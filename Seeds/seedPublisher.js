const mongoose = require('mongoose');
// Nhớ sửa lại đường dẫn import file model cho đúng với cấu trúc thư mục của bạn
const Publisher = require('../models/Publisher'); 

// Đổi URI này thành đường dẫn kết nối MongoDB thực tế của dự án Node.js của bạn
const MONGO_URI = 'mongodb://localhost:27017/gameplatform';

const seedPublishers = [
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

const seedDB = async () => {
  try {
    // 1. Kết nối vào database
    await mongoose.connect(MONGO_URI);
    console.log('✅ Đã kết nối MongoDB thành công!');

    // 2. Xóa dữ liệu cũ
    await Publisher.deleteMany({});
    console.log('🗑️ Đã xóa dữ liệu nhà phát hành cũ!');

    // 3. Thêm dữ liệu mới
    await Publisher.insertMany(seedPublishers);
    console.log('🎮 Đã seed dữ liệu nhà phát hành game mới thành công!');

  } catch (error) {
    console.error('❌ Có lỗi xảy ra trong quá trình seed dữ liệu:', error);
  } finally {
    // 4. Ngắt kết nối database
    mongoose.connection.close();
    console.log('🔌 Đã ngắt kết nối database.');
  }
};

// Chạy hàm seed
seedDB();