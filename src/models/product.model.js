import mongoose, { Schema } from "mongoose";

let productSchema = new Schema({

    name: {
        type: String,
        required: [true, "Please Enter Name"]
    },
    price: {
        type: Number,
        required: [true, "Please Enter Price"],
    },
    photo: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        trim: true


    },
    stock: {
        type: Number,
        required: [true, "Please enter Stock"]
    },

}, { timestamps: true })


export let Product = mongoose.model("Product", productSchema)