-- =============================================================================
-- What's On Feature - Table Creation SQL
-- =============================================================================
-- Execute this file to create all tables for the What's On events feature
-- Tables: 5 total
--   1. whatson_events (main events table)
--   2. whatson_schedule (event date/time slots)
--   3. whatson_tags (event tags)
--   4. whatson_rsvps (user RSVPs)
--   5. whatson_rsvp_dates (RSVP date selections)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. whatson_events (Main Events Table)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS whatson_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Event Creator
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Basic Information
    title TEXT NOT NULL CHECK (char_length(title) >= 3 AND char_length(title) <= 200),
    slug TEXT NOT NULL UNIQUE,
    location TEXT,
    is_online BOOLEAN DEFAULT false,
    
    -- Pricing
    is_paid BOOLEAN DEFAULT false,
    price_amount INTEGER DEFAULT 0 CHECK (price_amount >= 0),
    price_currency TEXT DEFAULT 'AED',
    
    -- RSVP & Capacity
    rsvp_deadline TIMESTAMPTZ,
    max_spots_per_person INTEGER DEFAULT 1 CHECK (max_spots_per_person >= 1),
    total_spots INTEGER CHECK (total_spots IS NULL OR total_spots >= 1),
    is_unlimited_spots BOOLEAN DEFAULT false,
    
    -- Content
    description TEXT NOT NULL CHECK (char_length(description) <= 10000),
    terms_conditions TEXT,
    
    -- Images
    thumbnail_url TEXT,
    hero_image_url TEXT,
    
    -- Status & Metadata
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'cancelled')),
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Constraints
    CONSTRAINT valid_location CHECK (
        (is_online = true) OR 
        (is_online = false AND location IS NOT NULL AND char_length(location) > 0)
    ),
    CONSTRAINT valid_capacity CHECK (
        (is_unlimited_spots = true) OR 
        (is_unlimited_spots = false AND total_spots IS NOT NULL)
    )
);

COMMENT ON TABLE whatson_events IS 'Main table for What''s On events';
COMMENT ON COLUMN whatson_events.slug IS 'URL-friendly unique identifier';
COMMENT ON COLUMN whatson_events.is_online IS 'True if event is online, false if in-person';
COMMENT ON COLUMN whatson_events.rsvp_deadline IS 'Last date/time to RSVP';
COMMENT ON COLUMN whatson_events.max_spots_per_person IS 'Maximum spots one user can book';
COMMENT ON COLUMN whatson_events.total_spots IS 'Total capacity (NULL if unlimited)';
COMMENT ON COLUMN whatson_events.status IS 'draft, published, or cancelled';

-- -----------------------------------------------------------------------------
-- 2. whatson_schedule (Event Date/Time Slots)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS whatson_schedule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES whatson_events(id) ON DELETE CASCADE,
    
    -- Date & Time
    event_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    timezone TEXT NOT NULL DEFAULT 'GST',
    
    -- Display Order
    sort_order INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Constraints
    CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

COMMENT ON TABLE whatson_schedule IS 'Event date and time slots (multiple per event)';
COMMENT ON COLUMN whatson_schedule.timezone IS 'Timezone code (e.g., GST, IST, UTC)';
COMMENT ON COLUMN whatson_schedule.sort_order IS 'Display order for multiple slots';

-- -----------------------------------------------------------------------------
-- 3. whatson_tags (Event Tags)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS whatson_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES whatson_events(id) ON DELETE CASCADE,
    tag_name TEXT NOT NULL CHECK (char_length(tag_name) >= 1 AND char_length(tag_name) <= 50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Constraints
    CONSTRAINT unique_event_tag UNIQUE (event_id, tag_name)
);

COMMENT ON TABLE whatson_tags IS 'Tags for categorizing events';
COMMENT ON CONSTRAINT unique_event_tag ON whatson_tags IS 'Prevent duplicate tags per event';

-- -----------------------------------------------------------------------------
-- 4. whatson_rsvps (User RSVPs)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS whatson_rsvps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- References
    event_id UUID NOT NULL REFERENCES whatson_events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Booking Details
    ticket_number TEXT NOT NULL UNIQUE,
    reference_number TEXT NOT NULL UNIQUE,
    number_of_spots INTEGER NOT NULL DEFAULT 1 CHECK (number_of_spots >= 1),
    
    -- Payment
    payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('paid', 'unpaid', 'n/a')),
    
    -- Status
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'waitlist')),
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Constraints
    CONSTRAINT unique_user_event_rsvp UNIQUE (event_id, user_id)
);

