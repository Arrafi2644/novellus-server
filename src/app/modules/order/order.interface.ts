

// import { Types } from "mongoose";

// export enum OrderType {
//   ONLINE = "ONLINE",
//   POS = "POS",
// }

// export interface IOrderFoodInput {
//     food: string; // frontend sends string _id
//     quantity: number;
//     ingredients?: {
//         ingredientId: string;
//     }[];
// };

// export enum OrderStatus {
//   PENDING = "PENDING",
//   ACCEPTED = "ACCEPTED",
//   COMPLETED = "COMPLETED",
//   CANCELLED = "CANCELLED",
// }

// export enum DeliveryOption {
//   DELIVERY = "DELIVERY",
//   PICKUP = "PICKUP",
// }

// export interface IOrderIngredient {
//   name: string;
//   price: number;
// }

// export interface IOrderFood {
//   food: Types.ObjectId;
//   quantity: number;
//   ingredients?: IOrderIngredient[];
//   unitPrice: number;
//   lineTotal: number;
// }

// export interface IOrder {
//   _id?: Types.ObjectId;

//   orderType: OrderType;
//   user?: Types.ObjectId;
//   seller?: Types.ObjectId;

//   foods: IOrderFood[];
//   totalPrice: number;

//   /** 🔥 Payment reference */
//   payment?: Types.ObjectId;

//   deliveryOption: DeliveryOption;
//   deliveryAddress?: string;

//   status: OrderStatus;

//   createdAt?: Date;
//   updatedAt?: Date;
// }





import { Types } from "mongoose";

export enum OrderType {
  ONLINE = "ONLINE",
  POS = "POS",
}

export interface IOrderFoodInput {
  food: string;
  quantity: number;

  ingredients?: {
    ingredient: string;
    name: string;
    price: number;
  }[];

  extraIngredients?: {
    ingredient: string;
    name: string;
    price: number;
  }[];
  variant: string;
}


export enum OrderStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum DeliveryOption {
  DELIVERY = "DELIVERY",
  PICKUP = "PICKUP",
}

export interface IOrderIngredient {
  ingredient?: string; // for input only
  name: string;
  price: number;
}

export interface IOrderFood {
  food: Types.ObjectId;
  quantity: number;
  size: string;
  ingredients?: IOrderIngredient[];
  unitPrice: number;
  lineTotal: number;
}

export interface IOrder {
  _id?: Types.ObjectId;

  orderType: OrderType;
  user?: Types.ObjectId;
  seller?: Types.ObjectId;

  foods: IOrderFood[];
  totalPrice: number;

  /** 🔥 Payment reference */
  payment?: Types.ObjectId;

  deliveryOption: DeliveryOption;
  deliveryAddress?: string;

  status: OrderStatus;

  createdAt?: Date;
  updatedAt?: Date;
}

