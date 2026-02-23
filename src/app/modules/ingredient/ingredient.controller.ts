/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from 'http-status-codes';
import { NextFunction, Request, Response } from "express"

import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { IngredientServices } from './ingredient.service';

const createIngredient = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    
    if (req.file) {
        payload.image = (req.file as any).path;
    }

    const ingredient = await IngredientServices.createIngredientService(payload)
    
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Ingredient Created Successfully",
        data: ingredient
    })
})

const getSingleIngredient = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const ingredientId = req.params.id as string
    const result = await IngredientServices.getSingleIngredient(ingredientId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Ingredient Retrieved Successfully",
        data: result.data
    })
})

const deleteIngredient = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const ingredientId = req.params.id as string
    const result = await IngredientServices.deleteIngredient(ingredientId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Ingredient Deleted Successfully",
        data: result.data
    })
})

const updateIngredient = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const ingredientId = req.params.id as string;
    const payload = req.body;
    
    // Get image URL from multer file upload if new image is uploaded
    if (req.file) {
        payload.image = (req.file as any).path;
    }

    const ingredient = await IngredientServices.updateIngredient(ingredientId, payload)
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Ingredient Updated Successfully",
        data: ingredient
    })
})

const getAllIngredients = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const result = await IngredientServices.getAllIngredients(query as Record<string, string>);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "All Ingredients Retrieved Successfully",
        data: result.data,
        meta: result.meta
    })
})


export const IngredientControllers = {
    createIngredient,
    getSingleIngredient,
    deleteIngredient,
    updateIngredient,
    getAllIngredients
}
