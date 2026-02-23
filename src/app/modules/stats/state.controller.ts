// import httpStatus from "http-status-codes";
// import { Request, Response } from "express";
// import { catchAsync } from "../../utils/catchAsync";
// import { StatsService } from "./state.service";
// import { sendResponse } from "../../utils/sendResponse";


// /* ================= USER ORDER STATS ================= */
// const getOrderStats = catchAsync(async (req: Request, res: Response) => {
//   const data = await StatsService.getOrderStats();

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "User order stats retrieved successfully.",
//     data,
//   });
// });

// /* ================= FOOD STATS ================= */
// const getFoodStats = catchAsync(async (req: Request, res: Response) => {
//   const data = await StatsService.getFoodStats();

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "Food stats retrieved successfully.",
//     data,
//   });
// });

// /* ================= EXPORT ================= */
// export const StatsController = {
//   getOrderStats,
//   getFoodStats,
// };

import httpStatus from "http-status-codes";
import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { StatsService } from "./state.service";
import { sendResponse } from "../../utils/sendResponse";

/* ---------- ORDER STATS ---------- */
const getOrderStats = catchAsync(async (req: Request, res: Response) => {
  const range = (req.query.range as string) || "today";

  const data = await StatsService.getOrderStats(range);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order statistics retrieved successfully",
    data,
  });
});

/* ---------- FOOD STATS ---------- */
const getFoodStats = catchAsync(async (req: Request, res: Response) => {
  const range = (req.query.range as string) || "today";

  const data = await StatsService.getFoodStats(range);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Food statistics retrieved successfully",
    data,
  });
});

export const StatsController = {
  getOrderStats,
  getFoodStats,
};

