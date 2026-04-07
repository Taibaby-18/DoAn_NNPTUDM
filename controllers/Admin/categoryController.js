const Category = require('../../models/Category');
const Game = require('../../models/Game'); 

module.exports = {
  GetAllCategories: async function () {
    const categories = await Category.find().sort({ createdAt: -1 });
    return categories;
  },

  GetActiveCategories: async function () {
    const ids = await Game.distinct('category', { category: { $ne: null }, status: 'approved' });
    const categories = await Category.find({ _id: { $in: ids } }).select('_id name').sort({ name: 1 });
    return { success: true, count: categories.length, data: categories };
  },

  CreateCategory: async function (name, description) {
    if (!name) throw new Error('Tên danh mục là bắt buộc');

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) throw new Error('Tên danh mục này đã tồn tại');

    const newCategory = new Category({ name, description });
    await newCategory.save();
    return newCategory;
  },

  UpdateCategory: async function (categoryId, name, description) {
    const category = await Category.findById(categoryId);
    if (!category) throw new Error('Không tìm thấy danh mục');

    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ name });
      if (existingCategory) throw new Error('Tên danh mục này đã tồn tại');
      category.name = name;
    }

    if (description !== undefined) category.description = description;

    await category.save();
    return category;
  },

  DeleteCategory: async function (categoryId) {
    const category = await Category.findByIdAndDelete(categoryId);
    if (!category) throw new Error('Không tìm thấy danh mục');

    return true;
  }
};