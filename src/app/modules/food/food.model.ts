// import { Schema, model, Types } from "mongoose";
// import { FoodStatus, IFood } from "./food.interface";

// const foodSchema = new Schema<IFood>({
//     name: {
//         type: String,
//         required: true,
//         index: true
//     },
//     category: {
//         type: Types.ObjectId,
//         required: true,
//         index: true,
//         ref: "Category"
//     },
//     slug: {
//         type: String,
//         unique: true,
//         index: true
//     },
//     description: {
//         type: String,
//         required: true,
//     },
//     price: {
//         type: Number,
//         required: true,
//     },
//     offerPrice: {
//         type: Number,
//     },
//     image: {
//         type: String,
//         required: true,
//     },
//     status: {
//         type: String,
//         enum: Object.values(FoodStatus),
//         default: FoodStatus.ACTIVE,
//     },
//     // ingredients: {
//     //     type: [Schema.Types.Mixed],
//     //     required: true,
//     // },
//     ingredients: [
//         {
//             type: Types.ObjectId,
//             ref: "Ingredient",
//             required: true,
//         },
//     ],
//     totalSell: {
//         type: Number,
//         default: 0,
//     },
//     totalStock: {
//         type: Number,
//         default: 0,
//     },
//     quantity: {
//         type: Number
//     },
//     unit: {
//         type: String,
//         required: true,
//     },

// }, {
//     timestamps: true,
// });


// foodSchema.pre("save", async function (next) {
//     if (this.isModified("name")) {
//         const baseSlug = this.name.toLowerCase().split(" ").join("-")
//         let slug = `${baseSlug}`

//         let counter = 1;

//         while (await Food.exists({ slug })) {
//             slug = `${baseSlug}-${counter++}`;
//         }

//         this.slug = slug;
//     }
// })

// foodSchema.pre("findOneAndUpdate", async function (next) {
//     const food = this.getUpdate() as Partial<IFood>

//     if (food.name) {
//         const baseSlug = food.name.toLowerCase().split(" ").join("-")
//         let slug = `${baseSlug}`

//         let counter = 1; // Start counter from 1

//         // Check for existing slug and increment the counter
//         while (await Food.exists({ slug })) {
//             slug = `${baseSlug}-${counter++}`;
//         }

//         food.slug = slug
//     }

//     this.setUpdate(food)
// })

// export const Food = model<IFood>("Food", foodSchema)

import { Schema, model, Types } from "mongoose";
import { FoodStatus, IFood } from "./food.interface";

const variantSchema = new Schema(
  {
    size: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    offerPrice: {
      type: Number,
      min: 0,
      default: null,
    },
    totalStock: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false } // embedded document হিসেবে _id না দেওয়ার জন্য
);

const foodSchema = new Schema<IFood>(
  {
    name: {
      type: String,
      required: true,
      index: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    category: {
      type: Types.ObjectId,
      required: true,
      index: true,
      ref: "Category",
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(FoodStatus),
      default: FoodStatus.ACTIVE,
    },
    ingredients: [
      {
        type: Types.ObjectId,
        ref: "Ingredient",
      },
    ],
    totalSell: {
      type: Number,
      default: 0,
    },
    unit: {
      type: String,
      required: true,
    },

    variants: {
      type: [variantSchema],
      required: true,
      minlength: 1,
      default: undefined,
    },
  },
  {
    timestamps: true,
  }
);

foodSchema.pre("save", async function (next) {
    if (this.isModified("name")) {
        const baseSlug = this.name.toLowerCase().split(" ").join("-")
        let slug = `${baseSlug}`

        let counter = 1;

        while (await Food.exists({ slug })) {
            slug = `${baseSlug}-${counter++}`;
        }

        this.slug = slug;
    }
})

foodSchema.pre("findOneAndUpdate", async function (next) {
    const food = this.getUpdate() as Partial<IFood>

    if (food.name) {
        const baseSlug = food.name.toLowerCase().split(" ").join("-")
        let slug = `${baseSlug}`

        let counter = 1; // Start counter from 1

        // Check for existing slug and increment the counter
        while (await Food.exists({ slug })) {
            slug = `${baseSlug}-${counter++}`;
        }

        food.slug = slug
    }

    this.setUpdate(food)
})

export const Food = model<IFood>("Food", foodSchema);