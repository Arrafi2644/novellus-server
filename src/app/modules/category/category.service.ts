import httpStatus from 'http-status-codes';
import { ICategory } from "./category.interface";
import AppError from '../../errorHelpers/appError';
import { Category } from './category.model';
import { categorySearchableFields } from './category.constants';
import { QueryBuilder } from '../../utils/QueryBuilder';
import { deleteImageFromCloudinary } from '../../config/cloudinary.config';
import mongoose from "mongoose";


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


const updateCategory = async (
  categoryId: string,
  payload: Partial<ICategory>
) => {

  const session = await mongoose.startSession();
  session.startTransaction();

  try {

    const existingCategory = await Category.findById(categoryId).session(session);

    if (!existingCategory) {
      throw new AppError(httpStatus.NOT_FOUND, "Category not found");
    }

    const oldOrder = existingCategory.showOrder;
    const newOrder = Number(payload.showOrder);

    if (newOrder && newOrder !== oldOrder) {

      // temporarily move current category
      await Category.findByIdAndUpdate(
        categoryId,
        { showOrder: -1 },
        { session }
      );

      if (newOrder < oldOrder) {
        await Category.updateMany(
          {
            showOrder: { $gte: newOrder, $lt: oldOrder },
          },
          { $inc: { showOrder: 1 } },
          { session }
        );
      } else {
        await Category.updateMany(
          {
            showOrder: { $gt: oldOrder, $lte: newOrder },
          },
          { $inc: { showOrder: -1 } },
          { session }
        );
      }

      payload.showOrder = newOrder;
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      payload,
      { new: true, runValidators: true, session }
    );

    await session.commitTransaction();
    session.endSession();

    return updatedCategory;

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
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
