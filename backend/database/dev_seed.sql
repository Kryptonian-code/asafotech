USE asafo_tech;

START TRANSACTION;

INSERT IGNORE INTO categories (name, slug, icon_name, display_order) VALUES
  ('Smart Phones', 'smart-phones', 'Smartphone', 1),
  ('Laptops', 'laptops', 'Laptop', 2),
  ('Desktop PCs', 'desktop-pcs', 'MonitorSmartphone', 3),
  ('System Units', 'system-units', 'Cpu', 4),
  ('Game Consoles', 'game-consoles', 'Gamepad2', 5),
  ('Game Controllers', 'game-controllers', 'Gamepad2', 6),
  ('Headphones', 'headphones', 'Headphones', 7),
  ('Accessories', 'accessories', 'Smartphone', 8);

INSERT INTO products (
  category_id,
  name,
  slug,
  brand,
  description,
  price,
  original_price,
  rating,
  reviews_count,
  image_url,
  inventory_count,
  collection_tag,
  is_featured
)
SELECT
  c.id,
  generated.name,
  generated.slug,
  generated.brand,
  generated.description,
  generated.price,
  generated.original_price,
  generated.rating,
  generated.reviews_count,
  generated.image_url,
  generated.inventory_count,
  generated.collection_tag,
  generated.is_featured
