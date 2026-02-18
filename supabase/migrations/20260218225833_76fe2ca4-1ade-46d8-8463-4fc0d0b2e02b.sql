
-- Create a function to handle team creation atomically
CREATE OR REPLACE FUNCTION public.create_team(_name text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _team_id uuid;
  _user_id uuid;
BEGIN
  _user_id := auth.uid();
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Insert team
  INSERT INTO public.teams (name, created_by)
  VALUES (_name, _user_id)
  RETURNING id INTO _team_id;

  -- Add creator as head coach
  INSERT INTO public.team_members (team_id, user_id, role)
  VALUES (_team_id, _user_id, 'head_coach');

  -- Create default team settings
  INSERT INTO public.team_settings (team_id)
  VALUES (_team_id);

  RETURN _team_id;
END;
$$;
