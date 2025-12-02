-- Rename market_products table to establishment_products
ALTER TABLE public.market_products
RENAME TO establishment_products;

-- Rename market_id column to establishment_id
ALTER TABLE public.establishment_products
RENAME COLUMN market_id TO establishment_id;