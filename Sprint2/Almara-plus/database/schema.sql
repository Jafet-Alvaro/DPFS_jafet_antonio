-- Esquema de base de datos para Almara+
-- Motor sugerido: MySQL 8+

CREATE DATABASE IF NOT EXISTS almara_plus
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE almara_plus;

-- =========================
-- Tabla de usuarios
-- =========================

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  whatsapp VARCHAR(30),
  avatar VARCHAR(255),
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =========================
-- Tablas de catálogo
-- =========================

CREATE TABLE IF NOT EXISTS categories (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS colors (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS sizes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
);

-- =========================
-- Productos
-- =========================

CREATE TABLE IF NOT EXISTS products (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  sku VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  fabric VARCHAR(100),
  wholesale_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  retail_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  image VARCHAR(255),
  description TEXT,
  category_id INT UNSIGNED,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_products_category
    FOREIGN KEY (category_id)
    REFERENCES categories(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
);

-- =========================
-- Relaciones N:M de productos
-- =========================

CREATE TABLE IF NOT EXISTS product_colors (
  product_id INT UNSIGNED NOT NULL,
  color_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (product_id, color_id),
  CONSTRAINT fk_product_colors_product
    FOREIGN KEY (product_id)
    REFERENCES products(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_product_colors_color
    FOREIGN KEY (color_id)
    REFERENCES colors(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS product_sizes (
  product_id INT UNSIGNED NOT NULL,
  size_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (product_id, size_id),
  CONSTRAINT fk_product_sizes_product
    FOREIGN KEY (product_id)
    REFERENCES products(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_product_sizes_size
    FOREIGN KEY (size_id)
    REFERENCES sizes(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

-- =========================
-- Carrito de compras (opcional)
-- =========================

CREATE TABLE IF NOT EXISTS carts (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED,
  status ENUM('active', 'completed', 'cancelled') NOT NULL DEFAULT 'active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_carts_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS cart_items (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  cart_id INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NOT NULL,
  quantity INT UNSIGNED NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_cart_items_cart
    FOREIGN KEY (cart_id)
    REFERENCES carts(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_cart_items_product
    FOREIGN KEY (product_id)
    REFERENCES products(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
);




