import express from "express";
import { AuthControllers } from "./auth.controller";
import { Role } from "../user/user.interface";
import { changePasswordZodSchema } from "./auth.validation";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
const router = express.Router();

router.post('/login', AuthControllers.credentialLogin)
router.post('/logout', AuthControllers.logout)
router.post("/refresh-token", AuthControllers.getNewAccessToken)
router.post("/change-password", checkAuth(...Object.values(Role)), validateRequest(changePasswordZodSchema), AuthControllers.changePassword)
router.post("/forgot-password", AuthControllers.forgotPassword)
router.post("/reset-password/:token", AuthControllers.resetPassword)

export const authRoutes = router;

