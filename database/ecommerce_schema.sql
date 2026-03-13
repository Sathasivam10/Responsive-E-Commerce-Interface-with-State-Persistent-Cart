CREATE DATABASE IF NOT EXISTS ecommerce_db;
USE ecommerce_db;

CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  product_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200),
  description TEXT,
  price DECIMAL(10,2),
  image_url VARCHAR(255),
  stock INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cart (
  cart_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  product_id INT,
  quantity INT,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- Sample Data Insert
INSERT IGNORE INTO products (product_id, name, description, price, image_url, stock)
VALUES
(1, 'Wireless Headphones', 'Noise cancelling headphones', 2999, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80', 50),
(2, 'Smart Watch', 'Fitness tracking smartwatch', 3999, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80', 40),
(3, 'Laptop Backpack', 'Water resistant backpack', 1499, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80', 60),
(4, 'Bluetooth Speaker', 'Portable wireless speaker', 1999, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&q=80', 35),
(5, 'Gaming Mouse', 'Ergonomic RGB gaming mouse', 1299, 'https://images.unsplash.com/photo-1527814050087-379381547969?w=500&q=80', 70),
(6, 'Mechanical Keyboard', 'RGB Mechanical keyboard with blue switches', 4599, 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=500&q=80', 25);
