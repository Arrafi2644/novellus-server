// import { z } from "zod";
// import { OrderType, PaymentMethod } from "./order.interface";

// const orderIngredientSchema = z.object({
//   name: z.string({ invalid_type_error: "Ingredient name must be a string" }).min(1),
//   price: z.number({ invalid_type_error: "Ingredient price must be a number" }).min(0),
// });

// const orderFoodSchema = z.object({
//   food: z.string({ invalid_type_error: "Food must be a string" }).min(1),
//   quantity: z.number({ invalid_type_error: "Quantity must be a number" }).min(1),
//   ingredients: z.array(orderIngredientSchema).optional(),
// });

// /**
//  * Create Order:
//  * - foods required
//  * - orderType required
//  * - paymentMethod required for ONLINE
//  * - deliveryAddress optional
//  *
//  * NOTE: totalPrice is NOT accepted from client (backend calculates).
//  */
// export const createOrderZodSchema = z
//   .object({
//     orderType: z.enum([OrderType.ONLINE, OrderType.POS], {
//       invalid_type_error: "Order type must be ONLINE or POS",
//     }),
//     paymentMethod: z
//       .enum([PaymentMethod.COD, PaymentMethod.STRIPE], {
//         invalid_type_error: "Payment method must be COD or STRIPE",
//       })
//       .optional(),
//     deliveryAddress: z
//       .string({ invalid_type_error: "Delivery address must be a string" })
//       .optional(),
//     foods: z.array(orderFoodSchema).min(1, { message: "At least one food is required" }),
//   })
//   .superRefine((val, ctx) => {
//     if (val.orderType === OrderType.ONLINE && !val.paymentMethod) {
//       ctx.addIssue({
//         code: z.ZodIssueCode.custom,
//         message: "paymentMethod is required for ONLINE orders",
//         path: ["paymentMethod"],
//       });
//     }
//   });


// import { z } from "zod";
// import { OrderType, PaymentMethod } from "./order.interface";

// const orderIngredientSchema = z.object({
//   name: z.string({ invalid_type_error: "Ingredient name must be a string" }).min(1),
//   price: z.number({ invalid_type_error: "Ingredient price must be a number" }).min(0),
// });

// const orderFoodSchema = z.object({
//   food: z.string({ invalid_type_error: "Food ID must be a string" }).min(1),
//   quantity: z.number({ invalid_type_error: "Quantity must be a number" }).min(1),
//   ingredients: z.array(orderIngredientSchema).optional(),
// });

// export const createOrderZodSchema = z
//   .object({
//     orderType: z.enum([OrderType.ONLINE, OrderType.POS], {
//       invalid_type_error: "Order type must be ONLINE or POS",
//     }),
//     paymentMethod: z
//       .enum([PaymentMethod.COD], {
//         invalid_type_error: "Payment method must be COD (currently only COD supported)",
//       })
//       .optional(),
//     deliveryAddress: z.string().optional(),
//     foods: z.array(orderFoodSchema).min(1, { message: "At least one food is required" }),
//   })
//   .superRefine((val, ctx) => {
//     if (val.orderType === OrderType.ONLINE && !val.paymentMethod) {
//       ctx.addIssue({
//         code: z.ZodIssueCode.custom,
//         message: "paymentMethod is required for ONLINE orders",
//         path: ["paymentMethod"],
//       });
//     }
//   });


// import { z } from "zod";
// import { DeliveryOption, OrderType, PaymentMethod } from "./order.interface";

// const orderIngredientSchema = z.object({
//   name: z.string({ invalid_type_error: "Ingredient name must be a string" }).min(1),
//   price: z.number({ invalid_type_error: "Ingredient price must be a number" }).min(0),
// });

// const orderFoodSchema = z.object({
//   food: z.string({ invalid_type_error: "Food ID must be a string" }).min(1),
//   quantity: z.number({ invalid_type_error: "Quantity must be a number" }).min(1),
//   ingredients: z.array(orderIngredientSchema).optional(),
// });

