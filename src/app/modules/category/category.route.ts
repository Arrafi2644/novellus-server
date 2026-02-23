import express from "express";
import { CategoryControllers } from "./category.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../user/user.interface";
import { validateRequest } from "../../middleware/validateRequest";
import { createCategoryZodSchema, updateCategoryZodSchema } from "./category.validation";
import { multerUpload } from "../../config/multer.config";

const router = express.Router();

router.post(
    '/create-category', 
    checkAuth(Role.OWNER),
    multerUpload.single('image'),
    validateRequest(createCategoryZodSchema), 
    CategoryControllers.createCategory
)

router.get("/all-categories", CategoryControllers.getAllCategories)
router.get("/:slug", CategoryControllers.getSingleCategory)
router.delete("/:id", checkAuth(Role.OWNER), CategoryControllers.deleteCategory)
router.patch(
    "/:id", 
    checkAuth(Role.OWNER), 
    multerUpload.single('image'),
    validateRequest(updateCategoryZodSchema), 
    CategoryControllers.updateCategory
)

export const categoryRoutes = router;
