// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { Order } from "../order/order.model";
// import { OrderStatus } from "../order/order.interface";
// import { Food } from "../food/food.model";

// const now = new Date();
// const sevenDaysAgo = new Date(now).setDate(now.getDate() - 7);
// const thirtyDaysAgo = new Date(now).setDate(now.getDate() - 30);

// const getOrderStats = async () => {
//   const totalOrderPromise = Order.countDocuments();

//   const totalOrderByStatusPromise = Order.aggregate([
//     {
//       $group: {
//         _id: "$status",
//         count: { $sum: 1 },
//       },
//     },
//   ]);

//   const orderInLast7DaysPromise = Order.countDocuments({
//     createdAt: { $gte: sevenDaysAgo },
//   });

//   const orderInLast30DaysPromise = Order.countDocuments({
//     createdAt: { $gte: thirtyDaysAgo },
//   });

//   const orderByOrderTypePromise = Order.aggregate([
//     {
//       $group: {
//         _id: "$orderType",
//         count: { $sum: 1 },
//       },
//     },
//   ]);

//   const orderByDeliveryOptionPromise = Order.aggregate([
//     {
//       $group: {
//         _id: "$deliveryOption",
//         count: { $sum: 1 },
//       },
//     },
//   ]);

//   const totalRevenuePromise = Order.aggregate([
//     {
//       $match: { status: OrderStatus.COMPLETED },
//     },
//     {
//       $group: {
//         _id: null,
//         totalRevenue: { $sum: "$totalPrice" },
//       },
//     },
//   ]);

//   const [
//     totalOrder,
//     totalOrderByStatus,
//     orderInLast7Days,
//     orderInLast30Days,
//     orderByOrderType,
//     orderByDeliveryOption,
//     totalRevenue,
//   ] = await Promise.all([
//     totalOrderPromise,
//     totalOrderByStatusPromise,
//     orderInLast7DaysPromise,
//     orderInLast30DaysPromise,
//     orderByOrderTypePromise,
//     orderByDeliveryOptionPromise,
//     totalRevenuePromise,
//   ]);

//   return {
//     totalOrder,
//     totalOrderByStatus,
//     orderInLast7Days,
//     orderInLast30Days,
//     orderByOrderType,
//     orderByDeliveryOption,
//     totalRevenue: totalRevenue[0]?.totalRevenue || 0,
//   };
// };

// const getOrderTrend = async (range: string) => {
//   const { startDate, endDate } = getDateRange(range);

//   return Order.aggregate([
//     {
//       $match: {
//         createdAt: { $gte: startDate, $lte: endDate },
//       },
//     },
//     {
//       $group: {
//         _id: {
//           $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
//         },
//         totalOrders: { $sum: 1 },
//       },
//     },
//     { $sort: { _id: 1 } },
//   ]);
// };

// const getTopSellingFoods = async (range: string) => {
//   const { startDate, endDate } = getDateRange(range);

//   return Order.aggregate([
//     {
//       $match: {
//         createdAt: { $gte: startDate, $lte: endDate },
//       },
//     },

//     { $unwind: "$foods" },

//     {
//       $group: {
//         _id: "$foods.food",
//         totalSold: { $sum: "$foods.quantity" },
//       },
//     },

//     { $sort: { totalSold: -1 } },

//     { $limit: 7 },

//     {
//       $lookup: {
//         from: "foods",
//         localField: "_id",
//         foreignField: "_id",
//         as: "food",
//       },
//     },

//     { $unwind: "$food" },

//     {
//       $project: {
//         totalSold: 1,
//         "food.name": 1,
//         "food.price": 1,
//       },
//     },
//   ]);
// };

// const getFoodStats = async () => {
//   const totalFoodPromise = Food.countDocuments();

//   const mostSoldFoodPromise = Order.aggregate([
//     { $unwind: "$foods" },

//     {
//       $group: {
//         _id: "$foods.food",
//         totalSold: { $sum: "$foods.quantity" },
//       },
//     },

//     { $sort: { totalSold: -1 } },

//     { $limit: 5 },

//     {
//       $lookup: {
//         from: "foods",
//         localField: "_id",
//         foreignField: "_id",
//         as: "food",
//       },
//     },

//     { $unwind: "$food" },

//     {
//       $project: {
//         totalSold: 1,
//         "food.name": 1,
//         "food.price": 1,
//       },
//     },
//   ]);

