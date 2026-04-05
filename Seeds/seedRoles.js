const mongoose = require('mongoose');
// Nhớ kiểm tra lại đường dẫn import file models của bạn cho chuẩn nhé
const User = require('../models/User');
const Role = require('../models/Role'); // Import model Role

const MONGO_URI = 'mongodb://localhost:27017/gameplatform';

const seedUsersAndRoles = async () => {
  try {
    // 1. Kết nối database
    await mongoose.connect(MONGO_URI);
    console.log('✅ Đã kết nối MongoDB thành công!');

    // 2. Xóa dữ liệu User và Role cũ cho sạch sẽ (Cẩn thận nếu DB đang có user thật)
    await Role.deleteMany({});
    await User.deleteMany({});
    console.log('🗑️ Đã xóa sạch dữ liệu Role và User cũ!');

    // 3. Tạo 3 quyền (Roles) cơ bản
    const roleAdmin = await Role.create({ name: 'Admin' });
    const rolePublisher = await Role.create({ name: 'Publisher' });
    const roleGamer = await Role.create({ name: 'Gamer' });
    console.log('🛡️ Đã tạo 3 Role: Admin, Publisher, Gamer');

    // 4. Tạo 3 tài khoản User
    // LƯU Ý: Mình dùng User.create() thay vì insertMany() để đảm bảo nếu bạn có viết 
    // hàm băm mật khẩu (bcrypt) trong file model User (pre-save hook) thì nó vẫn sẽ chạy.
    await User.create([
      {
        username: 'admin_vip',
        email: 'admin@gmail.com',
        password: 'Password123', // Pass chung cho dễ nhớ
        role: roleAdmin._id,
        walletBalance: 0
      },
      {
        username: 'nph_hutech',
        email: 'publisher@gmail.com',
        password: 'Password123',
        role: rolePublisher._id,
        walletBalance: 0
      },
      {
        // Tài khoản user của bạn theo như Postman
        username: 'taibaby18',
        email: 'tai@hutech.edu.vn',
        password: 'Password123',
        role: roleGamer._id,
        walletBalance: 5000000 // Bơm sẵn 5 củ vào ví để test tính năng mua game luôn cho sướng
      }
    ]);

    console.log('👥 Đã seed thành công 3 tài khoản (Admin, Publisher, Gamer)!');
    console.log('🔑 Mật khẩu chung cho cả 3 nick là: Password123');

  } catch (error) {
    console.error('❌ Có lỗi xảy ra trong quá trình seed User:', error);
  } finally {
    // 5. Ngắt kết nối
    mongoose.connection.close();
    console.log('🔌 Đã ngắt kết nối database.');
  }
};

// Chạy hàm
seedUsersAndRoles();