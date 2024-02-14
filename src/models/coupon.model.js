import mongoose, { Schema } from "mongoose";

let couponSchema = new Schema({
    code: {
        type: String,
        required: [true, "Please enter the Coupon Code"],
        unique: true,
    },
    amount: {
        type: Number,
        required: [true, "Please enter the Discount Amount"],
    },
}, { timestamps: true })

export let Coupon = mongoose.model("Coupon", couponSchema)