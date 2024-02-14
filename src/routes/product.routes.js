import Router from "express"
import {
    getAdminProduct,
    newProduct,
    deleteProduct,
    updateProduct,
    getAllCategories,
    getSingleProduct,
    getAllProducts,
    latestProduct,
} from "../controllers/product.controller.js";
import { singleUpload } from "../middlewares/multer.middleware.js"
import adminOnly from "../middlewares/auth.middleware.js"

let router = Router()
//To Create New Product  - /api/v1/product/new

router.post("/new", adminOnly, singleUpload, newProduct)

router.get("/all", getAllProducts)

router.get("/latest", latestProduct)

router.get("/categories", getAllCategories)

router.get("/admin-products", adminOnly, getAdminProduct)

router.route("/:id")
    .delete(adminOnly, deleteProduct)
    .patch(adminOnly, singleUpload, updateProduct)
    .get(getSingleProduct);

export default router;