FROM (
  SELECT
    seq.num,
    CASE ((seq.num - 1) % 8)
      WHEN 0 THEN 'smart-phones'
      WHEN 1 THEN 'laptops'
      WHEN 2 THEN 'desktop-pcs'
      WHEN 3 THEN 'system-units'
      WHEN 4 THEN 'game-consoles'
      WHEN 5 THEN 'game-controllers'
      WHEN 6 THEN 'headphones'
      ELSE 'accessories'
    END AS category_slug,
    CASE ((seq.num - 1) % 8)
      WHEN 0 THEN CONCAT(
        ELT(((seq.num - 1) DIV 8) % 5 + 1, 'Samsung', 'Tecno', 'Infinix', 'itel', 'Xiaomi'),
        ' Phone ',
        LPAD(seq.num, 3, '0')
      )
      WHEN 1 THEN CONCAT(
        ELT(((seq.num - 1) DIV 8) % 5 + 1, 'HP', 'Dell', 'Lenovo', 'Asus', 'Acer'),
        ' Laptop ',
        LPAD(seq.num, 3, '0')
      )
      WHEN 2 THEN CONCAT(
        ELT(((seq.num - 1) DIV 8) % 5 + 1, 'Dell', 'HP', 'Lenovo', 'Acer', 'Asafo'),
        ' Desktop ',
        LPAD(seq.num, 3, '0')
      )
      WHEN 3 THEN CONCAT(
        ELT(((seq.num - 1) DIV 8) % 5 + 1, 'Asafo', 'Intel', 'AMD', 'Gigabyte', 'MSI'),
        ' System Unit ',
        LPAD(seq.num, 3, '0')
      )
      WHEN 4 THEN CONCAT(
        ELT(((seq.num - 1) DIV 8) % 4 + 1, 'PlayStation', 'Xbox', 'Nintendo', 'Asafo'),
        ' Console ',
        LPAD(seq.num, 3, '0')
      )
      WHEN 5 THEN CONCAT(
        ELT(((seq.num - 1) DIV 8) % 5 + 1, 'Sony', 'Xbox', 'Logitech', 'Redragon', 'Asafo'),
        ' Controller ',
        LPAD(seq.num, 3, '0')
      )
      WHEN 6 THEN CONCAT(
        ELT(((seq.num - 1) DIV 8) % 5 + 1, 'JBL', 'Oraimo', 'Sony', 'Anker', 'Beats'),
        ' Headphones ',
        LPAD(seq.num, 3, '0')
      )
      ELSE CONCAT(
        ELT(((seq.num - 1) DIV 8) % 5 + 1, 'Oraimo', 'Anker', 'Asafo', 'JBL', 'Ugreen'),
        ' Accessory ',
        LPAD(seq.num, 3, '0')
      )
    END AS name,
    CONCAT(
      CASE ((seq.num - 1) % 8)
        WHEN 0 THEN 'smart-phone'
        WHEN 1 THEN 'laptop'
        WHEN 2 THEN 'desktop-pc'
        WHEN 3 THEN 'system-unit'
        WHEN 4 THEN 'game-console'
        WHEN 5 THEN 'game-controller'
        WHEN 6 THEN 'headphones'
        ELSE 'accessory'
      END,
      '-',
      LPAD(seq.num, 3, '0')
    ) AS slug,
    CASE ((seq.num - 1) % 8)
      WHEN 0 THEN ELT(((seq.num - 1) DIV 8) % 5 + 1, 'Samsung', 'Tecno', 'Infinix', 'itel', 'Xiaomi')
      WHEN 1 THEN ELT(((seq.num - 1) DIV 8) % 5 + 1, 'HP', 'Dell', 'Lenovo', 'Asus', 'Acer')
      WHEN 2 THEN ELT(((seq.num - 1) DIV 8) % 5 + 1, 'Dell', 'HP', 'Lenovo', 'Acer', 'Asafo')
      WHEN 3 THEN ELT(((seq.num - 1) DIV 8) % 5 + 1, 'Asafo Build', 'Intel', 'AMD', 'Gigabyte', 'MSI')
      WHEN 4 THEN ELT(((seq.num - 1) DIV 8) % 4 + 1, 'Sony', 'Microsoft', 'Nintendo', 'Asafo')
      WHEN 5 THEN ELT(((seq.num - 1) DIV 8) % 5 + 1, 'Sony', 'Microsoft', 'Logitech', 'Redragon', 'Asafo')
      WHEN 6 THEN ELT(((seq.num - 1) DIV 8) % 5 + 1, 'JBL', 'Oraimo', 'Sony', 'Anker', 'Beats')
      ELSE ELT(((seq.num - 1) DIV 8) % 5 + 1, 'Oraimo', 'Anker', 'Asafo', 'JBL', 'Ugreen')
    END AS brand,
    CASE ((seq.num - 1) % 8)
      WHEN 0 THEN 'Reliable smartphone for daily use, social media, photos, and mobile productivity.'
      WHEN 1 THEN 'Well-balanced laptop for office work, school, browsing, and light creative tasks.'
      WHEN 2 THEN 'Dependable desktop PC for office operations, front-desk work, and steady performance.'
      WHEN 3 THEN 'Custom system unit built for performance, multitasking, and demanding workflows.'
      WHEN 4 THEN 'Gaming console with strong visuals, responsive gameplay, and entertainment value.'
      WHEN 5 THEN 'Comfortable game controller with quick response, stable grip, and smooth play sessions.'
      WHEN 6 THEN 'Wireless headphones with strong sound, everyday comfort, and dependable battery life.'
      ELSE 'Useful electronics accessory to support charging, connection, and daily device use.'
    END AS description,
    CASE ((seq.num - 1) % 8)
      WHEN 0 THEN 1700 + (seq.num * 37)
      WHEN 1 THEN 4200 + (seq.num * 55)
      WHEN 2 THEN 3600 + (seq.num * 48)
      WHEN 3 THEN 5200 + (seq.num * 61)
      WHEN 4 THEN 7800 + (seq.num * 43)
      WHEN 5 THEN 650 + (seq.num * 19)
      WHEN 6 THEN 450 + (seq.num * 17)
      ELSE 120 + (seq.num * 9)
    END AS price,
    CASE ((seq.num - 1) % 8)
      WHEN 0 THEN 1900 + (seq.num * 39)
      WHEN 1 THEN 4550 + (seq.num * 58)
      WHEN 2 THEN 3900 + (seq.num * 50)
      WHEN 3 THEN 5550 + (seq.num * 64)
      WHEN 4 THEN 8200 + (seq.num * 45)
      WHEN 5 THEN 760 + (seq.num * 21)
      WHEN 6 THEN 520 + (seq.num * 18)
      ELSE 150 + (seq.num * 10)
    END AS original_price,
    ROUND(3.8 + ((seq.num % 12) * 0.1), 1) AS rating,
    5 + (seq.num % 40) AS reviews_count,
    CASE ((seq.num - 1) % 8)
      WHEN 0 THEN 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80'
      WHEN 1 THEN 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80'
      WHEN 2 THEN 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=900&q=80'
      WHEN 3 THEN 'https://images.unsplash.com/photo-1587202372616-b43abea06c2a?auto=format&fit=crop&w=900&q=80'
      WHEN 4 THEN 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=900&q=80'
      WHEN 5 THEN 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=900&q=80'
      WHEN 6 THEN 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80'
      ELSE 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=900&q=80'
    END AS image_url,
    CASE
      WHEN seq.num % 11 = 0 THEN 0
      ELSE 2 + (seq.num % 14)
    END AS inventory_count,
    CASE
      WHEN seq.num % 3 = 0 THEN 'trending'
      WHEN seq.num % 5 = 0 THEN 'deals'
      ELSE NULL
    END AS collection_tag,
    CASE WHEN seq.num % 4 = 0 THEN 1 ELSE 0 END AS is_featured
  FROM (
    SELECT ones.n + (tens.n * 10) + 1 AS num
    FROM
      (SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) AS ones
    CROSS JOIN
      (SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) AS tens
    WHERE ones.n + (tens.n * 10) < 100
  ) AS seq
) AS generated
INNER JOIN categories c ON c.slug = generated.category_slug
LEFT JOIN products existing ON existing.slug = generated.slug
WHERE existing.id IS NULL;

