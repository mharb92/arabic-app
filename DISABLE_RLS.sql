-- CRITICAL: Disable Row Level Security on ALL Tables
-- Run this in Supabase SQL Editor > "New snippet" (NOT "New query")

-- Existing tables
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE unit_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE weak_words DISABLE ROW LEVEL SECURITY;
ALTER TABLE personal_vocab DISABLE ROW LEVEL SECURITY;
ALTER TABLE focused_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE special_courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE dynamic_units DISABLE ROW LEVEL SECURITY;
ALTER TABLE checkpoints DISABLE ROW LEVEL SECURITY;

-- New table from BUILD 5
ALTER TABLE phrases_mastery DISABLE ROW LEVEL SECURITY;

-- Verify all tables have RLS disabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Result should show rls_enabled = false for all tables
