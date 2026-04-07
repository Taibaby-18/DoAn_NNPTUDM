const User = require('../../models/User');
const Game = require('../../models/Game');
const Wishlist = require('../../models/Wishlist');

module.exports = {
    AddToWishlist: async function (userId, gameId) {
        const user = await User.findById(userId);
        const game = await Game.findById(gameId);

        if (!game) throw new Error('Game không tồn tại!');
        
        if (user.library && user.library.includes(gameId)) {
            throw new Error('Bạn đã sở hữu game này rồi!');
        }
        
        let wishlist = await Wishlist.findOne({ user: userId });
        if (!wishlist) {
            wishlist = await Wishlist.create({ user: userId, games: [] });
        }

        if (wishlist.games.includes(gameId)) {
            throw new Error('Game này đã có trong danh sách yêu thích!');
        }

        wishlist.games.push(gameId);
        await wishlist.save();
        return true;
    },

    GetWishlist: async function (userId) {
        const wishlist = await Wishlist.findOne({ user: userId }).populate('games', 'title price thumbnail imageUrl');
            
        if (!wishlist || !wishlist.games || wishlist.games.length === 0) {
            return { wishlist: [], totalGames: 0 };
        }

        return { wishlist: wishlist.games, totalGames: wishlist.games.length };
    },

    RemoveFromWishlist: async function (userId, gameId) {
        const wishlist = await Wishlist.findOne({ user: userId });
        if (!wishlist) throw new Error('Danh sách yêu thích không tồn tại');

        wishlist.games = wishlist.games.filter(id => id.toString() !== gameId);
        
        await wishlist.save();
        return true;
    }
};