// const customerInfoSchema = z.object({
//   name: z.string({ invalid_type_error: "Name must be a string" }).min(1).optional(),
//   email: z
//     .string({ invalid_type_error: "Email must be a string" })
//     .email({ message: "Invalid email address" }).optional(),
//   phone: z
//     .string({ invalid_type_error: "Phone number must be a string" })
//     .min(1, { message: "Phone number is required" }).optional(),
//   address: z
//     .string({ invalid_type_error: "Address must be a string" })
//     .min(2, { message: "Address is required" }).optional(),
// });

// export const createOrderZodSchema = z
//   .object({
//     orderType: z.enum([OrderType.ONLINE, OrderType.POS], {
//       invalid_type_error: "Order type must be ONLINE or POS",
//     }),
//     paymentMethod: z
//       .enum([PaymentMethod.COD], {
//         invalid_type_error: "Payment method must be COD (currently only COD supported)",
//       })
//       .optional(),
//     deliveryAddress: z.string().optional(),
//     deliveryOption: z.enum([DeliveryOption.DELIVERY, DeliveryOption.PICKUP]),
//     foods: z.array(orderFoodSchema).min(1, { message: "At least one food is required" }),
//     customerInfo: customerInfoSchema

//   })
//   .superRefine((val, ctx) => {
//     if (val.orderType === OrderType.ONLINE && !val.paymentMethod) {
//       ctx.addIssue({
//         code: z.ZodIssueCode.custom,
//         message: "paymentMethod is required for ONLINE orders",
//         path: ["paymentMethod"],
//       });
//     }
//   });


// import { z } from "zod";
// import { DeliveryOption, OrderStatus, OrderType } from "./order.interface";
// import { PaymentMethod } from "../payment/payment.interface";

// /* ---------- Ingredient ---------- */
// const orderIngredientSchema = z.object({
//   name: z.string().min(1, "Ingredient name is required"),
//   price: z.number().min(0, "Ingredient price must be >= 0"),
// });

// /* ---------- Food ---------- */
// const orderFoodSchema = z.object({
//   food: z.string().min(1, "Food ID is required"),
//   quantity: z.number().min(1, "Quantity must be at least 1"),
//   ingredients: z.array(orderIngredientSchema).optional(),
// });

// /* ---------- Customer Info ---------- */
// const customerInfoSchema = z.object({
//   name: z.string().min(1, "Customer name is required").optional(),
//   email: z.string().email("Invalid email address"),
//   phone: z.string().min(1, "Phone number is required").optional(),
//   address: z.string().min(2, "Address is required").optional(),
// });

// /* ---------- Create Order ---------- */
// export const createOrderZodSchema = z
//   .object({
//     orderType: z.enum([OrderType.ONLINE, OrderType.POS]),

//     paymentMethod: z
//       .enum([PaymentMethod.COD, PaymentMethod.STRIPE])
//       .optional(),

//     deliveryOption: z.enum([
//       DeliveryOption.DELIVERY,
//       DeliveryOption.PICKUP,
//     ]),

//     deliveryAddress: z.string().optional(),

//     foods: z.array(orderFoodSchema).min(1, {
//       message: "At least one food is required",
//     }),

//     customerInfo: customerInfoSchema.optional(),
//     seller: z.string().min(1, "Seller ID is required").optional(),
//   })
//   .superRefine((data, ctx) => {
//     /* ---------- ONLINE order rules ---------- */
//     if (data.orderType === OrderType.ONLINE) {
//       if (!data.paymentMethod) {
//         ctx.addIssue({
//           code: z.ZodIssueCode.custom,
//           path: ["paymentMethod"],
//           message: "paymentMethod is required for ONLINE orders",
//         });
//       }

//       if (!data.customerInfo) {
//         ctx.addIssue({
//           code: z.ZodIssueCode.custom,
//           path: ["customerInfo"],
//           message: "customerInfo is required for guest ONLINE checkout",
//         });
//       }
//     }
//   });

