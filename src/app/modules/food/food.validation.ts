// import { string, z } from "zod";
// import { FoodStatus } from "./food.interface";

// // Create Food Schema
// export const createFoodZodSchema = z.object({
//   name: z
//     .string({ invalid_type_error: "Name must be a string" })
//     .min(1, { message: "Name is required" }),
//   category: z
//     .string({ invalid_type_error: "Category must be a string" })
//     .min(1, { message: "Category is required" }),
//   description: z
//     .string({ invalid_type_error: "Description must be a string" })
//     .min(1, { message: "Description is required" }),
//   price: z
//     .number({ invalid_type_error: "Price must be a number" })
//     .min(0, { message: "Price must be positive" }),
//   offerPrice: z
//     .number({ invalid_type_error: "Offer price must be a number" })
//     .min(0, { message: "Offer price must be positive" }).optional(),
//   image: z.string({ invalid_type_error: "Image must be a string" }).optional(),
//   status: z.enum([FoodStatus.ACTIVE, FoodStatus.INACTIVE], {
//     invalid_type_error: "Status must be either ACTIVE or INACTIVE",
//   }).optional(),
//   // ingredients: z.array(string).optional(),
//   ingredients: z.array(z.string()).optional(),
//   totalSell: z.number({ invalid_type_error: "Total sell must be a number" }).optional(),
//   totalStock: z.number({ invalid_type_error: "Total stock must be a number" }).optional(),
//   quantity: z
//     .number({ invalid_type_error: "Quantity must be a number" })
//     .min(0, { message: "Quantity must be positive" }).optional(),
//   unit: z
//     .string({ invalid_type_error: "Unit must be a string" })
//     .min(1, { message: "Unit is required" }),
//   slug: z.string({ invalid_type_error: "Slug must be a string" }).optional(),
// });

// // Update Food Schema
// export const updateFoodZodSchema = z.object({
//   name: z
//     .string({ invalid_type_error: "Name must be a string" })
//     .min(1, { message: "Name is required" })
//     .optional(),
//   category: z
//     .string({ invalid_type_error: "Category must be a string" })
//     .min(1, { message: "Category is required" })
//     .optional(),
//   description: z
//     .string({ invalid_type_error: "Description must be a string" })
//     .min(1, { message: "Description is required" })
//     .optional(),
//   price: z
//     .number({ invalid_type_error: "Price must be a number" })
//     .min(0, { message: "Price must be positive" }).optional(),
//   offerPrice: z
//     .number({ invalid_type_error: "Offer price must be a number" })
//     .min(0, { message: "Offer price must be positive" }).optional(),
//   image: z.string({ invalid_type_error: "Image must be a string" }).optional(),
//   status: z.enum([FoodStatus.ACTIVE, FoodStatus.INACTIVE], {
//     invalid_type_error: "Status must be either ACTIVE or INACTIVE",
//   }).optional(),
//   ingredients: z.array(z.string()).optional(),
//   totalSell: z.number({ invalid_type_error: "Total sell must be a number" }).optional(),
//   totalStock: z.number({ invalid_type_error: "Total stock must be a number" }).optional(),
//   quantity: z
//     .number({ invalid_type_error: "Quantity must be a number" })
//     .min(0, { message: "Quantity must be positive" })
//     .optional(),
//   unit: z
//     .string({ invalid_type_error: "Unit must be a string" })
//     .min(1, { message: "Unit is required" })
//     .optional(),
//   slug: z.string({ invalid_type_error: "Slug must be a string" }).optional(),
// });

import { z } from "zod";
import { FoodStatus } from "./food.interface";

// Variant এর schema
const variantSchema = z.object({
  size: z.string().min(1, { message: "Size name is required" }),
  price: z.number().min(0, { message: "Price cannot be negative" }),
  offerPrice: z.number().min(0, { message: "Offer price cannot be negative" }).optional().nullable(),
  totalStock: z.number().min(0, { message: "Stock cannot be negative" }),
});

// Create Food Schema
export const createFoodZodSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  category: z.string().min(1, { message: "Category is required" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  unit: z.string().min(1, { message: "Unit is required" }),
  status: z.enum([FoodStatus.ACTIVE, FoodStatus.INACTIVE]).optional(),
  ingredients: z.array(z.string()).optional(),
  image: z.string().optional(), // backend এ upload করলে string হবে

  // Variants — required এবং অন্তত একটা থাকতে হবে
  variants: z
    .array(variantSchema)
    .min(1, { message: "At least one variant (size) is required" }),
});

// Update Food Schema (optional fields)
export const updateFoodZodSchema = createFoodZodSchema.partial().extend({
  variants: z
    .array(variantSchema)
    .min(1, { message: "At least one variant (size) is required" })
    .optional(),
});