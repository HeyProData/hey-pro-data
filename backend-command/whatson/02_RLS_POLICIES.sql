-- =============================================================================
-- What's On Feature - Row Level Security (RLS) Policies
-- =============================================================================
-- Execute this file to set up Row Level Security policies
-- Total Policies: 25
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Enable RLS on All Tables
-- -----------------------------------------------------------------------------

ALTER TABLE whatson_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatson_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatson_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatson_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatson_rsvp_dates ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- TABLE: whatson_events
-- =============================================================================

-- -----------------------------------------------------------------------------
-- SELECT Policies (Read Access)
-- -----------------------------------------------------------------------------

-- Policy 1: Public can view published events
CREATE POLICY "Public can view published events"
ON whatson_events FOR SELECT
USING (status = 'published');

COMMENT ON POLICY "Public can view published events" ON whatson_events IS 
'Allow anyone to view published events';

-- Policy 2: Users can view own events (all statuses)
CREATE POLICY "Users can view own events"
ON whatson_events FOR SELECT
USING (auth.uid() = created_by);

COMMENT ON POLICY "Users can view own events" ON whatson_events IS 
'Allow users to view their own events including drafts';

-- -----------------------------------------------------------------------------
-- INSERT Policies (Create Access)
-- -----------------------------------------------------------------------------

-- Policy 3: Authenticated users can create events
CREATE POLICY "Authenticated users can create events"
ON whatson_events FOR INSERT
WITH CHECK (auth.uid() = created_by);

COMMENT ON POLICY "Authenticated users can create events" ON whatson_events IS 
'Allow authenticated users to create events';

-- -----------------------------------------------------------------------------
-- UPDATE Policies (Edit Access)
-- -----------------------------------------------------------------------------

-- Policy 4: Users can update own events
CREATE POLICY "Users can update own events"
ON whatson_events FOR UPDATE
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

COMMENT ON POLICY "Users can update own events" ON whatson_events IS 
'Allow users to edit their own events';

-- -----------------------------------------------------------------------------
-- DELETE Policies (Delete Access)
-- -----------------------------------------------------------------------------

-- Policy 5: Users can delete own events
CREATE POLICY "Users can delete own events"
ON whatson_events FOR DELETE
USING (auth.uid() = created_by);

COMMENT ON POLICY "Users can delete own events" ON whatson_events IS 
'Allow users to delete their own events';

-- =============================================================================
-- TABLE: whatson_schedule
-- =============================================================================

-- -----------------------------------------------------------------------------
-- SELECT Policies
-- -----------------------------------------------------------------------------

-- Policy 6: Public can view schedule for published events
CREATE POLICY "Public can view published event schedules"
ON whatson_schedule FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM whatson_events
        WHERE whatson_events.id = whatson_schedule.event_id
        AND whatson_events.status = 'published'
    )
);

COMMENT ON POLICY "Public can view published event schedules" ON whatson_schedule IS 
'Allow viewing schedules for published events';

-- Policy 7: Users can view schedule for own events
CREATE POLICY "Users can view own event schedules"
ON whatson_schedule FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM whatson_events
        WHERE whatson_events.id = whatson_schedule.event_id
        AND whatson_events.created_by = auth.uid()
    )
);

COMMENT ON POLICY "Users can view own event schedules" ON whatson_schedule IS 
'Allow viewing schedules for own events';

-- -----------------------------------------------------------------------------
-- INSERT Policies
-- -----------------------------------------------------------------------------

-- Policy 8: Event creators can add schedules
CREATE POLICY "Event creators can add schedules"
ON whatson_schedule FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM whatson_events
        WHERE whatson_events.id = whatson_schedule.event_id
        AND whatson_events.created_by = auth.uid()
    )
);

COMMENT ON POLICY "Event creators can add schedules" ON whatson_schedule IS 
'Allow event creators to add schedule slots';

-- -----------------------------------------------------------------------------
-- UPDATE Policies
-- -----------------------------------------------------------------------------

-- Policy 9: Event creators can update schedules
CREATE POLICY "Event creators can update schedules"
ON whatson_schedule FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM whatson_events
        WHERE whatson_events.id = whatson_schedule.event_id
        AND whatson_events.created_by = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM whatson_events
        WHERE whatson_events.id = whatson_schedule.event_id
        AND whatson_events.created_by = auth.uid()
    )
);

