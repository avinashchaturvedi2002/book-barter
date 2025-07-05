import express from "express"
import { acceptPurchaseRequest, rejectPurchaseRequest, sendPurchaseRequest } from "../controllers/purchaseController.js"
import  verifyToken  from "../middlewares/verifyUser.js";

import { initiatePurchaseOtp, validatePurchaseOtp } from "../controllers/otpController.js";
const router=express.Router();
router.post("/send-request",verifyToken,sendPurchaseRequest);

router.put("/accept-purchase/:id",verifyToken,acceptPurchaseRequest)

router.put("/reject-purchase/:id",verifyToken,rejectPurchaseRequest)

router.post("/initiate-otp/:id",verifyToken,initiatePurchaseOtp)

router.post("/validate-otp/:id",verifyToken,validatePurchaseOtp)

export default router