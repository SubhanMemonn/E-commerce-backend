import Router from "express"
import {
    getDashboardStats,
    getPieChart,
    getBarCharts,
    getLineCharts,
} from "../controllers/statics.controller.js";
import adminOnly from "../middlewares/auth.middleware.js"


let router = Router();

// route - /api/v1/dashboard/stats
router.get("/stats", adminOnly, getDashboardStats);

router.get("/pie", adminOnly, getPieChart);


router.get("/bar", adminOnly, getBarCharts)
router.get("/line", adminOnly, getLineCharts)




export default router;