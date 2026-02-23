/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from 'http-status-codes';
import { NextFunction, Request, Response } from "express"

import { FoodServices } from './food.service';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';

const createFood = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    
    if (req.file) {
        payload.image = (req.file as any).path;
    }

    const food = await FoodServices.createFoodService(payload)
    
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Food Created Successfully",
        data: food
    })
})

const getSingleFood = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const foodSlug = req.params.slug as string
    const result = await FoodServices.getSingleFood(foodSlug);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Food Retrieved Successfully",
        data: result.data
    })
})

const deleteFood = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const foodId = req.params.id as string
    const result = await FoodServices.deleteFood(foodId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Food Deleted Successfully",
        data: result.data
    })
})

const updateFood = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const foodId = req.params.id as string;
    const payload = req.body;
    
    // Get image URL from multer file upload if new image is uploaded
    if (req.file) {
        payload.image = (req.file as any).path;
    }

    const food = await FoodServices.updateFood(foodId, payload)
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Food Updated Successfully",
        data: food
    })
})

const getAllFoods = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const result = await FoodServices.getAllFoods(query as Record<string, string>);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "All Foods Retrieved Successfully",
        data: result.data,
        meta: result.meta
    })
})


export const FoodControllers = {
    createFood,
    getSingleFood,
    deleteFood,
    updateFood,
    getAllFoods
}
