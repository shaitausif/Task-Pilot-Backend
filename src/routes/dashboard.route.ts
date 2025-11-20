import { Router } from "express";
import { authenticateJWT } from "../middlewares/auth.middleware.js";
import { getUserDashboardStats, getAdminDashboardStats } from "../controllers/dashboard.controller.js";
import { validate } from "../validators/validate.js";

const router = Router();

router.use(authenticateJWT)


router.route("/user").get(validate, getUserDashboardStats);

router.route("/admin").get(validate, getAdminDashboardStats);

export default router;
