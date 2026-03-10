
import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/appError";
import { Counter, Order } from "./order.model";
import {
  OrderType,
  OrderStatus,
  DeliveryOption,
  IOrderFoodInput,
} from "./order.interface";
import { User } from "../user/user.model";
import { UserServices } from "../user/user.service";
import { Food } from "../food/food.model";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { orderSearchableFields } from "./order.constants";
import { PaymentMethod, PaymentStatus } from "../payment/payment.interface";
import { Payment } from "../payment/payment.model";
import { stripe } from "../../config/stripe";
import { envVars } from "../../config/env";
import mongoose, { Types } from "mongoose";
import { PaymentService } from "../payment/payment.service";
import { calculateOrderPrice } from "../../utils/calculateOrderTotal";
import { PrintJob } from "../print/print.model";
import { io } from "../../../server";

type TCreateOrderPayload = {
  orderType: OrderType;
  paymentMethod?: PaymentMethod;
  deliveryOption: DeliveryOption;
  foods: IOrderFoodInput[];
  customerInfo: {
    name?: string;
    email: string;
    phone?: string;
    address?: string;
  };
  seller?: string; // seller ID (for POS orders)
};

const getTransactionId = () => {
  return `Tran_${Date.now()}_${Math.floor(Math.random() * 1000)}`
}

// const createOrder = async (payload: TCreateOrderPayload) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const { orderType, foods, customerInfo, deliveryOption } = payload;
//     const getNextCustomOrderId = async (): Promise<number> => {
//       const counter = await Counter.findByIdAndUpdate(
//         { _id: "orderId" },
//         { $inc: { seq: 1 } },
//         { new: true, upsert: true }
//       );
      
//       return counter.seq;
//     };

//     const customOrderId = await getNextCustomOrderId();
//     const calculated = await calculateOrderPrice(foods);
//     const orderDoc: any = {
//       customOrderId,
//       orderType,
//       foods: calculated.foodsWithPrice,
//       totalPrice: calculated.totalPrice,
//       deliveryOption,
//       status: OrderStatus.PENDING,

//     };

//     /* ---------- USER (ONLINE only) ---------- */
//     let user = null;

//     // if (orderType === OrderType.ONLINE && customerInfo) {
//     if (customerInfo) {
//       user = await User.findOne({ email: customerInfo.email }).session(session);

//       if (!user) {
//         user = await UserServices.createUserService(
//           {
//             name: customerInfo.name,
//             email: customerInfo.email,
//             phone: customerInfo.phone,
//             address: customerInfo.address,
//           },
//           session
//         );
//       }

//       orderDoc.user = user._id;

//       // if (deliveryOption === DeliveryOption.DELIVERY) {
//       if (customerInfo) {
//         orderDoc.deliveryAddress = customerInfo.address;
//       }
//     }

//     /* ---------- POS ---------- */
//     if (orderType === OrderType.POS) {
//       orderDoc.seller = payload.seller;
//       orderDoc.status = OrderStatus.COMPLETED;

//       if (deliveryOption === DeliveryOption.DELIVERY) {
//         orderDoc.deliveryAddress = customerInfo?.address;
//       }
//     }

//     /* ---------- CREATE ORDER ---------- */
//     const order = await Order.create([orderDoc], { session });
//     const orderId = order[0]._id;

//     /* ---------- CREATE PAYMENT ---------- */
//     const transactionId = getTransactionId();

//     const payment = await Payment.create(
//       [
//         {
//           order: orderId,
//           transactionId,
//           amount: calculated.totalPrice,
//           paymentStatus:
//             payload.paymentMethod === PaymentMethod.COD
//               ? PaymentStatus.PAID
//               : PaymentStatus.UNPAID,
//           paymentMethod: payload.paymentMethod,
//         },
//       ],
//       { session }
//     );