//   const categoryWiseSellPromise = Order.aggregate([
//     { $unwind: "$foods" },

//     {
//       $lookup: {
//         from: "foods",
//         localField: "foods.food",
//         foreignField: "_id",
//         as: "food",
//       },
//     },

//     { $unwind: "$food" },

//     {
//       $group: {
//         _id: "$food.category",
//         totalSold: { $sum: "$foods.quantity" },
//       },
//     },
//   ]);

//   const lowStockFoodPromise = Food.find({ totalStock: { $lte: 5 } }).select(
//     "name totalStock"
//   );

//   const [totalFood, mostSoldFood, categoryWiseSell, lowStockFood] =
//     await Promise.all([
//       totalFoodPromise,
//       mostSoldFoodPromise,
//       categoryWiseSellPromise,
//       lowStockFoodPromise,
//     ]);

//   return {
//     totalFood,
//     mostSoldFood,
//     categoryWiseSell,
//     lowStockFood,
//   };
// };

// export const StatsService = {
//   getOrderStats,
//   getFoodStats,
// };


// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { Order } from "../order/order.model";
// import { Food } from "../food/food.model";

// /* ---------- Date Range Helper ---------- */
// const getDateRange = (range: string) => {
//   const now = new Date();
//   let startDate: Date;

//   switch (range) {
//     case "today":
//       startDate = new Date();
//       startDate.setHours(0, 0, 0, 0);
//       break;

//     case "7days":
//       startDate = new Date(now);
//       startDate.setDate(now.getDate() - 6);
//       break;

//     case "30days":
//       startDate = new Date(now);
//       startDate.setDate(now.getDate() - 29);
//       break;

//     default:
//       startDate = new Date(0); // all time
//   }

//   return { startDate, endDate: now };
// };

// /* ========================================================= */
// /* ===================== ORDER STATS ======================= */
// /* ========================================================= */

// const getOrderStats = async (range: string) => {
//   const { startDate, endDate } = getDateRange(range);

//   /* ---------- Basic Order Stats (আগের গুলো) ---------- */
//   const totalOrdersPromise = Order.countDocuments();

//   const totalOrdersByStatusPromise = Order.aggregate([
//     {
//       $group: {
//         _id: "$status",
//         count: { $sum: 1 },
//       },
//     },
//   ]);

//   /* ---------- Order Trend (Date wise) ---------- */
//   const orderTrendPromise = Order.aggregate([
//     {
//       $match: {
//         createdAt: { $gte: startDate, $lte: endDate },
//       },
//     },
//     {
//       $group: {
//         _id: {
//           $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
//         },
//         totalOrders: { $sum: 1 },
//       },
//     },
//     { $sort: { _id: 1 } },
//   ]);

//   const [totalOrders, totalOrdersByStatus, orderTrend] =
//     await Promise.all([
//       totalOrdersPromise,
//       totalOrdersByStatusPromise,
//       orderTrendPromise,
//     ]);

//   return {
//     totalOrders,
//     totalOrdersByStatus,
//     orderTrend, // 📊 chart-ready
//   };
// };

// /* ========================================================= */
// /* ====================== FOOD STATS ======================= */
// /* ========================================================= */

// const getFoodStats = async (range: string) => {
//   const { startDate, endDate } = getDateRange(range);

//   /* ---------- Basic Food Stats ---------- */
//   const totalFoodsPromise = Food.countDocuments();

//   /* ---------- Top Selling Foods ---------- */
//   const topSellingFoodsPromise = Order.aggregate([
//     {
//       $match: {
//         createdAt: { $gte: startDate, $lte: endDate },
//       },
//     },

//     { $unwind: "$foods" },

//     {
//       $group: {
//         _id: "$foods.food",
//         totalSold: { $sum: "$foods.quantity" },
//       },
//     },

//     { $sort: { totalSold: -1 } },

//     { $limit: 7 },

//     {
//       $lookup: {
//         from: "foods",
//         localField: "_id",
//         foreignField: "_id",
//         as: "food",
//       },
//     },

//     { $unwind: "$food" },

//     {
//       $project: {
//         _id: 1,
//         totalSold: 1,
//         "food.name": 1,
//         "food.price": 1,
//         "food.image": 1,
//       },
//     },
//   ]);

//   const [totalFoods, topSellingFoods] = await Promise.all([
//     totalFoodsPromise,
//     topSellingFoodsPromise,
//   ]);

//   return {
//     totalFoods,
//     topSellingFoods,
//   };
// };

