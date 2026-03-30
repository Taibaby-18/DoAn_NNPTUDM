const axios = require('axios');
const crypto = require('crypto');
const mongoose = require('mongoose');

const User = require('../models/User');
const TopUpTransaction = require('../models/TopUpTransaction');

const MOMO_CREATE_ENDPOINT = 'https://test-payment.momo.vn/v2/gateway/api/create';

function mustGetEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function buildOrderId(userId) {
  const rand = crypto.randomBytes(4).toString('hex');
  return `TOPUP_${userId}_${Date.now()}_${rand}`;
}

exports.createMoMoPayment = async (req, res) => {
  try {
    const partnerCode = mustGetEnv('MOMO_PARTNER_CODE');
    const accessKey = mustGetEnv('MOMO_ACCESS_KEY');
    const secretKey = mustGetEnv('MOMO_SECRET_KEY');

    const amount = Number(req.body.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ success: false, message: 'amount không hợp lệ' });
    }

    // redirectUrl ưu tiên cấu hình/param để phù hợp localhost của bạn
    const redirectUrl =
      req.body.redirectUrl ||
      process.env.MOMO_REDIRECT_URL ||
      `${req.protocol}://${req.get('host')}/api/wallet/momo/return`;

    // Vì localhost không nhận IPN từ MoMo, để cùng 1 URL hoặc để trống tùy môi trường
    const ipnUrl =
      req.body.ipnUrl ||
      process.env.MOMO_IPN_URL ||
      `${req.protocol}://${req.get('host')}/api/wallet/momo/return`;

    const orderId = buildOrderId(req.user._id.toString());
    const requestId = orderId;
    const orderInfo = `Nap vi (${req.user.email || req.user.username})`;
    const requestType = "payWithMethod";
    const extraData = Buffer.from(
      JSON.stringify({ userId: req.user._id.toString() }),
      'utf8'
    ).toString('base64');

    await TopUpTransaction.create({
      user: req.user._id,
      orderId,
      amount,
      paymentMethod: 'MoMo',
      status: 'pending'
    });

    const rawSignature =
      `accessKey=${accessKey}` +
      `&amount=${amount}` +
      `&extraData=${extraData}` +
      `&ipnUrl=${ipnUrl}` +
      `&orderId=${orderId}` +
      `&orderInfo=${orderInfo}` +
      `&partnerCode=${partnerCode}` +
      `&redirectUrl=${redirectUrl}` +
      `&requestId=${requestId}` +
      `&requestType=${requestType}`;

    const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');

    const payload = {
      partnerCode,
      accessKey,
      requestId,
      amount: String(amount),
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      extraData,
      requestType,
      signature,
      lang: 'vi'
    };

    const momoRes = await axios.post(MOMO_CREATE_ENDPOINT, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000
    });

    return res.status(200).json({
      success: true,
      data: {
        orderId,
        requestId,
        redirectUrl,
        momo: momoRes.data
      }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err?.response?.data?.message || err.message || 'MoMo create payment failed',
      error: err?.response?.data || undefined
    });
  }
};

// MoMo redirect về (ưu tiên dùng cho localhost)
exports.momoCallback = async (req, res) => {
  const params = { ...(req.query || {}), ...(req.body || {}) };
  const orderId = params.orderId;
  const resultCode = Number(params.resultCode);
  const message = params.message;

  if (!orderId) {
    return res.status(400).json({ success: false, message: 'Thiếu orderId' });
  }

  try {
    const session = await mongoose.startSession();
    let finalStatus = 'failed';

    await session.withTransaction(async () => {
      const tx = await TopUpTransaction.findOne({ orderId }).session(session);
      if (!tx) {
        throw new Error('Không tìm thấy TopUpTransaction theo orderId');
      }

      if (resultCode === 0) {
        finalStatus = 'success';

        // Idempotent: chỉ cộng tiền nếu đang pending
        const updated = await TopUpTransaction.findOneAndUpdate(
          { _id: tx._id, status: 'pending' },
          { $set: { status: 'success' } },
          { new: true, session }
        );

        if (updated) {
          await User.updateOne(
            { _id: updated.user },
            { $inc: { walletBalance: updated.amount } },
            { session }
          );
        }
      } else {
        finalStatus = 'failed';
        await TopUpTransaction.updateOne(
          { _id: tx._id, status: 'pending' },
          { $set: { status: 'failed' } },
          { session }
        );
      }
    });

    session.endSession();

    // Nếu bạn muốn MoMo redirect thẳng về 1 trang HTML frontend:
    const frontendReturn = process.env.MOMO_FRONTEND_RETURN_URL;
    if (frontendReturn) {
      const url = new URL(frontendReturn);
      url.searchParams.set('orderId', orderId);
      url.searchParams.set('resultCode', String(resultCode));
      if (message) url.searchParams.set('message', String(message));
      url.searchParams.set('status', finalStatus);
      return res.redirect(url.toString());
    }

    return res.status(200).json({
      success: true,
      message: 'Processed MoMo return',
      data: { orderId, resultCode, status: finalStatus }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Callback failed' });
  }
};

