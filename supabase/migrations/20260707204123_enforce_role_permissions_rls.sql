-- Enforce the app's per-role permission matrix (team_settings.permissions / usePermissions.ts)
-- at the database level.
--
-- Previously every INSERT/UPDATE/DELETE policy on team-scoped data tables only checked team
-- membership (public.is_team_member), not role or access level. That meant a 'viewer' (view-only
-- by default) or a 'player' (no access by default outside their own portal) could write directly
-- via the Supabase client, bypassing every restriction the UI enforces. Reads are left as
-- "any team member" since the app's dashboards/portal/stats views legitimately fetch team-wide
-- data and filter client-side — the real gap was write access.

CREATE OR REPLACE FUNCTION public.has_section_access(_team_id uuid, _section text, _min_level text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _role public.team_role;
  _level text;
  _perms jsonb;
BEGIN
  IF public.is_head_coach(_team_id) THEN
    RETURN true;
  END IF;

  SELECT role INTO _role FROM public.team_members
  WHERE team_id = _team_id AND user_id = auth.uid()
  LIMIT 1;

  IF _role IS NULL THEN
    RETURN false;
  END IF;

  SELECT permissions INTO _perms FROM public.team_settings WHERE team_id = _team_id LIMIT 1;
  _level := _perms #>> ARRAY[_role::text, _section];

  -- Fall back to the same defaults hardcoded in src/hooks/usePermissions.ts (DEFAULT_PERMISSIONS)
  -- when a team hasn't customized its permission matrix yet.
  IF _level IS NULL THEN
    _level := CASE _role::text || ':' || _section
      WHEN 'assistant_coach:team' THEN 'edit'
      WHEN 'assistant_coach:games' THEN 'edit'
      WHEN 'assistant_coach:stats' THEN 'view'
      WHEN 'assistant_coach:training' THEN 'edit'
      WHEN 'assistant_coach:playbook' THEN 'edit'
      WHEN 'assistant_coach:development' THEN 'edit'
      WHEN 'assistant_coach:tactics' THEN 'edit'
      WHEN 'stats_coach:team' THEN 'view'
      WHEN 'stats_coach:games' THEN 'edit'
      WHEN 'stats_coach:stats' THEN 'edit'
      WHEN 'stats_coach:training' THEN 'view'
      WHEN 'stats_coach:playbook' THEN 'view'
      WHEN 'stats_coach:development' THEN 'view'
      WHEN 'stats_coach:tactics' THEN 'view'
      WHEN 'viewer:team' THEN 'view'
      WHEN 'viewer:games' THEN 'view'
      WHEN 'viewer:stats' THEN 'view'
      WHEN 'viewer:training' THEN 'view'
      WHEN 'viewer:playbook' THEN 'view'
      WHEN 'viewer:development' THEN 'view'
      WHEN 'viewer:tactics' THEN 'view'
      ELSE 'none' -- player, and any unknown role/section
    END;
  END IF;

  IF _min_level = 'view' THEN
    RETURN _level IN ('view', 'edit');
  END IF;

  RETURN _level = 'edit';
END;
$$;

-- Players (section: team)
DROP POLICY IF EXISTS "Team members can insert players" ON public.players;
DROP POLICY IF EXISTS "Team members can update players" ON public.players;
DROP POLICY IF EXISTS "Team members can delete players" ON public.players;
CREATE POLICY "Editors can insert players" ON public.players
  FOR INSERT TO authenticated WITH CHECK (public.has_section_access(team_id, 'team', 'edit'));
CREATE POLICY "Editors can update players" ON public.players
  FOR UPDATE TO authenticated USING (public.has_section_access(team_id, 'team', 'edit'));
CREATE POLICY "Editors can delete players" ON public.players
  FOR DELETE TO authenticated USING (public.has_section_access(team_id, 'team', 'edit'));

-- Games (section: games)
DROP POLICY IF EXISTS "Team members can insert games" ON public.games;
DROP POLICY IF EXISTS "Team members can update games" ON public.games;
DROP POLICY IF EXISTS "Team members can delete games" ON public.games;
CREATE POLICY "Editors can insert games" ON public.games
  FOR INSERT TO authenticated WITH CHECK (public.has_section_access(team_id, 'games', 'edit'));
CREATE POLICY "Editors can update games" ON public.games
  FOR UPDATE TO authenticated USING (public.has_section_access(team_id, 'games', 'edit'));
CREATE POLICY "Editors can delete games" ON public.games
  FOR DELETE TO authenticated USING (public.has_section_access(team_id, 'games', 'edit'));

-- Drills (section: training)
DROP POLICY IF EXISTS "Team members can insert drills" ON public.drills;
DROP POLICY IF EXISTS "Team members can update drills" ON public.drills;
DROP POLICY IF EXISTS "Team members can delete drills" ON public.drills;
CREATE POLICY "Editors can insert drills" ON public.drills
  FOR INSERT TO authenticated WITH CHECK (public.has_section_access(team_id, 'training', 'edit'));
CREATE POLICY "Editors can update drills" ON public.drills
  FOR UPDATE TO authenticated USING (public.has_section_access(team_id, 'training', 'edit'));
CREATE POLICY "Editors can delete drills" ON public.drills
  FOR DELETE TO authenticated USING (public.has_section_access(team_id, 'training', 'edit'));

-- Plays (section: playbook)
DROP POLICY IF EXISTS "Team members can insert plays" ON public.plays;
DROP POLICY IF EXISTS "Team members can update plays" ON public.plays;
DROP POLICY IF EXISTS "Team members can delete plays" ON public.plays;
CREATE POLICY "Editors can insert plays" ON public.plays
  FOR INSERT TO authenticated WITH CHECK (public.has_section_access(team_id, 'playbook', 'edit'));
CREATE POLICY "Editors can update plays" ON public.plays
  FOR UPDATE TO authenticated USING (public.has_section_access(team_id, 'playbook', 'edit'));
CREATE POLICY "Editors can delete plays" ON public.plays
  FOR DELETE TO authenticated USING (public.has_section_access(team_id, 'playbook', 'edit'));

-- Training sessions (section: training)
DROP POLICY IF EXISTS "Team members can insert training" ON public.training_sessions;
DROP POLICY IF EXISTS "Team members can update training" ON public.training_sessions;
DROP POLICY IF EXISTS "Team members can delete training" ON public.training_sessions;
CREATE POLICY "Editors can insert training" ON public.training_sessions
  FOR INSERT TO authenticated WITH CHECK (public.has_section_access(team_id, 'training', 'edit'));
CREATE POLICY "Editors can update training" ON public.training_sessions
  FOR UPDATE TO authenticated USING (public.has_section_access(team_id, 'training', 'edit'));
CREATE POLICY "Editors can delete training" ON public.training_sessions
  FOR DELETE TO authenticated USING (public.has_section_access(team_id, 'training', 'edit'));

-- IDPs (section: development)
DROP POLICY IF EXISTS "Team members can insert idps" ON public.idps;
DROP POLICY IF EXISTS "Team members can update idps" ON public.idps;
DROP POLICY IF EXISTS "Team members can delete idps" ON public.idps;
CREATE POLICY "Editors can insert idps" ON public.idps
  FOR INSERT TO authenticated WITH CHECK (public.has_section_access(team_id, 'development', 'edit'));
CREATE POLICY "Editors can update idps" ON public.idps
  FOR UPDATE TO authenticated USING (public.has_section_access(team_id, 'development', 'edit'));
CREATE POLICY "Editors can delete idps" ON public.idps
  FOR DELETE TO authenticated USING (public.has_section_access(team_id, 'development', 'edit'));

-- Test results (section: stats)
DROP POLICY IF EXISTS "Team members can insert test results" ON public.test_results;
DROP POLICY IF EXISTS "Team members can update test results" ON public.test_results;
DROP POLICY IF EXISTS "Team members can delete test results" ON public.test_results;
CREATE POLICY "Editors can insert test results" ON public.test_results
  FOR INSERT TO authenticated WITH CHECK (public.has_section_access(team_id, 'stats', 'edit'));
CREATE POLICY "Editors can update test results" ON public.test_results
  FOR UPDATE TO authenticated USING (public.has_section_access(team_id, 'stats', 'edit'));
CREATE POLICY "Editors can delete test results" ON public.test_results
  FOR DELETE TO authenticated USING (public.has_section_access(team_id, 'stats', 'edit'));

-- Line layouts (section: team — managed from /team/lines)
DROP POLICY IF EXISTS "Team members can insert line layouts" ON public.line_layouts;
DROP POLICY IF EXISTS "Team members can update line layouts" ON public.line_layouts;
DROP POLICY IF EXISTS "Team members can delete line layouts" ON public.line_layouts;
CREATE POLICY "Editors can insert line layouts" ON public.line_layouts
  FOR INSERT TO authenticated WITH CHECK (public.has_section_access(team_id, 'team', 'edit'));
CREATE POLICY "Editors can update line layouts" ON public.line_layouts
  FOR UPDATE TO authenticated USING (public.has_section_access(team_id, 'team', 'edit'));
CREATE POLICY "Editors can delete line layouts" ON public.line_layouts
  FOR DELETE TO authenticated USING (public.has_section_access(team_id, 'team', 'edit'));

-- Tactics layouts (section: tactics)
DROP POLICY IF EXISTS "Team members can insert tactics layouts" ON public.tactics_layouts;
DROP POLICY IF EXISTS "Team members can update tactics layouts" ON public.tactics_layouts;
DROP POLICY IF EXISTS "Team members can delete tactics layouts" ON public.tactics_layouts;
CREATE POLICY "Editors can insert tactics layouts" ON public.tactics_layouts
  FOR INSERT TO authenticated WITH CHECK (public.has_section_access(team_id, 'tactics', 'edit'));
CREATE POLICY "Editors can update tactics layouts" ON public.tactics_layouts
  FOR UPDATE TO authenticated USING (public.has_section_access(team_id, 'tactics', 'edit'));
CREATE POLICY "Editors can delete tactics layouts" ON public.tactics_layouts
  FOR DELETE TO authenticated USING (public.has_section_access(team_id, 'tactics', 'edit'));

-- Seasons: season rollover is a head-coach-only action in TeamSettings.tsx already;
-- enforce it server-side too instead of relying on the UI hiding the control.
DROP POLICY IF EXISTS "Team members can insert seasons" ON public.seasons;
DROP POLICY IF EXISTS "Team members can update seasons" ON public.seasons;
DROP POLICY IF EXISTS "Team members can delete seasons" ON public.seasons;
CREATE POLICY "Head coaches can insert seasons" ON public.seasons
  FOR INSERT TO authenticated WITH CHECK (public.is_head_coach(team_id));
CREATE POLICY "Head coaches can update seasons" ON public.seasons
  FOR UPDATE TO authenticated USING (public.is_head_coach(team_id));
CREATE POLICY "Head coaches can delete seasons" ON public.seasons
  FOR DELETE TO authenticated USING (public.is_head_coach(team_id));

-- team_settings itself stores the permissions matrix, so letting any team member update the row
-- was a privilege-escalation path: a viewer/player could rewrite team_settings.permissions to
-- grant themselves edit access everywhere. The row also holds section-specific config
-- (weekly_focus, play_categories, test_types, game_categories, ...) that different roles
-- legitimately edit from their own section, so the UPDATE policy itself stays broad — instead,
-- a trigger blocks changes to the permissions column unless the caller is a head coach.
CREATE OR REPLACE FUNCTION public.protect_team_permissions()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.permissions IS DISTINCT FROM OLD.permissions AND NOT public.is_head_coach(NEW.team_id) THEN
    RAISE EXCEPTION 'Only head coaches can change team permissions';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_team_permissions_trigger ON public.team_settings;
CREATE TRIGGER protect_team_permissions_trigger
  BEFORE UPDATE ON public.team_settings
  FOR EACH ROW EXECUTE FUNCTION public.protect_team_permissions();
