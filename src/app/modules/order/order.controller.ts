
/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from "http-status-codes";
import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { OrderServices } from "./order.service";

// const createOrder = catchAsync(async (req: Request, res: Response) => {
//   const payload = req.body;
//   const decodedToken = req.user as JwtPayload | undefined;

//   const createdOrder = await OrderServices.createOrder(payload, decodedToken);

//   sendResponse(res, {
//     statusCode: httpStatus.CREATED,
//     success: true,
//   message: "Order created successfully",
//     data: {
//       order: createdOrder.data,
//     },
//   });
// });

const createOrder = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  const createdOrder = await OrderServices.createOrder(payload);

    console.log({createOrder})

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Order created successfully",
    data: createdOrder,
  });
});

/* ===================== GET SINGLE ORDER ===================== */
const getSingleOrder = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const orderId = req.params.id as string;
    const result = await OrderServices.getSingleOrder(orderId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Order Retrieved Successfully",
        data: result.data
    });
});

/* ===================== DELETE ORDER ===================== */
const deleteOrder = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const orderId = req.params.id as string;
    const result = await OrderServices.deleteOrder(orderId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Order Deleted Successfully",
        data: result.data
    });
});

/* ===================== UPDATE ORDER ===================== */
const updateOrder = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const orderId = req.params.id as string;
    const payload = req.body;

    const updatedOrder = await OrderServices.updateOrder(orderId, payload);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Order Updated Successfully",
        data: updatedOrder
    });
});

/* ===================== GET ALL ORDERS ===================== */
const getAllOrders = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const result = await OrderServices.getAllOrders(query as Record<string, string>);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "All Orders Retrieved Successfully",
        data: result.data,
        meta: result.meta
    });
});

const getMyOrders = catchAsync(async (req: Request, res: Response) => {
  const decodedToken = req.user as JwtPayload;
  const query = req.query as Record<string, string>;

  const result = await OrderServices.getMyOrders(decodedToken.userId, query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Your Orders Retrieved Successfully",
    data: result.data,
    meta: result.meta,
  });
});

export const OrderControllers = {
    createOrder,
    getSingleOrder,
    deleteOrder,
    updateOrder,
    getAllOrders,
    getMyOrders
};