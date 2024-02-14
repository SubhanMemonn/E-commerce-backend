import asyncHandler from "../utils/asyncHandle.js"
import apiError from "../utils/apiError.js"
import apiRespones from "../utils/apiRespones.js"
import { Product } from "../models/product.model.js"
import { rm } from "fs"
import { isValidObjectId } from "mongoose"
import { invalidateCache } from "../utils/NodeCache.js"
import { myCache } from "../app.js"
// import { faker } from "@faker-js/faker"


let newProduct = asyncHandler(async (req, res) => {
    let { name, price, stock, category } = req.body
    let photo = req.file
    if (
        [name, price, stock, category].some((field) => field?.trim() === "")
    ) {
        rm(photo.path, () => {
            console.log("Photo deleted")
        })
        throw new apiError(400, "All field requried")
    }
    if (!photo) {
        throw new apiError(400, "Photo is requried")

    }
    let product = await Product.create({
        name,
        price,
        stock,
        category,
        photo: photo.path
    })

    if (!product) {
        throw new apiError(500, "Failed to upload product")
    }

    invalidateCache({ product: true });
    return res.status(201)
        .json(
            new apiRespones(201, product, "Upload product")
        )
})

let updateProduct = asyncHandler(async (req, res) => {
    let { id } = req.params;
    let { name, price, stock, category } = req.body;
    let photo = req.file;

    let findProduct = await Product.findById(id);
    if (!findProduct) {
        throw new apiError(404, "product Id not found")
    }

    if (photo) {
        rm(findProduct.photo, () => {
            console.log("Photo Deleted")
        })
        findProduct.photo = photo.path;
    }
    if (name) findProduct.name = name;
    if (price) findProduct.price = price;
    if (stock) findProduct.stock = stock;
    if (category) findProduct.category = category;
    await findProduct.save()
    invalidateCache({ product: true, productId: findProduct._id });
    return res.status(200)
        .json(
            new apiRespones(
                200, findProduct, `${findProduct.name} Product Updated`
            )
        )
})

let deleteProduct = asyncHandler(async (req, res) => {
    let { id } = req.params;
    let product = await Product.findById(id)
    if (!product) {
        throw new apiError(400, "Invalid Id")
    }

    rm(product.photo, () => {
        console.log("delete photo")
    })
    let remove = await Product.findByIdAndDelete(id)
    if (!remove) {
        throw new apiError(500, "Failed to delete product")

    }
    invalidateCache({ product: true, productId: product._id });

    return res.status(200)
        .json(
            new apiRespones(
                200, remove, `Remove ${remove.name} Product`
            )
        )
})

let getAllProducts = asyncHandler(async (req, res) => {
    let { search, sort, category, price } = req.query;

    let page = Number(req.query.page) || 1;

    let limit = Number(process.env.PRODUCT_PER_PAGE) || 12;

    let skip = (page - 1) * limit;

    let baseQuery = {};

    if (search) {
        baseQuery.name = {
            $regex: search,
            $options: "i",
        };

    };

    if (price) {
        baseQuery.price = {
            $lte: Number(price)
        }
    };
    if (category) baseQuery.category = category;

    let productsPromise = Product.find(baseQuery)
        .sort(sort && { price: sort === "asc" ? 1 : -1 })
        .limit(limit)
        .skip(skip);

    let [product, filteredOnlyProduct] = await Promise.all([
        productsPromise,
        Product.find(baseQuery)
    ]);

    const totalPage = Math.ceil(filteredOnlyProduct.length / limit)

    return res.status(200)
        .json(
            new apiRespones(
                200, { product, totalPage, }, "filtered producted"
            )
        )
})

let getSingleProduct = asyncHandler(async (req, res) => {
    let { id } = req.params;
    if (!isValidObjectId(id)) {
        throw new apiError(404, "Invalid ID")

    }
    let product;
    let key = `product-${id}`
    if (myCache.has(key)) {
        product = JSON.parse(myCache.get(key))
    } else {
        product = await Product.findById(id);
        if (!product) {
            throw new apiError(404, "Product not found")

        }
        myCache.set(key, JSON.stringify(product))

    }
    return res.status(200)
        .json(
            new apiRespones(200, product, "Find product")
        )
})

let getAdminProduct = asyncHandler(async (req, res) => {
    let allProduct;

    if (myCache.has("all-products")) {
        allProduct = JSON.parse(myCache.get("all-products"))
    }
    else {
        allProduct = await Product.find({});
        if (!allProduct) {
            throw new apiError(500, "Product Not Found")
        }

        myCache.set("all-products", JSON.stringify(allProduct))
    }
    return res.status(200)
        .json(
            new apiRespones(200, allProduct, `Find All  ${allProduct.length} Product`)
        )
})

const getAllCategories = asyncHandler(async (req, res) => {

    let categories;
    let key = "categories"
    if (myCache.has(key)) {
        categories = JSON.parse(myCache.get(key))
    } else {
        categories = await Product.distinct("category")
        if (!categories) {
            throw new apiError(404, "Product not found")

        }
        myCache.set(key, JSON.stringify(categories))

    }

    return res.status(200)
        .json(
            new apiRespones(
                200, categories, "Category fatched"
            )
        )
})

let latestProduct = asyncHandler(async (req, res) => {

    let product;
    let key = "latest-products";
    if (myCache.has(key)) {
        product = JSON.parse(myCache.get(key))
    } else {
        product = await Product.find({}).sort({ createdAt: -1 }).limit(8);
        if (!product) {
            throw new apiError(404, "Product not found")

        }
        myCache.set(key, JSON.stringify(product))

    }
    return res.status(200)
        .json(
            new apiRespones(200, product, "Find product")
        )
})
// const generateRandomProducts = async (count = 10) => {
//     const products = [];

//     for (let i = 0; i < count; i++) {
//         const product = {
//             // _id: faker.string.uuid(),
//             name: faker.commerce.productName(),
//             photo: "/temp/5219a76d-9ef9-43ac-acbe-b3f14fc3282a.jpg",
//             price: faker.commerce.price({ min: 1500, max: 80000, dec: 0 }),
//             stock: faker.commerce.price({ min: 0, max: 100, dec: 0 }),
//             category: faker.commerce.department(),
//             createdAt: new Date(faker.date.past()),
//             updatedAt: new Date(faker.date.recent()),
//             __v: 0,
//         };

//         products.push(product);
//     }
//     await Product.create(products);

//     console.log("done");
// }
// generateRandomProducts(40)
// const deleteRandomsProducts = async (count) => {
//     const products = await Product.find({}).skip(2);

//     for (let i = 0; i < products.length; i++) {
//         const product = products[i];
//         await product.deleteOne();
//     }

//     console.log({ succecss: true });
// };

export {
    getAdminProduct,
    newProduct,
    deleteProduct,
    updateProduct,
    getAllCategories,
    getSingleProduct,
    getAllProducts,
    latestProduct,
}