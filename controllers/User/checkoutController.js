const User = require('../../models/User');
const Game = require('../../models/Game');
const Transaction = require('../../models/Transaction');

module.exports = {
    BuyGame: async function (userId, gameId) {
        const game = await Game.findById(gameId);
        if (!game) {
            throw new Error('Không tìm thấy Game này!');
        }

        const user = await User.findById(userId);

        if (user.library && user.library.includes(gameId)) {
            throw new Error('Commander đã sở hữu tựa game này rồi!');
        }

        if (user.walletBalance < game.price) {
            throw new Error('Ví không đủ tiền. Vui lòng nạp thêm!');
        }

        user.walletBalance -= game.price;
        if (!user.library) user.library = [];
        user.library.push(game._id);
        user.cart = user.cart.filter(id => id.toString() !== gameId); 
        // 6. Lưu lại lịch sử giao dịch (Biên lai)
        const transaction = await Transaction.create({
            user: user._id,
            game: game._id,
            price: game.price,
            status: 'completed'
        });

        await user.save();

        return {
            transaction,
            newBalance: user.walletBalance
        };
    }
};