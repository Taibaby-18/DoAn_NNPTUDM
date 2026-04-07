const mongoose = require('mongoose');

// Nhớ sửa lại đường dẫn import cho đúng thư mục models của bạn
const Category = require('../models/Category');
const Publisher = require('../models/Publisher');
const Game = require('../models/Game');

const MONGO_URI = 'mongodb://localhost:27017/gameplatform';

const seedDatabase = async () => {
  try {
    // 1. Kết nối vào database
    await mongoose.connect(MONGO_URI);
    console.log('✅ Đã kết nối MongoDB thành công!');

    // 2. Xóa dữ liệu cũ
    await Game.deleteMany({});
    await Category.deleteMany({});
    console.log('🗑️ Đã xóa sạch dữ liệu Game và Category cũ!');

    // 3. Khởi tạo dữ liệu Category
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

    // Thêm Category vào DB và lưu kết quả trả về để lấy _id
    const createdCategories = await Category.insertMany(seedCategories);
    console.log(`🏷️ Đã seed thành công ${createdCategories.length} thể loại game!`);

    // 4. Lấy dữ liệu Publisher từ database
    const publishers = await Publisher.find();

    if (publishers.length === 0) {
      console.log('⚠️ Cảnh báo: Database chưa có Publisher.');
      console.log('Vui lòng chạy file seed User & Publisher trước!');
      process.exit(1);
    }

    // Hàm helper để tìm _id theo tên
    const getCatId = (name) => {
      const cat = createdCategories.find(c => c.name === name);
      return cat ? cat._id : createdCategories[0]._id;
    };
    
    const getPubId = (name) => {
      const pub = publishers.find(p => p.name === name);
      return pub ? pub._id : publishers[0]._id;
    };

    // 5. Khởi tạo dữ liệu Game
    const seedGames = [
      {
        title: 'Palworld',
        description: 'Game sinh tồn thế giới mở nhiều người chơi, nơi bạn có thể thu thập các sinh vật bí ẩn gọi là "Pal" để chiến đấu, xây dựng và làm nông.',
        price: 385000,
        thumbnail: 'https://cdn-media.sforum.vn/storage/app/media/wp-content/uploads/2024/01/palworld-thumbnail.jpg',
        gallery: [
          'https://ccdn.g-portal.com/Gallery_Palworld_Variations_Lucky_Pals_cda09924bf.jpg',
          'https://ccdn.g-portal.com/Gallery_Palworld_Variations_Jormuntide_Ignis_f3f6d12d46.jpg'
        ],
        trailerVideo: 'https://www.youtube.com/watch?v=WD7RY6sn0aM',
        pcRequirements: 'OS: Windows 10 64-bit | CPU: i5-3570K | RAM: 16GB | GPU: GTX 1050 Ti',
        category: getCatId('Sinh tồn (Survival)'),
        publisher: getPubId('Pocketpair'),
        status: 'approved'
      },
      {
        title: 'Sekiro: Shadows Die Twice',
        description: 'Vào vai "Sói một tay", một chiến binh bị ruồng bỏ và trên bờ vực cái chết, bạn sẽ đối mặt với những kẻ thù khổng lồ trong Nhật Bản thời Sengoku đen tối.',
        price: 1290000,
        thumbnail: 'https://images5.alphacoders.com/100/thumb-1920-1004016.jpg',
        gallery: [
          'https://images8.alphacoders.com/990/thumb-1920-990916.jpg',
          'https://images5.alphacoders.com/130/thumb-1920-1309297.jpeg'
        ],
        trailerVideo: 'https://www.youtube.com/watch?v=DNcP4S-lP3o',
        pcRequirements: 'OS: Windows 10 64-bit | CPU: Intel Core i5-2500K | RAM: 8GB | GPU: GTX 970',
        category: getCatId('Hành động nhập vai (ARPG)'),
        publisher: getPubId('Activision'),
        status: 'approved'
      },
      {
        title: 'Ghost of Tsushima',
        description: 'Khám phá hòn đảo Tsushima tráng lệ và hóa thân thành một Samurai thực thụ để chống lại cuộc xâm lược của quân Mông Cổ.',
        price: 1400000,
        thumbnail: 'https://images7.alphacoders.com/135/thumb-1920-1355897.jpeg',
        gallery: [
          'https://images4.alphacoders.com/136/thumb-1920-1363457.jpeg',
          'https://images3.alphacoders.com/136/thumb-1920-1363455.jpeg'
        ],
        trailerVideo: 'https://www.youtube.com/watch?v=CHhhNRKaOfc',
        pcRequirements: 'OS: Windows 10 64-bit | CPU: Intel Core i3-7100 | RAM: 8GB | GPU: GTX 960',
        category: getCatId('Thế giới mở (Open World)'),
        publisher: getPubId('PlayStation Studios'),
        status: 'approved'
      },
      {
        title: 'Valheim',
        description: 'Khám phá một thế giới luyện ngục rộng lớn lấy cảm hứng từ thần thoại Bắc Âu và văn hóa Viking.',
        price: 188000,
        thumbnail: 'https://hb.imgix.net/b456229a182c3784e497788994d1db6b3e322e14.jpg?auto=compress,format&fit=crop&h=353&w=616&s=ec6bd2410a2290593b58b1bccc979fff',
        gallery: [
          'https://images2.alphacoders.com/113/thumb-1920-1138907.jpg',
          'https://images7.alphacoders.com/121/thumb-1920-1216518.jpg'
        ],
        trailerVideo: 'https://www.youtube.com/watch?v=MYPtcbPBBmE',
        pcRequirements: 'OS: Windows 10 64-bit | CPU: 2.6 GHz Quad Core | RAM: 8GB | GPU: GTX 950',
        category: getCatId('Sinh tồn (Survival)'),
        publisher: getPubId('Coffee Stain Publishing'),
        status: 'approved'
      },
      {
        title: 'FIFA 23',
        description: 'Đỉnh cao của game mô phỏng bóng đá với công nghệ HyperMotion2, mang đến trải nghiệm chân thực nhất trên sân cỏ.',
        price: 1090000,
        thumbnail: 'https://images8.alphacoders.com/127/thumb-1920-1275311.jpg',
        gallery: [
          'https://images2.alphacoders.com/125/thumb-1920-1257790.jpg',
          'https://images2.alphacoders.com/125/thumb-1920-1257792.jpg'
        ],
        trailerVideo: 'https://www.youtube.com/watch?v=PhDwMINuPdc',
        pcRequirements: 'OS: Windows 10 64-bit | CPU: Intel Core i5 6600k | RAM: 8GB | GPU: GTX 1050 Ti',
        category: getCatId('Thể thao (Sports)'),
        publisher: getPubId('Electronic Arts (EA)'),
        status: 'approved'
      },
      {
        title: 'PES 2021 (eFootball)',
        description: 'Bản cập nhật mùa giải cho tựa game bóng đá huyền thoại với gameplay xuất sắc và vật lý bóng thực tế.',
        price: 450000,
        thumbnail: 'https://www.konami.com/kde_cms/eu_publish/uploads/mock-visual_pes2021.jpg',
        gallery: [
          'https://talksport.com/wp-content/uploads/2020/10/PES4.jpg?w=620',
          'https://talksport.com/wp-content/uploads/2020/10/PES1.jpg?w=1240'
        ],
        trailerVideo: 'https://www.youtube.com/watch?v=UbrB5QDCj_E',
        pcRequirements: 'OS: Windows 10 64-bit | CPU: Intel Core i5-3470 | RAM: 8GB | GPU: GTX 670',
        category: getCatId('Thể thao (Sports)'),
        publisher: getPubId('Electronic Arts (EA)'),
        status: 'approved'
      },
      {
        title: 'God of War',
        description: 'Theo chân Kratos và cậu con trai Atreus trong cuộc hành trình đầy bạo lực và cảm xúc tại vùng đất của các vị thần Bắc Âu.',
        price: 1150000,
        thumbnail: 'https://w0.peakpx.com/wallpaper/653/537/HD-wallpaper-god-of-war-god-of-war-2018.jpg',
        gallery: [
          'https://images2.thanhnien.vn/528068263637045248/2024/3/8/gameofwar-1709868261771-17098682623131797849996.jpg',
          'https://4kwallpapers.com/images/walls/thumbs_3t/10659.jpg'
        ],
        trailerVideo: 'https://www.youtube.com/watch?v=BsVrS0Jgig8',
        pcRequirements: 'OS: Windows 10 64-bit | CPU: Intel i5-2500k | RAM: 8GB | GPU: GTX 960',
        category: getCatId('Hành động nhập vai (ARPG)'),
        publisher: getPubId('PlayStation Studios'),
        status: 'approved'
      },
      {
        title: 'Marvel\'s Spider-Man Remastered',
        description: 'Đu tơ lượn quanh thành phố New York và trải nghiệm cảm giác làm Người Nhện với đồ họa được nâng cấp mạnh mẽ.',
        price: 1390000,
        thumbnail: 'https://gepig.com/game_cover_460w/7364.jpg',
        gallery: [
          'https://images4.alphacoders.com/127/thumb-1920-1270256.jpg',
          'https://images5.alphacoders.com/132/thumb-1920-1327489.png'
        ],
        trailerVideo: 'https://www.youtube.com/watch?v=eEPG4TMhwtk',
        pcRequirements: 'OS: Windows 10 64-bit | CPU: Intel Core i3-4160 | RAM: 8GB | GPU: GTX 950',
        category: getCatId('Thế giới mở (Open World)'),
        publisher: getPubId('PlayStation Studios'),
        status: 'approved'
      },
      {
        title: 'Call of Duty: Modern Warfare II',
        description: 'Tựa game FPS bom tấn với những chiến dịch nghẹt thở và chế độ Multiplayer nhịp độ cực nhanh.',
        price: 1700000,
        thumbnail: 'https://images3.alphacoders.com/124/thumb-1920-1246702.jpg',
        gallery: [
          'https://images.alphacoders.com/129/thumb-1920-1294266.jpg',
          'https://images7.alphacoders.com/124/thumb-1920-1245273.jpg'
        ],
        trailerVideo: 'https://www.youtube.com/watch?v=KurHR-5VmIw',
        pcRequirements: 'OS: Windows 10 64-bit | CPU: Intel Core i3-6100 | RAM: 8GB | GPU: GTX 960',
        category: getCatId('Hành động nhập vai (ARPG)'),
        publisher: getPubId('Activision'),
        status: 'approved'
      },
      {
        title: 'It Takes Two',
        description: 'Tựa game Co-op 2 người chơi tuyệt đỉnh, một hành trình phiêu lưu đầy những câu đố sáng tạo và cốt truyện ý nghĩa.',
        price: 990000,
        thumbnail: 'https://images4.alphacoders.com/113/thumb-1920-1132363.jpg',
        gallery: [
          'https://images6.alphacoders.com/113/thumb-1920-1132362.jpg',
          'https://images5.alphacoders.com/114/thumb-1920-1148440.jpg'
        ],
        trailerVideo: 'https://www.youtube.com/watch?v=GAWHzGNcTEw',
        pcRequirements: 'OS: Windows 10 64-bit | CPU: Intel Core i3-2100 | RAM: 8GB | GPU: GTX 660',
        category: getCatId('Indie'),
        publisher: getPubId('Electronic Arts (EA)'),
        status: 'approved'
      },
      {
        title: 'Game Test Đang Chờ Duyệt',
        description: 'Đây là game tạo ra để test màn hình Admin.',
        price: 50000,
        thumbnail: '',
        gallery: [],
        trailerVideo: '',
        pcRequirements: 'OS: Windows 10',
        category: getCatId('Indie'),
        publisher: getPubId('Pocketpair'),
        status: 'pending' // Chờ duyệt
      }
    ];

    // Thêm Game vào DB
    const createdGames = await Game.insertMany(seedGames);
    console.log(`🕹️ Đã seed thành công ${createdGames.length} tựa game mới!`);

  } catch (error) {
    console.error('❌ Có lỗi xảy ra trong quá trình seed dữ liệu:', error);
  } finally {
    // 6. Ngắt kết nối database
    mongoose.connection.close();
    console.log('🔌 Đã ngắt kết nối database.');
  }
};

// Chạy hàm seed
seedDatabase();