import httpStatus from 'http-status-codes';
import { ICategory } from "./category.interface";
import AppError from '../../errorHelpers/appError';
import { Category } from './category.model';
import { categorySearchableFields } from './category.constants';
import { QueryBuilder } from '../../utils/QueryBuilder';

const createCategoryService = async (payload: Partial<ICategory>) => {
    const category = await Category.create(payload);
    return category;
}

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
        throw new AppError(httpStatus.NOT_FOUND, "Category Not Found")
    }
     
    await Category.findByIdAndDelete(id);
    
    return {
        data: null
    }
};

const updateCategory = async (
    categoryId: string,
    payload: Partial<ICategory>
) => {
    // Check if category exists
    const existingCategory = await Category.findById(categoryId);
    if (!existingCategory) {
        throw new AppError(httpStatus.NOT_FOUND, "Category not found");
    }

    // Update category
    const updatedCategory = await Category.findByIdAndUpdate(categoryId, payload, {
        new: true,
        runValidators: true,
    });

    return updatedCategory;
};

const getAllCategories = async (query: Record<string, string>) => {
    const queryBuilder = new QueryBuilder(Category.find(), query)
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
