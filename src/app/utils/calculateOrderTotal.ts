
import { Types } from "mongoose";
import { IOrderFood, IOrderFoodInput } from "../modules/order/order.interface";
import { Food } from "../modules/food/food.model";
import { Ingredient } from "../modules/ingredient/interface.model";

export const calculateOrderPrice = async (foods: IOrderFoodInput[]) => {
  const foodsWithPrice: IOrderFood[] = [];
  let totalPrice = 0;

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

  return { foodsWithPrice, totalPrice };
};
