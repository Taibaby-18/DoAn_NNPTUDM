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

module.exports = {
  CreateMoMoPayment: async function (amountParam, userId, userEmail, username, redirectUrlParam, ipnUrlParam, baseUrl) {
    const partnerCode = mustGetEnv('MOMO_PARTNER_CODE');
    const accessKey = mustGetEnv('MOMO_ACCESS_KEY');
    const secretKey = mustGetEnv('MOMO_SECRET_KEY');

    const amount = Number(amountParam);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error('amount không hợp lệ');
    }

    const redirectUrl = redirectUrlParam || process.env.MOMO_REDIRECT_URL || `${baseUrl}/api/wallet/momo/return`;
    const ipnUrl = ipnUrlParam || process.env.MOMO_IPN_URL || `${baseUrl}/api/wallet/momo/return`;

    const orderId = buildOrderId(userId.toString());
    const requestId = orderId;
    const orderInfo = `Nap vi (${userEmail || username})`;
    const requestType = "payWithMethod";
    const extraData = Buffer.from(
      JSON.stringify({ userId: userId.toString() }),
      'utf8'
    ).toString('base64');

    await TopUpTransaction.create({
      user: userId,
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

    try {
      const momoRes = await axios.post(MOMO_CREATE_ENDPOINT, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000
      });

      return {
        orderId,
        requestId,
        redirectUrl,
        momo: momoRes.data
      };
    } catch (err) {
      throw new Error(err?.response?.data?.message || err.message || 'MoMo create payment failed');
    }
  },

  MomoCallback: async function (orderId, resultCode, message) {
    if (!orderId) {
      throw new Error('Thiếu orderId');
    }

    const session = await mongoose.startSession();
    let finalStatus = 'failed';

    await session.withTransaction(async () => {
      const tx = await TopUpTransaction.findOne({ orderId }).session(session);
      if (!tx) {
        throw new Error('Không tìm thấy TopUpTransaction theo orderId');
      }

      if (resultCode === 0) {
        finalStatus = 'success';
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

    const frontendReturn = process.env.MOMO_FRONTEND_RETURN_URL;
    if (frontendReturn) {
      const url = new URL(frontendReturn);
      url.searchParams.set('orderId', orderId);
      url.searchParams.set('resultCode', String(resultCode));
      if (message) url.searchParams.set('message', String(message));
      url.searchParams.set('status', finalStatus);
      return { action: 'redirect', url: url.toString() };
    }

    return { 
      action: 'json', 
      data: { orderId, resultCode, status: finalStatus },
      message: 'Processed MoMo return'
    };
  }
};
