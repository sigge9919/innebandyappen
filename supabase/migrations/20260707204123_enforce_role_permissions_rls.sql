-- NOTE: this file originally targeted a schema this repo's migration history implied
-- (is_team_member()/is_head_coach() helpers, a team_role enum, per-section permission
-- policies named "Team members can ..."). That schema does not match what's actually
-- deployed — the live database uses a `member_role` enum, is_coach()/my_team_ids()
-- helpers, and Swedish-named policies. It never successfully ran (it errored on its
-- first statement), so it's rewritten here against the real, live schema — confirmed
-- directly via pg_policies/pg_proc — instead.
--
-- Two real gaps found in the live policies:
--
-- 1. team_members: "Coaches hanterar medlemmar" gates ALL commands on is_coach(team_id),
--    which is true for head_coach, assistant_coach, AND stats_coach alike. Any of the
--    three coach roles can currently run
--      UPDATE team_members SET role = 'head_coach' WHERE user_id = auth.uid()
--    to self-promote, or DELETE another coach's (including the real head coach's)
--    membership row outright. Restrict writes on team_members to the head coach only —
--    this matches what the UI already assumes (TeamSettings.tsx only shows the invite
--    and remove-member controls when the caller is head_coach).
--
-- 2. tactics_layouts: unlike every other table (including its sibling line_layouts),
--    its INSERT/UPDATE/DELETE policies only check team membership, not is_coach(). A
--    viewer or player can currently create, edit, or delete tactics board layouts.
--    Bring it in line with line_layouts' existing coach-only write policies.

CREATE OR REPLACE FUNCTION public.is_head_coach(tid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
  select exists (
    select 1 from team_members
    where user_id = auth.uid()
      and team_id = tid
      and role = 'head_coach'
  )
$function$;

-- 1. team_members: head-coach-only writes (reads stay open via the existing
--    "Se lagmedlemmar" policy, untouched).
DROP POLICY IF EXISTS "Coaches hanterar medlemmar" ON public.team_members;
CREATE POLICY "Huvudtränare hanterar medlemmar" ON public.team_members
  FOR ALL TO authenticated
  USING (public.is_head_coach(team_id))
  WITH CHECK (public.is_head_coach(team_id));

-- 2. tactics_layouts: coach-only writes, matching line_layouts (reads stay open via
--    the existing "Lagmedlemmar kan se taktiklayouter" policy, untouched).
DROP POLICY IF EXISTS "Lagmedlemmar kan skapa taktiklayouter" ON public.tactics_layouts;
DROP POLICY IF EXISTS "Lagmedlemmar kan ändra taktiklayouter" ON public.tactics_layouts;
DROP POLICY IF EXISTS "Lagmedlemmar kan ta bort taktiklayouter" ON public.tactics_layouts;

CREATE POLICY "Coaches kan skapa taktiklayouter" ON public.tactics_layouts
  FOR INSERT TO authenticated
  WITH CHECK (public.is_coach(team_id));

CREATE POLICY "Coaches kan ändra taktiklayouter" ON public.tactics_layouts
  FOR UPDATE TO authenticated
  USING (public.is_coach(team_id));

CREATE POLICY "Coaches kan ta bort taktiklayouter" ON public.tactics_layouts
  FOR DELETE TO authenticated
  USING (public.is_coach(team_id));
