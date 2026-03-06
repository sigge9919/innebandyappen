
-- Add 'player' to team_role enum
ALTER TYPE public.team_role ADD VALUE IF NOT EXISTS 'player';

-- Add user_id to players table for linking player accounts
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS invite_email text;

-- RPE ratings table
CREATE TABLE public.player_rpe_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  session_type text NOT NULL,
  session_id uuid NOT NULL,
  rating integer NOT NULL DEFAULT 5,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(player_id, session_type, session_id)
);

-- Validation trigger for RPE rating (1-10)
CREATE OR REPLACE FUNCTION public.validate_rpe_rating()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.rating < 1 OR NEW.rating > 10 THEN
    RAISE EXCEPTION 'RPE rating must be between 1 and 10';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_rpe_rating_trigger
  BEFORE INSERT OR UPDATE ON public.player_rpe_ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_rpe_rating();

-- Personal trainings table
CREATE TABLE public.personal_trainings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  date text NOT NULL,
  description text DEFAULT '',
  duration integer DEFAULT 60,
  rpe_rating integer NOT NULL DEFAULT 5,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Validation trigger for personal training RPE
CREATE TRIGGER validate_personal_training_rpe_trigger
  BEFORE INSERT OR UPDATE ON public.personal_trainings
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_rpe_rating();

-- RLS on player_rpe_ratings
ALTER TABLE public.player_rpe_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view RPE ratings"
  ON public.player_rpe_ratings FOR SELECT
  USING (is_team_member(team_id));

CREATE POLICY "Players can insert own RPE ratings"
  ON public.player_rpe_ratings FOR INSERT
  WITH CHECK (
    is_team_member(team_id) AND
    player_id = (SELECT id FROM public.players WHERE user_id = auth.uid() AND team_id = player_rpe_ratings.team_id LIMIT 1)
  );

CREATE POLICY "Players can update own RPE ratings"
  ON public.player_rpe_ratings FOR UPDATE
  USING (
    is_team_member(team_id) AND
    player_id = (SELECT id FROM public.players WHERE user_id = auth.uid() AND team_id = player_rpe_ratings.team_id LIMIT 1)
  );

-- RLS on personal_trainings
ALTER TABLE public.personal_trainings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view personal trainings"
  ON public.personal_trainings FOR SELECT
  USING (is_team_member(team_id));

CREATE POLICY "Players can insert own personal trainings"
  ON public.personal_trainings FOR INSERT
  WITH CHECK (
    is_team_member(team_id) AND
    player_id = (SELECT id FROM public.players WHERE user_id = auth.uid() AND team_id = personal_trainings.team_id LIMIT 1)
  );

CREATE POLICY "Players can update own personal trainings"
  ON public.personal_trainings FOR UPDATE
  USING (
    is_team_member(team_id) AND
    player_id = (SELECT id FROM public.players WHERE user_id = auth.uid() AND team_id = personal_trainings.team_id LIMIT 1)
  );

CREATE POLICY "Players can delete own personal trainings"
  ON public.personal_trainings FOR DELETE
  USING (
    is_team_member(team_id) AND
    player_id = (SELECT id FROM public.players WHERE user_id = auth.uid() AND team_id = personal_trainings.team_id LIMIT 1)
  );

-- Helper function: get player_id for current user in a team
CREATE OR REPLACE FUNCTION public.get_player_id_for_user(_team_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT id FROM public.players
  WHERE team_id = _team_id AND user_id = auth.uid()
  LIMIT 1;
$$;

-- Trigger: when a new user signs up, link them to their player record via invite_email
CREATE OR REPLACE FUNCTION public.handle_player_invite()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.players
  SET user_id = NEW.id
  WHERE invite_email = NEW.email AND user_id IS NULL;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_link_player
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_player_invite();
