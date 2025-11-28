-- =============================================================================
-- What's On Feature - Performance Indexes
-- =============================================================================
-- Execute this file to create performance indexes
-- Total Indexes: 25+
-- =============================================================================

-- =============================================================================
-- TABLE: whatson_events
-- =============================================================================

-- Index 1: Filter by creator
CREATE INDEX IF NOT EXISTS idx_whatson_events_created_by 
ON whatson_events(created_by);

COMMENT ON INDEX idx_whatson_events_created_by IS 
'Optimize queries for user''s created events';

-- Index 2: Filter by status
CREATE INDEX IF NOT EXISTS idx_whatson_events_status 
ON whatson_events(status);

COMMENT ON INDEX idx_whatson_events_status IS 
'Optimize filtering by event status';

-- Index 3: Filter by published status and created date
CREATE INDEX IF NOT EXISTS idx_whatson_events_status_created 
ON whatson_events(status, created_at DESC);

COMMENT ON INDEX idx_whatson_events_status_created IS 
'Optimize browse page sorting by date';

-- Index 4: Lookup by slug (already unique, but explicit index)
CREATE INDEX IF NOT EXISTS idx_whatson_events_slug 
ON whatson_events(slug);

COMMENT ON INDEX idx_whatson_events_slug IS 
'Optimize event detail page lookups by slug';

-- Index 5: Filter by location
CREATE INDEX IF NOT EXISTS idx_whatson_events_location 
ON whatson_events(location);

COMMENT ON INDEX idx_whatson_events_location IS 
'Optimize location-based filtering';

-- Index 6: Filter by online/in-person
CREATE INDEX IF NOT EXISTS idx_whatson_events_is_online 
ON whatson_events(is_online);

COMMENT ON INDEX idx_whatson_events_is_online IS 
'Optimize filtering by attendance mode';

-- Index 7: Filter by paid/free
CREATE INDEX IF NOT EXISTS idx_whatson_events_is_paid 
ON whatson_events(is_paid);

COMMENT ON INDEX idx_whatson_events_is_paid IS 
'Optimize filtering by price type';

-- Index 8: Filter by RSVP deadline (for upcoming/expired)
CREATE INDEX IF NOT EXISTS idx_whatson_events_rsvp_deadline 
ON whatson_events(rsvp_deadline);

COMMENT ON INDEX idx_whatson_events_rsvp_deadline IS 
'Optimize filtering by RSVP deadline';

-- Index 9: Composite index for common browse query
CREATE INDEX IF NOT EXISTS idx_whatson_events_browse 
ON whatson_events(status, is_paid, is_online, created_at DESC)
WHERE status = 'published';

COMMENT ON INDEX idx_whatson_events_browse IS 
'Optimize common browse page queries with multiple filters';

-- Index 10: Full-text search on title and description
CREATE INDEX IF NOT EXISTS idx_whatson_events_search 
ON whatson_events USING GIN(to_tsvector('english', title || ' ' || description));

COMMENT ON INDEX idx_whatson_events_search IS 
'Enable full-text search on title and description';

-- =============================================================================
-- TABLE: whatson_schedule
-- =============================================================================

-- Index 11: Join with events
CREATE INDEX IF NOT EXISTS idx_whatson_schedule_event_id 
ON whatson_schedule(event_id);

COMMENT ON INDEX idx_whatson_schedule_event_id IS 
'Optimize joining schedules with events';

-- Index 12: Sort by display order
CREATE INDEX IF NOT EXISTS idx_whatson_schedule_event_sort 
ON whatson_schedule(event_id, sort_order);

COMMENT ON INDEX idx_whatson_schedule_event_sort IS 
'Optimize sorting schedule slots';

-- Index 13: Filter by date range
CREATE INDEX IF NOT EXISTS idx_whatson_schedule_date 
ON whatson_schedule(event_date);

COMMENT ON INDEX idx_whatson_schedule_date IS 
'Optimize date-based filtering';

-- Index 14: Composite for event date queries
CREATE INDEX IF NOT EXISTS idx_whatson_schedule_event_date 
ON whatson_schedule(event_id, event_date);

COMMENT ON INDEX idx_whatson_schedule_event_date IS 
'Optimize queries for specific event dates';

-- =============================================================================
-- TABLE: whatson_tags
-- =============================================================================

-- Index 15: Join with events
CREATE INDEX IF NOT EXISTS idx_whatson_tags_event_id 
ON whatson_tags(event_id);

COMMENT ON INDEX idx_whatson_tags_event_id IS 
'Optimize joining tags with events';

