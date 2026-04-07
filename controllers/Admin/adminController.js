const User = require('../../models/User');
const Role = require('../../models/Role');
const Game = require('../../models/Game');

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
    const user = await User.findById(userId).populate('role', 'name');
    if (!user) {
      throw new Error('Không tìm thấy người dùng');
    }

    if (user.role && user.role.name === 'Admin') {
      throw new Error('Không thể xóa tài khoản Admin');
    }

    await User.findByIdAndDelete(userId);
    return true;
  },


  GetAllGamesAdmin: async function () {
    const games = await Game.find()
      .populate('publisher', 'name')
      .populate('category', 'name')
      .sort({ createdAt: -1 });
    return { success: true, count: games.length, data: games };
  },

  ApproveGame: async function (gameId) {
    const game = await Game.findById(gameId);
    if (!game) throw new Error('Không tìm thấy game');
    if (game.status === 'approved') throw new Error('Game này đã được duyệt rồi');

    game.status = 'approved';
    await game.save();
    return { success: true, data: game };
  },

  RejectGame: async function (gameId, reason) {
    const game = await Game.findById(gameId);
    if (!game) throw new Error('Không tìm thấy game');
    if (game.status === 'rejected') throw new Error('Game này đã bị từ chối rồi');

    game.status = 'rejected';
    if (reason) game.rejectionReason = reason;
    await game.save();
    return { success: true, data: game };
  }
};