import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTeam, TeamRole } from '@/contexts/TeamContext';

export type AccessLevel = 'none' | 'view' | 'edit';

export type AppSection =
  | 'team'
  | 'games'
  | 'stats'
  | 'training'
  | 'playbook'
  | 'development'
  | 'tactics';

export const APP_SECTIONS: { key: AppSection; label: string }[] = [
  { key: 'team', label: 'Lag' },
  { key: 'games', label: 'Matcher' },
  { key: 'stats', label: 'Statistik' },
  { key: 'training', label: 'Träning' },
  { key: 'playbook', label: 'Spelbok' },
  { key: 'development', label: 'Utveckling' },
  { key: 'tactics', label: 'Taktiktavla' },
];

export const CONFIGURABLE_ROLES: { key: TeamRole; label: string }[] = [
  { key: 'assistant_coach', label: 'Assisterande tränare' },
  { key: 'stats_coach', label: 'Statistikansvarig' },
  { key: 'viewer', label: 'Åskådare' },
  { key: 'player', label: 'Spelare' },
];

export type PermissionsMap = Record<string, Record<string, AccessLevel>>;

const DEFAULT_PERMISSIONS: PermissionsMap = {
  assistant_coach: {
    team: 'edit',
    games: 'edit',
    stats: 'view',
    training: 'edit',
    playbook: 'edit',
    development: 'edit',
    tactics: 'edit',
  },
  stats_coach: {
    team: 'view',
    games: 'edit',
    stats: 'edit',
    training: 'view',
    playbook: 'view',
    development: 'view',
    tactics: 'view',
  },
  viewer: {
    team: 'view',
    games: 'view',
    stats: 'view',
    training: 'view',
    playbook: 'view',
    development: 'view',
    tactics: 'view',
  },
  player: {
    team: 'none',
    games: 'none',
    stats: 'none',
    training: 'none',
    playbook: 'none',
    development: 'none',
    tactics: 'none',
  },
};

// Map routes to sections
const ROUTE_SECTION_MAP: Record<string, AppSection> = {
  '/team': 'team',
  '/games': 'games',
  '/stats': 'stats',
  '/training': 'training',
  '/playbook': 'playbook',
  '/development': 'development',
  '/tactics': 'tactics',
};

export function routeToSection(path: string): AppSection | null {
  for (const [route, section] of Object.entries(ROUTE_SECTION_MAP)) {
    if (path === route || path.startsWith(route + '/')) return section;
  }
  return null;
}

export function usePermissions() {
  const { activeTeam, activeRole } = useTeam();
  const [permissions, setPermissions] = useState<PermissionsMap>(DEFAULT_PERMISSIONS);
  const [loading, setLoading] = useState(true);

  const fetchPermissions = useCallback(async () => {
    if (!activeTeam) { setLoading(false); return; }
    const { data } = await supabase
      .from('team_settings')
      .select('permissions')
      .eq('team_id', activeTeam.id)
      .single();

    if (data?.permissions && typeof data.permissions === 'object' && Object.keys(data.permissions as object).length > 0) {
      // Merge with defaults so new sections get defaults
      const stored = data.permissions as PermissionsMap;
      const merged: PermissionsMap = {};
      for (const role of Object.keys(DEFAULT_PERMISSIONS)) {
        merged[role] = { ...DEFAULT_PERMISSIONS[role], ...(stored[role] || {}) };
      }
      setPermissions(merged);
    } else {
      setPermissions(DEFAULT_PERMISSIONS);
    }
    setLoading(false);
  }, [activeTeam]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const savePermissions = async (newPerms: PermissionsMap) => {
    if (!activeTeam) return;
    setPermissions(newPerms);
    await supabase
      .from('team_settings')
      .update({ permissions: newPerms as any })
      .eq('team_id', activeTeam.id);
  };

  const getAccess = (section: AppSection): AccessLevel => {
    if (!activeRole) return 'none';
    if (activeRole === 'head_coach') return 'edit';
    return permissions[activeRole]?.[section] ?? 'none';
  };

  const canView = (section: AppSection): boolean => {
    const access = getAccess(section);
    return access === 'view' || access === 'edit';
  };

  const canEdit = (section: AppSection): boolean => {
    return getAccess(section) === 'edit';
  };

  return {
    permissions,
    loading,
    getAccess,
    canView,
    canEdit,
    savePermissions,
    fetchPermissions,
  };
}
