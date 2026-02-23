import express from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../user/user.interface";
import { validateRequest } from "../../middleware/validateRequest";
import { multerUpload } from "../../config/multer.config";
import { createIngredientZodSchema, updateIngredientZodSchema } from "./ingredient.validation";
import { IngredientControllers } from "./ingredient.controller";

const router = express.Router();

router.post(
    '/create-ingredient', 
    checkAuth(Role.OWNER),
    validateRequest(createIngredientZodSchema), 
    IngredientControllers.createIngredient
)

router.get("/all-ingredients", IngredientControllers.getAllIngredients)
router.get("/:id", IngredientControllers.getSingleIngredient)
router.delete("/:id", checkAuth(Role.OWNER), IngredientControllers.deleteIngredient)
router.patch(
    "/:id", 
    checkAuth(Role.OWNER), 
    validateRequest(updateIngredientZodSchema), 
    IngredientControllers.updateIngredient
)

export const ingredientRoutes = router;