
-- Add enhanced game columns to games table
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS squad_player_ids TEXT[] DEFAULT '{}';
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS lines JSONB DEFAULT '[]';
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS starting_goalie_id TEXT;
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS current_period TEXT DEFAULT '1';
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS current_situation TEXT DEFAULT '5v5';
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS active_line_id TEXT;
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS active_goalie_id TEXT;
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS penalties JSONB DEFAULT '[]';
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS player_stats JSONB DEFAULT '[]';
