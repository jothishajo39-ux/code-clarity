/*
# Create analysis_history table for CodeClarity

## What this migration does
Creates a single table `analysis_history` that stores the output of all four
CodeClarity tools (Error Decoder, Project Planner, Code Review, Doc Generator)
for authenticated users so they can review past results.

## New Tables
- `analysis_history`
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key to auth.users, defaults to current authenticated user)
  - `tool_type` (text: 'error_decoder' | 'project_planner' | 'code_review' | 'doc_generator')
  - `input_text` (text: the user's pasted input)
  - `output_data` (jsonb: the structured AI response)
  - `title` (text: a short label for the history item)
  - `created_at` (timestamptz, defaults to now)

## Security
- Row Level Security enabled on `analysis_history`.
- Four separate policies (SELECT, INSERT, UPDATE, DELETE) scoped to `authenticated`
  users, each checking `auth.uid() = user_id`.
- The `user_id` column has `DEFAULT auth.uid()` so frontend inserts that omit
  the owner still satisfy the INSERT WITH CHECK.
*/

CREATE TABLE IF NOT EXISTS analysis_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_type text NOT NULL CHECK (tool_type IN ('error_decoder', 'project_planner', 'code_review', 'doc_generator')),
  input_text text NOT NULL,
  output_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  title text NOT NULL DEFAULT 'Untitled',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE analysis_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_history" ON analysis_history;
CREATE POLICY "select_own_history" ON analysis_history
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_history" ON analysis_history;
CREATE POLICY "insert_own_history" ON analysis_history
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_history" ON analysis_history;
CREATE POLICY "update_own_history" ON analysis_history
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_history" ON analysis_history;
CREATE POLICY "delete_own_history" ON analysis_history
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_history_user_created ON analysis_history (user_id, created_at DESC);