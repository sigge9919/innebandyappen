
-- Fix the trigger to only update ONE team_member row per team (prevents unique constraint violation)
CREATE OR REPLACE FUNCTION public.handle_new_user_invite()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.team_members
  SET user_id = NEW.id
  WHERE id = (
    SELECT id FROM public.team_members
    WHERE invite_email = NEW.email AND user_id IS NULL
    LIMIT 1
  );
  RETURN NEW;
END;
$$;

-- Also fix handle_player_invite the same way
CREATE OR REPLACE FUNCTION public.handle_player_invite()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.players
  SET user_id = NEW.id
  WHERE id = (
    SELECT id FROM public.players
    WHERE invite_email = NEW.email AND user_id IS NULL
    LIMIT 1
  );
  RETURN NEW;
END;
$$;

-- Add unique constraint to prevent duplicate invites for same email+team
ALTER TABLE public.team_members ADD CONSTRAINT team_members_team_invite_email_unique UNIQUE (team_id, invite_email);
