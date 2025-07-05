import express from "express"
import {createCoffeeOrder,verifyCoffeePayment} from "../controllers/coffeeController.js"
const router=express.Router()

router.post("/coffee-order", createCoffeeOrder);
router.post("/verify-coffee",verifyCoffeePayment)

export default router