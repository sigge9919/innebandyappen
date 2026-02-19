ALTER TABLE public.team_settings
ADD COLUMN IF NOT EXISTS test_types text[] DEFAULT ARRAY['Fitness', 'Skill'];