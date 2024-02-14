import asyncHandler from "../utils/asyncHandle.js"
import apiError from "../utils/apiError.js"
import { User } from "../models/user.model.js"

// Middleware to make sure only admin is allowed

const admin = asyncHandler(async (req, res, next) => {
    try {
        let { id } = req.query;
        if (!id) {
            throw new apiError(401, "Not authorized")
        }
        let user = await User.findById(id)
        if (!user) {
            throw new apiError(401, "User not found")

        }
        if (user.role !== "admin") {
            throw new apiError(403, "You have no assist")

        }
        next()
    } catch (error) {
        throw new apiError(401, error?.message || "Invaild Id")
    }
})
export default admin