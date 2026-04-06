const Category = require('../../models/Category');
const Game = require('../../models/Game'); // Bắt buộc thêm dòng này để lấy dữ liệu từ bảng Game

module.exports = {
  // 1. Get all cate (Dành cho Admin xem tất cả)
  GetAllCategories: async function () {
    const categories = await Category.find().sort({ createdAt: -1 });
    return categories;
  },

  // 2. Get active categories (Dành cho Menu Cửa hàng: Chỉ lấy danh mục có game đã duyệt)
  GetActiveCategories: async function () {
    const ids = await Game.distinct('category', { category: { $ne: null }, status: 'approved' });
    const categories = await Category.find({ _id: { $in: ids } }).select('_id name').sort({ name: 1 });
    return { success: true, count: categories.length, data: categories };
  },

  // 3. Create Category (Dành cho Admin)
  CreateCategory: async function (name, description) {
    if (!name) throw new Error('Tên danh mục là bắt buộc');

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) throw new Error('Tên danh mục này đã tồn tại');

    const newCategory = new Category({ name, description });
    await newCategory.save();
    return newCategory;
  },

  // 4. Update Category (Dành cho Admin)
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

  // 5. Delete Category (Dành cho Admin)
  DeleteCategory: async function (categoryId) {
    const category = await Category.findByIdAndDelete(categoryId);
    if (!category) throw new Error('Không tìm thấy danh mục');

    return true;
  }
};