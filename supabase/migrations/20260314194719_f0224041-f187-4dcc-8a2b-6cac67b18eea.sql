
-- Create seasons table
CREATE TABLE public.seasons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  name text NOT NULL,
  is_active boolean NOT NULL DEFAULT false,
  start_date text,
  end_date text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view seasons" ON public.seasons
  FOR SELECT TO authenticated USING (is_team_member(team_id));

CREATE POLICY "Team members can insert seasons" ON public.seasons
  FOR INSERT TO authenticated WITH CHECK (is_team_member(team_id));

CREATE POLICY "Team members can update seasons" ON public.seasons
  FOR UPDATE TO authenticated USING (is_team_member(team_id));

CREATE POLICY "Team members can delete seasons" ON public.seasons
  FOR DELETE TO authenticated USING (is_head_coach(team_id));

-- Add season_id columns
ALTER TABLE public.games ADD COLUMN season_id uuid REFERENCES public.seasons(id);
ALTER TABLE public.training_sessions ADD COLUMN season_id uuid REFERENCES public.seasons(id);
ALTER TABLE public.player_rpe_ratings ADD COLUMN season_id uuid REFERENCES public.seasons(id);

-- Create initial season per team and link existing data
DO $$
DECLARE
  t RECORD;
  s_id uuid;
BEGIN
  FOR t IN SELECT id FROM public.teams LOOP
    INSERT INTO public.seasons (team_id, name, is_active, start_date)
    VALUES (t.id, '2024/2025', true, '2024-08-01')
    RETURNING id INTO s_id;

    UPDATE public.games SET season_id = s_id WHERE team_id = t.id AND season_id IS NULL;
    UPDATE public.training_sessions SET season_id = s_id WHERE team_id = t.id AND season_id IS NULL;
    UPDATE public.player_rpe_ratings SET season_id = s_id WHERE team_id = t.id AND season_id IS NULL;
  END LOOP;
END $$;
