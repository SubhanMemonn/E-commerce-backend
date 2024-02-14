import mongoose, { Schema } from "mongoose";
import validator from "validator";

let userSchema = new Schema({
    _id: {
        type: String,
        required: [true, "Please enter Id"]
    },
    name: {
        type: String,
        required: [true, "Please Enter Name"]
    },
    email: {
        type: String,
        unique: [true, "Email alredy Exists"],
        required: [true, "Please Enter Email"],
        validator: validator.default.isEmail,
    },
    photo: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["admin", "user"],
        default: "user",

    },
    gender: {
        type: String,
        enum: ["male", "female"],
        default: "male",
        required: [true, "Please enter gender"]
    },
    dob: {
        type: Date,

        required: [true, "Please enter Date of brith"]
    }
}, { timestamps: true })


userSchema.virtual("age").get(function () {
    let today = new Date();
    let dob = this.dob;
    let age = today.getFullYear() - dob.getFullYear();

    if (
        today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())
    ) {
        age--;
    }
    return age
})
export let User = mongoose.model("User", userSchema)