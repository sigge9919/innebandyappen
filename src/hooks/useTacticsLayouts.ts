import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Player markers come in two shapes across the app (canvas uses 'opponent',
// renderer uses 'away'). Keep this open and let consumers narrow.
export type TacticsPlayerMarker = {
  id: string;
  x: number;
  y: number;
  number?: number | string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [k: string]: any;
};

export type TacticsKeyframe = {
  id: string;
  timestamp: number;
  players: TacticsPlayerMarker[];
  drawingData?: string;
  curveControlPoints?: { [playerId: string]: { x: number; y: number } };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [k: string]: any;
};

export interface TacticsZone {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TacticsLayoutRecord {
  id: string;
  name: string;
  players: TacticsPlayerMarker[];
  drawingData: string;
  homePlayerCount: number;
  opponentPlayerCount: number;
  keyframes?: TacticsKeyframe[];
  isAnimation?: boolean;
  zones?: TacticsZone[];
  canvasWidth?: number;
  canvasHeight?: number;
  createdAt: string;
}

function fromRow(row: any): TacticsLayoutRecord {
  return {
    id: row.id,
    name: row.name,
    players: (row.players as TacticsPlayerMarker[]) || [],
    drawingData: row.drawing_data || '',
    homePlayerCount: row.home_player_count ?? 0,
    opponentPlayerCount: row.opponent_player_count ?? 0,
    keyframes: Array.isArray(row.keyframes) && row.keyframes.length > 0 ? (row.keyframes as TacticsKeyframe[]) : undefined,
    isAnimation: !!row.is_animation,
    zones: Array.isArray(row.zones) && row.zones.length > 0 ? (row.zones as TacticsZone[]) : undefined,
    canvasWidth: row.canvas_width ?? undefined,
    canvasHeight: row.canvas_height ?? undefined,
    createdAt: row.created_at,
  };
}

export function useTacticsLayouts(teamId: string | null | undefined) {
  const { user } = useAuth();
  const [layouts, setLayouts] = useState<TacticsLayoutRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const refresh = useCallback(async () => {
    if (!teamId) {
      setLayouts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('tactics_layouts')
      .select('*')
      .eq('team_id', teamId)
      .order('created_at', { ascending: false });
    if (!error && data) {
      setLayouts(data.map(fromRow));
    }
    setLoading(false);
  }, [teamId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = useCallback(async (
    layout: Omit<TacticsLayoutRecord, 'id' | 'createdAt'>
  ): Promise<{ data: TacticsLayoutRecord | null; error: Error | null }> => {
    if (!teamId) return { data: null, error: new Error('No active team') };
    const { data, error } = await supabase
      .from('tactics_layouts')
      .insert({
        team_id: teamId,
        name: layout.name,
        players: layout.players as any,
        drawing_data: layout.drawingData,
        keyframes: (layout.keyframes || []) as any,
        zones: (layout.zones || []) as any,
        home_player_count: layout.homePlayerCount,
        opponent_player_count: layout.opponentPlayerCount,
        is_animation: !!layout.isAnimation,
        canvas_width: layout.canvasWidth ?? null,
        canvas_height: layout.canvasHeight ?? null,
        created_by: user?.id ?? null,
      })
      .select()
      .single();
    if (error || !data) return { data: null, error: error as Error };
    const record = fromRow(data);
    setLayouts(prev => [record, ...prev]);
    return { data: record, error: null };
  }, [teamId, user]);

  const remove = useCallback(async (layoutId: string) => {
    const { error } = await supabase
      .from('tactics_layouts')
      .delete()
      .eq('id', layoutId);
    if (!error) setLayouts(prev => prev.filter(l => l.id !== layoutId));
    return { error };
  }, []);

  const getById = useCallback((id: string) => layouts.find(l => l.id === id) || null, [layouts]);

  return { layouts, loading, refresh, create, remove, getById };
}

// Fetch a single layout regardless of cache (e.g. for fullscreen/preview)
export async function fetchTacticsLayoutById(layoutId: string): Promise<TacticsLayoutRecord | null> {
  const { data, error } = await supabase
    .from('tactics_layouts')
    .select('*')
    .eq('id', layoutId)
    .maybeSingle();
  if (error || !data) return null;
  return fromRow(data);
}