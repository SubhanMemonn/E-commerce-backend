import { Order } from "../models/order.model.js"
import { Product } from "../models/product.model.js"
import { User } from "../models/user.model.js"
import apiRespones from "../utils/apiRespones.js"
import asyncHandler from "../utils/asyncHandle.js"
import { calculatePercentage, getChartData, getInventories } from "../utils/features.js"


let getDashboardStats = asyncHandler(async (req, res) => {

    let stats;
    let today = new Date();
    let sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const thisMonth = {
        start: new Date(today.getFullYear(), today.getMonth(), 1),
        end: today
    }
    const lastMonth = {
        start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
        end: new Date(today.getFullYear(), today.getMonth(), 0)
    }

    const thisMonthProductPromise = Product.find({
        createdAt: {
            $gte: thisMonth.start,
            $lte: thisMonth.end
        }
    })
    const lastMonthProductPromise = Product.find({
        createdAt: {
            $gte: lastMonth.start,
            $lte: lastMonth.end
        }
    })
    const thisMonthUserPromise = User.find({
        createdAt: {
            $gte: thisMonth.start,
            $lte: thisMonth.end,
        }
    })

    const lastMonthUserPromise = User.find({
        createdAt: {
            $gte: lastMonth.start,
            $lte: lastMonth.end
        }
    })
    const thisMonthOrderPromise = Order.find({
        createdAt: {
            $gte: thisMonth.start,
            $lte: thisMonth.end
        }
    })
    const lastMonthOrderPromise = Order.find({
        createdAt: {
            $gte: lastMonth.start,
            $lte: lastMonth.end
        }
    })
    const lastSixMonthOrderPromise = Order.find({
        createdAt: {
            $gte: sixMonthsAgo,
            $lte: today,
        }
    })

    const latestTransactionsPromise = Order.find({}).select(["orderItems", "discount", "total", "status"]).limit(4)
    let [
        thisMonthProduct,
        thisMonthUser,
        thisMonthOrder,
        lastMonthProduct,
        lastMonthUser,
        lastMonthOrder,
        productsCount,
        usersCount,
        allOrders,
        lastSixMonthOrders,
        categories,
        femaleUsersCount,
        latestTransaction,
    ] = await Promise.all([
        thisMonthProductPromise,
        thisMonthUserPromise,
        thisMonthOrderPromise,
        lastMonthProductPromise,
        lastMonthUserPromise,
        lastMonthOrderPromise,
        Product.countDocuments(),
        User.countDocuments(),
        Order.find({}).select("total"),
        lastSixMonthOrderPromise,
        Product.distinct("category"),
        User.countDocuments({ gender: "female" }),
        latestTransactionsPromise
    ])

    const thisMonthRevenue = thisMonthOrder.reduce((total, order) => total + (order.total || 0), 0);

    const lastMonthRevenue = lastMonthOrder.reduce((total, order) => total + (order.total || 0), 0);

    const changePercent = {
        revenue: calculatePercentage(thisMonthRevenue, lastMonthRevenue),
        product: calculatePercentage(thisMonthProduct.length, lastMonthProduct.length),
        user: calculatePercentage(thisMonthUser.length, lastMonthUser.length),
        order: calculatePercentage(thisMonthOrder.length, lastMonthOrder.length)

    }

    const revenue = allOrders.reduce((total, order) => total + (order.total || 0), 0);

    const count = {
        revenue,
        user: usersCount,
        products: productsCount,
        order: allOrders.length
    }

    const orderMonthCounts = new Array(6).fill(0);
    const orderMonthyRevenue = new Array(6).fill(0);

    lastSixMonthOrders.forEach((order) => {
        const creationDate = order.createdAt;
        const monthDiff = (today.getMonth() - creationDate.getMonth() + 12) % 12

        if (monthDiff < 6) {
            orderMonthCounts[6 - monthDiff - 1] += 1;
            orderMonthyRevenue[6 - monthDiff - 1] += order.total

        }
    });

    const categoriesCount = await getInventories({
        categories,
        productsCount
    })

    const userRatio = {
        male: usersCount - femaleUsersCount,
        female: femaleUsersCount

    }

    const modifiedLatestTransaction = latestTransaction.map((i) => ({
        _id: i.id,
        discount: i.discount,
        amount: i.total,
        quantity: i.orderItems.length,
        status: i.status

    }));
    stats = {
        categoriesCount,
        changePercent,
        count,
        chart: {
            order: orderMonthCounts,
            revenue: orderMonthyRevenue,
        },
        userRatio,
        latestTransaction: modifiedLatestTransaction,
    }


    return res.status(200).json(
        new apiRespones(200, stats, "Dashboard stats fetched")
    )
})

