import mongoose from "mongoose";
import { DB_NAME } from "../constant.js"
const connectDB = async () => {
    try {
        let connectedDB = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`MongoDb connect with DB host ${connectedDB.connection.host}`);
    } catch (error) {
        console.log("Err while connect with DB " + error)
        process.exit(1)
    }
}
export default connectDB