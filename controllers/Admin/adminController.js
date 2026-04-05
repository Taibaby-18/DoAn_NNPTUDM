const User = require('../../models/User');
const Role = require('../../models/Role');

module.exports = {
  
  GetAllUsers: async function () {
    const users = await User.find()
      .populate('role', 'name') 
      .select('-password'); 
    return users;
  },


  UpdateUserRole: async function (userId, roleName) {
    const role = await Role.findOne({ name: roleName });
    if (!role) {
      throw new Error('Role không hợp lệ. Chỉ chấp nhận: Admin, Publisher, Gamer');
    }

    const user = await User.findById(userId).populate('role', 'name');
    if (!user) {
      throw new Error('Không tìm thấy người dùng');
    }

    if (user.role && user.role.name === 'Admin') {
      throw new Error('Không thể thay đổi quyền của tài khoản Admin');
    }

    user.role = role._id;
    await user.save();

    return user;
  },

  
  GetUserById: async function (userId) {
    const user = await User.findById(userId)
      .populate('role', 'name')
      .populate('library', 'title price') 
      .select('-password');
    if (!user) {
      throw new Error('Không tìm thấy người dùng');
    }
    return user;
  },

 
  DeleteUser: async function (userId) {
    // Populate role list to check if user is admin before deleting
    const user = await User.findById(userId).populate('role', 'name');
    if (!user) {
      throw new Error('Không tìm thấy người dùng');
    }

    if (user.role && user.role.name === 'Admin') {
      throw new Error('Không thể xóa tài khoản Admin');
    }

    await User.findByIdAndDelete(userId);
    return true;
  }
};