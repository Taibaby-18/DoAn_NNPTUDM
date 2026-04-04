const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Game = require('../models/Game'); // Đường dẫn tới Model Game

// Load biến môi trường (chứa link kết nối DB của ông)
dotenv.config();

// KẾT NỐI DATABASE
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Đã kết nối DB để bơm data...'));

// ĐIỀN ID CỦA CATEGORY VÀ PUBLISHER ÔNG ĐÃ TẠO TRONG COMPASS VÀO ĐÂY
const CAT_ID = "69c8a3a56251a3c828307b88"; 
const PUB_ID = "69c8a3ce6251a3c828307b8c";

// DANH SÁCH GAME CẦN BƠM (Dùng link ảnh mạng cho nhanh, web tự đẹp)
const gamesData = [
    {
        title: "Black Myth: Wukong",
        description: "Hành trình của Thiên Mệnh Nhân trong thế giới thần thoại Tây Du Ký.",
        price: 59.99,
        thumbnail: "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=400",
        gallery: [
            "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800",
            "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800"
        ],
        trailerVideo: "", // Có thể để trống nếu chưa có
        pcRequirements: "Intel Core i5, 16GB RAM, RTX 2060",
        category: CAT_ID,
        publisher: PUB_ID
    },
    {
        title: "Cyberpunk 2077",
        description: "Khám phá siêu đô thị Night City cùng Johnny Silverhand.",
        price: 49.99,
        thumbnail: "https://images.unsplash.com/photo-1605898835373-02f741d58c20?w=400",
        gallery: [
            "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800",
            "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800"
        ],
        trailerVideo: "",
        pcRequirements: "Intel Core i7, 16GB RAM, RTX 3070",
        category: CAT_ID,
        publisher: PUB_ID
    },
    {
        title: "Red Dead Redemption 2",
        description: "Bản hùng ca về miền Viễn Tây nước Mỹ thời kỳ suy tàn.",
        price: 39.99,
        thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400",
        gallery: [],
        trailerVideo: "",
        pcRequirements: "Intel Core i5, 12GB RAM, GTX 1060",
        category: CAT_ID,
        publisher: PUB_ID
    }
    // ÔNG CỨ COPY THÊM NHIỀU CỤC NHƯ TRÊN ĐỂ TẠO THÊM GAME
];

// HÀM BƠM DATA
const importData = async () => {
    try {
        await Game.insertMany(gamesData);
        console.log('🎉 ĐÃ BƠM DATA GAME THÀNH CÔNG!');
        process.exit(); // Tự động tắt terminal sau khi xong
    } catch (error) {
        console.error('⚠️ Lỗi bơm data:', error);
        process.exit(1);
    }
};

importData();