COMMENT ON TABLE whatson_rsvps IS 'User RSVPs to events';
COMMENT ON COLUMN whatson_rsvps.ticket_number IS 'Unique ticket identifier (e.g., WO-2025-001234)';
COMMENT ON COLUMN whatson_rsvps.reference_number IS 'Booking reference (e.g., #1234567890ABC)';
COMMENT ON COLUMN whatson_rsvps.number_of_spots IS 'Number of spots booked by this user';
COMMENT ON CONSTRAINT unique_user_event_rsvp ON whatson_rsvps IS 'One RSVP per user per event';

-- -----------------------------------------------------------------------------
-- 5. whatson_rsvp_dates (RSVP Date Selections)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS whatson_rsvp_dates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rsvp_id UUID NOT NULL REFERENCES whatson_rsvps(id) ON DELETE CASCADE,
    schedule_id UUID NOT NULL REFERENCES whatson_schedule(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Constraints
    CONSTRAINT unique_rsvp_schedule UNIQUE (rsvp_id, schedule_id)
);

COMMENT ON TABLE whatson_rsvp_dates IS 'Tracks which dates an attendee selected for their RSVP';
COMMENT ON CONSTRAINT unique_rsvp_schedule ON whatson_rsvp_dates IS 'Prevent duplicate date selections';

-- -----------------------------------------------------------------------------
-- Automatic Timestamp Update Trigger
-- -----------------------------------------------------------------------------

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_whatson_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to whatson_events
CREATE TRIGGER whatson_events_updated_at
    BEFORE UPDATE ON whatson_events
    FOR EACH ROW
    EXECUTE FUNCTION update_whatson_updated_at();

-- Apply trigger to whatson_rsvps
CREATE TRIGGER whatson_rsvps_updated_at
    BEFORE UPDATE ON whatson_rsvps
    FOR EACH ROW
    EXECUTE FUNCTION update_whatson_updated_at();

COMMENT ON FUNCTION update_whatson_updated_at() IS 'Auto-update updated_at timestamp on record changes';

-- -----------------------------------------------------------------------------
-- Helper Functions
-- -----------------------------------------------------------------------------

-- Function to generate ticket number
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TEXT AS $$
DECLARE
    ticket_num TEXT;
    counter INTEGER;
BEGIN
    -- Generate unique ticket number: WO-YYYY-NNNNNN
    counter := (SELECT COUNT(*) FROM whatson_rsvps) + 1;
    ticket_num := 'WO-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(counter::TEXT, 6, '0');
    
    -- Ensure uniqueness
    WHILE EXISTS (SELECT 1 FROM whatson_rsvps WHERE ticket_number = ticket_num) LOOP
        counter := counter + 1;
        ticket_num := 'WO-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(counter::TEXT, 6, '0');
    END LOOP;
    
    RETURN ticket_num;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_ticket_number() IS 'Generate unique ticket number (WO-YYYY-NNNNNN)';

-- Function to generate reference number
CREATE OR REPLACE FUNCTION generate_reference_number()
RETURNS TEXT AS $$
DECLARE
    ref_num TEXT;
BEGIN
    -- Generate unique reference: #RANDOMALPHANUMERIC
    ref_num := '#' || UPPER(substring(md5(random()::text || clock_timestamp()::text) from 1 for 13));
    
    -- Ensure uniqueness
    WHILE EXISTS (SELECT 1 FROM whatson_rsvps WHERE reference_number = ref_num) LOOP
        ref_num := '#' || UPPER(substring(md5(random()::text || clock_timestamp()::text) from 1 for 13));
    END LOOP;
    
    RETURN ref_num;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_reference_number() IS 'Generate unique reference number (#ALPHANUMERIC13)';

-- -----------------------------------------------------------------------------
-- Verification Queries
-- -----------------------------------------------------------------------------

-- Verify all tables were created
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' AND table_name LIKE 'whatson_%'
-- ORDER BY table_name;

-- Verify constraints
-- SELECT con.conname AS constraint_name, con.contype AS constraint_type, rel.relname AS table_name
-- FROM pg_constraint con
-- JOIN pg_class rel ON con.conrelid = rel.oid
-- WHERE rel.relname LIKE 'whatson_%'
-- ORDER BY rel.relname, con.conname;
