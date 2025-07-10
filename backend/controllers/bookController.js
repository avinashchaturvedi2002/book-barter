import cloudinary from "../utils/cloudinary.js";
import Book from "../models/Book.js";
import User from "../models/User.js";
import ExchangeRequest from "../models/ExchangeRequest.js";
import PurchaseRequest from "../models/PurchaseRequest.js";
import { emitNotification } from "../utils/emitNotifications.js";
import {getIO} from "../socket.js"
import { sendEmail } from "../utils/sendEmail.js";



const streamUpload = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    console.log("Cloudinary config used:", cloudinary.config());
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "image" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(fileBuffer);
  });
};


const addBook = async (req, res) => {
  try {
    const {
      title,
      author,
      category,
      mode,
      description,
      city,
      sellingPrice,
      securityMoney,
    } = req.body;

    const location = JSON.parse(req.body.location);
    console.log(location);

    if (!req.file) {
      return res.status(400).json({ error: "Image file is required" });
    }

    const result = await streamUpload(req.file.buffer);
    const imageUrl = result.secure_url;

    // Create new book document
    const book = new Book({
      title,
      author,
      category,
      mode,
      description,
      city,
      location,
      sellingPrice: mode === "sell" ? sellingPrice : undefined,
      securityMoney: mode === "lend" ? securityMoney : undefined,
      imageUrl,
      owner: req.user.id,
    });

    // Save the book
    await book.save();

    // Update the user's books array
    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { books: book._id } },
      { new: true }
    );

    // Return success
    res.status(201).json(book);

  } catch (error) {
    console.error("Error uploading book:", error);
    res.status(500).json({ error: "Server error" });
  }
};


const exploreBooks = async (req, res) => {
  try {
    const {
      type,
      author,
      category,
      title,
      radius,
      lat,
      lng,
      city,
      page = 1,
      limit = 9,
    } = req.query;

    const filters = { available: true };
    if (req.user) filters.owner = { $ne: req.user.id };
    if (type === "sell") filters.mode = "sell";
    if (type === "lend") filters.mode = "lend";
    if (author) filters.author = author;
    if (category) filters.category = category;
    if (title) filters.title = { $regex: title, $options: "i" };
    if (city)
      filters.city = {
        $regex: city.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        $options: "i",
      };
    if (radius && lat && lng) {
      filters.location = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: parseFloat(radius) * 1000,
        },
      };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Book.countDocuments(filters);
    const books = await Book.find(filters)
      .select("-__v")
      .populate("owner", "firstName lastName")
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      books,
      hasMore: skip + books.length < total,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch books" });
  }
};


const exchangeBooks = async (req, res) => {
  const userId = req.user._id;
  const { requestedBookId, offeredBookId, durationInDays } = req.body;

  if (!requestedBookId || !offeredBookId || !durationInDays) {
    return res.status(400).json({ message: "requestedBookId, offeredBookId and durationInDays are required." });
  }

  if (![3, 7, 14, 30].includes(Number(durationInDays))) {
    return res.status(400).json({ message: "Invalid borrow duration. Allowed: 3, 7, 14, or 30 days." });
  }

  try {
    const requestedBook = await Book.findById(requestedBookId);
    const offeredBook = await Book.findById(offeredBookId);

    if (!requestedBook || !offeredBook) {
      return res.status(404).json({ message: "One or both books not found." });
    }

    if (!offeredBook.available) {
      return res.status(400).json({ message: "Your offered book is not available." });
    }

    if (offeredBook.owner.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You can only offer books that belong to you." });
    }

    if (requestedBook.owner.toString() === userId.toString()) {
      return res.status(400).json({ message: "You can't request your own book." });
    }

    const returnBy = new Date(Date.now() + Number(durationInDays) * 24 * 60 * 60 * 1000);

    const exchangeRequest = new ExchangeRequest({
      requestedBy: userId,
      requestedFrom: requestedBook.owner,
      requestedBook: requestedBookId,
      offeredBook: offeredBookId,
      durationInDays,
    });

    await exchangeRequest.save();
    const io=getIO();
    await emitNotification(io, {
  toUserId: requestedBook.owner.toString(),
  type: "exchange_request",
  message: `${req.user.firstName} requested to exchange a book with you.`,
  exchangeId: exchangeRequest._id,
    
  }
);
  
  const bookOwner = await User.findById(requestedBook.owner).lean();

await sendEmail(
  bookOwner.email,
  "Book Barter • New Exchange Request",
  `Hi ${bookOwner.firstName},\n\n${req.user.firstName} has requested to exchange books with you.\n\nBook Requested: ${requestedBook.title}\nBook Offered: ${offeredBook.title}\nDuration: ${durationInDays} days\n\nLogin to Book Barter to accept, reject or counter the request.\n\nHappy Swapping! 📚 \n\n Click here to open app : ${process.env.FRONTEND_URL}`
);

  console.log("notification emitted");
    res.status(201).json({ message: "Exchange request sent successfully.", exchangeRequest });
  } catch (err) {
    console.error("Exchange Request Error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};


const deleteBook = async (req, res) => {
  try {
    const userId = req.user._id; // from auth middleware
    const { bookId } = req.params;

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: "Book not found." });

    // Only the owner can delete
    if (book.owner.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You are not authorized to delete this book." });
    }

    // Prevent deletion if involved in ongoing exchange requests
    const exchangeInUse = await ExchangeRequest.findOne({
      $or: [{ offeredBook: bookId }, { requestedBook: bookId }],
      status: { $nin: ["completed", "cancelled", "rejected"] }
    });

    if (exchangeInUse) {
      return res.status(400).json({ message: "This book is part of an active exchange request and cannot be deleted." });
    }

    // Prevent deletion if involved in ongoing purchase requests
    const purchaseInUse = await PurchaseRequest.findOne({
      book: bookId,
      status: { $nin: ["completed", "cancelled", "rejected"] }
    });

    if (purchaseInUse) {
      return res.status(400).json({ message: "This book is part of an active purchase request and cannot be deleted." });
    }

    // Delete book
    await Book.findByIdAndDelete(bookId);

    // Remove from user's book list
    await User.findByIdAndUpdate(userId, {
      $pull: { books: bookId }
    });

    res.json({ message: "Book deleted successfully." });

  } catch (err) {
    console.error("Error deleting book:", err);
    res.status(500).json({ message: "Server error while deleting book." });
  }
};


export {addBook,exploreBooks,exchangeBooks, deleteBook}
