ALTER TABLE public.games ADD COLUMN IF NOT EXISTS categories text[] NOT NULL DEFAULT '{}';
ALTER TABLE public.team_settings ADD COLUMN IF NOT EXISTS game_categories text[] NOT NULL DEFAULT '{}';