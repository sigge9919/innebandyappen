-- Add personal training fields to training_sessions
ALTER TABLE public.training_sessions
ADD COLUMN is_personal boolean NOT NULL DEFAULT false,
ADD COLUMN created_by_player_id uuid REFERENCES public.players(id) ON DELETE SET NULL,
ADD COLUMN rpe_rating integer;

-- Add validation trigger for rpe_rating
CREATE OR REPLACE FUNCTION public.validate_training_rpe()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.rpe_rating IS NOT NULL AND (NEW.rpe_rating < 1 OR NEW.rpe_rating > 5) THEN
    RAISE EXCEPTION 'RPE rating must be between 1 and 5';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_training_rpe_trigger
BEFORE INSERT OR UPDATE ON public.training_sessions
FOR EACH ROW
EXECUTE FUNCTION public.validate_training_rpe();

-- RLS: Players can insert their own personal training sessions
CREATE POLICY "Players can insert personal trainings"
ON public.training_sessions
FOR INSERT
TO authenticated
WITH CHECK (
  is_personal = true
  AND created_by_player_id IS NOT NULL
  AND is_team_member(team_id)
  AND created_by_player_id = (
    SELECT id FROM public.players
    WHERE user_id = auth.uid() AND team_id = training_sessions.team_id
    LIMIT 1
  )
);

-- RLS: Players can update their own personal training sessions
CREATE POLICY "Players can update personal trainings"
ON public.training_sessions
FOR UPDATE
TO authenticated
USING (
  is_personal = true
  AND is_team_member(team_id)
  AND created_by_player_id = (
    SELECT id FROM public.players
    WHERE user_id = auth.uid() AND team_id = training_sessions.team_id
    LIMIT 1
  )
);

-- RLS: Players can delete their own personal training sessions
CREATE POLICY "Players can delete personal trainings"
ON public.training_sessions
FOR DELETE
TO authenticated
USING (
  is_personal = true
  AND is_team_member(team_id)
  AND created_by_player_id = (
    SELECT id FROM public.players
    WHERE user_id = auth.uid() AND team_id = training_sessions.team_id
    LIMIT 1
  )
);