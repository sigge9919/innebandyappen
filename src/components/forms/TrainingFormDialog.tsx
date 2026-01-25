import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TrainingSession, Player, Drill } from '@/types';
import { format } from 'date-fns';

interface TrainingFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session?: TrainingSession | null;
  players: Player[];
  drills: Drill[];
  onSave: (session: TrainingSession) => void;
  onDelete?: (id: string) => void;
}

export function TrainingFormDialog({ 
  open, 
  onOpenChange, 
  session, 
  players, 
  drills, 
  onSave, 
  onDelete 
}: TrainingFormDialogProps) {
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    theme: '',
    duration: 90,
    playerIds: [] as string[],
    selectedDrills: [] as string[],
  });

  useEffect(() => {
    if (session) {
      setFormData({
        date: session.date,
        theme: session.theme,
        duration: session.duration,
        playerIds: session.playerIds,
        selectedDrills: session.sections.flatMap(s => s.drillIds),
      });
    } else {
      setFormData({
        date: format(new Date(), 'yyyy-MM-dd'),
        theme: '',
        duration: 90,
        playerIds: [],
        selectedDrills: [],
      });
    }
  }, [session, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSession: TrainingSession = {
      id: session?.id || crypto.randomUUID(),
      date: formData.date,
      theme: formData.theme,
      duration: formData.duration,
      playerIds: formData.playerIds,
      sections: [
        { type: 'Warm-up', duration: 15, drillIds: formData.selectedDrills.slice(0, 1) },
        { type: 'Main drills', duration: Math.max(30, formData.duration - 45), drillIds: formData.selectedDrills.slice(1, 3) },
        { type: 'Game-like drills', duration: 20, drillIds: formData.selectedDrills.slice(3, 4) },
        { type: 'Cool-down', duration: 10, drillIds: [] },
      ],
    };
    onSave(newSession);
    onOpenChange(false);
  };

  const togglePlayer = (playerId: string) => {
    setFormData(prev => ({
      ...prev,
      playerIds: prev.playerIds.includes(playerId)
        ? prev.playerIds.filter(id => id !== playerId)
        : [...prev.playerIds, playerId]
    }));
  };

  const toggleDrill = (drillId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedDrills: prev.selectedDrills.includes(drillId)
        ? prev.selectedDrills.filter(id => id !== drillId)
        : [...prev.selectedDrills, drillId]
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{session ? 'Edit Training Session' : 'Create Training Session'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="theme">Theme</Label>
                <Input
                  id="theme"
                  value={formData.theme}
                  onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                  placeholder="Training theme (e.g., Transitions, Defense)"
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
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="30"
                    max="180"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 90 })}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Players Attending</Label>
                <div className="border rounded-md p-3 space-y-2 max-h-40 overflow-y-auto">
                  {players.filter(p => p.status === 'Active').map(player => (
                    <div key={player.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`player-${player.id}`}
                        checked={formData.playerIds.includes(player.id)}
                        onCheckedChange={() => togglePlayer(player.id)}
                      />
                      <label htmlFor={`player-${player.id}`} className="text-sm cursor-pointer">
                        #{player.jerseyNumber} {player.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Drills</Label>
                <div className="border rounded-md p-3 space-y-2 max-h-40 overflow-y-auto">
                  {drills.map(drill => (
                    <div key={drill.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`drill-${drill.id}`}
                        checked={formData.selectedDrills.includes(drill.id)}
                        onCheckedChange={() => toggleDrill(drill.id)}
                      />
                      <label htmlFor={`drill-${drill.id}`} className="text-sm cursor-pointer">
                        {drill.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="gap-2">
            {session && onDelete && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  onDelete(session.id);
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
              {session ? 'Save Changes' : 'Create Session'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
