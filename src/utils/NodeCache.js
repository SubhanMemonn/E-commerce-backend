import { myCache } from "../app.js";
import { Product } from "../models/product.model.js";
import apiError from "./apiError.js";

export let invalidateCache = ({
    product,
    order,
    userId,
    orderId,
    productId
}) => {
    if (product) {
        let productKeys = [
            "latest-products",
            "categories",
            "all-products",
        ];

        if (productId) {
            productKeys.push(`product-${productId}`)

        }
        if (typeof productId === "object") {
            productId.forEach((i) => productKeys.push(`product-${i}`))
        }
        myCache.del(productKeys)
    }

    if (order) {
        let orderKeys = [
            "all-orders",
            `my-orders-${userId}`,
            `order-${orderId}`,
        ]
        myCache.del(orderKeys)

    }
};

export let reduceStock = async (orderItems) => {
    for (let i = 0; i < orderItems.length; i++) {
        let order = orderItems[i];
        let product = await Product.findById(order.productId);
        if (!product) {
            throw new apiError(404, "Product not found")
        }
        product.stock -= order.quantity;
        await product.save()
    }
};