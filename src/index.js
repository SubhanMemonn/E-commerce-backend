import dotenv from "dotenv"
import connectDB from "./db/index.js"
import app from "./app.js"
import { PORT } from "./constant.js"



dotenv.config({ path: "./env" })


connectDB().then(() => {
    app.listen(PORT, () => {
        console.log("Server ready at port ", PORT);
    })
}).catch((error) => {
    console.log("Err while connect with server", error)
})