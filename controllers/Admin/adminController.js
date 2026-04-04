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

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('Không tìm thấy người dùng');
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
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      throw new Error('Không tìm thấy người dùng');
    }
    return true;
  }
};