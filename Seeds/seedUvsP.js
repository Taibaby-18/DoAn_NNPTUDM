const mongoose = require('mongoose');
const User = require('../models/User');
const Role = require('../models/Role');
const Publisher = require('../models/Publisher'); 

const MONGO_URI = 'mongodb://localhost:27017/gameplatform';

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Đã kết nối MongoDB thành công!');

    // 1. Xóa sạch dữ liệu cũ
    await Role.deleteMany({});
    await User.deleteMany({});
    await Publisher.deleteMany({});
    console.log('🗑️ Đã xóa sạch dữ liệu Role, User và Publisher cũ!');

    // 2. Tạo 3 Role cơ bản
    const roleAdmin = await Role.create({ name: 'Admin' });
    const rolePublisher = await Role.create({ name: 'Publisher' });
    const roleGamer = await Role.create({ name: 'Gamer' });
    console.log('🛡️ Đã tạo 3 Role: Admin, Publisher, Gamer');

    // 3. Dữ liệu 5 Nhà phát hành
    const publishersData = [
      {
        name: 'PlayStation Studios',
        contactEmail: 'contact@playstation.com',
        description: 'Nhà phát hành đứng sau nhiều siêu phẩm AAA đình đám như Ghost of Tsushima, God of War, Spider-Man.'
      },
      {
        name: 'Electronic Arts (EA)',
        contactEmail: 'support@ea.com',
        description: 'Một trong những ông lớn ngành game, nổi tiếng toàn cầu với các dòng game thể thao như FIFA, EA Sports FC.'
      },
      {
        name: 'Pocketpair',
        contactEmail: 'info@pocketpair.jp',
        description: 'Nhà phát hành và phát triển game indie đến từ Nhật Bản, gây tiếng vang lớn với hiện tượng sinh tồn thế giới mở Palworld.'
      },
      {
        name: 'Activision',
        contactEmail: 'pr@activision.com',
        description: 'Nhà phát hành khổng lồ với các thương hiệu như Call of Duty và cũng là đơn vị phát hành toàn cầu cho bom tấn Sekiro: Shadows Die Twice.'
      },
      {
        name: 'Coffee Stain Publishing',
        contactEmail: 'hello@coffeestain.se',
        description: 'Nhà phát hành chuyên hỗ trợ các studio indie tài năng, được biết đến nhiều qua tựa game sinh tồn Valheim.'
      }
    ];
    
    // Insert mảng Publisher vào DB
    const createdPublishers = await Publisher.insertMany(publishersData);
    console.log(`🎮 Đã seed thành công ${createdPublishers.length} nhà phát hành!`);

    // Hàm helper để lấy ID nhanh theo tên Publisher
    const getPublisherId = (name) => {
      const pub = createdPublishers.find(p => p.name === name);
      return pub ? pub._id : null;
    };

    // 4. Tạo các tài khoản User
    await User.create([
      // --- ADMIN & GAMER ---
      {
        username: 'admin_vip',
        email: 'admin@gmail.com',
        password: 'Password123',
        role: roleAdmin._id,
        walletBalance: 0,
        publisherProfile: null
      },
      {
        username: 'taibaby18',
        email: 'tai@hutech.edu.vn',
        password: 'Password123',
        role: roleGamer._id,
        walletBalance: 5000000,
        publisherProfile: null
      },

      // --- 5 TÀI KHOẢN PUBLISHER TƯƠNG ỨNG ---
      {
        username: 'nph_playstation',
        email: 'admin@playstation.com',
        password: 'Password123',
        role: rolePublisher._id,
        walletBalance: 0,
        publisherProfile: getPublisherId('PlayStation Studios')
      },
      {
        username: 'nph_ea',
        email: 'admin@ea.com',
        password: 'Password123',
        role: rolePublisher._id,
        walletBalance: 0,
        publisherProfile: getPublisherId('Electronic Arts (EA)')
      },
      {
        username: 'nph_pocketpair',
        email: 'admin@pocketpair.jp',
        password: 'Password123',
        role: rolePublisher._id,
        walletBalance: 0,
        publisherProfile: getPublisherId('Pocketpair')
      },
      {
        username: 'nph_activision',
        email: 'admin@activision.com',
        password: 'Password123',
        role: rolePublisher._id,
        walletBalance: 0,
        publisherProfile: getPublisherId('Activision')
      },
      {
        username: 'nph_coffeestain',
        email: 'admin@coffeestain.se',
        password: 'Password123',
        role: rolePublisher._id,
        walletBalance: 0,
        publisherProfile: getPublisherId('Coffee Stain Publishing')
      }
    ]);

    console.log('👥 Đã seed thành công tất cả User và liên kết đầy đủ Publisher Profile!');

  } catch (error) {
    console.error('❌ Có lỗi xảy ra trong quá trình seed database:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Đã ngắt kết nối database.');
  }
};

seedDatabase();