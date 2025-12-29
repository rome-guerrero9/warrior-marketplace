-- =====================================================
-- FIX RLS POLICY FOR PRODUCTS TABLE
-- Allow public (anonymous) access to active products
-- =====================================================

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "products_select_active" ON products;

-- Create policy that explicitly allows PUBLIC role
CREATE POLICY "products_select_active"
ON products
FOR SELECT
TO public  -- This is key! Explicitly allow public/anonymous access
USING (status = 'active');

-- Verify RLS is enabled
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Show all policies on products table
SELECT tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'products';
