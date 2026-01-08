-- Create stripe_events table for webhook deduplication
-- This prevents processing the same Stripe webhook event multiple times

CREATE TABLE IF NOT EXISTS stripe_events (
  event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups by event type
CREATE INDEX idx_stripe_events_event_type ON stripe_events(event_type);

-- Index for faster lookups by order_id
CREATE INDEX idx_stripe_events_order_id ON stripe_events(order_id);

-- Index for cleanup queries (find old events)
CREATE INDEX idx_stripe_events_processed_at ON stripe_events(processed_at);

-- Add comment for documentation
COMMENT ON TABLE stripe_events IS 'Tracks processed Stripe webhook events to prevent duplicate processing';
COMMENT ON COLUMN stripe_events.event_id IS 'Unique Stripe event ID (evt_...)';
COMMENT ON COLUMN stripe_events.event_type IS 'Stripe event type (e.g., checkout.session.completed)';
COMMENT ON COLUMN stripe_events.processed_at IS 'When this event was successfully processed';
COMMENT ON COLUMN stripe_events.order_id IS 'Associated order ID if applicable';
COMMENT ON COLUMN stripe_events.metadata IS 'Additional event metadata for debugging';
