const moment = require('moment');
const crypto = require('crypto');
const qs = require('qs');
const mongoose = require('mongoose');
const User = require('../models/User');
const TopUpTransaction = require('../models/TopUpTransaction');

function sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}

module.exports = {
    createPaymentUrl: async function (req, res, next) {
        try {
            const userId = req.user._id || req.user.id;
            const amountParam = req.body.amount;

            if (!amountParam || isNaN(amountParam) || Number(amountParam) <= 0) {
                return res.status(400).json({ success: false, message: 'Số tiền không hợp lệ' });
            }

            // Ép cứng Key lấy từ Email của bạn để chạy test cho qua lỗi
            let tmnCode = 'RR58SP98';
            let secretKey = '89S54VM9R4ZB63PQMJ58O0OAO4WPJA55';
            let vnpUrl = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
            let returnUrl = 'http://localhost:5000/api/wallet/vnpay/return';

            let ipAddr = '127.0.0.1'; // Cố định IP

            let date = new Date();
            let createDate = moment(date).format('YYYYMMDDHHmmss');

            // THÊM BIẾN EXPIRE DATE (Hết hạn sau 15 phút) - ĐÂY LÀ CHÌA KHÓA QUYẾT ĐỊNH
            let expireDate = moment(date).add(15, 'minutes').format('YYYYMMDDHHmmss');

            let orderId = moment(date).format('DDHHmmss');
            let amount = Number(amountParam);

            let vnp_Params = {};
            vnp_Params['vnp_Version'] = '2.1.0';
            vnp_Params['vnp_Command'] = 'pay';
            vnp_Params['vnp_TmnCode'] = tmnCode;
            vnp_Params['vnp_Locale'] = 'vn';
            vnp_Params['vnp_CurrCode'] = 'VND';
            vnp_Params['vnp_TxnRef'] = orderId;
            vnp_Params['vnp_OrderInfo'] = 'Nap_tien_vao_vi_ma_GD_' + orderId;
            vnp_Params['vnp_OrderType'] = 'other';
            vnp_Params['vnp_Amount'] = amount * 100;
            vnp_Params['vnp_ReturnUrl'] = returnUrl;
            vnp_Params['vnp_IpAddr'] = ipAddr;
            vnp_Params['vnp_CreateDate'] = createDate;
            vnp_Params['vnp_ExpireDate'] = expireDate; // Gắn vào payload gửi đi

            vnp_Params = sortObject(vnp_Params);

            let signData = qs.stringify(vnp_Params, { encode: false });
            let hmac = crypto.createHmac("sha512", secretKey);
            let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
            vnp_Params['vnp_SecureHash'] = signed;
            vnpUrl += '?' + qs.stringify(vnp_Params, { encode: false });

            console.log("========== LINK CÓ EXPIRE DATE ĐÃ TẠO ==========");
            console.log(vnpUrl);

            await TopUpTransaction.create({
                user: userId,
                orderId: orderId,
                amount: amount,
                paymentMethod: 'VNPay',
                status: 'pending'
            });

            return res.status(200).json({ success: true, data: vnpUrl });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    },

    vnpayReturn: async function (req, res, next) {
        let vnp_Params = req.query;
        let secureHash = vnp_Params['vnp_SecureHash'];

        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];

        vnp_Params = sortObject(vnp_Params);

        // Ép cứng Key ở hàm hứng kết quả luôn
        let secretKey = '89S54VM9R4ZB63PQMJ58O0OAO4WPJA55';
        let signData = qs.stringify(vnp_Params, { encode: false });
        let hmac = crypto.createHmac("sha512", secretKey);
        let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

        let orderId = vnp_Params['vnp_TxnRef'];
        let rspCode = vnp_Params['vnp_ResponseCode'];
        let message = '';
        let status = 'failed';

        if (secureHash === signed) {
            const session = await mongoose.startSession();
            try {
                await session.withTransaction(async () => {
                    const tx = await TopUpTransaction.findOne({ orderId }).session(session);
                    if (!tx) {
                        message = 'Không tìm thấy giao dịch';
                        throw new Error(message);
                    }
                    if (tx.status !== 'pending') {
                        status = tx.status;
                        return;
                    }
                    if (rspCode === '00') {
                        status = 'success';
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
                        status = 'failed';
                        await TopUpTransaction.updateOne(
                            { _id: tx._id },
                            { $set: { status: 'failed' } },
                            { session }
                        );
                    }
                });
            } catch (err) {
                console.error(err);
            } finally {
                session.endSession();
            }
            // Đá về frontend
            const url = new URL('http://localhost:5500/vnpay_return.html');
            url.searchParams.set('orderId', orderId);
            url.searchParams.set('resultCode', rspCode);
            url.searchParams.set('status', status);
            return res.redirect(url.toString());
        } else {
            return res.status(200).json({ RspCode: '97', Message: 'Chữ ký không hợp lệ' });
        }
    }
};