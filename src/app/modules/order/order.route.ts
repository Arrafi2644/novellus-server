import express from "express";
import { validateRequest } from "../../middleware/validateRequest";
import { createOrderZodSchema, updateOrderZodSchema } from "./order.validation";
import { OrderControllers } from "./order.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../user/user.interface";

const router = express.Router();

/**
 * Create Order
 * - ONLINE: user must be logged in
 * - POS: owner/seller creates counter order
 *
 * NOTE: The service enforces orderType rules; route-level auth is kept simple.
 */
router.post(
  "/create-order",
  // checkAuth(...Object.values(Role)),
//   validateRequest(createOrderZodSchema),
  OrderControllers.createOrder
);

// Get logged-in user's orders (similar to /me)
router.get(
    "/my-orders",
    checkAuth(...Object.values(Role)),
    OrderControllers.getMyOrders
);

// Get all orders (OWNER or ADMIN)
router.get(
    "/all-orders",
    checkAuth(Role.OWNER),
    OrderControllers.getAllOrders
);

// Get single order by ID
router.get(
    "/:id",
    checkAuth(...Object.values(Role)),
    OrderControllers.getSingleOrder
);

// Delete order by ID
router.delete(
    "/:id",
    checkAuth(Role.OWNER),
    OrderControllers.deleteOrder
);

// Update order by ID
router.patch(
    "/:id",
    checkAuth(Role.OWNER),
    validateRequest(updateOrderZodSchema),
    OrderControllers.updateOrder
);

export const orderRoutes = router;

