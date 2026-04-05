-- BUILD 5: Mastery Score System
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS phrases_mastery (
  email TEXT NOT NULL,
  phrase_id TEXT NOT NULL,
  attempts INTEGER DEFAULT 0,
  correct INTEGER DEFAULT 0,
  mastery INTEGER DEFAULT 0,
  recent_history JSONB DEFAULT '[]'::jsonb,
  last_reviewed TIMESTAMPTZ DEFAULT NOW(),
  streak INTEGER DEFAULT 0,
  PRIMARY KEY (email, phrase_id)
);

CREATE INDEX IF NOT EXISTS idx_phrases_mastery_email ON phrases_mastery(email);
CREATE INDEX IF NOT EXISTS idx_phrases_mastery_mastery ON phrases_mastery(mastery);

-- Disable RLS
ALTER TABLE phrases_mastery DISABLE ROW LEVEL SECURITY;
