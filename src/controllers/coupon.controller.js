import asyncHandler from "../utils/asyncHandle.js"
import apiError from "../utils/apiError.js"
import apiRespones from "../utils/apiRespones.js"
import { Coupon } from "../models/coupon.model.js"

let newCoupon = asyncHandler(async (req, res) => {

    let { coupon, amount } = req.body;

    if (!coupon || !amount) {
        throw new apiError(400, "Please enter both coupon and amount")
    }

    let createCoupon = await Coupon.create({
        code: coupon,
        amount
    });

    if (!createCoupon) {
        throw new apiError(500, "Failed to create coupon")
    }

    return res.status(201)
        .json(
            new apiRespones(201, createCoupon, `Coupon create successfully`)
        )
});

let applyCoupon = asyncHandler(async (req, res) => {
    let { coupon } = req.query;

    let discount = await Coupon.findOne({ code: coupon })
    if (!discount) {
        throw new apiError(404, "Invalid coupon code")
    }

    return res.status(200)
        .json(new apiRespones(200, discount, "Coupon apply"))
})

let allCoupon = asyncHandler(async (req, res) => {
    let coupon = await Coupon.find({});

    if (!coupon || !coupon.length) {
        throw new apiError(400, "No Coupon found")
    }
    return res.status(200)
        .json(new apiRespones(200, coupon, "All Coupon Fetched"))
})

let deleteCoupon = asyncHandler(async (req, res) => {
    let { id } = req.params;
    let coupon = await Coupon.findById(id);

    if (!coupon) {
        throw new apiError(404, "Coupon Not Found")
    }

    return res.status(200)
        .json(new apiRespones(200, coupon, `Coupon ${coupon.code} code deleted`))
});

export {
    newCoupon,
    applyCoupon,
    allCoupon,
    deleteCoupon
}