
-- 1. Role enum
CREATE TYPE public.team_role AS ENUM ('head_coach', 'assistant_coach', 'stats_coach', 'viewer');

-- 2. Teams table
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- 3. Team members table (this IS the roles table)
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  invite_email TEXT,
  role team_role NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(team_id, user_id)
);
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- 4. Data tables scoped by team_id
CREATE TABLE public.players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  positions TEXT[] NOT NULL DEFAULT '{}',
  stick_side TEXT NOT NULL DEFAULT 'Left',
  jersey_number INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Active',
  notes TEXT DEFAULT '',
  focus_flag BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  opponent TEXT NOT NULL,
  location TEXT NOT NULL DEFAULT 'Home',
  status TEXT NOT NULL DEFAULT 'Upcoming',
  our_score INT,
  opponent_score INT,
  notes JSONB,
  events JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.training_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  theme TEXT NOT NULL,
  duration INT NOT NULL DEFAULT 60,
  player_ids TEXT[] DEFAULT '{}',
  sections JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.training_sessions ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.drills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  categories TEXT[] DEFAULT '{}',
  video_url TEXT,
  linked_layout_ids TEXT[] DEFAULT '{}',
  media_files JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.drills ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.plays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'System',
  diagram_url TEXT,
  key_points TEXT[] DEFAULT '{}',
  video_url TEXT,
  tags TEXT[] DEFAULT '{}',
  linked_layout_ids TEXT[] DEFAULT '{}',
  media_files JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.plays ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.idps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  goal TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  focus_areas TEXT[] DEFAULT '{}',
  short_term_goals TEXT[] DEFAULT '{}',
  coach_notes TEXT DEFAULT '',
  completed BOOLEAN DEFAULT false,
  last_updated TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.idps ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  test_type TEXT NOT NULL,
  test_name TEXT NOT NULL,
  date TEXT NOT NULL,
  result TEXT NOT NULL,
  previous_result TEXT,
  trend TEXT NOT NULL DEFAULT 'same',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.team_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL UNIQUE REFERENCES public.teams(id) ON DELETE CASCADE,
  weekly_focus TEXT DEFAULT '',
  coach_notes TEXT DEFAULT '',
  play_categories TEXT[] DEFAULT ARRAY['System', 'Set Play', 'Special Teams'],
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.team_settings ENABLE ROW LEVEL SECURITY;

