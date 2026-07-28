CREATE OR REPLACE FUNCTION public.is_coach(_team_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = _team_id AND user_id = auth.uid()
      AND role IN ('head_coach','assistant_coach')
  );
$$;

CREATE TABLE public.training_segments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  name text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.training_segments TO authenticated;
GRANT ALL ON public.training_segments TO service_role;

ALTER TABLE public.training_segments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coaches can manage training segments"
  ON public.training_segments FOR ALL
  TO authenticated
  USING (public.is_coach(team_id))
  WITH CHECK (public.is_coach(team_id));

CREATE POLICY "Team members can view training segments"
  ON public.training_segments FOR SELECT
  TO authenticated
  USING (public.is_team_member(team_id));

CREATE INDEX idx_training_segments_team ON public.training_segments(team_id, sort_order);

-- Seed for existing teams
INSERT INTO public.training_segments (team_id, name, sort_order, is_default)
SELECT t.id, s.name, s.ord, true
FROM public.teams t
CROSS JOIN (VALUES ('Uppvärmning',0),('Huvudövningar',1),('Spelövningar',2),('Nedvarvning',3)) AS s(name, ord);

-- Seed on team creation
CREATE OR REPLACE FUNCTION public.create_team(_name text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _team_id uuid;
  _user_id uuid;
BEGIN
  _user_id := auth.uid();
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO public.teams (name, created_by)
  VALUES (_name, _user_id)
  RETURNING id INTO _team_id;

  INSERT INTO public.team_members (team_id, user_id, role)
  VALUES (_team_id, _user_id, 'head_coach');

  INSERT INTO public.team_settings (team_id)
  VALUES (_team_id);

  INSERT INTO public.seasons (team_id, name, is_active, start_date)
  VALUES (_team_id, to_char(now(), 'YYYY') || '/' || to_char(now() + interval '1 year', 'YYYY'), true, to_char(now(), 'YYYY-MM-DD'));

  INSERT INTO public.training_segments (team_id, name, sort_order, is_default) VALUES
    (_team_id, 'Uppvärmning', 0, true),
    (_team_id, 'Huvudövningar', 1, true),
    (_team_id, 'Spelövningar', 2, true),
    (_team_id, 'Nedvarvning', 3, true);

  RETURN _team_id;
END;
$function$;