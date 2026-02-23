// import { Food } from "../modules/food/food.model";
// import { IOrderFood } from "../modules/order/order.interface";


// /**
//  * Calculate unitPrice + lineTotal for each food
//  * Returns array of foods with calculated prices + totalPrice
//  */
// export async function calculateOrderPrice(foods: IOrderFood[]): Promise<{ foodsWithPrice: IOrderFood[], totalPrice: number }> {
//   let totalPrice = 0;
//   const foodsWithPrice: IOrderFood[] = [];

//   for (const item of foods) {
//     const foodDoc = await Food.findById(item.food);
//     if (!foodDoc) throw new Error(`Food with ID ${item.food} not found`);

//     // Base price
//     let unitPrice = foodDoc.price;

//     // Add optional ingredient prices
//     if (item.ingredients && item.ingredients.length > 0) {
//       const ingredientTotal = item.ingredients.reduce((sum, ing) => sum + ing.price, 0);
//       unitPrice += ingredientTotal;
//     }

//     const lineTotal = unitPrice * item.quantity;
//     totalPrice += lineTotal;

//     foodsWithPrice.push({ ...item, unitPrice, lineTotal });
//   }

//   return { foodsWithPrice, totalPrice };
// }

// ------------------------------------------------------------------------

// import { Types } from "mongoose";
// import { IOrderFood, IOrderFoodInput } from "../modules/order/order.interface";
// import { Food } from "../modules/food/food.model";



// export const calculateOrderPrice = async (foods: IOrderFoodInput[]) => {
//   const foodsWithPrice: IOrderFood[] = [];
//   let totalPrice = 0;

//   for (const f of foods) {
//     const foodId = new Types.ObjectId(f.food); // <-- convert string to ObjectId
//     const foodDoc = await Food.findById(foodId);
//     if (!foodDoc) throw new Error(`Food not found: ${f.food}`);

//     let unitPrice = foodDoc.price;
//     if (f.ingredients?.length) {
//       unitPrice += f.ingredients.reduce((sum, ing) => sum + ing.price, 0);
//     }

//     const lineTotal = unitPrice * f.quantity;

//     foodsWithPrice.push({
//       food: foodId,        // <-- must be ObjectId
//       quantity: f.quantity,
//       ingredients: f.ingredients,
//       unitPrice,
//       lineTotal,
//     });

//     totalPrice += lineTotal;
//   }

//   return { foodsWithPrice, totalPrice };
// };


// ----------------------------------------------------------------

// import { Types } from "mongoose";
// import { IOrderFood, IOrderFoodInput } from "../modules/order/order.interface";
// import { Food } from "../modules/food/food.model";
// import { Ingredient } from "../modules/ingredient/interface.model";

// export const calculateOrderPrice = async (
//   foods: IOrderFoodInput[]
// ) => {
//   const foodsWithPrice: IOrderFood[] = [];
//   let totalPrice = 0;

//   console.log("Foods in calculate  ", foods)

//   for (const f of foods) {
//     const foodId = new Types.ObjectId(f.food);
//     const foodDoc = await Food.findById(foodId).populate("category");
//     console.log("Food doc in calculate ", foodDoc)

//     if (!foodDoc) {
//       throw new Error(`Food not found: ${f.food}`);
//     }

//     let unitPrice = foodDoc.price;
//     const resolvedIngredients: { name: string; price: number }[] = [];

//     /* ---------------- EXTRA INGREDIENTS ---------------- */
//     if (f.extraIngredients?.length) {
//       const extraIngredientDocs = await Ingredient.find({
//         _id: { $in: f.extraIngredients.map(i => i.ingredientId) },
//       });

//       // 🔥 EXACT spelling
//       const categoryTitle = foodDoc.category?.title;

//       extraIngredientDocs.forEach((ing, index) => {
//         let priceToAdd = 0;

//         /* ---- Metro ---- */
//         if (categoryTitle === "Metro") {
//           priceToAdd = 4;
//         }

//         /* ---- Novellus ---- */
//         else if (categoryTitle === "Novellus") {
//           if (index >= 4) {
//             priceToAdd = ing.price;
//           }
//         }

//         /* ---- Normal ---- */
//         else {
//           priceToAdd = ing.price;
//         }

//         unitPrice += priceToAdd;

//         resolvedIngredients.push({
//           name: ing.name,
//           price: priceToAdd,
//         });
//       });
//     }

//     const lineTotal = unitPrice * f.quantity;

//     foodsWithPrice.push({
//       food: foodId,
//       quantity: f.quantity,
//       ingredients: resolvedIngredients,
//       unitPrice,
//       lineTotal,
//     });

//     totalPrice += lineTotal;
//   }

//   return {
//     foodsWithPrice,
//     totalPrice,
//   };
// };

import { Types } from "mongoose";
import { IOrderFood, IOrderFoodInput } from "../modules/order/order.interface";
import { Food } from "../modules/food/food.model";
import { Ingredient } from "../modules/ingredient/interface.model";

export const calculateOrderPrice = async (foods: IOrderFoodInput[]) => {
  const foodsWithPrice: IOrderFood[] = [];
  let totalPrice = 0;

  console.log("input foods in calculate ", foods)

  for (const f of foods) {
    const foodId = new Types.ObjectId(f.food);
    const foodDoc = await Food.findById(foodId).populate("category");
    if (!foodDoc) throw new Error(`Food not found: ${f.food}`);

    // ---------- Get price from variant ----------
    if (!f.variant) throw new Error(`Variant is required for food: ${foodDoc.name}`);
    const variant = foodDoc.variants.find(v => v.size === f.variant);
    if (!variant) throw new Error(`Variant "${f.variant}" not found for food: ${foodDoc.name}`);

    let unitPrice = variant.offerPrice ? variant.offerPrice : variant.price; // base price from variant

    const resolvedIngredients: { name: string; price: number }[] = [];
    const categoryTitle = foodDoc.category?.title;

    // ---------- EXTRA INGREDIENTS ----------
    if (f.extraIngredients?.length) {
      const extraIngredientDocs = await Ingredient.find({
        _id: { $in: f.extraIngredients.map(i => i.ingredient) },
      });

      extraIngredientDocs.forEach((ing, index) => {
        let priceToAdd = ing.price;

        if (categoryTitle === "Metro") {
          priceToAdd += 1.5;
        } else if (categoryTitle === "Novellus") {
          priceToAdd = index < 4 ? 0 : ing.price;
        }

        unitPrice += priceToAdd;

        resolvedIngredients.push({
          name: ing.name,
          price: priceToAdd,
        });
      });
    }

    // ---------- DEFAULT INGREDIENTS ----------
    if (f.ingredients?.length) {
      f.ingredients.forEach((ing) => {
        resolvedIngredients.push({
          name: ing.name,
          price: 0, // default ingredients no price
        });
      });
    }

    console.log("resolved ingredients ", resolvedIngredients)

    const lineTotal = unitPrice * f.quantity;

    foodsWithPrice.push({
      food: foodId,
      quantity: f.quantity,
      size: f.variant,
      ingredients: resolvedIngredients,
      unitPrice,
      lineTotal,
    });

    totalPrice += lineTotal;
  }

  console.log("Foods with price , ", foodsWithPrice, "Total price ", totalPrice)
  console.log("Foods ingredients , ", foodsWithPrice[0]?.ingredients)
  return { foodsWithPrice, totalPrice };
};
