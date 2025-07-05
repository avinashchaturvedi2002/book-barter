import PurchaseRequest from "../models/PurchaseRequest.js";
import Book from "../models/Book.js"
import { getIO } from "../socket.js";
import { emitNotification } from "../utils/emitNotifications.js";
const sendPurchaseRequest=async(req,res)=>{
  const userId=req.user._id;
  const {bookId}=req.body
  if(!bookId)
    return res.status(400).json({message:"Please select the book you want to buy"})
  try{
    const requestedBook=await Book.findById(bookId)
    if(!requestedBook)
    {
      return res.status(404).json({message:"Couldn't find the requested book"})
    }
    if(!requestedBook.available)
    {
      return res.status(400).json({ message: "Your requested book is not available." });
    }
    if(requestedBook.owner.toString()===userId.toString())
    {
      return res.status(400).json({message:"You cant buy your own book"})
    }
    const purchaseRequest=new PurchaseRequest({
      book:requestedBook._id,
      buyer:userId,
      seller:requestedBook.owner,
      status:"pending",
    })
    await purchaseRequest.save()
    const io=getIO();
    await emitNotification(io,{
      toUserId:requestedBook.owner.toString(),
      type:"purchase_request",
      message:`${req.user.firstName} is ready to buy your book`,
      purchaseId:purchaseRequest._id,
    });
    res.status(201).json({ message: "Purchase request sent successfully.", purchaseRequest });
  } catch (err) {
    console.error("Purchase Request Error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
}

const acceptPurchaseRequest=async(req,res)=>{
  try{
    const userId=req.user._id;
    const purchaseId=req.params.id;
    const purchase=await PurchaseRequest.findById(purchaseId).populate("book")
    if(!purchase)
      {
      return res.status(404).json({ message: "Purchase request not found." });
    }
    if(purchase.seller.toString()!==userId.toString())
    {
      return res.status(403).json({ message: "You are not authorized to accept this request." });
    }
    purchase.status="accepted";
    await purchase.save();
    const io=getIO();
    await emitNotification(io, {
    toUserId : purchase.buyer,
    type     : "request_accepted",
    message  : "Your purchase request was accepted!",
    purchaseId: purchase._id
});
res.status(200).json({ message: "Purchase request accepted successfully.", purchase });
  }
  catch (error) {
    console.error("Error accepting exchange request:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

const rejectPurchaseRequest=async(req,res)=>{
  try{
    const userId=req.user._id;
    const purchaseId=req.params.id;
    const purchase=await PurchaseRequest.findById(purchaseId).populate("book");
    if (!purchase) {
      return res.status(404).json({ message: "Purchase request not found." });
    }

    // Ensure the logged-in user owns the requested book
    if (purchase.book.seller.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You are not authorized to reject this request." });
    }

    purchase.status="rejected";
    await purchase.save();
    const io=getIO();
    await emitNotification(io, {
  toUserId : purchase.buyer,
  type     : "request_rejected",
  message  : "Your purchase request was rejected.",
  exchangeId: purchase._id
});

  res.status(200).json({ message: "Purchase request rejected successfully.", purchase });
  }
  catch (error) {
    console.error("Error rejecting purchase request:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export {sendPurchaseRequest,acceptPurchaseRequest,rejectPurchaseRequest}