import mongoose, { Schema } from "mongoose";


let orderSchema = new Schema({
    shippingInfo: {
        address: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        country: {
            type: String,
            required: true,
        },
        state: {
            type: String,
            required: true,
        },
        pinCode: {
            type: Number,
            required: true,
        },

    },
    user: {
        type: String,
        ref: "User",
    },
    subtotal: {
        type: Number,
        required: true
    },
    tax: {
        type: Number,
        required: true
    },
    shippingCharge: {
        type: Number,
        required: true

    },
    dicount: {
        type: Number,
        required: true


    },
    total: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        emun: ["Processing", "Shipped", "Delivered"],
        default: "Processing"

    },
    orderItems: [
        {
            name: String,
            photo: String,
            price: Number,
            quantity: Number,
            productId: {
                type: Schema.Types.ObjectId,
                ref: "Product"
            }
        }
    ]
}, {
    timestamps: true
});

export let Order = mongoose.model("Order", orderSchema)

