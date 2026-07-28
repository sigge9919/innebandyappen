import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTeam } from '@/contexts/TeamContext';

export interface TrainingSegment {
  id: string;
  name: string;
  sortOrder: number;
  isDefault: boolean;
}

const DEFAULT_DURATIONS = [15, 40, 25, 10];

export function defaultDurationForIndex(index: number) {
  return DEFAULT_DURATIONS[index] ?? 15;
}

export function useTrainingSegments() {
  const { activeTeam } = useTeam();
  const [segments, setSegments] = useState<TrainingSegment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!activeTeam) { setSegments([]); setIsLoading(false); return; }
    const { data } = await supabase
      .from('training_segments')
      .select('*')
      .eq('team_id', activeTeam.id)
      .order('sort_order', { ascending: true });
    setSegments((data ?? []).map((r: any) => ({
      id: r.id,
      name: r.name,
      sortOrder: r.sort_order,
      isDefault: r.is_default,
    })));
    setIsLoading(false);
  }, [activeTeam]);

  useEffect(() => { refresh(); }, [refresh]);

  const persistOrder = useCallback(async (ordered: TrainingSegment[]) => {
    await Promise.all(ordered.map((s, i) =>
      supabase.from('training_segments').update({ sort_order: i }).eq('id', s.id)
    ));
    await refresh();
  }, [refresh]);

  const addSegment = useCallback(async (name: string, position?: number) => {
    if (!activeTeam) return;
    const insertAt = position === undefined || position < 0 || position > segments.length
      ? segments.length
      : position;
    const { data, error } = await supabase
      .from('training_segments')
      .insert({ team_id: activeTeam.id, name, sort_order: insertAt })
      .select()
      .single();
    if (error || !data) return;
    const created: TrainingSegment = { id: data.id, name: data.name, sortOrder: insertAt, isDefault: false };
    const next = [...segments];
    next.splice(insertAt, 0, created);
    await persistOrder(next);
  }, [activeTeam, segments, persistOrder]);

  const renameSegment = useCallback(async (id: string, name: string) => {
    await supabase.from('training_segments').update({ name }).eq('id', id);
    await refresh();
  }, [refresh]);

  const deleteSegment = useCallback(async (id: string) => {
    await supabase.from('training_segments').delete().eq('id', id);
    const next = segments.filter(s => s.id !== id);
    await persistOrder(next);
  }, [segments, persistOrder]);

  const moveSegment = useCallback(async (id: string, direction: -1 | 1) => {
    const index = segments.findIndex(s => s.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= segments.length) return;
    const next = [...segments];
    [next[index], next[target]] = [next[target], next[index]];
    setSegments(next.map((s, i) => ({ ...s, sortOrder: i })));
    await persistOrder(next);
  }, [segments, persistOrder]);

  /** Returns the number of training sessions that use the given segment. */
  const countUsage = useCallback(async (id: string) => {
    if (!activeTeam) return 0;
    const { data } = await supabase
      .from('training_sessions')
      .select('sections')
      .eq('team_id', activeTeam.id);
    return (data ?? []).filter((row: any) =>
      Array.isArray(row.sections) && row.sections.some((s: any) => s?.segmentId === id)
    ).length;
  }, [activeTeam]);

  return { segments, isLoading, refresh, addSegment, renameSegment, deleteSegment, moveSegment, countUsage };
}
