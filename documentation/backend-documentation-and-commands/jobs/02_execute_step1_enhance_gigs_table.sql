-- ============================================================================
-- STEP 1: Enhance gigs Table - Add Missing Columns
-- ============================================================================
-- Purpose: Add fields required by frontend that don't exist in current schema
-- Tables Modified: gigs
-- New Columns: company_logo, terms_conditions, budget_amount, budget_currency
-- ============================================================================

-- Add company logo field
ALTER TABLE gigs 
ADD COLUMN IF NOT EXISTS company_logo TEXT;

COMMENT ON COLUMN gigs.company_logo IS 'URL to company/project logo image (from Storage or external URL)';

-- Add terms and conditions field
ALTER TABLE gigs 
ADD COLUMN IF NOT EXISTS terms_conditions TEXT;

COMMENT ON COLUMN gigs.terms_conditions IS 'Terms, conditions, and return policy text for the gig/project';

-- Add project budget fields (useful for project details)
ALTER TABLE gigs 
ADD COLUMN IF NOT EXISTS budget_amount INTEGER;

ALTER TABLE gigs 
ADD COLUMN IF NOT EXISTS budget_currency TEXT DEFAULT 'AED';

COMMENT ON COLUMN gigs.budget_amount IS 'Total project budget amount (integer value)';
COMMENT ON COLUMN gigs.budget_currency IS 'Budget currency code (AED, USD, EUR, GBP, etc.)';

-- ============================================================================
-- RLS NOTES
-- ============================================================================
-- These new columns are part of the gigs table which already has RLS policies
-- Existing SELECT policies will automatically include these columns
-- No new RLS policies required
-- ============================================================================

-- Verification Query
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'gigs' 
AND column_name IN ('company_logo', 'terms_conditions', 'budget_amount', 'budget_currency')
ORDER BY ordinal_position;
