-- =====================================================
-- CREATE NEW TABLES FOR PROFILE FEATURES
-- =====================================================
-- Execute these commands in Supabase SQL Editor
-- These create new tables to support profile UI
-- =====================================================

-- 1. user_links - Social and portfolio links
-- =====================================================

CREATE TABLE IF NOT EXISTS user_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    url TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE user_links IS 'User social media and portfolio links';
COMMENT ON COLUMN user_links.label IS 'Link label (e.g., LinkedIn, Portfolio, GitHub)';
COMMENT ON COLUMN user_links.url IS 'Full URL to the link';
COMMENT ON COLUMN user_links.sort_order IS 'Display order for links';

CREATE INDEX IF NOT EXISTS idx_user_links_user_id ON user_links(user_id);
CREATE INDEX IF NOT EXISTS idx_user_links_user_id_sort ON user_links(user_id, sort_order);

-- 2. user_roles - User professional roles/titles
-- =====================================================

CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_name TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, role_name)
);

COMMENT ON TABLE user_roles IS 'User professional roles and titles';
COMMENT ON COLUMN user_roles.role_name IS 'Role name (e.g., Director, Cinematographer, Editor)';
COMMENT ON COLUMN user_roles.sort_order IS 'Display order for roles';

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id_sort ON user_roles(user_id, sort_order);

-- 3. user_languages - Languages with proficiency
-- =====================================================

CREATE TABLE IF NOT EXISTS user_languages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    language_name TEXT NOT NULL,
    can_speak BOOLEAN DEFAULT false,
    can_write BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, language_name),
    CHECK (can_speak = true OR can_write = true)
);

COMMENT ON TABLE user_languages IS 'User language skills with proficiency levels';
COMMENT ON COLUMN user_languages.language_name IS 'Language name (e.g., English, Spanish)';
COMMENT ON COLUMN user_languages.can_speak IS 'Can speak the language';
COMMENT ON COLUMN user_languages.can_write IS 'Can write the language';

CREATE INDEX IF NOT EXISTS idx_user_languages_user_id ON user_languages(user_id);

-- 4. user_visa_info - Visa and work authorization
-- =====================================================

CREATE TABLE IF NOT EXISTS user_visa_info (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    visa_type TEXT,
    issued_by TEXT,
    expiry_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

COMMENT ON TABLE user_visa_info IS 'User visa and work authorization information';
COMMENT ON COLUMN user_visa_info.visa_type IS 'Visa type (e.g., H1B, L1, O1, TN, E3, F1, J1, B1/B2)';
COMMENT ON COLUMN user_visa_info.issued_by IS 'Country that issued the visa';
COMMENT ON COLUMN user_visa_info.expiry_date IS 'Visa expiration date';

CREATE INDEX IF NOT EXISTS idx_user_visa_info_user_id ON user_visa_info(user_id);

-- 5. user_travel_countries - Available countries for travel
-- =====================================================

CREATE TABLE IF NOT EXISTS user_travel_countries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    country_code TEXT NOT NULL,
    country_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, country_code)
);

COMMENT ON TABLE user_travel_countries IS 'Countries user is available to travel to for work';
COMMENT ON COLUMN user_travel_countries.country_code IS 'ISO country code (e.g., US, IN, GB)';
COMMENT ON COLUMN user_travel_countries.country_name IS 'Full country name';

CREATE INDEX IF NOT EXISTS idx_user_travel_countries_user_id ON user_travel_countries(user_id);

-- 6. user_credits - Work history and credits
-- =====================================================

CREATE TABLE IF NOT EXISTS user_credits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    credit_title TEXT NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    image_url TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK (end_date IS NULL OR end_date >= start_date)
);

COMMENT ON TABLE user_credits IS 'User work history, credits, and past projects';
COMMENT ON COLUMN user_credits.credit_title IS 'Project or company name';
COMMENT ON COLUMN user_credits.description IS 'Description of work and responsibilities';
COMMENT ON COLUMN user_credits.start_date IS 'Project start date';
COMMENT ON COLUMN user_credits.end_date IS 'Project end date (NULL if ongoing)';
COMMENT ON COLUMN user_credits.image_url IS 'Project thumbnail or company logo URL';
COMMENT ON COLUMN user_credits.sort_order IS 'Display order for credits';

CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON user_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_user_credits_user_id_sort ON user_credits(user_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_user_credits_user_id_dates ON user_credits(user_id, start_date DESC);

-- 7. user_highlights - Profile highlights and achievements
-- =====================================================

CREATE TABLE IF NOT EXISTS user_highlights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE user_highlights IS 'User profile highlights and featured achievements';
COMMENT ON COLUMN user_highlights.title IS 'Highlight title';
COMMENT ON COLUMN user_highlights.description IS 'Detailed description of the highlight';
COMMENT ON COLUMN user_highlights.image_url IS 'Featured image URL';
COMMENT ON COLUMN user_highlights.sort_order IS 'Display order for highlights';

CREATE INDEX IF NOT EXISTS idx_user_highlights_user_id ON user_highlights(user_id);
CREATE INDEX IF NOT EXISTS idx_user_highlights_user_id_sort ON user_highlights(user_id, sort_order);

-- 8. user_recommendations - Profile recommendations and connections
-- =====================================================

CREATE TABLE IF NOT EXISTS user_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recommended_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, recommended_user_id),
    CHECK (user_id != recommended_user_id)
);

COMMENT ON TABLE user_recommendations IS 'User profile recommendations - "People also viewed"';
COMMENT ON COLUMN user_recommendations.user_id IS 'User whose profile is being viewed';
COMMENT ON COLUMN user_recommendations.recommended_user_id IS 'Recommended user to view';

CREATE INDEX IF NOT EXISTS idx_user_recommendations_user_id ON user_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_recommendations_recommended_id ON user_recommendations(recommended_user_id);

-- =====================================================
-- TRIGGERS FOR updated_at columns
-- =====================================================

-- Create or replace function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at column
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applicant_skills_updated_at BEFORE UPDATE ON applicant_skills
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_links_updated_at BEFORE UPDATE ON user_links
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_languages_updated_at BEFORE UPDATE ON user_languages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_visa_info_updated_at BEFORE UPDATE ON user_visa_info
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_credits_updated_at BEFORE UPDATE ON user_credits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_highlights_updated_at BEFORE UPDATE ON user_highlights
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- END OF CREATE TABLE COMMANDS
-- =====================================================
