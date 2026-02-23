import express from "express";
import { UserControllers } from "./user.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "./user.interface";
import { validateRequest } from "../../middleware/validateRequest";
import { createUserZodSchema, updateUserZodSchema } from "./user.validation";
import { multerUpload } from "../../config/multer.config";

const router = express.Router();

router.post(
    '/create-user', 
    multerUpload.single('picture'),
    validateRequest(createUserZodSchema), 
    UserControllers.createUser
)
router.get('/me', checkAuth(...Object.values(Role)), UserControllers.getMe)
router.get("/all-users", checkAuth(Role.OWNER), UserControllers.getAllUsers )
router.get("/:id", checkAuth(Role.OWNER), UserControllers.getSingleUser )
router.delete("/:id", checkAuth(Role.OWNER), UserControllers.deleteUser )
router.patch("/update-profile", checkAuth(...Object.values(Role)), multerUpload.single('picture'), validateRequest(updateUserZodSchema), UserControllers.updateProfile)
router.patch("/:id", checkAuth(Role.OWNER), multerUpload.single('picture'), validateRequest(updateUserZodSchema), UserControllers.updateUser)


export const userRoutes = router;

