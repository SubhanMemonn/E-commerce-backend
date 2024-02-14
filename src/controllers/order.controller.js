import asyncHandler from "../utils/asyncHandle.js"
import apiError from "../utils/apiError.js"
import apiRespones from "../utils/apiRespones.js"
import { Order } from "../models/order.model.js"
import { reduceStock } from "../utils/NodeCache.js"
import { invalidateCache } from "../utils/NodeCache.js"
import { myCache } from "../app.js"

let newOrder = asyncHandler(async (req, res) => {
    let {
        shippingInfo,
        orderItems,
        user,
        subtotal,
        tax,
        shippingCharges,
        discount,
        total,
    } = req.body;

    if (
        !shippingInfo ||
        !orderItems ||
        !user ||
        !subtotal ||
        !tax ||
        !total
    ) {
        throw new apiError(400, "All field are required")
    }

    let order = await Order.create({
        shippingInfo,
        orderItems,
        user,
        subtotal,
        tax,
        shippingCharges,
        discount,
        total,
    })
    if (!order) {
        throw new apiError(500, "Order not placed")

    }
    await reduceStock(orderItems);

    invalidateCache({
        product: true,
        order: true,
        userId: user,
        productId: orderItems.productId,
    })

    return res.status(201)
        .json(
            new apiRespones(201, order, "Order Placed Successfully")
        )

})

let processOrder = asyncHandler(async (req, res) => {
    let { id } = req.params;

    let order = await Order.findById(id);
    if (!order) {
        throw new apiError(404, "Order not found")
    }

    switch (order.status) {
        case "Processing":
            order.status = "Shipped"
            break;
        case "Shipped":
            order.status = "Delivered"
            break;
        default:
            order.status = "Delivered"
            break;
    }
    await order.save()

    invalidateCache({
        product: false,
        order: true,

        userId: order.user,
        orderId: order._id
    })

    return res.status(200)
        .json(
            new apiRespones(
                200, order, "Order Processed Successfully"
            )
        )
})

let deleteOrder = asyncHandler(async (req, res) => {
    let { id } = req.params;

    let order = await Order.findById(id);
    if (!order) {
        throw new apiError(404, "Order not found")
    }

    await order.deleteOne()

    invalidateCache({
        product: false,
        order: true,
        userId: order.user,
        orderId: order._id
    })

    return res.status(200)
        .json(new apiRespones(200, order, "Order deleted"))
})

let myOrder = asyncHandler(async (req, res) => {
    let { id: user } = req.query;

    let key = `my-order-${user}`

    let order;

    if (myCache.has(key)) {
        order = JSON.parse(myCache.get(key))
    } else {
        order = await Order.find({ user });
        if (!order) {
            throw new apiError(404, "Order Not Found")
        }
        myCache.set(key, JSON.stringify(order))
    }
    return res.status(200).json(
        new apiRespones(200, order, "Order fateched")
    )

})

let getSingleOrder = asyncHandler(async (req, res) => {
    let { id } = req.params;

    let key = `order-${id}`

    let order;

    if (myCache.has(key)) {
        order = JSON.parse(myCache.get(key))
    } else {
        order = await Order.findById(id);
        if (!order) {
            throw new apiError(404, "Order Not Found")
        }
        myCache.set(key, JSON.stringify(order))
    }
    return res.status(200).json(
        new apiRespones(200, order, "Order fateched")
    )

})

let getAllOrder = asyncHandler(async (req, res) => {

    let key = `all-orders`

    let order;

    if (myCache.has(key)) {
        order = JSON.parse(myCache.get(key))
    } else {
        order = await Order.find().populate("user", "name");
        if (!order) {
            throw new apiError(500, "Orders Not Found")
        }
        myCache.set(key, JSON.stringify(order))
    }
    return res.status(200).json(
        new apiRespones(200, order, "All Orders fateched")
    )

})

export {
    newOrder,
    processOrder,
    deleteOrder,
    myOrder,
    getAllOrder,
    getSingleOrder,
}