//     /* ---------- UPDATE ORDER WITH PAYMENT ---------- */
//     const updatedOrder = await Order.findByIdAndUpdate(
//       orderId,
//       {
//         payment: payment[0]._id,
//         status:
//           payload.paymentMethod === PaymentMethod.COD
//             ? OrderStatus.COMPLETED
//             : OrderStatus.PENDING,
//       },
//       { new: true, session }
//     ).populate("payment").populate("foods.food");

//     /* ---------- STRIPE ---------- */
//     let checkoutUrl: string | null = null;

//     if (payload.paymentMethod === PaymentMethod.STRIPE) {
//       const stripeSession = await stripe.checkout.sessions.create({
//         payment_method_types: ["card"],
//         mode: "payment",
//         line_items: [
//           {
//             price_data: {
//               currency: "EUR",
//               product_data: {
//                 name: `Order #${orderId}`,
//               },
//               unit_amount: Math.round(calculated.totalPrice * 100),
//             },
//             quantity: 1,
//           },
//         ],
//         metadata: {
//           orderId: orderId.toString(),
//           paymentId: payment[0]._id.toString(),
//         },
//         // success_url: envVars.STRIPE.STRIPE_SUCCESS_URL,
//         success_url: `${envVars.STRIPE.STRIPE_SUCCESS_URL}?paymentSuccess=true&orderId=${orderId}`,
//         cancel_url: `${envVars.STRIPE.STRIPE_CANCEL_URL}?paymentSuccess=false&orderId=null`,
//       });

//       checkoutUrl = stripeSession.url;
//     }

//     /* ---------- UPDATE FOOD STOCK ---------- */
//     await Promise.all(
//       foods.map(async (f) => {
//         const foodItem = await Food.findById(f.food).session(session);
//         if (foodItem) {
//           // 🔹 total sell update
//           foodItem.totalSell = (foodItem.totalSell || 0) + f.quantity;

//           // 🔹 variant stock update
//           const selectedVariant =
//             f.variant || foodItem.variants.find(v => v.size === "Normal")?.size;

//           if (!selectedVariant) {
//             throw new AppError(httpStatus.BAD_REQUEST, `Variant is required for stock update: ${foodItem.name}`);
//           }

//           const variant = foodItem.variants.find(v => v.size === selectedVariant);

//           if (!variant) {
//             throw new AppError(
//               httpStatus.NOT_FOUND,
//               `Variant "${selectedVariant}" not found for food: ${foodItem.name}`
//             );
//           }

//           if (variant.totalStock < f.quantity) {
//             throw new AppError(
//               httpStatus.BAD_REQUEST,
//               `Insufficient stock for ${foodItem.name} (${variant.size})`
//             );
//           }

//           variant.totalStock -= f.quantity;

//           await foodItem.save({ session });
//         }
//       })
//     );

//     await session.commitTransaction();
//     session.endSession();

//     /* ---------- INVOICE (COD only) ---------- */
//     let invoiceUrl = null;
//     if (payload.paymentMethod === PaymentMethod.COD) {
//       const invoice = await PaymentService.getInvoiceDownloadUrl(
//         payment[0]._id.toString()
//       );
//       invoiceUrl = invoice.downloadUrl;
//     }

//     // Printer job create
//     // await PrintJob.create({
//     //   orderId: order[0]._id.toString(),
//     // });

//     return {
//       order: updatedOrder,
//       checkoutUrl,
//       invoiceUrl,
//     };
//   } catch (err) {
//     await session.abortTransaction();
//     session.endSession();
//     throw err;
//   }
// };