COMMENT ON POLICY "Event creators can update schedules" ON whatson_schedule IS 
'Allow event creators to update schedule slots';

-- -----------------------------------------------------------------------------
-- DELETE Policies
-- -----------------------------------------------------------------------------

-- Policy 10: Event creators can delete schedules
CREATE POLICY "Event creators can delete schedules"
ON whatson_schedule FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM whatson_events
        WHERE whatson_events.id = whatson_schedule.event_id
        AND whatson_events.created_by = auth.uid()
    )
);

COMMENT ON POLICY "Event creators can delete schedules" ON whatson_schedule IS 
'Allow event creators to delete schedule slots';

-- =============================================================================
-- TABLE: whatson_tags
-- =============================================================================

-- -----------------------------------------------------------------------------
-- SELECT Policies
-- -----------------------------------------------------------------------------

-- Policy 11: Public can view tags for published events
CREATE POLICY "Public can view published event tags"
ON whatson_tags FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM whatson_events
        WHERE whatson_events.id = whatson_tags.event_id
        AND whatson_events.status = 'published'
    )
);

-- Policy 12: Users can view tags for own events
CREATE POLICY "Users can view own event tags"
ON whatson_tags FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM whatson_events
        WHERE whatson_events.id = whatson_tags.event_id
        AND whatson_events.created_by = auth.uid()
    )
);

-- -----------------------------------------------------------------------------
-- INSERT Policies
-- -----------------------------------------------------------------------------

-- Policy 13: Event creators can add tags
CREATE POLICY "Event creators can add tags"
ON whatson_tags FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM whatson_events
        WHERE whatson_events.id = whatson_tags.event_id
        AND whatson_events.created_by = auth.uid()
    )
);

-- -----------------------------------------------------------------------------
-- DELETE Policies
-- -----------------------------------------------------------------------------

-- Policy 14: Event creators can delete tags
CREATE POLICY "Event creators can delete tags"
ON whatson_tags FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM whatson_events
        WHERE whatson_events.id = whatson_tags.event_id
        AND whatson_events.created_by = auth.uid()
    )
);

-- =============================================================================
-- TABLE: whatson_rsvps
-- =============================================================================

-- -----------------------------------------------------------------------------
-- SELECT Policies
-- -----------------------------------------------------------------------------

-- Policy 15: Users can view own RSVPs
CREATE POLICY "Users can view own RSVPs"
ON whatson_rsvps FOR SELECT
USING (auth.uid() = user_id);

COMMENT ON POLICY "Users can view own RSVPs" ON whatson_rsvps IS 
'Allow users to view their RSVP records';

-- Policy 16: Event creators can view all RSVPs for their events
CREATE POLICY "Event creators can view event RSVPs"
ON whatson_rsvps FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM whatson_events
        WHERE whatson_events.id = whatson_rsvps.event_id
        AND whatson_events.created_by = auth.uid()
    )
);

COMMENT ON POLICY "Event creators can view event RSVPs" ON whatson_rsvps IS 
'Allow event creators to see all RSVPs for their events';

-- -----------------------------------------------------------------------------
-- INSERT Policies
-- -----------------------------------------------------------------------------

-- Policy 17: Users can create RSVPs (with validations)
CREATE POLICY "Users can create RSVPs"
ON whatson_rsvps FOR INSERT
WITH CHECK (
    -- User must be authenticated
    auth.uid() = user_id
    -- User cannot RSVP to own event
    AND NOT EXISTS (
        SELECT 1 FROM whatson_events
        WHERE whatson_events.id = whatson_rsvps.event_id
        AND whatson_events.created_by = auth.uid()
    )
    -- Event must be published
    AND EXISTS (
        SELECT 1 FROM whatson_events
        WHERE whatson_events.id = whatson_rsvps.event_id
        AND whatson_events.status = 'published'
    )
);

COMMENT ON POLICY "Users can create RSVPs" ON whatson_rsvps IS 
'Allow users to RSVP to published events (not their own)';

-- -----------------------------------------------------------------------------
-- UPDATE Policies
-- -----------------------------------------------------------------------------

-- Policy 18: Users can update own RSVPs
CREATE POLICY "Users can update own RSVPs"
ON whatson_rsvps FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

