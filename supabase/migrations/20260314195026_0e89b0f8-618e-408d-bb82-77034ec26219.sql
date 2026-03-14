
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

  -- Create default active season
  INSERT INTO public.seasons (team_id, name, is_active, start_date)
  VALUES (_team_id, to_char(now(), 'YYYY') || '/' || to_char(now() + interval '1 year', 'YYYY'), true, to_char(now(), 'YYYY-MM-DD'));

  PERFORM public.seed_default_drills(_team_id);

  RETURN _team_id;
END;
$function$;
