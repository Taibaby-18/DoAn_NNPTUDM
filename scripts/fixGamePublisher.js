/**
 * Script sửa lại publisher ID trong collection Games.
 * Vấn đề: trước đây route POST /api/games lưu publisher = user._id (User ID)
 * nhưng Game.publisher phải là publisherProfile._id (Publisher model ID).
 *
 * Chạy: node scripts/fixGamePublisher.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Game = require('../models/Game');
const User = require('../models/User');

async function fixGamePublishers() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Đã kết nối MongoDB');

  // Lấy tất cả users có publisherProfile
  const publishers = await User.find({ publisherProfile: { $ne: null } }).select('_id publisherProfile');

  let fixed = 0;
  let skipped = 0;

  for (const user of publishers) {
    // Tìm game nào đang có publisher = user._id (User ID — sai)
    const wrongGames = await Game.find({ publisher: user._id });

    if (wrongGames.length === 0) {
      skipped++;
      continue;
    }

    // Cập nhật lại thành publisherProfile._id (đúng)
    const result = await Game.updateMany(
      { publisher: user._id },
      { $set: { publisher: user.publisherProfile } }
    );

    console.log(`👤 User ${user._id} → publisherProfile ${user.publisherProfile}: sửa ${result.modifiedCount} game`);
    fixed += result.modifiedCount;
  }

  console.log(`\n🎉 Xong! Đã sửa tổng cộng ${fixed} game. Bỏ qua ${skipped} user không có game sai.`);
  await mongoose.disconnect();
}

fixGamePublishers().catch(err => {
  console.error('❌ Lỗi:', err);
  process.exit(1);
});
