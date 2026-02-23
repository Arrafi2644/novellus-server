import { z } from "zod";

// Create Ingredient Schema
export const createIngredientZodSchema = z.object({
    name: z
        .string({ invalid_type_error: "Name must be a string" })
        .min(1, { message: "Name is required" }),
    price: z
        .number({ invalid_type_error: "Price must be a number" })
        .min(0, { message: "Price must be a positive number" }),

});

// Update Ingredient Schema
export const updateIngredientZodSchema = z.object({
    name: z
        .string({ invalid_type_error: "Name must be a string" })
        .min(1, { message: "Name is required" })
        .optional(),
    price: z
        .number({ invalid_type_error: "Price must be a number" })
        .min(0, { message: "Price must be a positive number" })
        .optional(),

});
