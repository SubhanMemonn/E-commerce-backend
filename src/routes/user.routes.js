import Router from "express"
import {
    newUser,
    getAllUsers,
    getUser,
    deleteUser,
} from "../controllers/user.controller.js";
import adminOnly from "../middlewares/auth.middleware.js"


let router = Router();

// route - /api/v1/user/new
router.post("/new", newUser)
router.route("/all").get(adminOnly, getAllUsers)
router.route("/:id").delete(adminOnly, deleteUser).get(getUser)

export default router;
