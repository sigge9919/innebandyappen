import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createEnhancedGame, EnhancedGame } from '@/types/game';
import { format } from 'date-fns';
import { GameCategoryPicker } from './GameCategoryPicker';
import { Label as L } from '@/components/ui/label';

interface NewGameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (game: EnhancedGame) => void;
}

export function NewGameDialog({ open, onOpenChange, onSave }: NewGameDialogProps) {
  const [opponent, setOpponent] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [location, setLocation] = useState<'Home' | 'Away'>('Home');
  const [categories, setCategories] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!opponent.trim()) return;
    
    const game = createEnhancedGame(opponent.trim(), date, location);
    game.categories = categories;
    onSave(game);
    
    setOpponent('');
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setLocation('Home');
    setCategories([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Ny match</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="opponent">Motståndare</Label>
            <Input
              id="opponent"
              value={opponent}
              onChange={(e) => setOpponent(e.target.value)}
              placeholder="Ange motståndarlagets namn"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Datum</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Plats</Label>
              <Select value={location} onValueChange={(v) => setLocation(v as 'Home' | 'Away')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Home">Hemma</SelectItem>
                  <SelectItem value="Away">Borta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <L>Kategorier</L>
            <GameCategoryPicker value={categories} onChange={setCategories} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Avbryt
            </Button>
            <Button type="submit">Skapa match</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
