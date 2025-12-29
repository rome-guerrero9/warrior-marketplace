-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PROFILES POLICIES
-- =====================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Anyone can view public profile info (for vendor pages)
CREATE POLICY "Public profiles viewable"
ON profiles FOR SELECT
USING (role = 'vendor');

-- =====================================================
-- PRODUCTS POLICIES
-- =====================================================

-- Anyone can view active products
CREATE POLICY "Active products are viewable by anyone"
ON products FOR SELECT
USING (status = 'active');

-- Vendors can view their own products (all statuses)
CREATE POLICY "Vendors can view own products"
ON products FOR SELECT
USING (auth.uid() = vendor_id);

-- Vendors can create products
CREATE POLICY "Vendors can create products"
ON products FOR INSERT
WITH CHECK (auth.uid() = vendor_id);

-- Vendors can update their own products
CREATE POLICY "Vendors can update own products"
ON products FOR UPDATE
USING (auth.uid() = vendor_id);

-- Vendors can delete their own products
CREATE POLICY "Vendors can delete own products"
ON products FOR DELETE
USING (auth.uid() = vendor_id);

-- Admins can do everything with products
CREATE POLICY "Admins can manage all products"
ON products FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- =====================================================
-- ORDERS POLICIES
-- =====================================================

-- Customers can view their own orders
CREATE POLICY "Customers can view own orders"
ON orders FOR SELECT
USING (
    auth.uid() = customer_id
    OR customer_email = (SELECT email FROM profiles WHERE id = auth.uid())
);

-- Vendors can view orders containing their products
CREATE POLICY "Vendors can view orders for their products"
ON orders FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM order_items oi
        JOIN products p ON p.id = oi.product_id
        WHERE oi.order_id = orders.id AND p.vendor_id = auth.uid()
    )
);

-- Service role (backend) can create orders
CREATE POLICY "Service role can create orders"
ON orders FOR INSERT
WITH CHECK (true);

-- Service role can update orders
CREATE POLICY "Service role can update orders"
ON orders FOR UPDATE
USING (true);

-- =====================================================
-- ORDER_ITEMS POLICIES
-- =====================================================

-- Customers can view items in their own orders
CREATE POLICY "Customers can view own order items"
ON order_items FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM orders
        WHERE orders.id = order_items.order_id
        AND (orders.customer_id = auth.uid() OR orders.customer_email = (SELECT email FROM profiles WHERE id = auth.uid()))
    )
);

-- Vendors can view items for their products
CREATE POLICY "Vendors can view order items for their products"
ON order_items FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM products
        WHERE products.id = order_items.product_id AND products.vendor_id = auth.uid()
    )
);

-- Service role can insert order items
CREATE POLICY "Service role can insert order items"
ON order_items FOR INSERT
WITH CHECK (true);

-- =====================================================
-- DOWNLOADS POLICIES
-- =====================================================

-- Customers can view download links for their orders
CREATE POLICY "Customers can view own downloads"
ON downloads FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM orders
        WHERE orders.id = downloads.order_id
        AND (orders.customer_id = auth.uid() OR orders.customer_email = (SELECT email FROM profiles WHERE id = auth.uid()))
    )
);

-- Service role can manage downloads
CREATE POLICY "Service role can manage downloads"
ON downloads FOR ALL
USING (true);

-- =====================================================
-- REVIEWS POLICIES
-- =====================================================

-- Anyone can view reviews
CREATE POLICY "Anyone can view reviews"
ON reviews FOR SELECT
USING (true);

-- Authenticated users can create reviews
CREATE POLICY "Authenticated users can create reviews"
ON reviews FOR INSERT
WITH CHECK (auth.uid() = customer_id);

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews"
ON reviews FOR UPDATE
USING (auth.uid() = customer_id);

-- Users can delete their own reviews
CREATE POLICY "Users can delete own reviews"
ON reviews FOR DELETE
USING (auth.uid() = customer_id);

-- =====================================================
-- CARTS POLICIES
-- =====================================================

-- Users can view their own cart
CREATE POLICY "Users can view own cart"
ON carts FOR SELECT
USING (auth.uid() = customer_id);

-- Users can create their own cart
CREATE POLICY "Users can create own cart"
ON carts FOR INSERT
WITH CHECK (auth.uid() = customer_id);

-- Users can update their own cart
CREATE POLICY "Users can update own cart"
ON carts FOR UPDATE
USING (auth.uid() = customer_id);

-- Users can delete their own cart
CREATE POLICY "Users can delete own cart"
ON carts FOR DELETE
USING (auth.uid() = customer_id);

-- Service role can manage carts for abandoned cart recovery
CREATE POLICY "Service role can manage carts"
ON carts FOR ALL
USING (true);