// export const StatsService = {
//   getOrderStats,
//   getFoodStats,
// };


// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { Order } from "../order/order.model";
// import { Food } from "../food/food.model";

// /* ---------- Date Range Helper ---------- */
// const getDateRange = (range: string) => {
//   const now = new Date();
//   let startDate: Date;

//   switch (range) {
//     case "today":
//       startDate = new Date();
//       startDate.setHours(0, 0, 0, 0);
//       break;

//     case "7days":
//       startDate = new Date(now);
//       startDate.setDate(now.getDate() - 6);
//       startDate.setHours(0, 0, 0, 0);
//       break;

//     case "30days":
//       startDate = new Date(now);
//       startDate.setDate(now.getDate() - 29);
//       startDate.setHours(0, 0, 0, 0);
//       break;

//     default:
//       // "all" or unknown value → from beginning of time
//       startDate = new Date(0);
//       break;
//   }

//   return { startDate, endDate: now };
// };

// /* ========================================================= */
// /* ===================== ORDER STATS ======================= */
// /* ========================================================= */
// const getOrderStats = async (range: string) => {
//   const { startDate, endDate } = getDateRange(range);

//   const dateFilter = {
//     createdAt: { $gte: startDate, $lte: endDate },
//   };

//   // 1. Total orders in selected range
//   const totalOrdersPromise = Order.countDocuments(dateFilter);

//   // 2. Total revenue in selected range
//   // IMPORTANT: Change "$totalAmount" to your actual field name if different
//   // Common alternatives: total, grandTotal, amount, payableAmount, finalAmount, etc.
//   const totalRevenuePromise = Order.aggregate([
//     { $match: dateFilter },
//     {
//       $group: {
//         _id: null,
//         totalRevenue: { $sum: "$totalAmount" },
//       },
//     },
//   ]).then((results) => results[0]?.totalRevenue || 0);

//   // 3. Count orders by status in selected range
//   const statusPromise = Order.aggregate([
//     { $match: dateFilter },
//     {
//       $group: {
//         _id: "$status",
//         count: { $sum: 1 },
//       },
//     },
//   ]);

//   // 4. Daily order trend (for chart)
//   const trendPromise = Order.aggregate([
//     { $match: dateFilter },
//     {
//       $group: {
//         _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
//         totalOrders: { $sum: 1 },
//       },
//     },
//     { $sort: { _id: 1 } },
//   ]);

//   const [totalOrders, totalRevenue, statusResult, trendResult] = await Promise.all([
//     totalOrdersPromise,
//     totalRevenuePromise,
//     statusPromise,
//     trendPromise,
//   ]);

//   // Convert status array → object
//   const statusMap = statusResult.reduce((acc: Record<string, number>, item: any) => {
//     acc[item._id] = item.count;
//     return acc;
//   }, {});

//   return {
//     totalOrders: totalOrders || 0,
//     totalRevenue: Math.round(totalRevenue || 0), // avoid floating point issues
//     pendingOrders: statusMap["PENDING"] || 0,
//     completedOrders: statusMap["COMPLETED"] || 0,
//     cancelledOrders: statusMap["CANCELLED"] || 0,
//     // add other statuses if you have more (e.g. PROCESSING, DELIVERED, etc.)
//     orderTrend: trendResult || [],
//   };
// };

// /* ========================================================= */
// /* ====================== FOOD STATS ======================= */
// /* ========================================================= */
// const getFoodStats = async (range: string) => {
//   const { startDate, endDate } = getDateRange(range);

//   const dateFilter = {
//     createdAt: { $gte: startDate, $lte: endDate },
//   };

//   // Total foods → usually all-time (most common pattern)
//   // If you want only foods created in this range → use dateFilter below
//   const totalFoodsPromise = Food.countDocuments(); // ← all time
//   // const totalFoodsPromise = Food.countDocuments(dateFilter); // ← only in range

//   // Top selling foods (sales in selected range)
//   const topSellingPromise = Order.aggregate([
//     { $match: dateFilter },
//     { $unwind: "$foods" },
//     {
//       $group: {
//         _id: "$foods.food",
//         totalSold: { $sum: "$foods.quantity" },
//       },
//     },
//     { $sort: { totalSold: -1 } },
//     { $limit: 7 },
//     {
//       $lookup: {
//         from: "foods",
//         localField: "_id",
//         foreignField: "_id",
//         as: "food",
//       },
//     },
//     { $unwind: { path: "$food", preserveNullAndEmptyArrays: true } },
//     {
//       $project: {
//         _id: 1,
//         totalSold: 1,
//         "food.name": 1,
//         "food.price": 1,
//         "food.image": 1,
//       },
//     },
//   ]);

