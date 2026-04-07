const User = require('../../models/User');
const Game = require('../../models/Game'); // Kéo model Game vào để populate

module.exports = {
    GetUserProfile: async function (userId) {
        let user = await User.findById(userId).populate('library').populate('role');
        return user;
    }
}