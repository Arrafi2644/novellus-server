/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from 'http-status-codes';
import { NextFunction, Request, Response } from "express"

import { CategoryServices } from './category.service';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';

const createCategory = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    
    if (req.file) {
        payload.image = (req.file as any).path;
    }

    const category = await CategoryServices.createCategoryService(payload)
    
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Category Created Successfully",
        data: category
    })
})

const getSingleCategory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const categorySlug = req.params.slug as string
    const result = await CategoryServices.getSingleCategory(categorySlug);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Category Retrieved Successfully",
        data: result.data
    })
})

const deleteCategory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const categoryId = req.params.id as string
    const result = await CategoryServices.deleteCategory(categoryId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Category Deleted Successfully",
        data: result.data
    })
})

const updateCategory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const categoryId = req.params.id as string;
    const payload = req.body;
    
    // Get image URL from multer file upload if new image is uploaded
    if (req.file) {
        payload.image = (req.file as any).path;
    }

    const category = await CategoryServices.updateCategory(categoryId, payload)
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Category Updated Successfully",
        data: category
    })
})

const getAllCategories = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const result = await CategoryServices.getAllCategories(query as Record<string, string>);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "All Categories Retrieved Successfully",
        data: result.data,
        meta: result.meta
    })
})


export const CategoryControllers = {
    createCategory,
    getSingleCategory,
    deleteCategory,
    updateCategory,
    getAllCategories
}
