import httpStatus from 'http-status-codes';
import { ICategory } from "./category.interface";
import AppError from '../../errorHelpers/appError';
import { Category } from './category.model';
import { categorySearchableFields } from './category.constants';
import { QueryBuilder } from '../../utils/QueryBuilder';
import { deleteImageFromCloudinary } from '../../config/cloudinary.config';

// const createCategoryService = async (payload: Partial<ICategory>) => {
//     const category = await Category.create(payload);
//     return category;
// }

// const createCategoryService = async (payload: Partial<ICategory>) => {
//     // Ensure showOrder is number
//     if (!payload.showOrder || isNaN(payload.showOrder)) {
//         payload.showOrder = 1; // default
//     } else {
//         payload.showOrder = Number(payload.showOrder);
//     }

//     const category = await Category.create(payload);
//     return category;
// };
const createCategoryService = async (payload: Partial<ICategory>) => {
  const newOrder = Number(payload.showOrder) || 1;

  // shift existing categories
  await Category.updateMany(
    { showOrder: { $gte: newOrder } },
    { $inc: { showOrder: 1 } }
  );

  payload.showOrder = newOrder;

  const category = await Category.create(payload);
  return category;
};

// const updateCategory = async (
//     categoryId: string,
//     payload: Partial<ICategory>
// ) => {

//     const existingCategory = await Category.findById(categoryId);
//     if (!existingCategory) {
//         throw new AppError(httpStatus.NOT_FOUND, "Category not found");
//     }

//     const oldOrder = existingCategory.showOrder;
//     const newOrder = payload.showOrder;

//     if (newOrder && newOrder !== oldOrder) {

//         if (newOrder < oldOrder) {
//             await Category.updateMany(
//                 {
//                     _id: { $ne: categoryId },
//                     showOrder: { $gte: newOrder, $lt: oldOrder },
//                 },
//                 { $inc: { showOrder: 1 } }
//             );
//         } else {
//             await Category.updateMany(
//                 {
//                     _id: { $ne: categoryId },
//                     showOrder: { $gt: oldOrder, $lte: newOrder },
//                 },
//                 { $inc: { showOrder: -1 } }
//             );
//         }
//     }

//     const updatedCategory = await Category.findByIdAndUpdate(
//         categoryId,
//         payload,
//         { new: true, runValidators: true }
//     );

//     return updatedCategory;
// };


const updateCategory = async (
  categoryId: string,
  payload: Partial<ICategory>
) => {
  const existingCategory = await Category.findById(categoryId);

  if (!existingCategory) {
    throw new AppError(httpStatus.NOT_FOUND, "Category not found");
  }

  const oldOrder = existingCategory.showOrder;
  const newOrder = Number(payload.showOrder);

  if (newOrder !== undefined && newOrder !== oldOrder) {

    if (newOrder < oldOrder) {
      // move up
      await Category.updateMany(
        {
          _id: { $ne: categoryId },
          showOrder: { $gte: newOrder, $lt: oldOrder },
        },
        { $inc: { showOrder: 1 } }
      );
    } else {
      // move down
      await Category.updateMany(
        {
          _id: { $ne: categoryId },
          showOrder: { $gt: oldOrder, $lte: newOrder },
        },
        { $inc: { showOrder: -1 } }
      );
    }

    payload.showOrder = newOrder;
  }

  const updatedCategory = await Category.findByIdAndUpdate(
    categoryId,
    payload,
    { new: true, runValidators: true }
  );

  return updatedCategory;
};

const getSingleCategory = async (slug: string) => {
    const category = await Category.findOne({ slug });
    if (!category) {
        throw new AppError(httpStatus.NOT_FOUND, "Category Not Found")
    }
    return {
        data: category
    }
};

// const deleteCategory = async (id: string) => {
//     const category = await Category.findById(id);
//     if (!category) {
//         throw new AppError(httpStatus.NOT_FOUND, "Category Not Found")
//     }

//     await Category.findByIdAndDelete(id);

//     return {
//         data: null
//     }
// };

// const updateCategory = async (
//     categoryId: string,
//     payload: Partial<ICategory>
// ) => {
//     // Check if category exists
//     const existingCategory = await Category.findById(categoryId);
//     if (!existingCategory) {
//         throw new AppError(httpStatus.NOT_FOUND, "Category not found");
//     }

//     // Update category
//     const updatedCategory = await Category.findByIdAndUpdate(categoryId, payload, {
//         new: true,
//         runValidators: true,
//     });

//     return updatedCategory;
// };

const deleteCategory = async (id: string) => {

    const category = await Category.findById(id);
    if (!category) {
        throw new AppError(httpStatus.NOT_FOUND, "Category Not Found");
    }

    const deletedOrder = category.showOrder;
    if (category.image) {
        await deleteImageFromCloudinary(category.image);
    }

    await Category.findByIdAndDelete(id);

    await Category.updateMany(
        { showOrder: { $gt: deletedOrder } },
        { $inc: { showOrder: -1 } }
    );

    return { data: null };
};



const getAllCategories = async (query: Record<string, string>) => {
    // const queryBuilder = new QueryBuilder(Category.find(), query)
    const queryBuilder = new QueryBuilder(
        Category.find().sort({ showOrder: 1 }),
        query
    );
    const categoriesData = queryBuilder
        .filter()
        .search(categorySearchableFields)
        .sort()
        .fields()
        .paginate();

    const [data, meta] = await Promise.all([
        categoriesData.build(),
        queryBuilder.getMeta()
    ])

    return {
        data,
        meta
    }
};

export const CategoryServices = {
    createCategoryService,
    getSingleCategory,
    deleteCategory,
    updateCategory,
    getAllCategories
}