let getPieChart = asyncHandler(async (req, res) => {

    let allOrderPromise = Order.find({}).select([
        "total",
        "discount",
        "subtotal",
        "tax",
        "shippingCharges",
    ])

    const [
        processingOrder,
        shippingOrder,
        deliveredOrder,
        categories,
        productsCount,
        outOfStock,
        allOrders,
        allUsers,
        adminUsers,
        customerUsers,
    ] = await Promise.all([
        Order.countDocuments({ status: "Processing" }),
        Order.countDocuments({ status: "Shipped" }),
        Order.countDocuments({ status: "Delivered" }),
        Product.distinct("category"),
        Product.countDocuments(),
        Product.countDocuments({ stock: 0 }),
        allOrderPromise,
        User.find({}).select(["dob"]),
        User.countDocuments({ role: "admin" }),
        User.countDocuments({ role: "user" }),
    ])

    const orderFullfillment = {
        processing: processingOrder,
        shipping: shippingOrder,
        delivered: deliveredOrder,
    };

    let productCategories = await getInventories({ categories, productsCount });

    const stockAvailablity = {
        stock: productsCount - outOfStock,
        outOfStock
    };

    const grossIncome = allOrders.reduce((prev, order) => prev + (order.total || 0), 0)

    const discount = allOrders.reduce((prev, order) => prev + (order.dicount || 0), 0)

    const productionCost = allOrders.reduce((prev, order) => prev + (order.shippingCharge || 0), 0)

    const burnt = allOrders.reduce((prev, order) => prev + (order.tax || 0), 0)

    const marketingCost = Math.round(grossIncome * (30 / 100));

    const netMargin = grossIncome - discount - productionCost - burnt - marketingCost;

    const revenueDistribution = {
        grossIncome,
        discount,
        productionCost,
        burnt,
        marketingCost,
        netMargin
    }

    const usersAgeGroup = {
        teen: allUsers.filter((i) => i.age < 20).length,
        adult: allUsers.filter((i) => i.age >= 20 && i.age < 40).length,
        old: allUsers.filter((i) => i.age >= 40).length,
    }

    const adminCustomer = {
        admin: adminUsers,
        user: customerUsers,
    }

    const chats = {
        orderFullfillment,
        productCategories,
        stockAvailablity,
        revenueDistribution,
        usersAgeGroup,
        adminCustomer
    }

    return res.status(200)
        .json(
            new apiRespones(200, chats, "Chats data fetched")
        )
})

let getBarCharts = asyncHandler(async (req, res) => {

    let today = new Date();
    let sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    let twelveMonthsAgo = new Date()
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    let sixMonthProductPromise = Product.find({
        createdAt: {
            $gte: sixMonthsAgo,
            $lte: today,
        }
    }).select("createdAt")
    let sixMonthUserPromise = User.find({
        createdAt: {
            $gte: sixMonthsAgo,
            $lte: today,
        }
    }).select("createdAt")
    let twelveMonthOrderPromise = Order.find({
        createdAt: {
            $gte: twelveMonthsAgo,
            $lte: today,
        }
    }).select("createdAt")

    const [product, user, order] = await Promise.all([
        sixMonthProductPromise,
        sixMonthUserPromise,
        twelveMonthOrderPromise
    ])

    let productCount = await getChartData({ length: 6, docArr: product, today })
    let userCount = await getChartData({ length: 6, docArr: user, today })
    let orderCount = await getChartData({ length: 12, docArr: order, today })

    const charts = {
        user: userCount,
        product: productCount,
        order: orderCount
    }



    return res.status(200)
        .json(
            new apiRespones(200, charts, "Chats data fetched")
        )
})
let getLineCharts = asyncHandler(async (req, res) => {
    let today = new Date();
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const baseQuery = {
        createdAt: {
            $gte: twelveMonthsAgo,
            $lte: today,
        }
    }
    const [product, user, order] = await Promise.all([
        Product.find(baseQuery).select("createdAt"),
        User.find(baseQuery).select("createdAt"),
        Order.find(baseQuery).select(["createdAt", "total", "dicount"]),
    ]);

    let productCount = getChartData({ length: 12, docArr: product, today })
    let userCount = getChartData({ length: 12, docArr: user, today })
    let discount = getChartData(
        {
            length: 12,
            docArr: order,
            today,
            property: "dicount"
        }
    )
    let revenue = getChartData({
        length: 12,
        docArr: order,
        today,
        property: "total"
    })

    const charts = {
        user: userCount,
        product: productCount,
        discount,
        revenue
    }



    return res.status(200)
        .json(
            new apiRespones(200, charts, "line data fetched")
        )
})

export {
    getBarCharts, getDashboardStats, getLineCharts, getPieChart
}
