const User = require('../../models/User');
const Game = require('../../models/Game');
const Transaction = require('../../models/Transaction');

module.exports = {
    BuyGame: async function (userId, gameId) {
        // 1. Tìm Game xem có tồn tại không
        const game = await Game.findById(gameId);
        if (!game) {
            throw new Error('Không tìm thấy Game này!');
        }

        // 2. Lấy thông tin User hiện tại
        const user = await User.findById(userId);

        // 3. Kiểm tra xem user đã mua game này chưa
        if (user.library && user.library.includes(gameId)) {
            throw new Error('Commander đã sở hữu tựa game này rồi!');
        }

        // 4. Kiểm tra ví tiền
        if (user.walletBalance < game.price) {
            throw new Error('Ví không đủ tiền. Vui lòng nạp thêm!');
        }

        // 5. Tiến hành thanh toán (Trừ tiền + Thêm game vào thư viện)
        user.walletBalance -= game.price;
        if (!user.library) user.library = [];
        user.library.push(game._id);

        // 6. Lưu lại lịch sử giao dịch (Biên lai)
        const transaction = await Transaction.create({
            user: user._id,
            game: game._id,
            price: game.price,
            status: 'completed'
        });

        // 7. Lưu thay đổi của User vào Database
        await user.save();

        return {
            transaction,
            newBalance: user.walletBalance
        };
    }
};