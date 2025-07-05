import express from "express"
import { mybooks, requestedBooks, getMyRequests,incomingRequests,  getUserProfile, updateProfilePicture, getUserReviews, submitRating, getMyBorrowedBooks, getMyLentBooks, getUserBooks } from "../controllers/userController.js";
import multer from "multer";
import verifyToken from "../middlewares/verifyUser.js"
const router = express.Router();
const upload=multer({storage:multer.memoryStorage()})
router.get("/mybooks",verifyToken,mybooks)
router.get("/requestedbooks",verifyToken,requestedBooks)
router.get("/get-my-request",verifyToken,getMyRequests)
router.get("/incoming-requests",verifyToken,incomingRequests)
router.get("/profile/:userId",verifyToken,getUserProfile);
router.put("/update-profile-pic",verifyToken,upload.single("profilePic"),updateProfilePicture)
router.get("/reviews/:userId",verifyToken,getUserReviews)
router.post("/rate/:ratedUserId",verifyToken,submitRating)
router.get("/getMyLentBooks",verifyToken,getMyLentBooks)
router.get("/getMyBorrowedBooks",verifyToken,getMyBorrowedBooks)
router.get("/getUserBooks/:id",verifyToken,getUserBooks)

export default router

