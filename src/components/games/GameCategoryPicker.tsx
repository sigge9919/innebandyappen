import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { useGameCategories } from '@/hooks/useLocalStorage';
import { Plus, X, Tag } from 'lucide-react';

interface Props {
  value: string[];
  onChange: (next: string[]) => void;
}

export function GameCategoryPicker({ value, onChange }: Props) {
  const { categories, addCategory } = useGameCategories();
  const [open, setOpen] = useState(false);
  const [newCat, setNewCat] = useState('');

  // Merge: lag-fördefinierade + befintliga på matchen (för bakåtkomp)
  const all = Array.from(new Set([...(categories || []), ...(value || [])]));

  const toggle = (c: string) => {
    onChange(value.includes(c) ? value.filter(x => x !== c) : [...value, c]);
  };

  const handleAdd = async () => {
    const t = newCat.trim();
    if (!t) return;
    await addCategory(t);
    if (!value.includes(t)) onChange([...value, t]);
    setNewCat('');
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5 items-center">
        {value.length === 0 && (
          <span className="text-xs text-muted-foreground">Inga kategorier</span>
        )}
        {value.map(c => (
          <Badge key={c} variant="secondary" className="gap-1 pr-1">
            <Tag className="h-3 w-3" />
            <span>{c}</span>
            <button
              type="button"
              onClick={() => toggle(c)}
              className="hover:bg-muted-foreground/20 rounded-sm p-0.5"
              aria-label={`Ta bort ${c}`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline" size="sm" className="gap-1 h-7">
              <Plus className="h-3 w-3" />
              Lägg till
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3 space-y-2" align="start">
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {all.length === 0 && (
                <p className="text-xs text-muted-foreground">Inga kategorier ännu</p>
              )}
              {all.map(c => (
                <label key={c} className="flex items-center gap-2 p-1 rounded hover:bg-muted/50 cursor-pointer">
                  <Checkbox checked={value.includes(c)} onCheckedChange={() => toggle(c)} />
                  <span className="text-sm">{c}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-1 pt-2 border-t">
              <Input
                value={newCat}
                onChange={(e) => setNewCat(e.target.value)}
                placeholder="Ny kategori"
                className="h-8 text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); handleAdd(); }
                }}
              />
              <Button type="button" size="sm" onClick={handleAdd} disabled={!newCat.trim()}>
                Lägg till
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}