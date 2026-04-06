const mongoose = require('mongoose');
const User = require('../models/User');
const Role = require('../models/Role');

const MONGO_URI = 'mongodb://localhost:27017/gameplatform';



const seedUsersAndRoles = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Đã kết nối MongoDB thành công!');

    // 1. Xóa dữ liệu cũ
    await Role.deleteMany({});
    await User.deleteMany({});
    console.log('🗑️ Đã xóa sạch dữ liệu Role và User cũ!');

    // 2. Tạo 3 Role cơ bản
    const roleAdmin = await Role.create({ name: 'Admin' });
    const rolePublisher = await Role.create({ name: 'Publisher' });
    const roleGamer = await Role.create({ name: 'Gamer' });
    console.log('🛡️ Đã tạo 3 Role: Admin, Publisher, Gamer');

    // 3. Tạo 3 tài khoản User
    await User.create([
      {
        username: 'admin_vip',
        email: 'admin@gmail.com',
        password: 'Password123',
        role: roleAdmin._id,
        walletBalance: 0,
        publisherProfile: null
      },
      {
        username: 'nph_hutech',
        email: 'publisher@gmail.com',
        password: 'Password123',
        role: rolePublisher._id,
        walletBalance: 0,
        // --- GÁN ID THỦ CÔNG Ở ĐÂY ---
        publisherProfile: null
      },
      {
        username: 'taibaby18',
        email: 'tai@hutech.edu.vn',
        password: 'Password123',
        role: roleGamer._id,
        walletBalance: 5000000,
        publisherProfile: null
      }
    ]);

    console.log('👥 Đã seed thành công 3 tài khoản!');

  } catch (error) {
    console.error('❌ Có lỗi xảy ra trong quá trình seed User:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Đã ngắt kết nối database.');
  }
};

seedUsersAndRoles();