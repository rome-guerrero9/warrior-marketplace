-- =====================================================
-- SIMPLIFIED RLS SETUP - Execute one section at a time
-- =====================================================

-- STEP 1: Enable RLS on all tables (run this first)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;

-- STEP 2: Products policies (most important for marketplace)
-- Anyone can view active products
CREATE POLICY "products_select_active" ON products FOR SELECT USING (status = 'active');

-- STEP 3: Orders policies (for checkout)
-- Service role can create orders (allows your API to create orders)
CREATE POLICY "orders_insert_service" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "orders_update_service" ON orders FOR UPDATE USING (true);

-- STEP 4: Order items policies
-- Service role can insert order items
CREATE POLICY "order_items_insert_service" ON order_items FOR INSERT WITH CHECK (true);

-- STEP 5: Downloads policies
-- Service role can manage downloads
CREATE POLICY "downloads_all_service" ON downloads FOR ALL USING (true);

-- STEP 6: Reviews policies (public visibility)
-- Anyone can view reviews
CREATE POLICY "reviews_select_all" ON reviews FOR SELECT USING (true);

-- STEP 7: Carts policies
-- Service role can manage carts
CREATE POLICY "carts_all_service" ON carts FOR ALL USING (true);

-- =====================================================
-- That's the minimum needed for marketplace to function!
-- =====================================================
