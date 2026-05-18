import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { EnhancedGame } from '@/types/game';

interface GameFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  games: EnhancedGame[];
  selectedIds: string[];
  onConfirm: (ids: string[]) => void;
}

export function GameFilterDialog({ open, onOpenChange, games, selectedIds, onConfirm }: GameFilterDialogProps) {
  const [draft, setDraft] = useState<string[]>(selectedIds);

  useEffect(() => {
    if (open) setDraft(selectedIds);
  }, [open, selectedIds]);

  const sorted = [...games].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const allSelected = draft.length === sorted.length && sorted.length > 0;

  const toggle = (id: string) => {
    setDraft(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    setDraft(allSelected ? [] : sorted.map(g => g.id));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Välj matcher</DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-between border-b pb-2">
          <span className="text-sm text-muted-foreground">{draft.length} av {sorted.length} valda</span>
          <Button variant="ghost" size="sm" onClick={toggleAll}>
            {allSelected ? 'Avmarkera alla' : 'Markera alla'}
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
                </div>
              </label>
            );
          })}
          {sorted.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">Inga avslutade matcher</p>
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