const createOrder = async (payload: TCreateOrderPayload) => {

  const session = await mongoose.startSession();
  session.startTransaction();

  try {

    const { orderType, foods, customerInfo, deliveryOption } = payload;

    const getNextCustomOrderId = async (): Promise<number> => {
      const counter = await Counter.findByIdAndUpdate(
        { _id: "orderId" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );

      return counter.seq;
    };

    const customOrderId = await getNextCustomOrderId();

    const calculated = await calculateOrderPrice(foods);

    const orderDoc: any = {
      customOrderId,
      orderType,
      foods: calculated.foodsWithPrice,
      totalPrice: calculated.totalPrice,
      deliveryOption,
      status: OrderStatus.PENDING,
    };

    /* ---------- USER ---------- */

    let user = null;

    if (customerInfo) {

      user = await User.findOne({ email: customerInfo.email }).session(session);

      if (!user) {

        user = await UserServices.createUserService(
          {
            name: customerInfo.name,
            email: customerInfo.email,
            phone: customerInfo.phone,
            address: customerInfo.address,
          },
          session
        );

      }

      orderDoc.user = user._id;

      orderDoc.deliveryAddress = customerInfo.address;
    }

    /* ---------- POS ---------- */

    if (orderType === OrderType.POS) {

      orderDoc.seller = payload.seller;
      orderDoc.status = OrderStatus.COMPLETED;

      if (deliveryOption === DeliveryOption.DELIVERY) {
        orderDoc.deliveryAddress = customerInfo?.address;
      }

    }

    /* ---------- CREATE ORDER ---------- */

    const order = await Order.create([orderDoc], { session });

    const orderId = order[0]._id;

    /* ---------- CREATE PAYMENT ---------- */

    const transactionId = getTransactionId();

    const payment = await Payment.create(
      [
        {
          order: orderId,
          transactionId,
          amount: calculated.totalPrice,
          paymentStatus:
            payload.paymentMethod === PaymentMethod.COD
              ? PaymentStatus.PAID
              : PaymentStatus.UNPAID,
          paymentMethod: payload.paymentMethod,
        },
      ],
      { session }
    );

    /* ---------- UPDATE ORDER ---------- */

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        payment: payment[0]._id,
        status:
          payload.paymentMethod === PaymentMethod.COD
            ? OrderStatus.COMPLETED
            : OrderStatus.PENDING,
      },
      { new: true, session }
    )
      .populate("payment")
      .populate("foods.food");

    /* ---------- STRIPE ---------- */

    let checkoutUrl: string | null = null;

    if (payload.paymentMethod === PaymentMethod.STRIPE) {

      const stripeSession = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "EUR",
              product_data: {
                name: `Order #${orderId}`,
              },
              unit_amount: Math.round(calculated.totalPrice * 100),
            },
            quantity: 1,
          },
        ],
        metadata: {
          orderId: orderId.toString(),
          paymentId: payment[0]._id.toString(),
        },
        success_url: `${envVars.STRIPE.STRIPE_SUCCESS_URL}?paymentSuccess=true&orderId=${orderId}`,
        cancel_url: `${envVars.STRIPE.STRIPE_CANCEL_URL}?paymentSuccess=false&orderId=null`,
      });

      checkoutUrl = stripeSession.url;

    }

    /* ---------- UPDATE FOOD STOCK ---------- */

    await Promise.all(

      foods.map(async (f) => {

        const foodItem = await Food.findById(f.food).session(session);

        if (foodItem) {

          foodItem.totalSell = (foodItem.totalSell || 0) + f.quantity;

          const selectedVariant =
            f.variant || foodItem.variants.find(v => v.size === "Normal")?.size;

          const variant = foodItem.variants.find(v => v.size === selectedVariant);

          if (!variant) {
            throw new AppError(
              httpStatus.NOT_FOUND,
              `Variant "${selectedVariant}" not found for food: ${foodItem.name}`
            );
          }

          if (variant.totalStock < f.quantity) {
            throw new AppError(
              httpStatus.BAD_REQUEST,
              `Insufficient stock for ${foodItem.name} (${variant.size})`
            );
          }

          variant.totalStock -= f.quantity;

          await foodItem.save({ session });

        }

      })

    );

    /* ---------- COMMIT TRANSACTION ---------- */

    await session.commitTransaction();
    session.endSession();

    /* ---------- SOCKET EVENT ---------- */

    if (updatedOrder) {
      io.emit("new-order", updatedOrder);
    }

    /* ---------- INVOICE ---------- */

    let invoiceUrl = null;

    if (payload.paymentMethod === PaymentMethod.COD) {

      const invoice = await PaymentService.getInvoiceDownloadUrl(
        payment[0]._id.toString()
      );

      invoiceUrl = invoice.downloadUrl;

    }

    return {
      order: updatedOrder,
      checkoutUrl,
      invoiceUrl,
    };

  } catch (err) {

    await session.abortTransaction();
    session.endSession();

    throw err;

  }
};

