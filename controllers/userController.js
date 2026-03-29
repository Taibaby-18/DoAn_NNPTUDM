const User = require('../models/User');
require('../models/Game'); // Phải gọi Game model vào để hàm populate nó biết đường tìm

const getUserProfile = async (req, res) => {
    try {
        // Tìm user và kéo luôn thông tin chi tiết các game trong thư viện (library)
        const user = await User.findById(req.user.id).populate('library');
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
        }
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        console.error("LỖI LẤY PROFILE:", error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// CHÚ Ý CHỖ NÀY: Phải xuất khẩu đúng cái tên getUserProfile
module.exports = { getUserProfile };