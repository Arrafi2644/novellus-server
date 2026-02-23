

// import { Schema, model, Types } from "mongoose";
// import {
//   IOrder,
//   IOrderFood,
//   IOrderIngredient,
//   OrderType,
//   OrderStatus,
//   DeliveryOption,
// } from "./order.interface";

// /* ---------- Ingredient ---------- */
// const orderIngredientSchema = new Schema<IOrderIngredient>(
//   {
//     name: { type: String, required: true, trim: true },
//     price: { type: Number, required: true, min: 0 },
//   },
//   { _id: false }
// );

// /* ---------- Food ---------- */
// const orderFoodSchema = new Schema<IOrderFood>(
//   {
//     food: { type: Types.ObjectId, ref: "Food", required: true },
//     quantity: { type: Number, required: true, min: 1 },
//     ingredients: { type: [orderIngredientSchema], default: [] },
//     unitPrice: { type: Number, required: true, min: 0 },
//     lineTotal: { type: Number, required: true, min: 0 },
//   },
//   { _id: false }
// );

// /* ---------- Order ---------- */
// const orderSchema = new Schema<IOrder>(
//   {
//     orderType: {
//       type: String,
//       enum: Object.values(OrderType),
//       required: true,
//     },

//     user: { type: Types.ObjectId, ref: "User" },
//     seller: { type: Types.ObjectId, ref: "User" },
//     /** 🔥 Payment reference */
//     payment: {
//       type: Types.ObjectId,
//       ref: "Payment",
//     },
//     foods: {
//       type: [orderFoodSchema],
//       required: true,
//     },

//     totalPrice: {
//       type: Number,
//       required: true,
//       min: 0,
//     },

//     deliveryOption: {
//       type: String,
//       enum: Object.values(DeliveryOption),
//       required: true,
//     },

//     deliveryAddress: {
//       type: String
//     },

//     status: {
//       type: String,
//       enum: Object.values(OrderStatus),
//       default: OrderStatus.COMPLETED,
//     },
//   },
//   { timestamps: true }
// );

// /* ---------- Business Rules (TS-safe) ---------- */
// orderSchema.pre("validate", async function () {
//   const order = this as IOrder;

//   if (order.orderType === OrderType.ONLINE && !order.user) {
//     throw new Error("User is required for ONLINE order");
//   }

//   if (order.orderType === OrderType.POS && !order.seller) {
//     throw new Error("Seller is required for POS order");
//   }

//   if (
//     order.deliveryOption === DeliveryOption.DELIVERY &&
//     !order.deliveryAddress
//   ) {
//     throw new Error("Delivery address is required");
//   }

// });


// export const Order = model<IOrder>("Order", orderSchema);



import { Schema, model, Types } from "mongoose";
import {
  IOrder,
  IOrderFood,
  IOrderIngredient,
  OrderType,
  OrderStatus,
  DeliveryOption,
} from "./order.interface";

/* ---------- Ingredient ---------- */
const orderIngredientSchema = new Schema<IOrderIngredient>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

/* ---------- Food ---------- */
const orderFoodSchema = new Schema<IOrderFood>(
  {
    food: {
      type: Types.ObjectId,
      ref: "Food",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    ingredients: {
      type: [orderIngredientSchema],
      default: [],
    },

    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    lineTotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

/* ---------- Order ---------- */
const orderSchema = new Schema<IOrder>(
  {
    orderType: {
      type: String,
      enum: Object.values(OrderType),
      required: true,
    },

    user: {
      type: Types.ObjectId,
      ref: "User",
    },

    seller: {
      type: Types.ObjectId,
      ref: "User",
    },

    payment: {
      type: Types.ObjectId,
      ref: "Payment",
    },

    foods: {
      type: [orderFoodSchema],
      required: true,
    },

    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    deliveryOption: {
      type: String,
      enum: Object.values(DeliveryOption),
      required: true,
    },

    deliveryAddress: {
      type: String,
    },

    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PENDING,
    },
  },
  { timestamps: true }
);

/* ---------- Business Rules ---------- */
orderSchema.pre("validate", function () {
  const order = this as IOrder;

  if (order.orderType === OrderType.ONLINE && !order.user) {
    throw new Error("User is required for ONLINE order");
  }

  if (order.orderType === OrderType.POS && !order.seller) {
    throw new Error("Seller is required for POS order");
  }

  if (
    order.deliveryOption === DeliveryOption.DELIVERY &&
    !order.deliveryAddress
  ) {
    throw new Error("Delivery address is required");
  }
});

export const Order = model<IOrder>("Order", orderSchema);
