import { Router } from "express";
import { userRoutes } from "../modules/user/user.route";
import { authRoutes } from "../modules/auth/auth.route";
import { categoryRoutes } from "../modules/category/category.route";
import { foodRoutes } from "../modules/food/food.route";
import { orderRoutes } from "../modules/order/order.route";
import { statsRoutes } from "../modules/stats/state.route";
import { paymentRoutes } from "../modules/payment/payment.route";
import { ingredientRoutes } from "../modules/ingredient/ingredient.route";

export const router = Router();

const moduleRoutes = [
    {
        path: "/user",
        route: userRoutes
    },
    {
        path: "/auth",
        route: authRoutes
    },
    {
        path: "/category",
        route: categoryRoutes
    },
    {
        path: "/food",
        route: foodRoutes
    },
    {
        path: "/ingredient",
        route: ingredientRoutes
    },
    {
        path: "/order",
        route: orderRoutes
    },
    {
        path: "/state",
        route: statsRoutes
    },
    {
        path: "/payment",
        route: paymentRoutes
    }
]

moduleRoutes.forEach(route => {
    router.use(route.path, route.route)
})