-- Index 16: Filter by tag name
CREATE INDEX IF NOT EXISTS idx_whatson_tags_name 
ON whatson_tags(tag_name);

COMMENT ON INDEX idx_whatson_tags_name IS 
'Optimize filtering events by tag';

-- Index 17: Case-insensitive tag search
CREATE INDEX IF NOT EXISTS idx_whatson_tags_name_lower 
ON whatson_tags(LOWER(tag_name));

COMMENT ON INDEX idx_whatson_tags_name_lower IS 
'Optimize case-insensitive tag searches';

-- =============================================================================
-- TABLE: whatson_rsvps
-- =============================================================================

-- Index 18: Join with events
CREATE INDEX IF NOT EXISTS idx_whatson_rsvps_event_id 
ON whatson_rsvps(event_id);

COMMENT ON INDEX idx_whatson_rsvps_event_id IS 
'Optimize joining RSVPs with events';

-- Index 19: User's RSVPs
CREATE INDEX IF NOT EXISTS idx_whatson_rsvps_user_id 
ON whatson_rsvps(user_id);

COMMENT ON INDEX idx_whatson_rsvps_user_id IS 
'Optimize queries for user RSVPs';

-- Index 20: Filter by RSVP status
CREATE INDEX IF NOT EXISTS idx_whatson_rsvps_status 
ON whatson_rsvps(status);

COMMENT ON INDEX idx_whatson_rsvps_status IS 
'Optimize filtering by RSVP status';

-- Index 21: Filter by payment status
CREATE INDEX IF NOT EXISTS idx_whatson_rsvps_payment_status 
ON whatson_rsvps(payment_status);

COMMENT ON INDEX idx_whatson_rsvps_payment_status IS 
'Optimize filtering by payment status';

-- Index 22: Composite for event RSVP management
CREATE INDEX IF NOT EXISTS idx_whatson_rsvps_event_status 
ON whatson_rsvps(event_id, status, created_at DESC);

COMMENT ON INDEX idx_whatson_rsvps_event_status IS 
'Optimize event RSVP list queries with sorting';

-- Index 23: Ticket number lookup
CREATE INDEX IF NOT EXISTS idx_whatson_rsvps_ticket_number 
ON whatson_rsvps(ticket_number);

COMMENT ON INDEX idx_whatson_rsvps_ticket_number IS 
'Optimize ticket number lookups';

-- Index 24: Reference number lookup
CREATE INDEX IF NOT EXISTS idx_whatson_rsvps_reference_number 
ON whatson_rsvps(reference_number);

COMMENT ON INDEX idx_whatson_rsvps_reference_number IS 
'Optimize reference number lookups';

-- =============================================================================
-- TABLE: whatson_rsvp_dates
-- =============================================================================

-- Index 25: Join with RSVPs
CREATE INDEX IF NOT EXISTS idx_whatson_rsvp_dates_rsvp_id 
ON whatson_rsvp_dates(rsvp_id);

COMMENT ON INDEX idx_whatson_rsvp_dates_rsvp_id IS 
'Optimize joining RSVP dates with RSVPs';

-- Index 26: Join with schedule
CREATE INDEX IF NOT EXISTS idx_whatson_rsvp_dates_schedule_id 
ON whatson_rsvp_dates(schedule_id);

COMMENT ON INDEX idx_whatson_rsvp_dates_schedule_id IS 
'Optimize queries for which dates were selected';

-- =============================================================================
-- Composite Indexes for Complex Queries
-- =============================================================================

-- Index 27: User's active RSVPs with event info
CREATE INDEX IF NOT EXISTS idx_whatson_rsvps_user_active 
ON whatson_rsvps(user_id, status, created_at DESC)
WHERE status = 'confirmed';

COMMENT ON INDEX idx_whatson_rsvps_user_active IS 
'Optimize user''s active RSVPs list';

-- =============================================================================
-- Verification Queries
-- =============================================================================

-- List all indexes
-- SELECT 
--     schemaname,
--     tablename,
--     indexname,
--     indexdef
-- FROM pg_indexes
-- WHERE tablename LIKE 'whatson_%'
-- ORDER BY tablename, indexname;

-- Check index usage statistics
-- SELECT 
--     schemaname,
--     tablename,
--     indexname,
--     idx_scan as times_used,
--     idx_tup_read as tuples_read,
--     idx_tup_fetch as tuples_fetched
-- FROM pg_stat_user_indexes
-- WHERE tablename LIKE 'whatson_%'
-- ORDER BY tablename, indexname;