INSERT INTO users (full_name, firebase_uid, email, password_hash, phone, email_verified)
SELECT
  CASE
    WHEN seq.num = 1 THEN 'Joseph Acquah'
    ELSE CONCAT(
      ELT(((seq.num - 1) % 10) + 1, 'Kwame', 'Ama', 'Kojo', 'Abena', 'Kofi', 'Akosua', 'Yaw', 'Efua', 'Nana', 'Adwoa'),
      ' ',
      ELT((((seq.num - 1) DIV 10) % 10) + 1, 'Mensah', 'Owusu', 'Asare', 'Boateng', 'Agyeman', 'Appiah', 'Darko', 'Ofori', 'Antwi', 'Yeboah')
    )
  END AS full_name,
  NULL AS firebase_uid,
  CASE
    WHEN seq.num = 1 THEN 'josephyarteyacquah@gmail.com'
    ELSE CONCAT('tester', LPAD(seq.num, 3, '0'), '@asafotech.local')
  END AS email,
  '$2y$10$emyx2iR192FesnsvcvLPeO4bAlITIV0nVCP4ZcTFAXvaSCl8gx6ke' AS password_hash,
  CONCAT(
    '0',
    ELT(((seq.num - 1) % 4) + 1, '24', '20', '27', '55'),
    LPAD((seq.num * 731) % 10000000, 7, '0')
  ) AS phone,
  1 AS email_verified
FROM (
  SELECT ones.n + (tens.n * 10) + 1 AS num
  FROM
    (SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) AS ones
  CROSS JOIN
    (SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) AS tens
  WHERE ones.n + (tens.n * 10) < 100
) AS seq
LEFT JOIN users existing ON existing.email = CASE
  WHEN seq.num = 1 THEN 'josephyarteyacquah@gmail.com'
  ELSE CONCAT('tester', LPAD(seq.num, 3, '0'), '@asafotech.local')
END
WHERE existing.id IS NULL;