COMMENT ON POLICY "Users can update own RSVPs" ON whatson_rsvps IS 
'Allow users to modify their RSVP records';

-- Policy 19: Event creators can update RSVP payment status
CREATE POLICY "Event creators can update RSVP status"
ON whatson_rsvps FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM whatson_events
        WHERE whatson_events.id = whatson_rsvps.event_id
        AND whatson_events.created_by = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM whatson_events
        WHERE whatson_events.id = whatson_rsvps.event_id
        AND whatson_events.created_by = auth.uid()
    )
);

COMMENT ON POLICY "Event creators can update RSVP status" ON whatson_rsvps IS 
'Allow event creators to update payment status and RSVP status';

-- -----------------------------------------------------------------------------
-- DELETE Policies
-- -----------------------------------------------------------------------------

-- Policy 20: Users can cancel own RSVPs
CREATE POLICY "Users can cancel own RSVPs"
ON whatson_rsvps FOR DELETE
USING (auth.uid() = user_id);

COMMENT ON POLICY "Users can cancel own RSVPs" ON whatson_rsvps IS 
'Allow users to cancel their RSVPs';

-- =============================================================================
-- TABLE: whatson_rsvp_dates
-- =============================================================================

-- -----------------------------------------------------------------------------
-- SELECT Policies
-- -----------------------------------------------------------------------------

-- Policy 21: Users can view own RSVP date selections
CREATE POLICY "Users can view own RSVP dates"
ON whatson_rsvp_dates FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM whatson_rsvps
        WHERE whatson_rsvps.id = whatson_rsvp_dates.rsvp_id
        AND whatson_rsvps.user_id = auth.uid()
    )
);

-- Policy 22: Event creators can view RSVP dates for their events
CREATE POLICY "Event creators can view event RSVP dates"
ON whatson_rsvp_dates FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM whatson_rsvps
        JOIN whatson_events ON whatson_events.id = whatson_rsvps.event_id
        WHERE whatson_rsvps.id = whatson_rsvp_dates.rsvp_id
        AND whatson_events.created_by = auth.uid()
    )
);

-- -----------------------------------------------------------------------------
-- INSERT Policies
-- -----------------------------------------------------------------------------

-- Policy 23: Users can add dates to own RSVPs
CREATE POLICY "Users can add dates to own RSVPs"
ON whatson_rsvp_dates FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM whatson_rsvps
        WHERE whatson_rsvps.id = whatson_rsvp_dates.rsvp_id
        AND whatson_rsvps.user_id = auth.uid()
    )
);

-- -----------------------------------------------------------------------------
-- UPDATE Policies
-- -----------------------------------------------------------------------------

-- Policy 24: Users can update own RSVP dates
CREATE POLICY "Users can update own RSVP dates"
ON whatson_rsvp_dates FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM whatson_rsvps
        WHERE whatson_rsvps.id = whatson_rsvp_dates.rsvp_id
        AND whatson_rsvps.user_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM whatson_rsvps
        WHERE whatson_rsvps.id = whatson_rsvp_dates.rsvp_id
        AND whatson_rsvps.user_id = auth.uid()
    )
);

-- -----------------------------------------------------------------------------
-- DELETE Policies
-- -----------------------------------------------------------------------------

-- Policy 25: Users can delete own RSVP dates
CREATE POLICY "Users can delete own RSVP dates"
ON whatson_rsvp_dates FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM whatson_rsvps
        WHERE whatson_rsvps.id = whatson_rsvp_dates.rsvp_id
        AND whatson_rsvps.user_id = auth.uid()
    )
);

-- =============================================================================
-- Verification Queries
-- =============================================================================

-- Count policies per table
-- SELECT 
--     schemaname, 
--     tablename, 
--     COUNT(*) as policy_count
-- FROM pg_policies 
-- WHERE tablename LIKE 'whatson_%'
-- GROUP BY schemaname, tablename
-- ORDER BY tablename;

-- List all policies
-- SELECT 
--     schemaname,
--     tablename, 
--     policyname,
--     cmd as operation,
--     qual as using_expression,
--     with_check as with_check_expression
-- FROM pg_policies 
-- WHERE tablename LIKE 'whatson_%'
-- ORDER BY tablename, cmd, policyname;
