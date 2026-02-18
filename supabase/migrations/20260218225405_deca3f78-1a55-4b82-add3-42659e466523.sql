
-- Drop all existing RESTRICTIVE policies and recreate as PERMISSIVE

-- TEAMS
DROP POLICY IF EXISTS "Authenticated users can create teams" ON public.teams;
DROP POLICY IF EXISTS "Members can view their teams" ON public.teams;
DROP POLICY IF EXISTS "Head coaches can update teams" ON public.teams;
DROP POLICY IF EXISTS "Head coaches can delete teams" ON public.teams;

CREATE POLICY "Authenticated users can create teams" ON public.teams FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Members can view their teams" ON public.teams FOR SELECT TO authenticated USING (is_team_member(id));
CREATE POLICY "Head coaches can update teams" ON public.teams FOR UPDATE TO authenticated USING (is_head_coach(id));
CREATE POLICY "Head coaches can delete teams" ON public.teams FOR DELETE TO authenticated USING (is_head_coach(id));

-- TEAM_MEMBERS
DROP POLICY IF EXISTS "Creator can add self as first member" ON public.team_members;
DROP POLICY IF EXISTS "Head coaches can insert members" ON public.team_members;
DROP POLICY IF EXISTS "Head coaches can update members" ON public.team_members;
DROP POLICY IF EXISTS "Head coaches can delete members" ON public.team_members;
DROP POLICY IF EXISTS "Members can view team members" ON public.team_members;

CREATE POLICY "Members can view team members" ON public.team_members FOR SELECT TO authenticated USING (is_team_member(team_id));
CREATE POLICY "Head coaches can insert members" ON public.team_members FOR INSERT TO authenticated WITH CHECK (is_head_coach(team_id));
CREATE POLICY "Head coaches can update members" ON public.team_members FOR UPDATE TO authenticated USING (is_head_coach(team_id));
CREATE POLICY "Head coaches can delete members" ON public.team_members FOR DELETE TO authenticated USING (is_head_coach(team_id));
-- Special policy: allow user to add themselves as first member of a team they just created
CREATE POLICY "Creator can add self as first member" ON public.team_members FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND role = 'head_coach'::team_role);

-- PLAYERS
DROP POLICY IF EXISTS "Team members can view players" ON public.players;
DROP POLICY IF EXISTS "Team members can insert players" ON public.players;
DROP POLICY IF EXISTS "Team members can update players" ON public.players;
DROP POLICY IF EXISTS "Team members can delete players" ON public.players;

CREATE POLICY "Team members can view players" ON public.players FOR SELECT TO authenticated USING (is_team_member(team_id));
CREATE POLICY "Team members can insert players" ON public.players FOR INSERT TO authenticated WITH CHECK (is_team_member(team_id));
CREATE POLICY "Team members can update players" ON public.players FOR UPDATE TO authenticated USING (is_team_member(team_id));
CREATE POLICY "Team members can delete players" ON public.players FOR DELETE TO authenticated USING (is_team_member(team_id));

-- GAMES
DROP POLICY IF EXISTS "Team members can view games" ON public.games;
DROP POLICY IF EXISTS "Team members can insert games" ON public.games;
DROP POLICY IF EXISTS "Team members can update games" ON public.games;
DROP POLICY IF EXISTS "Team members can delete games" ON public.games;

CREATE POLICY "Team members can view games" ON public.games FOR SELECT TO authenticated USING (is_team_member(team_id));
CREATE POLICY "Team members can insert games" ON public.games FOR INSERT TO authenticated WITH CHECK (is_team_member(team_id));
CREATE POLICY "Team members can update games" ON public.games FOR UPDATE TO authenticated USING (is_team_member(team_id));
CREATE POLICY "Team members can delete games" ON public.games FOR DELETE TO authenticated USING (is_team_member(team_id));

-- DRILLS
DROP POLICY IF EXISTS "Team members can view drills" ON public.drills;
DROP POLICY IF EXISTS "Team members can insert drills" ON public.drills;
DROP POLICY IF EXISTS "Team members can update drills" ON public.drills;
DROP POLICY IF EXISTS "Team members can delete drills" ON public.drills;

CREATE POLICY "Team members can view drills" ON public.drills FOR SELECT TO authenticated USING (is_team_member(team_id));
CREATE POLICY "Team members can insert drills" ON public.drills FOR INSERT TO authenticated WITH CHECK (is_team_member(team_id));
CREATE POLICY "Team members can update drills" ON public.drills FOR UPDATE TO authenticated USING (is_team_member(team_id));
CREATE POLICY "Team members can delete drills" ON public.drills FOR DELETE TO authenticated USING (is_team_member(team_id));

