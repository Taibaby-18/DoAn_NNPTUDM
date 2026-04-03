# 🎮 Game Distribution Platform - Backend API

Backend Node.js phục vụ cho dự án Cửa hàng phân phối Game trực tuyến. Hệ thống hỗ trợ xác thực người dùng (JWT), phân quyền (Admin/User), quản lý giao dịch an toàn (MongoDB Transaction), và tích hợp nạp ví qua cổng thanh toán VNPay.

## 🛠 Yêu cầu hệ thống
* **Node.js** (Phiên bản 18+ hoặc 20+)
* **MongoDB** (Bắt buộc chạy dưới dạng **Replica Set** để hỗ trợ Transaction)

## 🚀 Hướng dẫn cài đặt và khởi chạy

**Bước 1: Clone dự án về máy**
```bash
git clone https://github.com/Taibaby-18/DoAn_NNPTUDM.git

** Bước 2: Cài đặt thư viện (Dependencies)

Bash
npm install
Bước 3: Cấu hình biến môi trường

Tạo một file tên là .env ở thư mục gốc của dự án.
## Hỏi Tài để biết nội dung file env
Thiết lập các thông số cơ bản sau:

Đoạn mã
PORT=????
MONGO_URI=mongodb://127.0.0.1:27017/????

# JWT Auth
JWT_SECRET=?????




# ## Chưa có làm
# # VNPay Sandbox Config
# VNP_TMNCODE=??????
# VNP_HASH_SECRET=??????
# VNP_URL=[https://sandbox.vnpayment.vn/paymentv2/vpcpay.html](https://sandbox.vnpayment.vn/paymentv2/vpcpay.html)
# VNP_RETURN_URL=[http://127.0.0.1:5000/api/wallet/vnpay/return](http://127.0.0.1:5000/api/wallet/vnpay/return)
# VNP_IPN_URL=[http://127.0.0.1:5000/api/wallet/vnpay/ipn](http://127.0.0.1:5000/api/wallet/vnpay/ipn)
# VNP_FRONTEND_RETURN_URL=[http://127.0.0.1:5500/frontend/topup.html](http://127.0.0.1:5500/frontend/topup.html)
Bước 4: Khởi chạy Server

Bash
# Chạy bình thường
npm start

# HOẶC Chạy môi trường Dev (tự động reload khi sửa code)
npm run dev