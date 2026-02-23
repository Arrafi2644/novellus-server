import { model, Schema } from "mongoose";
import { IIngredient } from "./ingredient.interface";

const ingredientSchema = new Schema<IIngredient>({
    name: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    price: {
        type: Number,
        required: true,
    }
}, {
    timestamps: true,
});

export const Ingredient = model<IIngredient>("Ingredient", ingredientSchema)
