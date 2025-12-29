-- =====================================================
-- SIMPLIFIED FUNCTIONS - Just the essentials
-- =====================================================

-- Function 1: Generate unique order numbers (ESSENTIAL)
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    new_order_number TEXT;
BEGIN
    new_order_number := 'ORD-' ||
        UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8)) || '-' ||
        TO_CHAR(NOW(), 'YYYYMMDD');
    RETURN new_order_number;
END;
$$;

-- Function 2: Search products (NICE TO HAVE)
CREATE OR REPLACE FUNCTION search_products(search_query TEXT, max_results INTEGER DEFAULT 20)
RETURNS SETOF products
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM products
    WHERE status = 'active'
    AND (name ILIKE '%' || search_query || '%' OR description ILIKE '%' || search_query || '%')
    ORDER BY name
    LIMIT max_results;
END;
$$;

-- =====================================================
-- That's all you need for launch!
-- The other functions are analytics/optimization features
-- =====================================================
