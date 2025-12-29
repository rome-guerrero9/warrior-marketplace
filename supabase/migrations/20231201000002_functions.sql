-- =====================================================
-- DATABASE FUNCTIONS
-- =====================================================

-- Function to generate unique order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    new_order_number TEXT;
    counter INTEGER := 0;
BEGIN
    LOOP
        new_order_number := 'ORD-' ||
            UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8)) || '-' ||
            TO_CHAR(NOW(), 'YYYYMMDD');

        EXIT WHEN NOT EXISTS (SELECT 1 FROM orders WHERE order_number = new_order_number);

        counter := counter + 1;
        IF counter > 100 THEN
            RAISE EXCEPTION 'Could not generate unique order number after 100 attempts';
        END IF;
    END LOOP;

    RETURN new_order_number;
END;
$$ LANGUAGE plpgsql;

-- Function to search products (full-text search)
CREATE OR REPLACE FUNCTION search_products(search_query TEXT, max_results INTEGER DEFAULT 20)
RETURNS SETOF products AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM products
    WHERE status = 'active'
    AND to_tsvector('english', name || ' ' || description) @@ plainto_tsquery('english', search_query)
    ORDER BY ts_rank(to_tsvector('english', name || ' ' || description), plainto_tsquery('english', search_query)) DESC
    LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- Function to get product recommendations (based on category and rating)
CREATE OR REPLACE FUNCTION get_product_recommendations(
    product_uuid UUID,
    max_results INTEGER DEFAULT 4
)
RETURNS SETOF products AS $$
DECLARE
    product_category TEXT;
BEGIN
    -- Get the category of the input product
    SELECT category INTO product_category FROM products WHERE id = product_uuid;

    -- Return similar products from same category, sorted by rating
    RETURN QUERY
    SELECT *
    FROM products
    WHERE status = 'active'
    AND category = product_category
    AND id != product_uuid
    ORDER BY rating_avg DESC, rating_count DESC
    LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user can review product (must have purchased)
CREATE OR REPLACE FUNCTION can_review_product(
    user_id UUID,
    product_uuid UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM orders o
        JOIN order_items oi ON oi.order_id = o.id
        WHERE o.customer_id = user_id
        AND oi.product_id = product_uuid
        AND o.status = 'paid'
    );
END;
$$ LANGUAGE plpgsql;

-- Function to get top selling products
CREATE OR REPLACE FUNCTION get_top_selling_products(
    days_back INTEGER DEFAULT 30,
    max_results INTEGER DEFAULT 10
)
RETURNS TABLE (
    product_id UUID,
    product_name TEXT,
    total_sales BIGINT,
    total_revenue BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        oi.product_id,
        p.name,
        SUM(oi.quantity) as total_sales,
        SUM(oi.price_cents * oi.quantity) as total_revenue
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    JOIN products p ON p.id = oi.product_id
    WHERE o.status = 'paid'
    AND o.created_at >= NOW() - (days_back || ' days')::INTERVAL
    GROUP BY oi.product_id, p.name
    ORDER BY total_sales DESC
    LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- Function to get revenue analytics
CREATE OR REPLACE FUNCTION get_revenue_analytics(
    start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
    end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
    total_orders BIGINT,
    total_revenue BIGINT,
    avg_order_value NUMERIC,
    unique_customers BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(DISTINCT o.id) as total_orders,
        COALESCE(SUM(o.total_cents), 0) as total_revenue,
        COALESCE(AVG(o.total_cents), 0) as avg_order_value,
        COUNT(DISTINCT o.customer_id) as unique_customers
    FROM orders o
    WHERE o.status = 'paid'
    AND o.created_at BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql;

-- Function to mark cart as abandoned
CREATE OR REPLACE FUNCTION mark_abandoned_carts()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE carts
    SET abandoned_at = NOW()
    WHERE abandoned_at IS NULL
    AND updated_at < NOW() - INTERVAL '2 hours'
    AND jsonb_array_length(items) > 0;

    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;
