import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { EnhancedGame } from '@/types/game';
import { useGameCategories } from '@/hooks/useLocalStorage';
import { Tag } from 'lucide-react';

interface GameFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  games: EnhancedGame[];
  selectedIds: string[];
  onConfirm: (ids: string[]) => void;
}

export function GameFilterDialog({ open, onOpenChange, games, selectedIds, onConfirm }: GameFilterDialogProps) {
  const [draft, setDraft] = useState<string[]>(selectedIds);
  const [catFilter, setCatFilter] = useState<string[]>([]);
  const { categories: teamCategories } = useGameCategories();

  useEffect(() => {
    if (open) {
      setDraft(selectedIds);
      setCatFilter([]);
    }
  }, [open, selectedIds]);

  const allCategories = useMemo(() => {
    const set = new Set<string>(teamCategories || []);
    games.forEach(g => (g.categories || []).forEach(c => set.add(c)));
    return Array.from(set).sort();
  }, [teamCategories, games]);

  const sorted = useMemo(() => {
    const base = [...games].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (catFilter.length === 0) return base;
    return base.filter(g => (g.categories || []).some(c => catFilter.includes(c)));
  }, [games, catFilter]);

  const visibleIds = sorted.map(g => g.id);
  const allSelected = visibleIds.length > 0 && visibleIds.every(id => draft.includes(id));

  const toggleCat = (c: string) => {
    setCatFilter(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  };

  const toggle = (id: string) => {
    setDraft(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    if (allSelected) {
      setDraft(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      setDraft(prev => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Välj matcher</DialogTitle>
        </DialogHeader>

        {allCategories.length > 0 && (
          <div className="space-y-1.5 border-b pb-2">
            <div className="text-xs text-muted-foreground">Filtrera på kategori</div>
            <div className="flex flex-wrap gap-1.5">
              {allCategories.map(c => {
                const active = catFilter.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleCat(c)}
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs transition-colors ${
                      active
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background hover:bg-muted border-border'
                    }`}
                  >
                    <Tag className="h-3 w-3" />
                    {c}
                  </button>
                );
              })}
              {catFilter.length > 0 && (
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => setCatFilter([])}>
                  Rensa
                </Button>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between border-b pb-2">
          <span className="text-sm text-muted-foreground">
            {draft.length} valda · visar {sorted.length}
          </span>
          <Button variant="ghost" size="sm" onClick={toggleAll}>
            {allSelected ? 'Avmarkera synliga' : 'Markera synliga'}
          </Button>
        </div>

        <div className="max-h-[50vh] overflow-y-auto space-y-1">
          {sorted.map(g => {
            const checked = draft.includes(g.id);
            return (
              <label
                key={g.id}
                className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer"
              >
                <Checkbox checked={checked} onCheckedChange={() => toggle(g.id)} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {g.location === 'Home' ? 'vs' : '@'} {g.opponent}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {g.date} · {g.ourScore}–{g.opponentScore}
                  </div>
                  {(g.categories?.length ?? 0) > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {g.categories!.map(c => (
                        <Badge key={c} variant="outline" className="text-[10px] px-1.5 py-0">{c}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              </label>
            );
          })}
          {sorted.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">
              {catFilter.length > 0 ? 'Inga matcher matchar filtret' : 'Inga avslutade matcher'}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Avbryt</Button>
          <Button onClick={() => { onConfirm(draft); onOpenChange(false); }}>Använd urval</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}