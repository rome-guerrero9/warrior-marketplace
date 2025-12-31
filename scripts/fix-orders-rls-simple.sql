-- Add missing SELECT policy for service role on orders table
-- This fixes the webhook "Order not found" error

CREATE POLICY IF NOT EXISTS "Service role can select orders"
ON orders FOR SELECT
USING (true);
