const mongoose = require('mongoose');
// Nhớ sửa lại đường dẫn import file model cho đúng với cấu trúc thư mục của bạn
const Category = require('../models/Category'); 

// Đổi URI này thành đường dẫn kết nối MongoDB thực tế của bạn
const MONGO_URI = 'mongodb://localhost:27017/gameplatform';

const seedCategories = [
  {
    name: 'Sinh tồn (Survival)',
    description: 'Người chơi bắt đầu với lượng tài nguyên hạn hẹp và phải chế tạo công cụ, xây dựng căn cứ để sống sót (ví dụ: Palworld, Valheim).'
  },
  {
    name: 'Hành động nhập vai (ARPG)',
    description: 'Thể loại kết hợp giữa yếu tố hành động nhịp độ cao và sự phát triển nhân vật sâu sắc của game nhập vai (ví dụ: Sekiro: Shadows Die Twice, Ghost of Tsushima).'
  },
  {
    name: 'Thể thao (Sports)',
    description: 'Mô phỏng các môn thể thao ngoài đời thực mang tính cạnh tranh cao, tập trung vào kỹ năng điều khiển và chiến thuật (ví dụ: FIFA 23, PES 2021).'
  },
  {
    name: 'Thế giới mở (Open World)',
    description: 'Cung cấp một thế giới rộng lớn, cho phép người chơi tự do di chuyển, khám phá và làm nhiệm vụ theo cách riêng thay vì đi theo tuyến tính.'
  },
  {
    name: 'Indie',
    description: 'Những tựa game độc lập được phát triển bởi các studio nhỏ, thường mang đậm tính sáng tạo và phong cách đồ họa độc đáo.'
  }
];

const seedDB = async () => {
  try {
    // 1. Kết nối vào database
    await mongoose.connect(MONGO_URI);
    console.log('✅ Đã kết nối MongoDB thành công!');

    // 2. Xóa dữ liệu cũ (để tránh lỗi duplicate key vì trường name là unique)
    await Category.deleteMany({});
    console.log('🗑️ Đã xóa dữ liệu thể loại (category) cũ!');

    // 3. Thêm dữ liệu mới
    await Category.insertMany(seedCategories);
    console.log('🏷️ Đã seed dữ liệu thể loại game mới thành công!');

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