import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTeam } from '@/contexts/TeamContext';
import { LineLayout, LineLayoutType, LineSlot } from '@/types/lineLayout';

export function useLineLayouts() {
  const { activeTeam } = useTeam();
  const [layouts, setLayouts] = useState<LineLayout[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!activeTeam) {
      setLayouts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('line_layouts')
      .select('*')
      .eq('team_id', activeTeam.id)
      .order('updated_at', { ascending: false });
    if (!error && data) {
      setLayouts(
        data.map((row: any) => ({
          ...row,
          slots: (row.slots ?? []) as LineSlot[],
        })) as LineLayout[]
      );
    }
    setLoading(false);
  }, [activeTeam]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createLayout = useCallback(
    async (name: string, type: LineLayoutType, slots: LineSlot[]) => {
      if (!activeTeam) return { error: new Error('No team') };
      const { data, error } = await supabase
        .from('line_layouts')
        .insert({
          team_id: activeTeam.id,
          name,
          type,
          slots: slots as any,
        })
        .select()
        .single();
      if (!error && data) {
        await refresh();
        return { error: null, layout: data as unknown as LineLayout };
      }
      return { error };
    },
    [activeTeam, refresh]
  );

  const updateLayout = useCallback(
    async (id: string, patch: Partial<Pick<LineLayout, 'name' | 'slots' | 'type'>>) => {
      const { error } = await supabase
        .from('line_layouts')
        .update({ ...patch, updated_at: new Date().toISOString() } as any)
        .eq('id', id);
      if (!error) await refresh();
      return { error };
    },
    [refresh]
  );

  const deleteLayout = useCallback(
    async (id: string) => {
      const { error } = await supabase.from('line_layouts').delete().eq('id', id);
      if (!error) await refresh();
      return { error };
    },
    [refresh]
  );

  return { layouts, loading, refresh, createLayout, updateLayout, deleteLayout };
}