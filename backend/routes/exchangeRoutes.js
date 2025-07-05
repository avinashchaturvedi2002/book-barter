import express from "express"
import { acceptExchangeRequest, rejectExchangeRequest, counterExchangeOffer, dismissRequest, offerSecurityDeposit, cancelExchangeRequest, createSecurityOrder, verifySecurityPayment } from "../controllers/exchangeController.js";
import { initiateOtpExchange, validateExchangeOtp , initiateReturnOtpExchange,validateReturnOtp} from "../controllers/otpController.js";
import verifyToken from "../middlewares/verifyUser.js";
const router = express.Router();
router.put("/accept-exchange/:id",verifyToken,acceptExchangeRequest)
router.put("/reject-exchange/:id",verifyToken,rejectExchangeRequest)
router.put("/counter/:id", verifyToken, counterExchangeOffer);
router.post("/initiate-otp/:id",verifyToken,initiateOtpExchange)
router.post("/validate-otp/:id",verifyToken,validateExchangeOtp)
router.post("/initiate-return-otp/:id",verifyToken,initiateReturnOtpExchange)
router.post("/validate-return-otp/:id",verifyToken,validateReturnOtp)
router.put("/dismiss/:id",verifyToken,dismissRequest)
router.put("/lend-security/:id",verifyToken,offerSecurityDeposit)
router.put("/cancel-request/:id",verifyToken,cancelExchangeRequest)
router.post("/security-order/:id", verifyToken, createSecurityOrder);
router.post("/verify-security-payment",verifyToken, verifySecurityPayment)


export default router
