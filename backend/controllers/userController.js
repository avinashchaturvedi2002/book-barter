import User from "../models/User.js";
import Books from "../models/Book.js"
import Rating from "../models/Rating.js";
import ExchangeRequest from "../models/ExchangeRequest.js";
import PurchaseRequest from "../models/PurchaseRequest.js";
import cloudinary from "../utils/cloudinary.js";
import { emitNotification } from "../utils/emitNotifications.js";
import {getIO} from "../socket.js"

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

const mybooks=async(req,res)=>{
  try{
    const userId=req.user._id;
  const books=await Books.find({owner:userId});
  res.status(200).json({books:books})
  }
  catch(e){
    console.log("Error: ",e);
    res.status(500).json({msg:"Failed to fetch books"})
  }
  
}

const requestedBooks=async (req, res) => {
  try {
    const userId = req.user.id;

    const requests = await ExchangeRequest.find({
      requestedBy: userId,
      status: { $in: ["pending", "accepted"] }
    }).select("requestedBook");

    const requestedBookIds = requests.map(r => r.requestedBook.toString());

    res.json({ requestedBookIds });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
}

// controllers/request.js
const getMyRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    // show only Pending | Accepted | Counter_Offer | Rejected
    const visible = ["pending", "accepted","counter_pending", "counter_Offer", "rejected", "security_pending"];

    const exchangeRequests = await ExchangeRequest.find({
  requestedBy: userId,
  dismissedByRequester: false,
  status: { $in: ["pending", "accepted","counter_pending", "counter_Offer", "rejected", "security_pending", "security_paid"] },
}).populate({
        path: "requestedBook",
        populate: { path: "owner", select: "firstName lastName username profileImage _id" },
      })
      .populate({
        path: "offeredBook",
        populate: { path: "owner", select: "firstName lastName username profileImage _id" },
      });

    const purchaseRequests = await PurchaseRequest.find({
      buyer: userId,
    })
      .populate({
        path: "book",
        populate: { path: "owner", select: "firstName lastName _id" },
      })
      .lean();

    res.status(200).json({ exchangeRequests, purchaseRequests });
  } catch (err) {
    console.error("Failed to fetch user requests", err);
    res.status(500).json({ message: "Failed to fetch your requests." });
  }
};


const incomingRequests=async (req,res)=>{
  try{
    const userId=req.user._id;
    console.log(userId);
    const exchangeRequests = await ExchangeRequest.find({
  requestedFrom: userId,
  status: { $in: ["pending", "accepted", "counter_pending", "security_pending","security_paid"] }   // <-- filter
})
  .populate({
    path: "requestedBook",
    populate: {
      path: "owner",
      select: "firstName lastName username profileImage _id",
    },
  })
  .populate({
    path: "requestedBy",
    select: "firstName lastName  profileImage _id",
    
  })
  .populate({
    path:"offeredBook",
  })
  .sort({ updatedAt: -1 });

      const purchaseRequests = await PurchaseRequest.find({ seller: userId })
      .populate("book").populate({path:"buyer",select:"firstName"})
      .lean();

    res.status(200).json({
      exchangeRequests,
      purchaseRequests,
    });
  }
  catch(e)
  {
    console.error("Failed to fetch user requests", e);
    res.status(500).json({ message: "Failed to fetch your requests." });
  }
}


const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId).populate({
      path: "books",
      select: "title author imageUrl mode category available city sellingPrice",
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch accepted exchange history
    const swapHistory = await ExchangeRequest.find({
      status: { $in: ["swapped", "completed"] },
      $or: [
        { requestedBy: userId },
        { requestedFrom: userId }
      ],
    })
      .populate("requestedBook", "title author imageUrl")
      .populate("offeredBook", "title author imageUrl")
      .populate("requestedBy", "firstName lastName _id")
      .populate("requestedFrom", "firstName lastName _id");

    // Fetch accepted purchases
    const purchaseHistory = await PurchaseRequest.find({
      status: "accepted",
      buyer: userId,
    })
      .populate("book", "title author imageUrl")
      .populate("buyer", "firstName lastName _id");

    res.status(200).json({
      user,
      swapHistory,
      purchaseHistory,
    });

  } catch (err) {
    console.error("Failed to fetch user profile", err);
    res.status(500).json({ message: "Failed to fetch user profile" });
  }
};

