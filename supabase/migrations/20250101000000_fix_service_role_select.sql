-- =====================================================
-- FIX: Add SELECT policy for service role on orders
-- =====================================================
-- This allows the webhook endpoint to fetch orders after
-- updating them for fulfillment processing

CREATE POLICY "Service role can select orders"
ON orders FOR SELECT
USING (true);
