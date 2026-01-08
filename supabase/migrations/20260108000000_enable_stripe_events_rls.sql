-- Enable Row Level Security on stripe_events table
-- This prevents unauthorized access via Supabase REST API

ALTER TABLE stripe_events ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can insert (API routes only)
-- This ensures webhooks can only be recorded by our backend
CREATE POLICY "Service role can insert stripe events"
ON stripe_events
FOR INSERT
TO service_role
USING (true);

-- Policy: Only service role can read (API routes only)
-- Prevents unauthorized access to webhook event history
CREATE POLICY "Service role can read stripe events"
ON stripe_events
FOR SELECT
TO service_role
USING (true);

-- Policy: Admins can read for debugging (optional)
-- Allows admin users to view webhook history for troubleshooting
CREATE POLICY "Admins can read stripe events"
ON stripe_events
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Update table comment
COMMENT ON TABLE stripe_events IS 'Webhook event deduplication table - RLS enabled, service role and admin access only';
