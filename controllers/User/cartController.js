const User = require('../../models/User');
const Game = require('../../models/Game');
const Transaction = require('../../models/Transaction');

module.exports = {
    // 1. Thêm game vào giỏ hàng
    AddToCart: async function (userId, gameId) {
        const user = await User.findById(userId);
        const game = await Game.findById(gameId);

        if (!game) throw new Error('Game không tồn tại!');
        
        if (user.library && user.library.includes(gameId)) {
            throw new Error('Bạn đã sở hữu game này rồi!');
        }
        
        if (user.cart && user.cart.includes(gameId)) {
            throw new Error('Game này đã nằm trong giỏ hàng!');
        }

        user.cart.push(gameId);
        await user.save();
        return true;
    },

    // 2. Xem giỏ hàng & Tính tổng tiền
    GetCart: async function (userId) {
        const user = await User.findById(userId).populate('cart', 'title price thumbnail imageUrl'); 
            
        if (!user || !user.cart || user.cart.length === 0) {
            return { cart: [], totalPrice: 0 };
        }

        let totalPrice = 0;
        user.cart.forEach(game => {
            totalPrice += game.price || 0;
        });

        return { cart: user.cart, totalPrice: totalPrice };
    },

    // 3. Thanh toán toàn bộ giỏ hàng
    CheckoutCart: async function (userId) {
        const user = await User.findById(userId).populate('cart');

        if (!user.cart || user.cart.length === 0) {
            throw new Error('Giỏ hàng đang trống!');
        }

        const totalPrice = user.cart.reduce((total, game) => total + game.price, 0);

        if (user.walletBalance < totalPrice) {
            throw new Error(`Ví không đủ tiền. Cần thêm ${totalPrice - user.walletBalance} để thanh toán!`);
        }

        user.walletBalance -= totalPrice;

        for (let game of user.cart) {
            user.library.push(game._id);
            
            await Transaction.create({
                user: user._id,
                game: game._id,
                price: game.price,
                status: 'completed'
            });
        }

        user.cart = [];
        await user.save();

        return user.walletBalance; 
    },

    // 4. Xóa một game cụ thể khỏi giỏ hàng
    RemoveFromCart: async function (userId, gameId) {
        const user = await User.findById(userId);
        if (!user) throw new Error('User không tồn tại');

        user.cart = user.cart.filter(id => id.toString() !== gameId);
        
        await user.save();
        return true;
    }
};