import express from "express";
import { addBook, exploreBooks, exchangeBooks, deleteBook } from "../controllers/bookController.js";
import multer from "multer";
import verifyToken from "../middlewares/verifyUser.js";
import optionalAuth from "../middlewares/optionalAuth.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/add", verifyToken, upload.single("image"), addBook);

router.get("/explore",optionalAuth,exploreBooks);

router.post("/exchange",verifyToken,exchangeBooks)

router.delete("/:bookId",verifyToken,deleteBook)


export default router;