const updateProfilePicture=async(req,res)=>{
  try{
    const userId=req.user._id;
    if (!req.file) {
      return res.status(400).json({ error: "Image file is required" });
    }
    const result=await streamUpload(req.file.buffer)
    const imageUrl=result.secure_url;

    const updateStatus= await User.findByIdAndUpdate(userId,{profileImage:imageUrl},{new:true});

    if(!updateStatus)
      res.status(404).json({msg:"User Not Found"})

    res.status(200).json({msg:"image uploaded successfully"})
    }
  catch(e)
  {
    console.log("error: ",e);
    res.status(500).json({msg:"internal server error"})
  }
}


const submitRating = async (req, res) => {
  try {
    const { ratedUserId } = req.params;
    const { stars, reviewText } = req.body;
    const ratedBy = req.user._id;

    if (!stars || stars < 1 || stars > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5 stars." });
    }

    if (ratedBy.toString() === ratedUserId) {
      return res.status(400).json({ message: "You cannot rate yourself." });
    }

    // Prevent duplicate ratings from the same user
    const existing = await Rating.findOne({ ratedUser: ratedUserId, ratedBy });
    if (existing) {
      return res.status(400).json({ message: "You have already rated this user." });
    }

    const newRating = await Rating.create({
      ratedUser: ratedUserId,
      ratedBy,
      stars,
      reviewText,
    });

    // Update avg rating and count on the User model
    const ratings = await Rating.find({ ratedUser: ratedUserId });
    const average = ratings.reduce((sum, r) => sum + r.stars, 0) / ratings.length;

    await User.findByIdAndUpdate(ratedUserId, {
      rating: average.toFixed(1),
      reviewCount: ratings.length,
    });
const io=getIO();
    // after await User.findByIdAndUpdate(...)
await emitNotification(io, {
  toUserId : ratedUserId,
  type     : "new_rating",
  message  : `${req.user.firstName} left you a ${stars}-star review.`,
  data     : { stars, reviewText }
});


    res.status(201).json({ message: "Rating submitted successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error submitting rating." });
  }
};



const getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;

    const reviews = await Rating.find({ ratedUser: userId })
      .populate("ratedBy", "firstName lastName profileImage")
      .sort({ createdAt: -1 });

    res.json({ reviews });
  } catch (err) {
    console.error("Error fetching reviews:", err);
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
};

// GET /api/exchanges/borrowed
const getMyBorrowedBooks = async (req, res) => {
  try {
    const userId = req.user._id;

    const exchanges = await ExchangeRequest.find({
      status: "swapped",
      $or: [{ requestedFrom: userId }, { requestedBy: userId }],
    })
      .populate([
        { path: "requestedBook", select: "title imageUrl author" },
        { path: "offeredBook", select: "title imageUrl author" },
        { path: "requestedBy", select: "firstName lastName" },
        { path: "requestedFrom", select: "firstName lastName" },
      ])
      .sort({ updatedAt: -1 });

    const exchangeOnSecurity=await ExchangeRequest.find({
      status:"lent_on_security",
      requestedBy:userId
    }).populate([{path:"requestedBook",select: "title imageUrl author" },{ path: "requestedBy", select: "firstName lastName" },
        { path: "requestedFrom", select: "firstName lastName" },])

    const borrowedBooks = exchanges.reduce((arr, ex) => {
      // Case 1: you borrowed requestedBook and gave offeredBook
      if (ex.requestedBy._id.equals(userId)) {
        arr.push({
          exchangeId: ex._id,
          book: ex.requestedBook,                // the one you received
          exchangedFor: ex.offeredBook,          // the one you gave
          role: "borrower",
          returnBy: ex.returnBy,
          currentHolder: {
            _id: userId,
            name: `${req.user.firstName} ${req.user.lastName || ""}`.trim(),
          },
          owner: {
            _id: ex.requestedFrom._id,
            name: `${ex.requestedFrom.firstName} ${ex.requestedFrom.lastName || ""}`.trim(),
          },
        });
      }

      // Case 2: you lent requestedBook and received offeredBook
      if (ex.requestedFrom._id.equals(userId)) {
        arr.push({
          exchangeId: ex._id,
          book: ex.offeredBook,                 // the one you received
          exchangedFor: ex.requestedBook,       // the one you gave
          role: "lender",
          returnBy: ex.returnBy,
          currentHolder: {
            _id: userId,
            name: `${req.user.firstName} ${req.user.lastName || ""}`.trim(),
          },
          owner: {
            _id: ex.requestedBy._id,
            name: `${ex.requestedBy.firstName} ${ex.requestedBy.lastName || ""}`.trim(),
          },
        });
      }

      return arr;
    }, []);
    const borrowedOnSecurity=exchangeOnSecurity.reduce((arr,ex)=>{
      arr.push(
        {
          exchangeId: ex._id,
          book: ex.requestedBook,                
          role: "borrower",
          returnBy: ex.returnBy,
          currentHolder: {
            _id: userId,
            name: `${req.user.firstName} ${req.user.lastName || ""}`.trim(),
          },
          owner: {
            _id: ex.requestedFrom._id,
            name: `${ex.requestedFrom.firstName} ${ex.requestedFrom.lastName || ""}`.trim(),
          },
        })
        return arr;
        },[])
     

    res.json({ borrowedBooks, borrowedOnSecurity });
  } catch (err) {
    console.error("Error fetching borrowed books:", err);
    res.status(500).json({ message: "Failed to fetch borrowed books." });
  }
};