//   const [totalFoods, topSellingFoods] = await Promise.all([
//     totalFoodsPromise,
//     topSellingPromise,
//   ]);

//   return {
//     totalFoods: totalFoods || 0,
//     topSellingFoods: topSellingFoods || [],
//   };
// };

// /* ========================================================= */
// /* ==================== EXPORT SERVICE ==================== */
// /* ========================================================= */
// export const StatsService = {
//   getOrderStats,
//   getFoodStats,
// };

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Order } from "../order/order.model";
import { Food } from "../food/food.model";
import { Payment } from "../payment/payment.model";   // ← Payment মডেল ইম্পোর্ট করতে হবে

/* ---------- Date Range Helper ---------- */
const getDateRange = (range: string) => {
  const now = new Date();
  let startDate: Date;

  switch (range) {
    case "today":
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      break;

    case "7days":
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
      break;

    case "30days":
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 29);
      startDate.setHours(0, 0, 0, 0);
      break;

    default:
      startDate = new Date(0); // all time
      break;
  }

  return { startDate, endDate: now };
};

/* ========================================================= */
/* ===================== ORDER STATS ======================= */
/* ========================================================= */
const getOrderStats = async (range: string) => {
  const { startDate, endDate } = getDateRange(range);

  const dateFilter = {
    createdAt: { $gte: startDate, $lte: endDate },
  };

  // 1. Total orders in range
  const totalOrdersPromise = Order.countDocuments(dateFilter);

  // 2. Total revenue → শুধু PAID payments থেকে
  const totalRevenuePromise = Payment.aggregate([
    {
      $match: {
        ...dateFilter,
        paymentStatus: "PAID",
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$amount" },
      },
    },
  ]).then((results) => results[0]?.totalRevenue || 0);

  // 3. Orders by status in range
  const statusPromise = Order.aggregate([
    { $match: dateFilter },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  // 4. Daily order trend
  const trendPromise = Order.aggregate([
    { $match: dateFilter },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        totalOrders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const [
    totalOrders,
    totalRevenue,
    statusResult,
    trendResult,
  ] = await Promise.all([
    totalOrdersPromise,
    totalRevenuePromise,
    statusPromise,
    trendPromise,
  ]);

  const statusMap = statusResult.reduce((acc: Record<string, number>, item: any) => {
    acc[item._id] = item.count;
    return acc;
  }, {});

  return {
    totalOrders: totalOrders || 0,
    totalRevenue: Math.round(totalRevenue || 0),
    pendingOrders: statusMap["PENDING"] || 0,
    completedOrders: statusMap["COMPLETED"] || 0,
    cancelledOrders: statusMap["CANCELLED"] || 0,
    orderTrend: trendResult || [],
  };
};

/* ========================================================= */
/* ====================== FOOD STATS ======================= */
/* ========================================================= */
const getFoodStats = async (range: string) => {
  const { startDate, endDate } = getDateRange(range);

  const dateFilter = {
    createdAt: { $gte: startDate, $lte: endDate },
  };

  // Total foods (all time - সাধারণত এটাই চলে)
  const totalFoodsPromise = Food.countDocuments();

  // Top selling foods in range
  const topSellingPromise = Order.aggregate([
    { $match: dateFilter },
    { $unwind: "$foods" },
    {
      $group: {
        _id: "$foods.food",
        totalSold: { $sum: "$foods.quantity" },
      },
    },
    { $sort: { totalSold: -1 } },
    { $limit: 7 },
    {
      $lookup: {
        from: "foods",
        localField: "_id",
        foreignField: "_id",
        as: "food",
      },
    },
    { $unwind: "$food" },
    {
      $project: {
        _id: 1,
        totalSold: 1,
        "food.name": 1,
        "food.price": 1,
        "food.image": 1,
      },
    },
  ]);

  const [totalFoods, topSellingFoods] = await Promise.all([
    totalFoodsPromise,
    topSellingPromise,
  ]);

  return {
    totalFoods: totalFoods || 0,
    topSellingFoods: topSellingFoods || [],
  };
};

export const StatsService = {
  getOrderStats,
  getFoodStats,
};