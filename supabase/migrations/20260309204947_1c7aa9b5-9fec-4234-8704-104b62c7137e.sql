
-- Fix: personal_trainings policies target 'public' role instead of 'authenticated'
-- Drop and recreate all policies with correct role

DROP POLICY IF EXISTS "Team members can view personal trainings" ON public.personal_trainings;
DROP POLICY IF EXISTS "Players can insert own personal trainings" ON public.personal_trainings;
DROP POLICY IF EXISTS "Players can update own personal trainings" ON public.personal_trainings;
DROP POLICY IF EXISTS "Players can delete own personal trainings" ON public.personal_trainings;

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

-- Fix: player_rpe_ratings policies target 'public' role instead of 'authenticated'
DROP POLICY IF EXISTS "Team members can view RPE ratings" ON public.player_rpe_ratings;
DROP POLICY IF EXISTS "Players can insert own RPE ratings" ON public.player_rpe_ratings;
DROP POLICY IF EXISTS "Players can update own RPE ratings" ON public.player_rpe_ratings;

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

-- Also allow coaches to view personal trainings and RPE (already covered by SELECT policy above)
-- And allow coaches to insert RPE on behalf of players (for bulk entry)
CREATE POLICY "Coaches can manage personal trainings"
  ON public.personal_trainings FOR ALL TO authenticated
  USING (is_head_coach(team_id))
  WITH CHECK (is_head_coach(team_id));

CREATE POLICY "Coaches can manage RPE ratings"
  ON public.player_rpe_ratings FOR ALL TO authenticated
  USING (is_head_coach(team_id))
  WITH CHECK (is_head_coach(team_id));

-- Attach the invite trigger functions (they exist but have no triggers)
DROP TRIGGER IF EXISTS on_auth_user_created_invite ON auth.users;
CREATE TRIGGER on_auth_user_created_invite
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_invite();

DROP TRIGGER IF EXISTS on_auth_user_created_player ON auth.users;
CREATE TRIGGER on_auth_user_created_player
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_player_invite();
