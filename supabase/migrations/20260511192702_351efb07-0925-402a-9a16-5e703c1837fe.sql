CREATE TABLE public.tactics_layouts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id uuid NOT NULL,
  name text NOT NULL,
  players jsonb NOT NULL DEFAULT '[]'::jsonb,
  drawing_data text NOT NULL DEFAULT '',
  keyframes jsonb NOT NULL DEFAULT '[]'::jsonb,
  zones jsonb NOT NULL DEFAULT '[]'::jsonb,
  home_player_count integer NOT NULL DEFAULT 0,
  opponent_player_count integer NOT NULL DEFAULT 0,
  is_animation boolean NOT NULL DEFAULT false,
  canvas_width integer,
  canvas_height integer,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_tactics_layouts_team_id ON public.tactics_layouts(team_id);

ALTER TABLE public.tactics_layouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view tactics layouts"
ON public.tactics_layouts FOR SELECT
TO authenticated
USING (is_team_member(team_id));

CREATE POLICY "Team members can insert tactics layouts"
ON public.tactics_layouts FOR INSERT
TO authenticated
WITH CHECK (is_team_member(team_id));

CREATE POLICY "Team members can update tactics layouts"
ON public.tactics_layouts FOR UPDATE
TO authenticated
USING (is_team_member(team_id));

CREATE POLICY "Team members can delete tactics layouts"
ON public.tactics_layouts FOR DELETE
TO authenticated
USING (is_team_member(team_id));

CREATE TRIGGER update_tactics_layouts_updated_at
BEFORE UPDATE ON public.tactics_layouts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();