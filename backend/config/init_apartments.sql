CREATE DATABASE IF NOT EXISTS apartment_sales CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE apartment_sales;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS apartments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  seller_email VARCHAR(100) NOT NULL,
  location VARCHAR(200) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  size DECIMAL(10,2),
  rooms INT,
  description TEXT,
  bedrooms INT,
  bathrooms INT,
  max_guests INT,
  amenities JSON,
  image_url VARCHAR(500),
  available_units INT DEFAULT 1,
  property_type ENUM('apartman', 'vila', 'hotel') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  apartment_id INT NOT NULL,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  guests_number INT NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  status ENUM('confirmed', 'cancelled') DEFAULT 'confirmed',
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  email VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (apartment_id) REFERENCES apartments(id)
);
