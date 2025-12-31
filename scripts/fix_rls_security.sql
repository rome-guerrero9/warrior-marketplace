-- =====================================================
-- FIX RLS SECURITY ISSUES - Agent Alpha-1 Correction
-- =====================================================

-- Issue 1: Enable RLS on products table
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Issue 2-5: Fix function security (make them SECURITY DEFINER with proper roles)

-- Fix generate_order_number function
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_order_number TEXT;
    counter INT;
BEGIN
    -- Generate order number: ORD-YYYYMMDD-XXXX
    SELECT COUNT(*) INTO counter
    FROM orders
    WHERE DATE(created_at) = CURRENT_DATE;

    new_order_number := 'ORD-' ||
                       TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' ||
                       LPAD((counter + 1)::TEXT, 4, '0');

    RETURN new_order_number;
END;
$$;

-- Fix search_products function
CREATE OR REPLACE FUNCTION public.search_products(search_query TEXT)
RETURNS SETOF products
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM products
    WHERE
        status = 'active'
        AND (
            name ILIKE '%' || search_query || '%'
            OR description ILIKE '%' || search_query || '%'
            OR category ILIKE '%' || search_query || '%'
        )
    ORDER BY is_featured DESC, created_at DESC;
END;
$$;

-- Fix update_product_rating function
CREATE OR REPLACE FUNCTION public.update_product_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Recalculate product rating when review is added/updated/deleted
    UPDATE products
    SET
        rating_avg = (
            SELECT COALESCE(AVG(rating), 0)
            FROM reviews
            WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
        ),
        rating_count = (
            SELECT COUNT(*)
            FROM reviews
            WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
        )
    WHERE id = COALESCE(NEW.product_id, OLD.product_id);

    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.generate_order_number() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.search_products(TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.update_product_rating() TO service_role;
GRANT EXECUTE ON FUNCTION public.update_updated_at_column() TO service_role;

-- Verify RLS is enabled on all tables
DO $$
BEGIN
    -- Enable RLS on all tables if not already enabled
    ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;
    ALTER TABLE IF EXISTS public.orders ENABLE ROW LEVEL SECURITY;
    ALTER TABLE IF EXISTS public.order_items ENABLE ROW LEVEL SECURITY;
    ALTER TABLE IF EXISTS public.downloads ENABLE ROW LEVEL SECURITY;
    ALTER TABLE IF EXISTS public.reviews ENABLE ROW LEVEL SECURITY;
    ALTER TABLE IF EXISTS public.carts ENABLE ROW LEVEL SECURITY;
END $$;

-- Show confirmation
SELECT
    schemaname,
    tablename,
    rowsecurity AS "RLS Enabled"
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'products', 'orders', 'order_items', 'downloads', 'reviews', 'carts')
ORDER BY tablename;
