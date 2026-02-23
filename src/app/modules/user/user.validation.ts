import { z } from "zod";
import { Role } from "./user.interface";

// Create User Schema
export const createUserZodSchema = z.object({
  name: z
    .string({ invalid_type_error: "Name must be a string" })
    .min(1, { message: "Name is required" }),
  email: z
    .string({ invalid_type_error: "Email must be a string" })
    .email({ message: "Invalid email address" }),
  password: z
    .string({ invalid_type_error: "Password must be a string" })
    .min(6, { message: "Password must be at least 6 characters long" })
    .optional(),
  picture: z.string({ invalid_type_error: "Picture must be a string" }).optional(),
  role: z.enum([Role.SELLER, Role.USER, Role.OWNER], {
    invalid_type_error: "Role must be either OWNER or USER or SELLER",
  }).optional(),
  phone: z
    .string({ invalid_type_error: "Phone number must be a string" })
    .min(1, { message: "Phone number is required" }),
  address: z
    .string({ invalid_type_error: "Address must be a string" })
    .min(2, { message: "Address is required" }),
});

// Update User Schema
export const updateUserZodSchema = z.object({
  name: z.string({ invalid_type_error: "Name must be a string" }).optional(),
  email: z
    .string({ invalid_type_error: "Email must be a string" })
    .email({ message: "Invalid email address" })
    .optional(),
  password: z
    .string({ invalid_type_error: "Password must be a string" })
    .min(6, { message: "Password must be at least 6 characters long" })
    .optional(),
  picture: z.string({ invalid_type_error: "Picture must be a string" }).optional(),
  role: z.enum([Role.SELLER, Role.USER, Role.OWNER], {
    invalid_type_error: "Role must be either OWNER or USER or SELLER",
  }).optional(),
  phone: z
    .string({ invalid_type_error: "Phone number must be a string" }).optional(),
  address: z
    .string({ invalid_type_error: "Address must be a string" })
    .min(2, { message: "Address is required" }).optional(),
});
