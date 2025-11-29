-- Seeds básicos para Almara+
-- Ejecutar después de schema.sql

USE almara_plus;

-- =========================
-- Categorías (desde products.json)
-- =========================

INSERT INTO categories (name) VALUES
  ('BABUCHAS'),
  ('BLAZERS'),
  ('BLUSAS'),
  ('CAMISAS'),
  ('CAMISOLAS'),
  ('CAMPERAS'),
  ('CAPRIS'),
  ('CHALECOS'),
  ('KIMONOS'),
  ('MONOS'),
  ('MUSCULOSAS'),
  ('PANTALONES'),
  ('POLLERAS'),
  ('REMERAS'),
  ('SAQUITOS'),
  ('SHORTS'),
  ('VESTIDOS')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- =========================
-- Usuario admin de ejemplo
-- (cambiar password_hash por un hash real de bcrypt en producción)
-- =========================

INSERT INTO users (name, email, whatsapp, avatar, password_hash, role)
VALUES (
  'Admin Almara+',
  'admin@almara-plus.com',
  '+5491100000000',
  NULL,
  '$2a$10$exampleexampleexampleexampleexampleexampleexampleexa', -- REEMPLAZAR
  'admin'
)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  whatsapp = VALUES(whatsapp),
  role = VALUES(role);

-- =========================
-- Productos de ejemplo (3 productos)
-- =========================

INSERT INTO products (
  sku,
  name,
  fabric,
  wholesale_price,
  retail_price,
  image,
  description,
  category_id
)
VALUES
(
  '0200MD',
  'Babucha Modal',
  'Modal con Lycra',
  8500,
  8500,
  '0200MD-Babucha Modal/DSC_0033.jpg',
  'Comodidad absoluta para tu día a día. Tela suave que acompaña tus curvas con elegancia.',
  (SELECT id FROM categories WHERE name = 'BABUCHAS' LIMIT 1)
),
(
  '0302BE',
  'Blazer Golden',
  'Bengalina',
  13500,
  13500,
  '0302BE-Blazer Golden/blazergolden.jpg',
  'Elegancia que impone presencia. El blazer perfecto para ocasiones especiales o el día a día con actitud.',
  (SELECT id FROM categories WHERE name = 'BLAZERS' LIMIT 1)
),
(
  '0401LU',
  'Blusa Cruzada Lurex',
  'Lurex',
  26000,
  23000,
  '0401LU-Blusa Cruzada Lurex/DSC_0009.jpg',
  'Brillo sofisticado que realza tu silueta. Diseño cruzado que estiliza y deslumbra.',
  (SELECT id FROM categories WHERE name = 'BLUSAS' LIMIT 1)
)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  fabric = VALUES(fabric),
  wholesale_price = VALUES(wholesale_price),
  retail_price = VALUES(retail_price),
  image = VALUES(image),
  description = VALUES(description),
  category_id = VALUES(category_id);




