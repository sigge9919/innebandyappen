
-- Fix: RESTRICTIVE policies block players because they fail the coach policy.
-- Change all personal_trainings and player_rpe_ratings policies to PERMISSIVE.

-- personal_trainings: drop and recreate as PERMISSIVE
DROP POLICY IF EXISTS "Coaches can manage personal trainings" ON public.personal_trainings;
DROP POLICY IF EXISTS "Players can delete own personal trainings" ON public.personal_trainings;
DROP POLICY IF EXISTS "Players can insert own personal trainings" ON public.personal_trainings;
DROP POLICY IF EXISTS "Players can update own personal trainings" ON public.personal_trainings;
DROP POLICY IF EXISTS "Team members can view personal trainings" ON public.personal_trainings;

CREATE POLICY "Team members can view personal trainings"
  ON public.personal_trainings FOR SELECT TO authenticated
  USING (is_team_member(team_id));

CREATE POLICY "Players can insert own personal trainings"
  ON public.personal_trainings FOR INSERT TO authenticated
  WITH CHECK (
    is_team_member(team_id) AND
    player_id = (SELECT id FROM public.players WHERE user_id = auth.uid() AND team_id = personal_trainings.team_id LIMIT 1)
  );

CREATE POLICY "Players can update own personal trainings"
  ON public.personal_trainings FOR UPDATE TO authenticated
  USING (
    is_team_member(team_id) AND
    player_id = (SELECT id FROM public.players WHERE user_id = auth.uid() AND team_id = personal_trainings.team_id LIMIT 1)
  );

CREATE POLICY "Players can delete own personal trainings"
  ON public.personal_trainings FOR DELETE TO authenticated
  USING (
    is_team_member(team_id) AND
    player_id = (SELECT id FROM public.players WHERE user_id = auth.uid() AND team_id = personal_trainings.team_id LIMIT 1)
  );

CREATE POLICY "Coaches can manage personal trainings"
  ON public.personal_trainings FOR ALL TO authenticated
  USING (is_head_coach(team_id))
  WITH CHECK (is_head_coach(team_id));

-- player_rpe_ratings: drop and recreate as PERMISSIVE
DROP POLICY IF EXISTS "Coaches can manage RPE ratings" ON public.player_rpe_ratings;
DROP POLICY IF EXISTS "Players can insert own RPE ratings" ON public.player_rpe_ratings;
DROP POLICY IF EXISTS "Players can update own RPE ratings" ON public.player_rpe_ratings;
DROP POLICY IF EXISTS "Team members can view RPE ratings" ON public.player_rpe_ratings;

CREATE POLICY "Team members can view RPE ratings"
  ON public.player_rpe_ratings FOR SELECT TO authenticated
  USING (is_team_member(team_id));

CREATE POLICY "Players can insert own RPE ratings"
  ON public.player_rpe_ratings FOR INSERT TO authenticated
  WITH CHECK (
    is_team_member(team_id) AND
    player_id = (SELECT id FROM public.players WHERE user_id = auth.uid() AND team_id = player_rpe_ratings.team_id LIMIT 1)
  );

CREATE POLICY "Players can update own RPE ratings"
  ON public.player_rpe_ratings FOR UPDATE TO authenticated
  USING (
    is_team_member(team_id) AND
    player_id = (SELECT id FROM public.players WHERE user_id = auth.uid() AND team_id = player_rpe_ratings.team_id LIMIT 1)
  );

CREATE POLICY "Coaches can manage RPE ratings"
  ON public.player_rpe_ratings FOR ALL TO authenticated
  USING (is_head_coach(team_id))
  WITH CHECK (is_head_coach(team_id));
