# Game Distribution Platform Backend API

## Setup

1. Copy `.env.example` to `.env` and update values:
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
```

2. Install dependencies:
```
npm install
```

3. Start server:
```
npm run dev
```

## Core Features Implemented

- ✅ 12 Mongoose Models with relationships
- ✅ JWT Authentication (Register/Login)
- ✅ File Upload with Multer (POST /api/upload)
- ✅ Checkout Transaction (ACID) - POST /api/checkout/cart
- ✅ Role-based middleware

## Seeding Initial Roles

Create a seed script or manually insert via MongoDB:

```js
// Roles: Admin, Publisher, Gamer
```

## API Endpoints

**Auth:**
- POST `/api/auth/register`
- POST `/api/auth/login`

**Checkout:**
- POST `/api/checkout/cart` (requires auth)

**Upload:**
- POST `/api/upload` (multipart/form-data, requires auth)

Serve static files from `/uploads`

## Next Steps
- Add CRUD routes for all models
- Implement Publisher role-specific endpoints
- Add wallet top-up functionality
- Integrate Cloudinary for production uploads

Project follows MVC pattern and requirements from PROJECT_REQUIREMENTS.md.

