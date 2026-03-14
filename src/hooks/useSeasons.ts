import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTeam } from '@/contexts/TeamContext';

export interface Season {
  id: string;
  teamId: string;
  name: string;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
}

function dbToSeason(row: any): Season {
  return {
    id: row.id,
    teamId: row.team_id,
    name: row.name,
    isActive: row.is_active,
    startDate: row.start_date,
    endDate: row.end_date,
    createdAt: row.created_at,
  };
}

export function useSeasons() {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [activeSeason, setActiveSeason] = useState<Season | null>(null);
  const [selectedSeasonId, setSelectedSeasonId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { activeTeam } = useTeam();

  const refresh = useCallback(async () => {
    if (!activeTeam) { setSeasons([]); setActiveSeason(null); setLoading(false); return; }
    const { data } = await supabase
      .from('seasons')
      .select('*')
      .eq('team_id', activeTeam.id)
      .order('created_at', { ascending: false });
    const list = (data ?? []).map(dbToSeason);
    setSeasons(list);
    const active = list.find(s => s.isActive) ?? list[0] ?? null;
    setActiveSeason(active);
    if (!selectedSeasonId || !list.find(s => s.id === selectedSeasonId)) {
      setSelectedSeasonId(active?.id ?? null);
    }
    setLoading(false);
  }, [activeTeam]);

  useEffect(() => { refresh(); }, [refresh]);

  const startNewSeason = useCallback(async (name: string, startDate?: string) => {
    if (!activeTeam) return { error: new Error('No active team') };
    // Deactivate all existing seasons
    await supabase
      .from('seasons')
      .update({ is_active: false, end_date: new Date().toISOString().slice(0, 10) })
      .eq('team_id', activeTeam.id)
      .eq('is_active', true);
    // Create new active season
    const { error } = await supabase.from('seasons').insert({
      team_id: activeTeam.id,
      name,
      is_active: true,
      start_date: startDate || new Date().toISOString().slice(0, 10),
    });
    if (error) return { error: error as unknown as Error };
    await refresh();
    return { error: null };
  }, [activeTeam, refresh]);

  const selectedSeason = seasons.find(s => s.id === selectedSeasonId) ?? activeSeason;

  return {
    seasons,
    activeSeason,
    selectedSeason,
    selectedSeasonId,
    setSelectedSeasonId,
    startNewSeason,
    loading,
    refresh,
  };
}
