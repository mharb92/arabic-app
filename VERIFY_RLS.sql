-- Run this to CHECK if RLS is disabled
-- This should show rowsecurity = false for all tables

SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