-- 5. Security definer helper functions
CREATE OR REPLACE FUNCTION public.is_team_member(_team_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = _team_id AND user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_head_coach(_team_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = _team_id AND user_id = auth.uid() AND role = 'head_coach'
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_team_role(_team_id UUID)
RETURNS team_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.team_members
  WHERE team_id = _team_id AND user_id = auth.uid()
  LIMIT 1;
$$;

-- 6. Auto-link invited users on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_invite()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.team_members
  SET user_id = NEW.id
  WHERE invite_email = NEW.email AND user_id IS NULL;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_link_invite
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_invite();

-- 7. RLS Policies

-- Teams: members can read their teams, any authenticated user can create
CREATE POLICY "Members can view their teams" ON public.teams
  FOR SELECT TO authenticated USING (public.is_team_member(id));

CREATE POLICY "Authenticated users can create teams" ON public.teams
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Head coaches can update teams" ON public.teams
  FOR UPDATE TO authenticated USING (public.is_head_coach(id));

CREATE POLICY "Head coaches can delete teams" ON public.teams
  FOR DELETE TO authenticated USING (public.is_head_coach(id));

-- Team members: head coaches manage, members can read own membership
CREATE POLICY "Members can view team members" ON public.team_members
  FOR SELECT TO authenticated USING (public.is_team_member(team_id));

CREATE POLICY "Head coaches can insert members" ON public.team_members
  FOR INSERT TO authenticated WITH CHECK (public.is_head_coach(team_id));

CREATE POLICY "Head coaches can update members" ON public.team_members
  FOR UPDATE TO authenticated USING (public.is_head_coach(team_id));

CREATE POLICY "Head coaches can delete members" ON public.team_members
  FOR DELETE TO authenticated USING (public.is_head_coach(team_id));

-- Data tables: team members can CRUD
-- Players
CREATE POLICY "Team members can view players" ON public.players
  FOR SELECT TO authenticated USING (public.is_team_member(team_id));
CREATE POLICY "Team members can insert players" ON public.players
  FOR INSERT TO authenticated WITH CHECK (public.is_team_member(team_id));
CREATE POLICY "Team members can update players" ON public.players
  FOR UPDATE TO authenticated USING (public.is_team_member(team_id));
CREATE POLICY "Team members can delete players" ON public.players
  FOR DELETE TO authenticated USING (public.is_team_member(team_id));

-- Games
CREATE POLICY "Team members can view games" ON public.games
  FOR SELECT TO authenticated USING (public.is_team_member(team_id));
CREATE POLICY "Team members can insert games" ON public.games
  FOR INSERT TO authenticated WITH CHECK (public.is_team_member(team_id));
CREATE POLICY "Team members can update games" ON public.games
  FOR UPDATE TO authenticated USING (public.is_team_member(team_id));
CREATE POLICY "Team members can delete games" ON public.games
  FOR DELETE TO authenticated USING (public.is_team_member(team_id));

-- Training sessions
CREATE POLICY "Team members can view training" ON public.training_sessions
  FOR SELECT TO authenticated USING (public.is_team_member(team_id));
CREATE POLICY "Team members can insert training" ON public.training_sessions
  FOR INSERT TO authenticated WITH CHECK (public.is_team_member(team_id));
CREATE POLICY "Team members can update training" ON public.training_sessions
  FOR UPDATE TO authenticated USING (public.is_team_member(team_id));
CREATE POLICY "Team members can delete training" ON public.training_sessions
  FOR DELETE TO authenticated USING (public.is_team_member(team_id));

-- Drills
CREATE POLICY "Team members can view drills" ON public.drills
  FOR SELECT TO authenticated USING (public.is_team_member(team_id));
CREATE POLICY "Team members can insert drills" ON public.drills
  FOR INSERT TO authenticated WITH CHECK (public.is_team_member(team_id));
CREATE POLICY "Team members can update drills" ON public.drills
  FOR UPDATE TO authenticated USING (public.is_team_member(team_id));
CREATE POLICY "Team members can delete drills" ON public.drills
  FOR DELETE TO authenticated USING (public.is_team_member(team_id));

-- Plays
CREATE POLICY "Team members can view plays" ON public.plays
  FOR SELECT TO authenticated USING (public.is_team_member(team_id));
CREATE POLICY "Team members can insert plays" ON public.plays
  FOR INSERT TO authenticated WITH CHECK (public.is_team_member(team_id));
CREATE POLICY "Team members can update plays" ON public.plays
  FOR UPDATE TO authenticated USING (public.is_team_member(team_id));
CREATE POLICY "Team members can delete plays" ON public.plays
  FOR DELETE TO authenticated USING (public.is_team_member(team_id));

-- IDPs
CREATE POLICY "Team members can view idps" ON public.idps
  FOR SELECT TO authenticated USING (public.is_team_member(team_id));
CREATE POLICY "Team members can insert idps" ON public.idps
  FOR INSERT TO authenticated WITH CHECK (public.is_team_member(team_id));
CREATE POLICY "Team members can update idps" ON public.idps
  FOR UPDATE TO authenticated USING (public.is_team_member(team_id));
CREATE POLICY "Team members can delete idps" ON public.idps
  FOR DELETE TO authenticated USING (public.is_team_member(team_id));

-- Test results
CREATE POLICY "Team members can view test results" ON public.test_results
  FOR SELECT TO authenticated USING (public.is_team_member(team_id));
CREATE POLICY "Team members can insert test results" ON public.test_results
  FOR INSERT TO authenticated WITH CHECK (public.is_team_member(team_id));
CREATE POLICY "Team members can update test results" ON public.test_results
  FOR UPDATE TO authenticated USING (public.is_team_member(team_id));
CREATE POLICY "Team members can delete test results" ON public.test_results
  FOR DELETE TO authenticated USING (public.is_team_member(team_id));

-- Team settings
CREATE POLICY "Team members can view settings" ON public.team_settings
  FOR SELECT TO authenticated USING (public.is_team_member(team_id));
CREATE POLICY "Team members can insert settings" ON public.team_settings
  FOR INSERT TO authenticated WITH CHECK (public.is_team_member(team_id));
CREATE POLICY "Team members can update settings" ON public.team_settings
  FOR UPDATE TO authenticated USING (public.is_team_member(team_id));

-- 8. Special policy: allow team creator to insert themselves as first member
CREATE POLICY "Creator can add self as first member" ON public.team_members
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND role = 'head_coach'
    AND NOT EXISTS (SELECT 1 FROM public.team_members WHERE team_id = team_members.team_id)
  );
