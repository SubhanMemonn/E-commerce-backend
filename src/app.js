import express from "express"
import cors from "cors"
import morgan from "morgan"
import NodeCache from "node-cache"
// Importing Routes
import userRouter from "./routes/user.routes.js"
import productRouter from "./routes/product.routes.js"
import orderRouter from "./routes/order.routes.js"
import couponRouter from "./routes/coupon.routes.js";
import dashboardRouter from "./routes/statics.routes.js";
let app = express()

export let myCache = new NodeCache();

app.use(cors());
app.use(express.json())
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }))
app.use(morgan("dev"))

// Using Routes
// http://localhost:5000/api/v1/user
app.use("/api/v1/user", userRouter)
// http://localhost:5000/api/v1/product/
app.use("/api/v1/product", productRouter)
// http://localhost:5000/api/v1/order
app.use("/api/v1/order", orderRouter)
// http://localhost:5000/api/v1/coupon
app.use("/api/v1/coupon", couponRouter)
// http://localhost:5000/api/v1/dashboard/
app.use("/api/v1/dashboard", dashboardRouter)

export default app