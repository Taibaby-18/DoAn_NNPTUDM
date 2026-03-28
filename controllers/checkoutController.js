const mongoose = require('mongoose');
const User = require('../models/User');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const OrderDetail = require('../models/OrderDetail');
const Library = require('../models/Library');

exports.checkoutCart = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user.id;

    // 1. Fetch cart and calculate total
    const cart = await Cart.findOne({ user: userId }).populate('items');
    if (!cart || cart.items.length === 0) {
      throw new Error('Cart is empty');
    }

    const totalAmount = cart.items.reduce((sum, item) => sum + item.price, 0);

    // 2. Check wallet balance
    const user = await User.findById(userId).session(session);
    if (user.walletBalance < totalAmount) {
      throw new Error('Insufficient wallet balance');
    }

    // 3. Deduct from wallet
    user.walletBalance -= totalAmount;
    await user.save({ session });

    // 4. Create Order
    const order = new Order({
      user: userId,
      totalAmount,
      status: 'Completed'
    });
    await order.save({ session });

    // 5. Create OrderDetails
    for (const game of cart.items) {
      const orderDetail = new OrderDetail({
        order: order._id,
        game: game._id,
        priceAtPurchase: game.price
      });
      await orderDetail.save({ session });
    }

    // 6. Add to Library (merge with existing)
    let library = await Library.findOne({ user: userId }).session(session);
    if (!library) {
      library = new Library({ user: userId, ownedGames: [] });
    }
    const newGames = cart.items.map(item => item._id);
    library.ownedGames.push(...newGames.filter(id => !library.ownedGames.includes(id)));
    await library.save({ session });

    // 7. Clear Cart
    cart.items = [];
    await cart.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({
      message: 'Checkout successful',
      orderId: order._id,
      totalAmount,
      libraryUpdated: true
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: error.message });
  }
};

