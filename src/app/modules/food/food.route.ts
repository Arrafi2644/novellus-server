import express from "express";
import { FoodControllers } from "./food.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../user/user.interface";
import { validateRequest } from "../../middleware/validateRequest";
import { createFoodZodSchema, updateFoodZodSchema } from "./food.validation";
import { multerUpload } from "../../config/multer.config";

const router = express.Router();

router.post(
    '/create-food', 
    checkAuth(Role.OWNER),
    multerUpload.single('image'),
    validateRequest(createFoodZodSchema), 
    FoodControllers.createFood
)

router.get("/all-foods", FoodControllers.getAllFoods)
router.get("/:slug", FoodControllers.getSingleFood)
router.delete("/:id", checkAuth(Role.OWNER), FoodControllers.deleteFood)
router.patch(
    "/:id", 
    checkAuth(Role.OWNER), 
    multerUpload.single('image'),
    validateRequest(updateFoodZodSchema), 
    FoodControllers.updateFood
)

export const foodRoutes = router;
