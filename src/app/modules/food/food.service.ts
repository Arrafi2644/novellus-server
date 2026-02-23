import httpStatus from 'http-status-codes';
import { IFood } from "./food.interface";
import AppError from '../../errorHelpers/appError';
import { Food } from './food.model';
import { foodSearchableFields } from './food.constants';
import { QueryBuilder } from '../../utils/QueryBuilder';
import mongoose from 'mongoose';

const createFoodService = async (payload: Partial<IFood>) => {
    // Validate category exists if provided
    if (payload.category) {
        const isValidCategory = mongoose.Types.ObjectId.isValid(payload.category as any);
        if (!isValidCategory) {
            throw new AppError(httpStatus.BAD_REQUEST, "Invalid category ID");
        }
    }

    // ✅ Validate ingredients (ObjectId array)
    if (payload.ingredients && payload.ingredients.length > 0) {
        const invalidIngredient = payload.ingredients.find(
            (id) => !mongoose.Types.ObjectId.isValid(id as any)
        );

        if (invalidIngredient) {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                "One or more ingredient IDs are invalid"
            );
        }
    }


    const food = await Food.create(payload);
    return food;
}

const getSingleFood = async (slug: string) => {
    const food = await Food.findOne({ slug }).populate('category');
    if (!food) {
        throw new AppError(httpStatus.NOT_FOUND, "Food Not Found")
    }
    return {
        data: food
    }
};

const deleteFood = async (id: string) => {
    const food = await Food.findById(id);
    if (!food) {
        throw new AppError(httpStatus.NOT_FOUND, "Food Not Found")
    }

    await Food.findByIdAndDelete(id);

    return {
        data: null
    }
};

const updateFood = async (
    foodId: string,
    payload: Partial<IFood>
) => {
    // Check if food exists
    const existingFood = await Food.findById(foodId);
    if (!existingFood) {
        throw new AppError(httpStatus.NOT_FOUND, "Food not found");
    }

    // Validate category if provided
    if (payload.category) {
        const isValidCategory = mongoose.Types.ObjectId.isValid(payload.category as any);
        if (!isValidCategory) {
            throw new AppError(httpStatus.BAD_REQUEST, "Invalid category ID");
        }
    }

    // Update food
    const updatedFood = await Food.findByIdAndUpdate(foodId, payload, {
        new: true,
        runValidators: true,
    }).populate('category');

    return updatedFood;
};

const getAllFoods = async (query: Record<string, string>) => {
    const queryBuilder = new QueryBuilder(Food.find().populate('category').populate("ingredients"), query)
    const foodsData = queryBuilder
        .filter()
        .search(foodSearchableFields)
        .sort()
        .fields()
        .paginate();

    const [data, meta] = await Promise.all([
        foodsData.build(),
        queryBuilder.getMeta()
    ])

    return {
        data,
        meta
    }
};

export const FoodServices = {
    createFoodService,
    getSingleFood,
    deleteFood,
    updateFood,
    getAllFoods
}
