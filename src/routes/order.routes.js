import Router from "express"
import {
    newOrder,
    processOrder,
    deleteOrder,
    myOrder,
    getAllOrder,
    getSingleOrder,
} from "../controllers/order.controller.js";
import adminOnly from "../middlewares/auth.middleware.js"

let router = Router()

//To Create New Product  - /api/v1/order/new
router.post("/new", adminOnly, newOrder)

// route - /api/v1/order/my
router.get("/my", myOrder)

// route - /api/v1/order/all
router.get("/all", adminOnly, getAllOrder)

router.route("/:id")
    .get(getSingleOrder)
    .delete(adminOnly, deleteOrder)
    .patch(adminOnly, processOrder)

export default router;