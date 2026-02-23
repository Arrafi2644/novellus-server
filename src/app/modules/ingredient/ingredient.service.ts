import httpStatus from 'http-status-codes';

import { QueryBuilder } from '../../utils/QueryBuilder';
import { Ingredient } from './interface.model';
import AppError from '../../errorHelpers/appError';
import { IIngredient } from './ingredient.interface';
import { ingredientSearchableFields } from './ingredient.constant';

const createIngredientService = async (payload: Partial<IIngredient>) => {
    const ingredient = await Ingredient.create(payload);
    return ingredient;
}

const getSingleIngredient = async (id: string) => {
    const ingredient = await Ingredient.findById(id);
    if (!ingredient) {
        throw new AppError(httpStatus.NOT_FOUND, "Ingredient Not Found")
    }
    return {
        data: ingredient
    }
};

const deleteIngredient = async (id: string) => {
    const ingredient = await Ingredient.findById(id);
    if (!ingredient) {
        throw new AppError(httpStatus.NOT_FOUND, "Ingredient Not Found")
    }
     
    await Ingredient.findByIdAndDelete(id);
    
    return {
        data: null
    }
};

const updateIngredient = async (
    ingredientId: string,
    payload: Partial<IIngredient>
) => {
    // Check if ingredient exists
    const existingIngredient = await Ingredient.findById(ingredientId);
    if (!existingIngredient) {
        throw new AppError(httpStatus.NOT_FOUND, "Ingredient not found");
    }

    // Update ingredient
    const updatedIngredient = await Ingredient.findByIdAndUpdate(ingredientId, payload, {
        new: true,
        runValidators: true,
    });

    return updatedIngredient;
};

const getAllIngredients = async (query: Record<string, string>) => {
    const queryBuilder = new QueryBuilder(Ingredient.find(), query)
    const ingredientsData = queryBuilder
        .filter()
        .search(ingredientSearchableFields)
        .sort()
        .fields()
        .paginate();

    const [data, meta] = await Promise.all([
        ingredientsData.build(),
        queryBuilder.getMeta()
    ])

    return {
        data,
        meta
    }
};

export const IngredientServices = {
    createIngredientService,
    getSingleIngredient,
    deleteIngredient,
    updateIngredient,
    getAllIngredients
}