INSERT INTO orders (
  user_id,
  order_number,
  status,
  payment_status,
  currency,
  subtotal,
  delivery_fee,
  total,
  customer_name,
  customer_phone,
  delivery_address
)
SELECT
  u.id,
  CONCAT('ESH-DEMO', LPAD(seq.num, 4, '0')) AS order_number,
  CASE (seq.num % 5)
    WHEN 1 THEN 'processing'
    WHEN 2 THEN 'shipped'
    WHEN 3 THEN 'delivered'
    WHEN 4 THEN 'cancelled'
    ELSE 'pending'
  END AS status,
  CASE
    WHEN seq.num % 5 = 4 THEN 'failed'
    WHEN seq.num % 5 = 0 THEN 'pending'
    ELSE 'paid'
  END AS payment_status,
  'GHS' AS currency,
  ROUND((p.price * (1 + (seq.num % 2))), 2) AS subtotal,
  CASE
    WHEN (p.price * (1 + (seq.num % 2))) >= 200 THEN 0.00
    ELSE 15.00
  END AS delivery_fee,
  ROUND((p.price * (1 + (seq.num % 2))) + CASE WHEN (p.price * (1 + (seq.num % 2))) >= 200 THEN 0.00 ELSE 15.00 END, 2) AS total,
  u.full_name AS customer_name,
  COALESCE(u.phone, '0240000000') AS customer_phone,
  CONCAT(
    ELT(((seq.num - 1) % 10) + 1, 'East Legon', 'Adum', 'Osu', 'Madina', 'Kasoa', 'Dansoman', 'Tema', 'Santasi', 'Takoradi', 'Tamale'),
    ', ',
    ELT(((seq.num - 1) % 5) + 1, 'Accra', 'Kumasi', 'Tema', 'Takoradi', 'Tamale')
  ) AS delivery_address
FROM (
  SELECT ones.n + (tens.n * 10) + 1 AS num
  FROM
    (SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) AS ones
  CROSS JOIN
    (SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4) AS tens
  WHERE ones.n + (tens.n * 10) < 50
) AS seq
INNER JOIN users u ON u.email = CASE
  WHEN seq.num = 1 THEN 'josephyarteyacquah@gmail.com'
  ELSE CONCAT('tester', LPAD(seq.num, 3, '0'), '@asafotech.local')
END
INNER JOIN products p ON p.slug = CONCAT(
  CASE ((seq.num - 1) % 8)
    WHEN 0 THEN 'smart-phone'
    WHEN 1 THEN 'laptop'
    WHEN 2 THEN 'desktop-pc'
    WHEN 3 THEN 'system-unit'
    WHEN 4 THEN 'game-console'
    WHEN 5 THEN 'game-controller'
    WHEN 6 THEN 'headphones'
    ELSE 'accessory'
  END,
  '-',
  LPAD(seq.num, 3, '0')
)
LEFT JOIN orders existing ON existing.order_number = CONCAT('ESH-DEMO', LPAD(seq.num, 4, '0'))
WHERE existing.id IS NULL;

INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT
  o.id,
  p.id,
  1 + (seq.num % 2) AS quantity,
  p.price AS unit_price
FROM (
  SELECT ones.n + (tens.n * 10) + 1 AS num
  FROM
    (SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) AS ones
  CROSS JOIN
    (SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4) AS tens
  WHERE ones.n + (tens.n * 10) < 50
) AS seq
INNER JOIN orders o ON o.order_number = CONCAT('ESH-DEMO', LPAD(seq.num, 4, '0'))
INNER JOIN products p ON p.slug = CONCAT(
  CASE ((seq.num - 1) % 8)
    WHEN 0 THEN 'smart-phone'
    WHEN 1 THEN 'laptop'
    WHEN 2 THEN 'desktop-pc'
    WHEN 3 THEN 'system-unit'
    WHEN 4 THEN 'game-console'
    WHEN 5 THEN 'game-controller'
    WHEN 6 THEN 'headphones'
    ELSE 'accessory'
  END,
  '-',
  LPAD(seq.num, 3, '0')
)
LEFT JOIN order_items existing ON existing.order_id = o.id AND existing.product_id = p.id
WHERE existing.id IS NULL;

COMMIT;
