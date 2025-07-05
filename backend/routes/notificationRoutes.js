import express from "express"
import  verifyToken  from "../middlewares/verifyUser.js"
import { getNotifications, markAsRead, markAllRead } from "../controllers/notificationController.js"
const router=express.Router()
router.get("/", verifyToken, getNotifications);
router.patch("/:id/read", verifyToken, markAsRead);
router.patch("/mark-all-read", verifyToken, markAllRead);

export default router;
