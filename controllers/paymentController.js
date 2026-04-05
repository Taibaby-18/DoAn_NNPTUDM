const User = require('../models/User');
const TopUpTransaction = require('../models/TopUpTransaction');

const generateOrderId = () => {
  return 'ORDER_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
};

module.exports = {

<<<<<<< Updated upstream
getBankQR: async function (req, res) {
  try {
    const userId = req.user._id || req.user.id;

=======
  
  GetBankQR: async function (userId) {
>>>>>>> Stashed changes
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.depositCode) {
      const error = new Error("User chưa có mã nạp tiền");
      error.statusCode = 500;
      throw error;
    }
<<<<<<< Updated upstream

    const code = user.depositCode;

    console.log("Deposit code:", code); // debug

// 🔥 tìm transaction pending trước
let transaction = await TopUpTransaction.findOne({
  user: user._id,
  status: 'pending'
});

// nếu chưa có thì tạo
if (!transaction) {
  transaction = await TopUpTransaction.create({
    user: user._id,
    code: code,
    amount: 0,
    status: 'pending'
  });
}
=======
      const existingPending = await TopUpTransaction.findOne({
        user: userId,
        status: 'pending'
      });

      if (existingPending) {
        const error = new Error("Bạn đang có đơn chưa thanh toán, vui lòng hoàn tất hoặc hủy đơn trước khi tạo đơn mới");
        error.statusCode = 400;
        throw error;
      }
      

    const code = user.depositCode;
    const orderId = generateOrderId();

    await TopUpTransaction.create({
      user: user._id,
      code: code,
      orderId: orderId,
      amount: 0,
      status: 'pending'
    });
>>>>>>> Stashed changes

    const qrUrl = `https://img.vietqr.io/image/MB-0389306604-compact.png?amount=0&addInfo=${code}&accountName=NGO%20MINH%20HAI`;

    return res.json({
      bank: "MB",
      accountNumber: "0389306604",
      accountName: "NGO MINH HAI",
      content: code,
      qrUrl
<<<<<<< Updated upstream
    });
=======
    };
  },
  

  HandleSeepayWebhook: async function (content, amount) {
    if (!content || !amount) {
      const error = new Error("Thiếu dữ liệu");
      error.statusCode = 400;
      throw error;
    }

    if (amount <= 0) {
      const error = new Error("Số tiền không hợp lệ");
      error.statusCode = 400;
      throw error;
    }

    const transaction = await TopUpTransaction.findOne({
      code: content,
      status: 'pending'
    }).sort({ createdAt: -1 });
>>>>>>> Stashed changes

  } catch (err) {
    console.error("QR ERROR:", err); // 🔥 QUAN TRỌNG
    res.status(500).json({ message: "Lỗi server" });
  }
},

<<<<<<< Updated upstream


  handleSeepayWebhook: async function (req, res) {
    try {
      const { content, amount } = req.body;

      if (!content || !amount) {
        return res.status(400).json({ message: "Thiếu dữ liệu" });
      }

      const transaction = await TopUpTransaction.findOne({
        code: content
      });

      if (!transaction) {
        return res.status(404).json({ message: "Không tìm thấy giao dịch" });
      }

      if (transaction.status === 'success') {
        return res.json({ message: "Đã xử lý trước đó" });
      }

      const session = await mongoose.startSession();

      await session.withTransaction(async () => {

        const user = await User.findById(transaction.user).session(session);

        if (!user) throw new Error("User không tồn tại");

        user.walletBalance += amount;
        await user.save({ session });

        transaction.amount = amount;
        transaction.status = 'success';
        await transaction.save({ session });

      });

      session.endSession();

      res.json({ success: true });

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Webhook lỗi" });
    }
  }


  

=======
    const user = await User.findById(transaction.user);

    if (!user) {
      const error = new Error("User không tồn tại");
      error.statusCode = 404;
      throw error;
    }

    user.walletBalance += amount;
    await user.save();

    transaction.amount = amount;
    transaction.status = 'success';
    await transaction.save();

    return { success: true };
  },

  GetTopUpHistory: async function (userId) {
    const transactions = await TopUpTransaction.find({
      user: userId
    })
      .sort({ createdAt: -1 });

    return transactions;
  },

  CancelTopUp: async function (userId, orderId) {
  const transaction = await TopUpTransaction.findOne({
    user: userId,
    orderId: orderId,
    status: 'pending'
  });

  if (!transaction) {
    const error = new Error("Không tìm thấy đơn để hủy");
    error.statusCode = 404;
    throw error;
  }

  transaction.status = 'failed'; 
  await transaction.save();

  return { success: true };
}
>>>>>>> Stashed changes
};