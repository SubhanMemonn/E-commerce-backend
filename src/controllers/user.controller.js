import asyncHandler from "../utils/asyncHandle.js"
import apiError from "../utils/apiError.js"
import apiRespones from "../utils/apiRespones.js"
import { User } from "../models/user.model.js"

let newUser = asyncHandler(async (req, res) => {
    let { name, email, photo, gender, _id, dob } = req.body


    if ([name, email, photo, gender, _id, dob].some((field) => field?.trim() === "")) {
        throw new apiError(400, "All field are required")
    }

    let existedUser = await User.findById(_id)
    if (existedUser) {
        return res.status(200).json(new apiRespones(200, existedUser, "Welcome " + existedUser.name))
    }
    let user = await User.create({
        name,
        email,
        photo,
        gender,
        _id,
        dob: new Date(dob),
    })
    if (!user) {
        throw new apiError(500, "Something went wrong while login")

    }
    return res.status(200).json(new apiRespones(200, user, "Welcome" + user.name))
})

let getAllUsers = asyncHandler(async (req, res) => {
    let allUser = await User.find({})

    return res.status(200)
        .json(new apiRespones(200, allUser, "All user fatched"))
})

let getUser = asyncHandler(async (req, res) => {
    let { id } = req.params

    let findUser = await User.findById(id)
    if (!findUser) {
        throw new apiError(404, "Invalid ID")
    }

    return res.status(200)
        .json(
            new apiRespones(200, findUser, "User Fatched")
        )
})

let deleteUser = asyncHandler(async (req, res) => {
    let { id } = req.params
    let user = await User.findById(id)
    if (!user) {
        throw new apiError(404, "Invalid Id")

    }

    let removeUser = await User.findByIdAndDelete(id)
    if (!removeUser) {
        throw new apiError(500, "Failed to remove")

    }

    return res.status(200)
        .json(
            new apiRespones(
                200, removeUser, "User Deleted"
            )
        )
})

export {
    newUser,
    getAllUsers,
    getUser,
    deleteUser,
}