// export const updateOrderZodSchema = z.object({
//   deliveryOption: z
//     .enum([DeliveryOption.DELIVERY, DeliveryOption.PICKUP])
//     .optional(),
  
//   status: z
//     .enum([OrderStatus.PENDING, OrderStatus.ACCEPTED, OrderStatus.COMPLETED, OrderStatus.CANCELLED])
//     .optional(),

//   deliveryAddress: z.string().min(2, "Delivery address must be at least 2 characters").optional(),

// })
// .superRefine((data, ctx) => {
//   // If deliveryOption is DELIVERY, deliveryAddress must be provided
//   if (data.deliveryOption === DeliveryOption.DELIVERY && !data.deliveryAddress) {
//     ctx.addIssue({
//       code: z.ZodIssueCode.custom,
//       path: ["deliveryAddress"],
//       message: "deliveryAddress is required when deliveryOption is DELIVERY",
//     });
//   }
// });

import { z } from "zod";
import { DeliveryOption, OrderStatus, OrderType } from "./order.interface";
import { PaymentMethod } from "../payment/payment.interface";

/* ---------- Ingredient Ref ---------- */
const ingredientRefSchema = z.object({
  ingredientId: z.string().min(1, "ingredientId is required"),
});

/* ---------- Food ---------- */
const orderFoodSchema = z.object({
  food: z.string().min(1, "Food ID is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),

  defaultIngredients: z.array(ingredientRefSchema).optional(),
  extraIngredients: z.array(ingredientRefSchema).optional(),
});

/* ---------- Customer Info ---------- */
const customerInfoSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(6).optional(),
  address: z.string().min(2).optional(),
});

/* ---------- Create Order ---------- */
export const createOrderZodSchema = z
  .object({
    orderType: z.enum([OrderType.ONLINE, OrderType.POS]),

    paymentMethod: z
      .enum([PaymentMethod.COD, PaymentMethod.STRIPE])
      .optional(),

    deliveryOption: z.enum([
      DeliveryOption.DELIVERY,
      DeliveryOption.PICKUP,
    ]),

    deliveryAddress: z.string().optional(),

    foods: z.array(orderFoodSchema).min(1, {
      message: "At least one food is required",
    }),

    customerInfo: customerInfoSchema.optional(),

    seller: z.string().min(1).optional(),
  })
  .superRefine((data, ctx) => {
    /* ---------- ONLINE rules ---------- */
    if (data.orderType === OrderType.ONLINE) {
      if (!data.paymentMethod) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["paymentMethod"],
          message: "paymentMethod is required for ONLINE order",
        });
      }

      if (!data.customerInfo) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["customerInfo"],
          message: "customerInfo is required for ONLINE order",
        });
      }
    }

    /* ---------- POS rules ---------- */
    if (data.orderType === OrderType.POS && !data.seller) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["seller"],
        message: "seller is required for POS order",
      });
    }

    /* ---------- DELIVERY rules ---------- */
    if (
      data.deliveryOption === DeliveryOption.DELIVERY &&
      !data.deliveryAddress
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["deliveryAddress"],
        message: "deliveryAddress is required for DELIVERY option",
      });
    }
  });

/* ---------- Update Order ---------- */
export const updateOrderZodSchema = z
  .object({
    deliveryOption: z
      .enum([DeliveryOption.DELIVERY, DeliveryOption.PICKUP])
      .optional(),

    status: z
      .enum([
        OrderStatus.PENDING,
        OrderStatus.ACCEPTED,
        OrderStatus.COMPLETED,
        OrderStatus.CANCELLED,
      ])
      .optional(),

    deliveryAddress: z.string().min(2).optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.deliveryOption === DeliveryOption.DELIVERY &&
      !data.deliveryAddress
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["deliveryAddress"],
        message: "deliveryAddress is required when deliveryOption is DELIVERY",
      });
    }
  });
