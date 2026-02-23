// import { Types } from "mongoose";

// export enum FoodStatus {
//     ACTIVE = "ACTIVE",
//     INACTIVE = "INACTIVE",
// }

// export interface IIngredient {
//     name: string;
//     price: number;
// }

// export interface IFood {
//     _id?: Types.ObjectId;
//     name: string;
//     slug: string;
//     category: Types.ObjectId;
//     description: string;
//     price: number;
//     offerPrice: number;
//     image: string;
//     status: FoodStatus;
//     ingredients?: IIngredient[];
//     totalSell: number;
//     totalStock: number;
//     quantity?: number;
//     unit: string;
// }

import { Types } from "mongoose";
import { ICategory } from "../category/category.interface";

export enum FoodStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export interface IIngredient {
  name: string;
  price: number;
}

export interface IVariant {
  size: string;           // "Normal", "XL", "Large", "500ml", "Family Pack" ইত্যাদি
  price: number;
  offerPrice?: number;    // optional
  totalStock: number;
}

export interface IFood {
  _id?: Types.ObjectId;
  name: string;
  slug: string;
  category: ICategory;
  description: string;
  image: string;
  status: FoodStatus;
  ingredients?: Types.ObjectId[];
  totalSell: number;
  unit: string;
  variants: IVariant[];
}