-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================
-- Execute these commands in Supabase SQL Editor
-- These enable RLS and create security policies
-- =====================================================

-- Enable RLS on all new tables
ALTER TABLE user_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_visa_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_travel_countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_recommendations ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 1. user_links policies
-- =====================================================

-- Users can view their own links
CREATE POLICY "Users can view own links"
ON user_links FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own links
CREATE POLICY "Users can insert own links"
ON user_links FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own links
CREATE POLICY "Users can update own links"
ON user_links FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own links
CREATE POLICY "Users can delete own links"
ON user_links FOR DELETE
USING (auth.uid() = user_id);

-- Public can view links of any user (for profile viewing)
CREATE POLICY "Public can view all user links"
ON user_links FOR SELECT
USING (true);

-- =====================================================
-- 2. user_roles policies
-- =====================================================

CREATE POLICY "Users can view own roles"
ON user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own roles"
ON user_roles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own roles"
ON user_roles FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own roles"
ON user_roles FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Public can view all user roles"
ON user_roles FOR SELECT
USING (true);

-- =====================================================
-- 3. user_languages policies
-- =====================================================

CREATE POLICY "Users can view own languages"
ON user_languages FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own languages"
ON user_languages FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own languages"
ON user_languages FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own languages"
ON user_languages FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Public can view all user languages"
ON user_languages FOR SELECT
USING (true);

-- =====================================================
-- 4. user_visa_info policies
-- =====================================================

CREATE POLICY "Users can view own visa info"
ON user_visa_info FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own visa info"
ON user_visa_info FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own visa info"
ON user_visa_info FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own visa info"
ON user_visa_info FOR DELETE
USING (auth.uid() = user_id);

-- Visa info is private - only owner can see
-- Remove public access for visa information

-- =====================================================
-- 5. user_travel_countries policies
-- =====================================================

CREATE POLICY "Users can view own travel countries"
ON user_travel_countries FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own travel countries"
ON user_travel_countries FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own travel countries"
ON user_travel_countries FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own travel countries"
ON user_travel_countries FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Public can view all user travel countries"
ON user_travel_countries FOR SELECT
USING (true);

-- =====================================================
-- 6. user_credits policies
-- =====================================================

CREATE POLICY "Users can view own credits"
ON user_credits FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own credits"
ON user_credits FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own credits"
ON user_credits FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own credits"
ON user_credits FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Public can view all user credits"
ON user_credits FOR SELECT
USING (true);

-- =====================================================
-- 7. user_highlights policies
-- =====================================================

CREATE POLICY "Users can view own highlights"
ON user_highlights FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own highlights"
ON user_highlights FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own highlights"
ON user_highlights FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own highlights"
ON user_highlights FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Public can view all user highlights"
ON user_highlights FOR SELECT
USING (true);

-- =====================================================
-- 8. user_recommendations policies
-- =====================================================

CREATE POLICY "Users can view recommendations for their profile"
ON user_recommendations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert recommendations for their profile"
ON user_recommendations FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their recommendations"
ON user_recommendations FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their recommendations"
ON user_recommendations FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Public can view all user recommendations"
ON user_recommendations FOR SELECT
USING (true);

-- =====================================================
-- END OF RLS POLICIES
-- =====================================================
