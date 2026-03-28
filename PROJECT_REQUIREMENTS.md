# Project: Game Distribution Platform Backend API (Steam/Epic Clone)

## 1. Tech Stack & Environment
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (using Mongoose ODM)
- **Authentication:** JWT (JSON Web Tokens) + bcrypt for password hashing
- **File Upload:** Multer (local storage or integrate with Cloudinary)
- **Author:** Taibaby-18

## 2. Core Requirements to Generate
The system MUST include the following core functionalities:
- **Full CRUD** operations for all 12 models.
- **Authentication:** Login, Register.
- **Authorization:** Role-based access control (Admin, Publisher, Gamer).
- **Database Transaction:** Strict ACID transactions for the checkout process (using `mongoose.startSession()`).
- **File Upload:** API to upload images/videos.

## 3. Database Schema (12 Models)

Please generate Mongoose Models for the following 12 entities with relationships:

1. **Role**:
   - `name` (String, enum: ['Admin', 'Publisher', 'Gamer'], required)
   
2. **User**:
   - `username`, `email` (String, unique, required)
   - `password` (String, hashed, required)
   - `walletBalance` (Number, default: 0)
   - `role` (ObjectId, ref: 'Role')

3. **Category** (Genre):
   - `name` (String, unique, required) - e.g., Action, RPG, Puzzle
   - `description` (String)

4. **Publisher**:
   - `name` (String, required)
   - `contactEmail` (String)
   - `description` (String)

5. **Game**:
   - `title` (String, required)
   - `description` (String)
   - `price` (Number, required)
   - `pcRequirements` (String) // Minimum PC specs
   - `category` (ObjectId, ref: 'Category')
   - `publisher` (ObjectId, ref: 'Publisher')

6. **Cart**:
   - `user` (ObjectId, ref: 'User', unique)
   - `items` (Array of ObjectIds, ref: 'Game')

7. **Wishlist**:
   - `user` (ObjectId, ref: 'User', unique)
   - `games` (Array of ObjectIds, ref: 'Game')

8. **Order**:
   - `user` (ObjectId, ref: 'User')
   - `totalAmount` (Number, required)
   - `status` (String, enum: ['Pending', 'Completed', 'Failed'], default: 'Pending')
   - `createdAt` (Date, default: Date.now)

9. **OrderDetail**:
   - `order` (ObjectId, ref: 'Order')
   - `game` (ObjectId, ref: 'Game')
   - `priceAtPurchase` (Number, required)

10. **Library**:
    - `user` (ObjectId, ref: 'User', unique)
    - `ownedGames` (Array of ObjectIds, ref: 'Game')

11. **Review**:
    - `user` (ObjectId, ref: 'User')
    - `game` (ObjectId, ref: 'Game')
    - `rating` (Number, min: 1, max: 5)
    - `comment` (String)

12. **MediaAsset** (For File Uploads):
    - `entityId` (ObjectId) // Can refer to Game ID or User ID
    - `entityModel` (String, enum: ['Game', 'User'])
    - `url` (String, required) // Path or Cloudinary URL
    - `mediaType` (String, enum: ['Avatar', 'GameBanner', 'GameTrailer'])

## 4. Specific Business Logic to Implement

### A. The Checkout Transaction (Crucial)
Generate a Controller function `checkoutCart` that uses MongoDB Transactions (`session.withTransaction`).
**Steps inside the transaction:**
1. Fetch the user's `Cart` and calculate the `totalAmount` of all games.
2. Check if `User.walletBalance` >= `totalAmount`. If not, abort transaction (throw error).
3. Deduct `totalAmount` from `User.walletBalance`.
4. Create a new `Order` with status 'Completed'.
5. Create `OrderDetail` records for each game in the cart.
6. Add the purchased games to the user's `Library`.
7. Clear the user's `Cart` (remove all items).
*If any step fails, the entire transaction MUST rollback.*

### B. File Upload Logic
Generate a middleware using `multer` to handle `multipart/form-data`.
- Create a Controller function to upload a file.
- Save the file path/URL to the `MediaAsset` collection, linking it to the correct `Game` or `User`.

## 5. Instructions for AI (Blackbox)
- Please generate the Mongoose connection setup first.
- Then, generate the 12 Model files.
- Next, generate the Auth controller and Checkout Transaction controller.
- Keep the code modular (MVC pattern: routes, controllers, models).