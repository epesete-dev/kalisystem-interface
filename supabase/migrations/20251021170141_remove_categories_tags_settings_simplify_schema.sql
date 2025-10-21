/*
  # Simplify Schema - Remove Categories, Tags, Settings and Update Item Structure

  ## Changes
  1. Drop categories table
  2. Drop tags table  
  3. Drop settings table
  4. Drop manager_tags table
  5. Update items table:
     - Remove category column
     - Remove tags column  
     - Remove variant_tags column
     - Rename unit_tag to measure_unit
  6. Update suppliers table:
     - Remove categories column
     - Remove order_type column
     - Remove payment_method column
     - Update default_payment_method values
  7. Update pending_orders table:
     - Remove order_type column
     - Update payment_method to new values
  8. Update completed_orders table:
     - Remove order_type column
  9. Update current_order table:
     - Remove order_type column
     - Remove manager column

  ## Security
  - All RLS policies remain enabled
  
  ## Important Notes
  - This is a destructive migration that removes data
  - Payment methods updated to: CASH ON DELIVERY, Aba, TrueMoney, BANK
  - Auto-save is now hardcoded in the application
*/

-- Drop tables we no longer need
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS manager_tags CASCADE;
DROP TABLE IF EXISTS current_order_metadata CASCADE;

-- Update items table
DO $$
BEGIN
  -- Remove category column
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'items' AND column_name = 'category'
  ) THEN
    ALTER TABLE items DROP COLUMN category;
  END IF;

  -- Remove tags column
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'items' AND column_name = 'tags'
  ) THEN
    ALTER TABLE items DROP COLUMN tags;
  END IF;

  -- Remove variant_tags column
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'items' AND column_name = 'variant_tags'
  ) THEN
    ALTER TABLE items DROP COLUMN variant_tags;
  END IF;

  -- Rename unit_tag to measure_unit
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'items' AND column_name = 'unit_tag'
  ) THEN
    ALTER TABLE items RENAME COLUMN unit_tag TO measure_unit;
  END IF;
END $$;

-- Update suppliers table
DO $$
BEGIN
  -- Remove categories column
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'suppliers' AND column_name = 'categories'
  ) THEN
    ALTER TABLE suppliers DROP COLUMN categories;
  END IF;

  -- Remove order_type column
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'suppliers' AND column_name = 'order_type'
  ) THEN
    ALTER TABLE suppliers DROP COLUMN order_type;
  END IF;

  -- Remove payment_method column
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'suppliers' AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE suppliers DROP COLUMN payment_method;
  END IF;

  -- Remove default_order_type column
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'suppliers' AND column_name = 'default_order_type'
  ) THEN
    ALTER TABLE suppliers DROP COLUMN default_order_type;
  END IF;

  -- Update default_payment_method default value
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'suppliers' AND column_name = 'default_payment_method'
  ) THEN
    ALTER TABLE suppliers ALTER COLUMN default_payment_method SET DEFAULT 'CASH ON DELIVERY';
  END IF;
END $$;

-- Update pending_orders table
DO $$
BEGIN
  -- Remove order_type column
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pending_orders' AND column_name = 'order_type'
  ) THEN
    ALTER TABLE pending_orders DROP COLUMN order_type;
  END IF;

  -- Update payment_method default value
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pending_orders' AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE pending_orders ALTER COLUMN payment_method SET DEFAULT 'CASH ON DELIVERY';
  END IF;
END $$;

-- Update completed_orders table
DO $$
BEGIN
  -- Remove order_type column
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'completed_orders' AND column_name = 'order_type'
  ) THEN
    ALTER TABLE completed_orders DROP COLUMN order_type;
  END IF;
END $$;

-- Update current_order table
DO $$
BEGIN
  -- Remove order_type column
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'current_order' AND column_name = 'order_type'
  ) THEN
    ALTER TABLE current_order DROP COLUMN order_type;
  END IF;

  -- Remove manager column
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'current_order' AND column_name = 'manager'
  ) THEN
    ALTER TABLE current_order DROP COLUMN manager;
  END IF;
END $$;