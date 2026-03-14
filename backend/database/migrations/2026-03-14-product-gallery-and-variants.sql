ALTER TABLE products
  ADD COLUMN IF NOT EXISTS gallery_images LONGTEXT NULL AFTER key_specs,
  ADD COLUMN IF NOT EXISTS variants_json LONGTEXT NULL AFTER gallery_images;

ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS variant_label VARCHAR(120) NULL AFTER unit_price;

UPDATE products
SET gallery_images = JSON_ARRAY(image_url)
WHERE gallery_images IS NULL OR TRIM(gallery_images) = '';

UPDATE products
SET variants_json = CASE
  WHEN category_id = (SELECT id FROM categories WHERE slug = 'smart-phones' LIMIT 1) THEN JSON_ARRAY(
    JSON_OBJECT('id', '128gb-black', 'label', '128GB / Black', 'price', price, 'inventoryCount', GREATEST(inventory_count, 0)),
    JSON_OBJECT('id', '256gb-blue', 'label', '256GB / Blue', 'price', price + 350, 'inventoryCount', GREATEST(inventory_count - 1, 0))
  )
  WHEN category_id = (SELECT id FROM categories WHERE slug = 'laptops' LIMIT 1) THEN JSON_ARRAY(
    JSON_OBJECT('id', '8gb-512ssd', 'label', '8GB RAM / 512GB SSD', 'price', price, 'inventoryCount', GREATEST(inventory_count, 0)),
    JSON_OBJECT('id', '16gb-1tbssd', 'label', '16GB RAM / 1TB SSD', 'price', price + 950, 'inventoryCount', GREATEST(inventory_count - 1, 0))
  )
  WHEN category_id = (SELECT id FROM categories WHERE slug = 'game-consoles' LIMIT 1) THEN JSON_ARRAY(
    JSON_OBJECT('id', 'standard', 'label', 'Standard Bundle', 'price', price, 'inventoryCount', GREATEST(inventory_count, 0)),
    JSON_OBJECT('id', 'extra-pad', 'label', 'Bundle with Extra Pad', 'price', price + 520, 'inventoryCount', GREATEST(inventory_count - 1, 0))
  )
  ELSE JSON_ARRAY()
END
WHERE variants_json IS NULL OR TRIM(variants_json) = '';
