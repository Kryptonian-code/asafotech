USE asafo_tech;

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS condition_label VARCHAR(40) NOT NULL DEFAULT 'Brand New' AFTER description,
  ADD COLUMN IF NOT EXISTS warranty_months INT UNSIGNED NULL AFTER condition_label,
  ADD COLUMN IF NOT EXISTS key_specs TEXT NULL AFTER warranty_months,
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'active' AFTER key_specs;
