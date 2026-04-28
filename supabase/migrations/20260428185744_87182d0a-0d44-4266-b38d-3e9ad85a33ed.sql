CREATE TABLE public.line_layouts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id uuid NOT NULL,
  name text NOT NULL,
  type text NOT NULL,
  slots jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.line_layouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view line layouts"
  ON public.line_layouts FOR SELECT TO authenticated
  USING (is_team_member(team_id));

CREATE POLICY "Team members can insert line layouts"
  ON public.line_layouts FOR INSERT TO authenticated
  WITH CHECK (is_team_member(team_id));

CREATE POLICY "Team members can update line layouts"
  ON public.line_layouts FOR UPDATE TO authenticated
  USING (is_team_member(team_id));

CREATE POLICY "Team members can delete line layouts"
  ON public.line_layouts FOR DELETE TO authenticated
  USING (is_team_member(team_id));

CREATE INDEX idx_line_layouts_team ON public.line_layouts(team_id);