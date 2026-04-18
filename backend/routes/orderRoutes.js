import express from "express";
import {
  createOrder,
  updateOrderStatus,
  getOrders,
  getOrderById,
  getDashboard,
} from "../controllers/orderController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All order routes are protected
router.use(protect);

// Dashboard must be before :id route to avoid conflict
router.get("/dashboard", getDashboard);

router.route("/").get(getOrders).post(createOrder);
router.get("/:id", getOrderById);
router.patch("/:id/status", updateOrderStatus);

export default router;
