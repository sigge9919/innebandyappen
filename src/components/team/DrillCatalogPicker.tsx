import { useState, useMemo } from 'react';
import { DEFAULT_DRILLS, DRILL_GROUPS, DefaultDrill } from '@/lib/defaultDrills';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Search, ChevronDown, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DrillCatalogPickerProps {
  teamId: string;
  onComplete: () => void;
}

export function DrillCatalogPicker({ teamId, onComplete }: DrillCatalogPickerProps) {
  const { toast } = useToast();
  const [selected, setSelected] = useState<Set<number>>(new Set(DEFAULT_DRILLS.map((_, i) => i)));
  const [search, setSearch] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(DRILL_GROUPS));
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim()) return DEFAULT_DRILLS.map((d, i) => ({ ...d, idx: i }));
    const q = search.toLowerCase();
    return DEFAULT_DRILLS.map((d, i) => ({ ...d, idx: i })).filter(
      d => d.name.toLowerCase().includes(q) || d.description.toLowerCase().includes(q) || d.group.toLowerCase().includes(q)
    );
  }, [search]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const d of filtered) {
      const list = map.get(d.group) || [];
      list.push(d);
      map.set(d.group, list);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b, 'sv'));
  }, [filtered]);

  const toggleAll = (checked: boolean) => {
    if (checked) {
      setSelected(new Set(DEFAULT_DRILLS.map((_, i) => i)));
    } else {
      setSelected(new Set());
    }
  };

  const toggleGroup = (group: string, checked: boolean) => {
    const next = new Set(selected);
    const indices = DEFAULT_DRILLS.map((d, i) => ({ d, i })).filter(x => x.d.group === group).map(x => x.i);
    for (const i of indices) {
      if (checked) next.add(i); else next.delete(i);
    }
    setSelected(next);
  };

  const toggleDrill = (idx: number) => {
    const next = new Set(selected);
    if (next.has(idx)) next.delete(idx); else next.add(idx);
    setSelected(next);
  };

  const toggleExpand = (group: string) => {
    const next = new Set(expandedGroups);
    if (next.has(group)) next.delete(group); else next.add(group);
    setExpandedGroups(next);
  };

  const handleImport = async () => {
    if (selected.size === 0) {
      onComplete();
      return;
    }
    setLoading(true);
    const drillsToInsert = [...selected].map(i => {
      const d = DEFAULT_DRILLS[i];
      return {
        team_id: teamId,
        name: d.name,
        description: d.description,
        categories: ['Övningsbanken'],
        video_url: d.video_url,
      };
    });

    // Insert in batches of 50
    for (let i = 0; i < drillsToInsert.length; i += 50) {
      const batch = drillsToInsert.slice(i, i + 50);
      const { error } = await supabase.from('drills').insert(batch);
      if (error) {
        toast({ title: 'Fel', description: error.message, variant: 'destructive' });
        setLoading(false);
        return;
      }
    }

    toast({ title: 'Klart!', description: `${selected.size} övningar importerade` });
    onComplete();
  };

  const allSelected = selected.size === DEFAULT_DRILLS.length;

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Välj övningar från Övningsbanken</CardTitle>
        <CardDescription>
          Välj vilka övningar du vill importera till ditt lag ({selected.size} av {DEFAULT_DRILLS.length} valda)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search & bulk actions */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Sök övningar..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => toggleAll(true)} disabled={allSelected}>
            Välj alla
          </Button>
          <Button variant="outline" size="sm" onClick={() => toggleAll(false)} disabled={selected.size === 0}>
            Avmarkera alla
          </Button>
        </div>

        {/* Grouped drill list */}
        <div className="max-h-[400px] overflow-y-auto space-y-1 border rounded-md p-2">
          {grouped.map(([group, drills]) => {
            const groupIndices = drills.map(d => d.idx);
            const allGroupSelected = groupIndices.every(i => selected.has(i));
            const someGroupSelected = groupIndices.some(i => selected.has(i));
            const expanded = expandedGroups.has(group);

            return (
              <div key={group}>
                <div
                  className="flex items-center gap-2 py-2 px-1 cursor-pointer hover:bg-muted/50 rounded"
                  onClick={() => toggleExpand(group)}
                >
                  {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  <Checkbox
                    checked={allGroupSelected}
                    ref={el => {
                      if (el) (el as HTMLButtonElement).dataset.state = someGroupSelected && !allGroupSelected ? 'indeterminate' : allGroupSelected ? 'checked' : 'unchecked';
                    }}
                    onCheckedChange={(checked) => {
                      toggleGroup(group, !!checked);
                    }}
                    onClick={e => e.stopPropagation()}
                  />
                  <span className="font-medium text-sm">{group}</span>
                  <Badge variant="secondary" className="ml-auto text-xs">{drills.length}</Badge>
                </div>

                {expanded && (
                  <div className="ml-8 space-y-0.5">
                    {drills.map(drill => (
                      <label
                        key={drill.idx}
                        className="flex items-start gap-2 py-1.5 px-1 cursor-pointer hover:bg-muted/30 rounded"
                      >
                        <Checkbox
                          checked={selected.has(drill.idx)}
                          onCheckedChange={() => toggleDrill(drill.idx)}
                          className="mt-0.5"
                        />
                        <div className="min-w-0">
                          <div className="text-sm font-medium leading-tight">{drill.name}</div>
                          <div className="text-xs text-muted-foreground line-clamp-1">{drill.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button className="flex-1" onClick={handleImport} disabled={loading}>
            {loading ? 'Importerar…' : `Importera valda (${selected.size} st)`}
          </Button>
          <Button variant="ghost" onClick={onComplete} disabled={loading}>
            Hoppa över
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
