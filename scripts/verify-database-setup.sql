-- =====================================================
-- DATABASE VERIFICATION SCRIPT
-- Run this to check what's already set up
-- =====================================================

-- 1. Check which tables exist
SELECT
    schemaname,
    tablename,
    rowsecurity as "RLS Enabled"
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. Check products count
SELECT
    'products' as table_name,
    COUNT(*) as row_count,
    STRING_AGG(name, ', ' ORDER BY name) as product_names
FROM products;

-- 3. Check RLS policies
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 4. Check functions
SELECT
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
    'generate_order_number',
    'search_products',
    'get_product_recommendations',
    'can_review_product',
    'get_top_selling_products',
    'get_revenue_analytics',
    'mark_abandoned_carts'
)
ORDER BY routine_name;

-- 5. Summary
SELECT
    'Setup Status' as check_type,
    CASE
        WHEN COUNT(*) >= 7 THEN '✅ All tables created'
        ELSE '⚠️ Missing tables: ' || (7 - COUNT(*))::TEXT
    END as status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'products', 'orders', 'order_items', 'downloads', 'reviews', 'carts');
