var express = require("express");
var router = express.Router();

let { protect } = require('../middleware/auth'); 
let userController = require('../controllers/User/userController'); 

router.get('/profile', protect, async function (req, res, next) {
    try {
        let result = await userController.GetUserProfile(req.user.id);
        
        if (result) {
            res.send({ success: true, data: result });
        } else {
            res.status(404).send({ success: false, message: "Không tìm thấy người dùng" });
        }
    } catch (error) {
        console.error("LỖI LẤY PROFILE:", error);
        res.status(500).send({ success: false, message: "Lỗi server" });
    }
});

module.exports = router;