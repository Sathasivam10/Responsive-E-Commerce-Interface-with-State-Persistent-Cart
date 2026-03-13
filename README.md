# SaaS E-Commerce Cart System

A full-stack, state-persistent e-commerce web application with a modern, responsive SaaS-style UI.

## Features

- **Frontend:** Vanilla JS, CSS3 (Grid & Flexbox), HTML5.
- **Backend:** Node.js, Express.js.
- **Database:** MySQL.
- **Authentication:** JWT & bcrypt, local storage tokens.
- **Cart Persistence:** 
  - Anonymous users: Cart saved in `localStorage`.
  - Logged-in users: Cart saved in MySQL database. Local cart merges upon login.

## Prerequisites

- Node.js installed.
- MySQL server running locally.

## Setup Instructions

### 1. Database Setup
1. Open MySQL Workbench or your preferred MySQL client.
2. Run the SQL script located at `database/ecommerce_schema.sql` to create the `ecommerce_db` database, tables, and insert sample data products.
3. Verify the database `ecommerce_db` is created.

### 2. Backend Setup
1. Open a terminal and navigate to the `ecommerce-cart-system` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the backend server:
   ```bash
   npm run start
   ```
   *The server will run on `http://localhost:3000`.*

   *(Note: The server uses default root/password for MySQL, if your DB credentials differ, modify `backend/config/db.js` or set environment variables `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`)*

### 3. Frontend Usage
Since the frontend uses external JS API calls, you can open the HTML files directly in your browser or run them using a simple local server (like VS Code Live Server extension).

Because the Express backend also serves static files, you can access the frontend straight from the Node server:
1. Ensure the Node server is running.
2. Open your web browser and navigate to:
   ```
   http://localhost:3000
   ```

## Demonstration Details

1. **Anonymous Cart:** Go to Products, add items. Refresh page to see `localStorage` persistence.
2. **Registration/Login:** Go to Login. Register a new account, then login.
3. **Cart Merge:** Upon login, your `localStorage` cart automatically merges into the MySQL database.
4. **Persistent Session:** Close the browser, come back, you are still logged in (JWT token based), and your cart items are pulled directly from the DB.
