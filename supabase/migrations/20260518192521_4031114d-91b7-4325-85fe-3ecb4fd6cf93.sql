CREATE OR REPLACE FUNCTION public.claim_pending_invites()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _user_id uuid;
  _email text;
BEGIN
  _user_id := auth.uid();
  IF _user_id IS NULL THEN
    RETURN;
  END IF;

  SELECT email INTO _email FROM auth.users WHERE id = _user_id;
  IF _email IS NULL THEN
    RETURN;
  END IF;

  UPDATE public.team_members
  SET user_id = _user_id
  WHERE user_id IS NULL AND lower(invite_email) = lower(_email);

  UPDATE public.players
  SET user_id = _user_id
  WHERE user_id IS NULL AND lower(invite_email) = lower(_email);
END;
$$;