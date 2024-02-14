import Router from "express"
import {
    newCoupon,
    applyCoupon,
    allCoupon,
    deleteCoupon
} from "../controllers/coupon.controller.js";
import adminOnly from "../middlewares/auth.middleware.js"

let router = Router()

//To Create New Coupon  - /api/v1/coupon/new
router.post("/new", adminOnly, newCoupon)

router.get("/discount", applyCoupon);

router.get("/all", adminOnly, allCoupon)

router.delete("/coupon/:id", adminOnly, deleteCoupon)



export default router;