import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Player, PlayerPosition } from '@/types';

const POSITIONS: { value: PlayerPosition; label: string }[] = [
  { value: 'Forward', label: 'Forward' },
  { value: 'Center', label: 'Center' },
  { value: 'Defender', label: 'Defender' },
  { value: 'Goalkeeper', label: 'Goalkeeper' },
];

interface PlayerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  player?: Player | null;
  onSave: (player: Player) => void;
  onDelete?: (id: string) => void;
}

export function PlayerFormDialog({ open, onOpenChange, player, onSave, onDelete }: PlayerFormDialogProps) {
  const [formData, setFormData] = useState<Partial<Player>>({
    name: '',
    positions: ['Forward'],
    stickSide: 'Right',
    jerseyNumber: 1,
    status: 'Active',
    notes: '',
    focusFlag: false,
  });

  useEffect(() => {
    if (player) {
      // Handle migration from old single position to new positions array
      const positions = player.positions || 
        ((player as any).position ? [(player as any).position as PlayerPosition] : ['Forward']);
      setFormData({ ...player, positions });
    } else {
      setFormData({
        name: '',
        positions: ['Forward'],
        stickSide: 'Right',
        jerseyNumber: 1,
        status: 'Active',
        notes: '',
        focusFlag: false,
      });
    }
  }, [player, open]);

  const togglePosition = (position: PlayerPosition) => {
    const currentPositions = formData.positions || [];
    if (currentPositions.includes(position)) {
      // Don't allow removing the last position
      if (currentPositions.length > 1) {
        setFormData({ ...formData, positions: currentPositions.filter(p => p !== position) });
      }
    } else {
      setFormData({ ...formData, positions: [...currentPositions, position] });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPlayer: Player = {
      id: player?.id || crypto.randomUUID(),
      name: formData.name || '',
      positions: formData.positions || ['Forward'],
      stickSide: formData.stickSide as Player['stickSide'],
      jerseyNumber: formData.jerseyNumber || 1,
      status: formData.status as Player['status'],
      notes: formData.notes || '',
      focusFlag: formData.focusFlag || false,
    };
    onSave(newPlayer);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{player ? 'Edit Player' : 'Add Player'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Player name"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="jerseyNumber">Jersey Number</Label>
                <Input
                  id="jerseyNumber"
                  type="number"
                  min="1"
                  max="99"
                  value={formData.jerseyNumber}
                  onChange={(e) => setFormData({ ...formData, jerseyNumber: parseInt(e.target.value) || 1 })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="stickSide">Stick Side</Label>
                <Select
                  value={formData.stickSide}
                  onValueChange={(value) => setFormData({ ...formData, stickSide: value as Player['stickSide'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Left">Left</SelectItem>
                    <SelectItem value="Right">Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Positions</Label>
              <div className="flex flex-wrap gap-3">
                {POSITIONS.map(({ value, label }) => (
                  <div key={value} className="flex items-center gap-2">
                    <Checkbox
                      id={`position-${value}`}
                      checked={formData.positions?.includes(value)}
                      onCheckedChange={() => togglePosition(value)}
                    />
                    <Label htmlFor={`position-${value}`} className="text-sm font-normal cursor-pointer">
                      {label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as Player['status'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Injured">Injured</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Player notes..."
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="focusFlag">Focus Flag</Label>
              <Switch
                id="focusFlag"
                checked={formData.focusFlag}
                onCheckedChange={(checked) => setFormData({ ...formData, focusFlag: checked })}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            {player && onDelete && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  onDelete(player.id);
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
              {player ? 'Save Changes' : 'Add Player'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