const getSingleOrder = async (id: string) => {
  const order = await Order.findById(id).populate("user").populate("seller").populate("payment").populate("foods.food");
  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, "Order Not Found");
  }
  return { data: order };
};

const deleteOrder = async (id: string) => {
  const order = await Order.findById(id);
  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, "Order Not Found");
  }

  await Order.findByIdAndDelete(id);
  return { data: null };
};

const updateOrder = async (orderId: string, payload: Partial<any>) => {
  const existingOrder = await Order.findById(orderId);
  if (!existingOrder) {
    throw new AppError(httpStatus.NOT_FOUND, "Order Not Found");
  }

  // Optional: restrict certain fields if needed (like totalPrice)
  const updatedOrder = await Order.findByIdAndUpdate(orderId, payload, {
    new: true,
    runValidators: true,
  });

  return updatedOrder;
};

const getAllOrders = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(Order.find(), query);
  const ordersData = queryBuilder.filter().search(orderSearchableFields).sort().fields().paginate().build()
    .populate("user")
    .populate("seller")
    .populate("payment")
    .populate("foods.food");;

  // const [data, meta] = await Promise.all([ordersData.build(), queryBuilder.getMeta()]);
  const [data, meta] = await Promise.all([
    ordersData,
    queryBuilder.getMeta(),
  ]);
  return { data, meta };
};

// const getMyOrders = async (userId: string, query: Record<string, string>) => {
//   const baseQuery = Order.find({
//     $or: [
//       { user: userId },
//       { seller: userId },
//     ],
//   });

//   let queryBuilder = new QueryBuilder(
//     Order.find({
//       $or: [
//         { user: userId },
//         { seller: userId }
//       ]
//     }),
//     query
//   );

//   const ordersQuery = queryBuilder.filter().sort().fields().paginate();

//   const [orders, meta] = await Promise.all([ordersQuery.build(), queryBuilder.getMeta(baseQuery)]);

//   return { data: orders, meta };
// };

const getMyOrders = async (userId: string, query: Record<string, string>) => {
  let userObjectId: Types.ObjectId;
  try {
    userObjectId = new Types.ObjectId(userId);
  } catch (err) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid user ID");
  }

  const baseQuery = Order.find({
    $or: [
      { user: userObjectId },
      { seller: userObjectId },
    ],
  });

  let queryBuilder = new QueryBuilder(baseQuery, query);

  queryBuilder = queryBuilder.search([
    "customerInfo.name",
    "customerInfo.email",
  ]);

  queryBuilder = queryBuilder
    .filter()
    .sort()
    .fields()
    .paginate();

  // Final query execute + populate
  const orders = await queryBuilder
    .build()
    .populate({
      path: "payment",
      select: "paymentMethod transactionId amount paymentStatus createdAt",
    })
    .populate({
      path: "foods.food",
      select: "name price image description",
    })
    .exec();

  // Meta data (pagination info)
  const meta = await queryBuilder.getMeta();

  return {
    data: orders,
    meta,
  };
};
export const OrderServices = {
  createOrder,
  getSingleOrder,
  deleteOrder,
  updateOrder,
  getAllOrders,
  getMyOrders
};