const getMyLentBooks = async (req, res) => {
  try {
    const userId = req.user._id;

    const exchanges = await ExchangeRequest.find({
      status: "swapped",
      $or: [{ requestedFrom: userId }, { requestedBy: userId }],
    })
      .populate([
        { path: "requestedBook", select: "title imageUrl author" },
        { path: "offeredBook", select: "title imageUrl author" },
        { path: "requestedBy", select: "firstName lastName" },
        { path: "requestedFrom", select: "firstName lastName" },
      ])
      .sort({ updatedAt: -1 });

      const exchangeOnSecurity=await ExchangeRequest.find({
      status:"lent_on_security",
      requestedFrom:userId
    }).populate([{path:"requestedBook",select: "title imageUrl author" },{ path: "requestedBy", select: "firstName lastName" },
        { path: "requestedFrom", select: "firstName lastName" },])

    const lentBooks = exchanges.reduce((arr, ex) => {
      // case 1: you were the lender → you gave requestedBook and received offeredBook
      if (ex.requestedFrom._id.equals(userId)) {
        arr.push({
          exchangeId: ex._id,
          returnBy: ex.returnBy,
          book: ex.requestedBook,            // what you gave (lent)
          exchangedFor: ex.offeredBook,      // what you got in return
          role: "lender",
          currentHolder: {
            _id: ex.requestedBy._id,
            name: `${ex.requestedBy.firstName} ${ex.requestedBy.lastName || ""}`.trim(),
          },
        });
      }

      // case 2: you were the borrower → you gave offeredBook and received requestedBook
      if (ex.requestedBy._id.equals(userId)) {
        arr.push({
          exchangeId: ex._id,
          returnBy: ex.returnBy,
          book: ex.offeredBook,              // what you gave
          exchangedFor: ex.requestedBook,    // what you received
          role: "borrower",
          currentHolder: {
            _id: ex.requestedFrom._id,
            name: `${ex.requestedFrom.firstName} ${ex.requestedFrom.lastName || ""}`.trim(),
          },
        });
      }

      return arr;
    }, []);
    const lentOnSecurity=exchangeOnSecurity.reduce((arr,ex)=>{
      arr.push(
        {
          exchangeId: ex._id,
          book: ex.requestedBook,                
          role: "lender",
          returnBy: ex.returnBy,
          currentHolder: {
            _id: userId,
            name: `${req.user.firstName} ${req.user.lastName || ""}`.trim(),
          },
        })
        return arr;
        },[])

    res.status(200).json({ lentBooks, lentOnSecurity });
  } catch (err) {
    console.error("Error fetching lent books:", err);
    res.status(500).json({ message: "Failed to fetch lent books." });
  }
};



const getUserBooks=async(req,res)=>{
  const id=req.params.id
  const user=await User.findById(id).populate("books")
  console.log(user);
  res.status(200).json({user})

  
}



export {mybooks,requestedBooks,getMyRequests,incomingRequests,getUserProfile, updateProfilePicture, submitRating, getUserReviews, getMyBorrowedBooks, getMyLentBooks, getUserBooks}