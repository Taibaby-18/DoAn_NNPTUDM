# 🚀 PROJECT CODING RULES & BEST PRACTICES
**Tech Stack:** Node.js, Express, MongoDB (Mongoose)

## 1. QUY TẮC CƠ BẢN (GENERAL RULES)
- **Async/Await:** Bắt buộc sử dụng `async/await` thay cho `.then().catch()` hoặc callback.
- **Error Handling:** Mọi controller phải được bọc trong khối `try...catch`. Bắt buộc log lỗi ra console `console.error(err)` và trả về HTTP Status code 500 kèm message rõ ràng khi có lỗi server.
- **Biến môi trường (Env):** Không bao giờ hardcode các thông tin nhạy cảm (Keys, Database URI, Port). Bắt buộc phải gọi qua `.env`.
- **Naming Convention:** - Tên file/controller/biến: `camelCase` (vd: `gameController.js`, `walletBalance`).
  - Tên Model/Class: `PascalCase` (vd: `User.js`, `TopUpTransaction.js`).

## 2. KIẾN TRÚC ROUTER & ĐIỀU HƯỚNG (ROUTING & REDIRECTION)
- **Tách bạch Route và Controller (Strict MVC):** Tuyệt đối KHÔNG viết logic nghiệp vụ (gọi Database, tính toán, gọi API bên thứ 3) trực tiếp bên trong các file ở thư mục `routes/`.
  - Các file trong `routes/` CHỈ được phép làm 3 nhiệm vụ: Định nghĩa endpoint (GET/POST), gắn Middleware chặn cửa (verifyToken, checkRole), và gọi hàm Controller tương ứng.
  - Vd chuẩn: `router.post('/pay', verifyToken, paymentController.createPayment);`
  - Mọi logic xử lý BẮT BUỘC phải nằm gọn trong thư mục `controllers/`.
- **Phân tách Frontend & Backend:** Backend chỉ đóng vai trò là API Server. Tuyệt đối KHÔNG render HTML từ Backend.
- **Quy tắc Redirect (Điều hướng chéo):** Các route dùng làm Callback/Return URL từ bên thứ 3 (VNPay, MoMo, OAuth) BẮT BUỘC phải sử dụng lệnh `res.redirect(FRONTEND_URL)` (nằm trong Controller) để điều hướng người dùng về lại giao diện Frontend sau khi xử lý xong Database. Các tham số kết quả phải được gắn vào Query String.
##  3. GIAO DỊCH CƠ SỞ DỮ LIỆU (DATABASE TRANSACTIONS) - [CRITICAL]
Bắt buộc sử dụng session.withTransaction cho tất cả các API có tính chất thay đổi dữ liệu trên nhiều bảng (Collections) cùng một lúc. Đặc biệt là các tác vụ liên quan đến:

Thanh toán, cộng/trừ tiền trong ví (walletBalance).

Tạo đơn hàng (Orders) và cập nhật số lượng tồn kho.

Mua Game (Trừ tiền User + Thêm Game vào thư viện).

Quy tắc Rollback: Nếu bất kỳ bước nào trong Transaction thất bại, bắt buộc phải throw Error để MongoDB tự động Rollback lại toàn bộ quá trình. Không được để xảy ra tình trạng "trừ tiền nhưng chưa giao hàng".

Tính Idempotency: Trong các API Webhook/IPN, phải kiểm tra trạng thái cũ của giao dịch (vd: if (status !== 'pending') return) trước khi xử lý tiếp để chống nạp tiền 2 lần.

## 4. XÁC THỰC VÀ PHÂN QUYỀN (AUTHENTICATION & AUTHORIZATION)
Authentication (Xác thực người dùng):

Mọi API yêu cầu đăng nhập BẮT BUỘC phải đi qua middleware verifyToken.

Sử dụng JWT (JSON Web Token) truyền qua header: Authorization: Bearer <token>.

Không truyền user ID từ Client lên ở body/query để chống giả mạo. Phải lấy trực tiếp từ token giải mã: req.user._id.

Authorization (Phân quyền):

Các API quản trị (Thêm/Sửa/Xóa Game, xem thống kê) BẮT BUỘC phải đi qua middleware checkRole('admin').

Người dùng thông thường (user) chỉ được thao tác với dữ liệu của chính mình (vd: cập nhật profile của mình, không được sửa profile người khác). Bắt buộc phải check điều kiện req.user._id.toString() === targetId.