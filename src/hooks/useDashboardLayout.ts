import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { TeamRole } from '@/contexts/TeamContext';

export type DashboardCardId =
  | 'stats'
  | 'next-training'
  | 'next-game'
  | 'weekly-focus'
  | 'team-rpe'
  | 'last-game'
  | 'rpe-alerts'
  | 'player-alerts';

export interface DashboardCard {
  id: DashboardCardId;
  visible: boolean;
}

export const DASHBOARD_CARD_LABELS: Record<DashboardCardId, string> = {
  'stats': 'Statistikrad',
  'next-training': 'Nästa träning',
  'next-game': 'Nästa match',
  'weekly-focus': 'Veckans fokus',
  'team-rpe': 'Lagets trötthet',
  'last-game': 'Senaste matchen',
  'rpe-alerts': 'Hög trötthet',
  'player-alerts': 'Spelarnotiser',
};

const ALL_IDS: DashboardCardId[] = [
  'stats', 'next-training', 'next-game', 'weekly-focus',
  'team-rpe', 'last-game', 'rpe-alerts', 'player-alerts',
];

export function getDefaultLayout(role: TeamRole | null): DashboardCard[] {
  if (role === 'player') {
    const order: DashboardCardId[] = [
      'team-rpe', 'next-training', 'next-game', 'weekly-focus', 'last-game', 'stats',
    ];
    return ALL_IDS.map(id => ({
      id,
      visible: order.includes(id),
    })).sort((a, b) => {
      const ai = order.indexOf(a.id); const bi = order.indexOf(b.id);
      if (ai === -1 && bi === -1) return 0;
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
  }
  if (role === 'viewer') {
    const order: DashboardCardId[] = [
      'next-game', 'last-game', 'stats', 'next-training', 'weekly-focus',
    ];
    return ALL_IDS.map(id => ({
      id,
      visible: order.includes(id),
    })).sort((a, b) => {
      const ai = order.indexOf(a.id); const bi = order.indexOf(b.id);
      if (ai === -1 && bi === -1) return 0;
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
  }
  // head_coach, assistant_coach, stats_coach (default)
  const order: DashboardCardId[] = [
    'stats', 'next-game', 'next-training', 'weekly-focus',
    'team-rpe', 'last-game', 'rpe-alerts', 'player-alerts',
  ];
  return order.map(id => ({ id, visible: true }));
}

function mergeWithKnownIds(stored: DashboardCard[]): DashboardCard[] {
  const seen = new Set<DashboardCardId>();
  const result: DashboardCard[] = [];
  for (const c of stored) {
    if (ALL_IDS.includes(c.id) && !seen.has(c.id)) {
      result.push({ id: c.id, visible: !!c.visible });
      seen.add(c.id);
    }
  }
  // Append any new cards not in stored as hidden so user can opt-in
  for (const id of ALL_IDS) {
    if (!seen.has(id)) result.push({ id, visible: false });
  }
  return result;
}

export function useDashboardLayout(teamId: string | null, role: TeamRole | null) {
  const { user } = useAuth();
  const [layout, setLayoutState] = useState<DashboardCard[]>(() => getDefaultLayout(role));
  const [persisted, setPersisted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!user || !teamId) {
        setLayoutState(getDefaultLayout(role));
        setPersisted(false);
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data, error } = await supabase
        .from('user_dashboard_preferences')
        .select('layout')
        .eq('user_id', user.id)
        .eq('team_id', teamId)
        .maybeSingle();
      if (cancelled) return;
      if (!error && data?.layout && Array.isArray(data.layout)) {
        setLayoutState(mergeWithKnownIds(data.layout as unknown as DashboardCard[]));
        setPersisted(true);
      } else {
        setLayoutState(getDefaultLayout(role));
        setPersisted(false);
      }
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [user, teamId, role]);

  const save = useCallback(async (next: DashboardCard[]) => {
    if (!user || !teamId) return { error: new Error('Not ready') };
    const { error } = await supabase
      .from('user_dashboard_preferences')
      .upsert(
        { user_id: user.id, team_id: teamId, layout: next as unknown as object },
        { onConflict: 'user_id,team_id' }
      );
    if (!error) {
      setLayoutState(next);
      setPersisted(true);
    }
    return { error };
  }, [user, teamId]);

  const resetToRoleDefault = useCallback(async () => {
    const def = getDefaultLayout(role);
    if (!user || !teamId) {
      setLayoutState(def);
      return { error: null as Error | null };
    }
    const { error } = await supabase
      .from('user_dashboard_preferences')
      .delete()
      .eq('user_id', user.id)
      .eq('team_id', teamId);
    setLayoutState(def);
    setPersisted(false);
    return { error };
  }, [user, teamId, role]);

  const visibleIds = useMemo(
    () => layout.filter(c => c.visible).map(c => c.id),
    [layout]
  );

  return { layout, setLayout: setLayoutState, save, resetToRoleDefault, loading, persisted, visibleIds };
}