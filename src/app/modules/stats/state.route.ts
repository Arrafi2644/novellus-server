
import express from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../user/user.interface";
import { StatsController } from "./state.controller";
const router = express.Router();

router.get("/food", checkAuth(Role.OWNER, Role.SELLER), StatsController.getFoodStats)
router.get("/order", checkAuth(Role.OWNER, Role.SELLER), StatsController.getOrderStats)

export const statsRoutes = router;