-- PLAYS
DROP POLICY IF EXISTS "Team members can view plays" ON public.plays;
DROP POLICY IF EXISTS "Team members can insert plays" ON public.plays;
DROP POLICY IF EXISTS "Team members can update plays" ON public.plays;
DROP POLICY IF EXISTS "Team members can delete plays" ON public.plays;

CREATE POLICY "Team members can view plays" ON public.plays FOR SELECT TO authenticated USING (is_team_member(team_id));
CREATE POLICY "Team members can insert plays" ON public.plays FOR INSERT TO authenticated WITH CHECK (is_team_member(team_id));
CREATE POLICY "Team members can update plays" ON public.plays FOR UPDATE TO authenticated USING (is_team_member(team_id));
CREATE POLICY "Team members can delete plays" ON public.plays FOR DELETE TO authenticated USING (is_team_member(team_id));

-- TRAINING_SESSIONS
DROP POLICY IF EXISTS "Team members can view training" ON public.training_sessions;
DROP POLICY IF EXISTS "Team members can insert training" ON public.training_sessions;
DROP POLICY IF EXISTS "Team members can update training" ON public.training_sessions;
DROP POLICY IF EXISTS "Team members can delete training" ON public.training_sessions;

CREATE POLICY "Team members can view training" ON public.training_sessions FOR SELECT TO authenticated USING (is_team_member(team_id));
CREATE POLICY "Team members can insert training" ON public.training_sessions FOR INSERT TO authenticated WITH CHECK (is_team_member(team_id));
CREATE POLICY "Team members can update training" ON public.training_sessions FOR UPDATE TO authenticated USING (is_team_member(team_id));
CREATE POLICY "Team members can delete training" ON public.training_sessions FOR DELETE TO authenticated USING (is_team_member(team_id));

-- IDPS
DROP POLICY IF EXISTS "Team members can view idps" ON public.idps;
DROP POLICY IF EXISTS "Team members can insert idps" ON public.idps;
DROP POLICY IF EXISTS "Team members can update idps" ON public.idps;
DROP POLICY IF EXISTS "Team members can delete idps" ON public.idps;

CREATE POLICY "Team members can view idps" ON public.idps FOR SELECT TO authenticated USING (is_team_member(team_id));
CREATE POLICY "Team members can insert idps" ON public.idps FOR INSERT TO authenticated WITH CHECK (is_team_member(team_id));
CREATE POLICY "Team members can update idps" ON public.idps FOR UPDATE TO authenticated USING (is_team_member(team_id));
CREATE POLICY "Team members can delete idps" ON public.idps FOR DELETE TO authenticated USING (is_team_member(team_id));

-- TEST_RESULTS
DROP POLICY IF EXISTS "Team members can view test results" ON public.test_results;
DROP POLICY IF EXISTS "Team members can insert test results" ON public.test_results;
DROP POLICY IF EXISTS "Team members can update test results" ON public.test_results;
DROP POLICY IF EXISTS "Team members can delete test results" ON public.test_results;

CREATE POLICY "Team members can view test results" ON public.test_results FOR SELECT TO authenticated USING (is_team_member(team_id));
CREATE POLICY "Team members can insert test results" ON public.test_results FOR INSERT TO authenticated WITH CHECK (is_team_member(team_id));
CREATE POLICY "Team members can update test results" ON public.test_results FOR UPDATE TO authenticated USING (is_team_member(team_id));
CREATE POLICY "Team members can delete test results" ON public.test_results FOR DELETE TO authenticated USING (is_team_member(team_id));

-- TEAM_SETTINGS
DROP POLICY IF EXISTS "Team members can view settings" ON public.team_settings;
DROP POLICY IF EXISTS "Team members can insert settings" ON public.team_settings;
DROP POLICY IF EXISTS "Team members can update settings" ON public.team_settings;

CREATE POLICY "Team members can view settings" ON public.team_settings FOR SELECT TO authenticated USING (is_team_member(team_id));
CREATE POLICY "Team members can insert settings" ON public.team_settings FOR INSERT TO authenticated WITH CHECK (is_team_member(team_id));
CREATE POLICY "Team members can update settings" ON public.team_settings FOR UPDATE TO authenticated USING (is_team_member(team_id));
