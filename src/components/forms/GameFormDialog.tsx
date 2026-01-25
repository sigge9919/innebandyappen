import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Game } from '@/types';
import { format } from 'date-fns';

interface GameFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  game?: Game | null;
  onSave: (game: Game) => void;
  onDelete?: (id: string) => void;
}

export function GameFormDialog({ open, onOpenChange, game, onSave, onDelete }: GameFormDialogProps) {
  const [formData, setFormData] = useState<Partial<Game>>({
    date: format(new Date(), 'yyyy-MM-dd'),
    opponent: '',
    location: 'Home',
    status: 'Upcoming',
    ourScore: undefined,
    opponentScore: undefined,
    notes: undefined,
  });

  useEffect(() => {
    if (game) {
      setFormData(game);
    } else {
      setFormData({
        date: format(new Date(), 'yyyy-MM-dd'),
        opponent: '',
        location: 'Home',
        status: 'Upcoming',
        ourScore: undefined,
        opponentScore: undefined,
        notes: undefined,
      });
    }
  }, [game, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newGame: Game = {
      id: game?.id || crypto.randomUUID(),
      date: formData.date || format(new Date(), 'yyyy-MM-dd'),
      opponent: formData.opponent || '',
      location: formData.location as Game['location'],
      status: formData.status as Game['status'],
      ourScore: formData.status === 'Played' ? formData.ourScore : undefined,
      opponentScore: formData.status === 'Played' ? formData.opponentScore : undefined,
      notes: formData.status === 'Played' ? formData.notes : undefined,
    };
    onSave(newGame);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{game ? 'Edit Game' : 'Add Game'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="opponent">Opponent</Label>
              <Input
                id="opponent"
                value={formData.opponent}
                onChange={(e) => setFormData({ ...formData, opponent: e.target.value })}
                placeholder="Opponent team name"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Select
                  value={formData.location}
                  onValueChange={(value) => setFormData({ ...formData, location: value as Game['location'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Home">Home</SelectItem>
                    <SelectItem value="Away">Away</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as Game['status'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Upcoming">Upcoming</SelectItem>
                  <SelectItem value="Played">Played</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.status === 'Played' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="ourScore">Our Score</Label>
                    <Input
                      id="ourScore"
                      type="number"
                      min="0"
                      value={formData.ourScore ?? ''}
                      onChange={(e) => setFormData({ ...formData, ourScore: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="opponentScore">Opponent Score</Label>
                    <Input
                      id="opponentScore"
                      type="number"
                      min="0"
                      value={formData.opponentScore ?? ''}
                      onChange={(e) => setFormData({ ...formData, opponentScore: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="whatWorked">What Worked</Label>
                  <Textarea
                    id="whatWorked"
                    value={formData.notes?.whatWorked || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      notes: { ...formData.notes, whatWorked: e.target.value, whatDidnt: formData.notes?.whatDidnt || '', focusNextWeek: formData.notes?.focusNextWeek || '' }
                    })}
                    rows={2}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="whatDidnt">What Didn't Work</Label>
                  <Textarea
                    id="whatDidnt"
                    value={formData.notes?.whatDidnt || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      notes: { ...formData.notes, whatDidnt: e.target.value, whatWorked: formData.notes?.whatWorked || '', focusNextWeek: formData.notes?.focusNextWeek || '' }
                    })}
                    rows={2}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="focusNextWeek">Focus Next Week</Label>
                  <Textarea
                    id="focusNextWeek"
                    value={formData.notes?.focusNextWeek || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      notes: { ...formData.notes, focusNextWeek: e.target.value, whatWorked: formData.notes?.whatWorked || '', whatDidnt: formData.notes?.whatDidnt || '' }
                    })}
                    rows={2}
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter className="gap-2">
            {game && onDelete && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  onDelete(game.id);
                  onOpenChange(false);
                }}
              >
                Delete
              </Button>
            )}
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {game ? 'Save Changes' : 'Add Game'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
