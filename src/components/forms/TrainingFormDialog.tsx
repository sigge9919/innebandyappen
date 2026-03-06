import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { TrainingSession, Player, Drill, TrainingSection } from '@/types';
import { format } from 'date-fns';
import { Plus, X, Clock, GripVertical } from 'lucide-react';

const SECTION_TYPES: TrainingSection['type'][] = ['Warm-up', 'Main drills', 'Game-like drills', 'Cool-down'];

const DEFAULT_SECTIONS: { type: TrainingSection['type']; duration: number }[] = [
  { type: 'Warm-up', duration: 15 },
  { type: 'Main drills', duration: 40 },
  { type: 'Game-like drills', duration: 25 },
  { type: 'Cool-down', duration: 10 },
];

interface SectionFormData {
  type: TrainingSection['type'];
  duration: number;
  drillIds: string[];
}

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
    playerIds: [] as string[],
  });
  
  const [sections, setSections] = useState<SectionFormData[]>(
    DEFAULT_SECTIONS.map(s => ({ ...s, drillIds: [] }))
  );

  useEffect(() => {
    if (session) {
      setFormData({
        date: session.date,
        theme: session.theme,
        playerIds: session.playerIds,
      });
      setSections(session.sections.map(s => ({
        type: s.type,
        duration: s.duration,
        drillIds: s.drillIds || [],
      })));
    } else {
      setFormData({
        date: format(new Date(), 'yyyy-MM-dd'),
        theme: '',
        playerIds: [],
      });
      setSections(DEFAULT_SECTIONS.map(s => ({ ...s, drillIds: [] })));
    }
  }, [session, open]);

  const totalDuration = sections.reduce((sum, s) => sum + s.duration, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSession: TrainingSession = {
      id: session?.id || crypto.randomUUID(),
      date: formData.date,
      theme: formData.theme,
      duration: totalDuration,
      playerIds: formData.playerIds,
      sections: sections.map(s => ({
        type: s.type,
        duration: s.duration,
        drillIds: s.drillIds,
      })),
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

  const updateSectionDuration = (index: number, duration: number) => {
    setSections(prev => prev.map((s, i) => i === index ? { ...s, duration: Math.max(0, duration) } : s));
  };

  const toggleDrillInSection = (sectionIndex: number, drillId: string) => {
    setSections(prev => prev.map((s, i) => {
      if (i !== sectionIndex) return s;
      return {
        ...s,
        drillIds: s.drillIds.includes(drillId)
          ? s.drillIds.filter(id => id !== drillId)
          : [...s.drillIds, drillId],
      };
    }));
  };

  const removeDrillFromSection = (sectionIndex: number, drillId: string) => {
    setSections(prev => prev.map((s, i) => {
      if (i !== sectionIndex) return s;
      return { ...s, drillIds: s.drillIds.filter(id => id !== drillId) };
    }));
  };

  const getDrillName = (drillId: string) => {
    return drills.find(d => d.id === drillId)?.name || 'Unknown';
  };

  // Get drills not yet assigned to any section
  const allAssignedDrillIds = sections.flatMap(s => s.drillIds);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh]">
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

              {/* Session Structure */}
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label>Session Structure</Label>
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    Total: {totalDuration} min
                  </span>
                </div>

                <div className="space-y-3">
                  {sections.map((section, sIndex) => (
                    <div key={sIndex} className="border border-border rounded-md p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{
                          backgroundColor: sIndex === 0 ? 'hsl(var(--muted-foreground))' : 
                                         sIndex === 1 ? 'hsl(var(--primary))' :
                                         sIndex === 2 ? 'hsl(var(--accent-foreground))' : 'hsl(var(--muted-foreground))'
                        }} />
                        <span className="text-sm font-medium flex-1">{section.type}</span>
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            min="0"
                            max="120"
                            value={section.duration}
                            onChange={(e) => updateSectionDuration(sIndex, parseInt(e.target.value) || 0)}
                            className="w-16 h-8 text-center text-sm"
                          />
                          <span className="text-xs text-muted-foreground">min</span>
                        </div>
                      </div>

                      {/* Assigned drills */}
                      {section.drillIds.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pl-4">
                          {section.drillIds.map(drillId => (
                            <Badge key={drillId} variant="secondary" className="gap-1 text-xs">
                              {getDrillName(drillId)}
                              <button
                                type="button"
                                onClick={() => removeDrillFromSection(sIndex, drillId)}
                                className="ml-0.5 hover:text-destructive"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Add drills to section */}
                      {drills.length > 0 && (
                        <div className="pl-4">
                          <details className="group">
                            <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground flex items-center gap-1">
                              <Plus className="h-3 w-3" />
                              Add drills
                            </summary>
                            <div className="mt-1.5 space-y-1 max-h-28 overflow-y-auto border border-border rounded p-2">
                              {drills.map(drill => (
                                <div key={drill.id} className="flex items-center gap-2">
                                  <Checkbox
                                    id={`s${sIndex}-drill-${drill.id}`}
                                    checked={section.drillIds.includes(drill.id)}
                                    onCheckedChange={() => toggleDrillInSection(sIndex, drill.id)}
                                  />
                                  <label
                                    htmlFor={`s${sIndex}-drill-${drill.id}`}
                                    className="text-xs cursor-pointer flex-1"
                                  >
                                    {drill.name}
                                    {allAssignedDrillIds.includes(drill.id) && !section.drillIds.includes(drill.id) && (
                                      <span className="text-muted-foreground ml-1">(used)</span>
                                    )}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </details>
                        </div>
                      )}
                    </div>
                  ))}
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
