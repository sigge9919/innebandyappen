import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

export type TeamRole = 'head_coach' | 'assistant_coach' | 'stats_coach' | 'viewer' | 'player';

export interface Team {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string | null;
  invite_email: string | null;
  role: TeamRole;
  created_at: string;
}

interface TeamContextValue {
  teams: Team[];
  activeTeam: Team | null;
  activeRole: TeamRole | null;
  members: TeamMember[];
  loading: boolean;
  setActiveTeam: (team: Team) => void;
  createTeam: (name: string) => Promise<{ error: Error | null }>;
  inviteCoach: (email: string, role: TeamRole) => Promise<{ error: Error | null }>;
  removeMember: (memberId: string) => Promise<{ error: Error | null }>;
  refreshTeams: () => Promise<void>;
  refreshMembers: () => Promise<void>;
}

const TeamContext = createContext<TeamContextValue | undefined>(undefined);

export function TeamProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [activeTeam, setActiveTeamState] = useState<Team | null>(null);
  const [activeRole, setActiveRole] = useState<TeamRole | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshTeams = useCallback(async () => {
    if (!user) { setTeams([]); setLoading(false); return; }
    const { data } = await supabase.from('teams').select('*');
    const teamList = (data ?? []) as Team[];
    setTeams(teamList);

    // Auto-select logic
    const storedId = localStorage.getItem('coachOS_activeTeamId');
    const stored = teamList.find(t => t.id === storedId);
    if (stored) {
      setActiveTeamState(stored);
    } else if (teamList.length === 1) {
      setActiveTeamState(teamList[0]);
      localStorage.setItem('coachOS_activeTeamId', teamList[0].id);
    } else {
      setActiveTeamState(null);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refreshTeams();
  }, [refreshTeams]);

  // Load role & members when active team changes
  const refreshMembers = useCallback(async () => {
    if (!activeTeam) { setMembers([]); setActiveRole(null); return; }
    const { data } = await supabase.from('team_members').select('*').eq('team_id', activeTeam.id);
    const memberList = (data ?? []) as TeamMember[];
    setMembers(memberList);
    const me = memberList.find(m => m.user_id === user?.id);
    setActiveRole(me?.role ?? null);
  }, [activeTeam, user]);

  useEffect(() => {
    refreshMembers();
  }, [refreshMembers]);

  const setActiveTeam = (team: Team) => {
    setActiveTeamState(team);
    localStorage.setItem('coachOS_activeTeamId', team.id);
  };

  const createTeam = async (name: string) => {
    if (!user) return { error: new Error('Not authenticated') };
    const { data: teamId, error } = await supabase.rpc('create_team', { _name: name });
    if (error) return { error: error as unknown as Error };

    await refreshTeams();
    // Auto-select the newly created team
    const { data: newTeam } = await supabase.from('teams').select('*').eq('id', teamId).single();
    if (newTeam) setActiveTeam(newTeam as Team);
    return { error: null };
  };

  const inviteCoach = async (email: string, role: TeamRole) => {
    if (!activeTeam) return { error: new Error('No active team') };
    const { error } = await supabase.from('team_members').insert({
      team_id: activeTeam.id,
      invite_email: email.toLowerCase(),
      role,
    });
    if (error) return { error: error as unknown as Error };
    await refreshMembers();
    return { error: null };
  };

  const removeMember = async (memberId: string) => {
    const { error } = await supabase.from('team_members').delete().eq('id', memberId);
    if (error) return { error: error as unknown as Error };
    await refreshMembers();
    return { error: null };
  };

  return (
    <TeamContext.Provider value={{
      teams, activeTeam, activeRole, members, loading,
      setActiveTeam, createTeam, inviteCoach, removeMember, refreshTeams, refreshMembers,
    }}>
      {children}
    </TeamContext.Provider>
  );
}

export function useTeam() {
  const ctx = useContext(TeamContext);
  if (!ctx) throw new Error('useTeam must be used within TeamProvider');
  return ctx;
}
