import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { TrainingSession, Player, Drill, TrainingSection, TrainingTeam } from '@/types';
import { format } from 'date-fns';
import { Plus, X, Clock, Shuffle, Users } from 'lucide-react';

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

  const [teams, setTeams] = useState<TrainingTeam[]>([]);
  const [teamCount, setTeamCount] = useState(2);

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
      setTeams(session.teams || []);
    } else {
      setFormData({
        date: format(new Date(), 'yyyy-MM-dd'),
        theme: '',
        playerIds: [],
      });
      setSections(DEFAULT_SECTIONS.map(s => ({ ...s, drillIds: [] })));
      setTeams([]);
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
      teams: teams.length > 0 ? teams : undefined,
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

  const selectAllPlayers = () => {
    const activePlayers = players.filter(p => p.status === 'Active');
    const allSelected = activePlayers.every(p => formData.playerIds.includes(p.id));
    setFormData(prev => ({
      ...prev,
      playerIds: allSelected ? [] : activePlayers.map(p => p.id),
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
    return drills.find(d => d.id === drillId)?.name || 'Okänd';
  };

  const allAssignedDrillIds = sections.flatMap(s => s.drillIds);

  // Team setup helpers
  const attendingFieldPlayers = players.filter(
    p => formData.playerIds.includes(p.id) && !p.positions?.includes('Goalkeeper')
  );

  const randomizeTeams = () => {
    const shuffled = [...attendingFieldPlayers].sort(() => Math.random() - 0.5);
    const newTeams: TrainingTeam[] = Array.from({ length: teamCount }, (_, i) => ({
      name: `Team ${i + 1}`,
      playerIds: [],
    }));
    shuffled.forEach((player, idx) => {
      newTeams[idx % teamCount].playerIds.push(player.id);
    });
    setTeams(newTeams);
  };

  const movePlayerToTeam = (playerId: string, targetTeamIndex: number) => {
    setTeams(prev => prev.map((team, i) => ({
      ...team,
      playerIds: i === targetTeamIndex
        ? [...team.playerIds.filter(id => id !== playerId), playerId]
        : team.playerIds.filter(id => id !== playerId),
    })));
  };

  const getPlayerName = (playerId: string) => {
    const p = players.find(pl => pl.id === playerId);
    return p ? `#${p.jerseyNumber} ${p.name.split(' ')[0]}` : '';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{session ? 'Edit Training Session' : 'Create Training Session'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 space-y-4">
          <ScrollArea className="flex-1 min-h-0 pr-4" style={{ maxHeight: 'calc(90vh - 180px)' }}>
            <div className="grid gap-4 pb-2">
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

              {/* Players Attending */}
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label>Players Attending</Label>
                  <Button type="button" variant="ghost" size="sm" className="text-xs h-7" onClick={selectAllPlayers}>
                    {players.filter(p => p.status === 'Active').every(p => formData.playerIds.includes(p.id))
                      ? 'Deselect All' : 'Select All'}
                  </Button>
                </div>
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

              {/* Team Setup for Gameplay */}
              {attendingFieldPlayers.length >= 4 && (
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-1.5">
                      <Users className="h-4 w-4" />
                      Teams for Gameplay
                    </Label>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="teamCount" className="text-xs text-muted-foreground">Teams:</Label>
                      <Input
                        id="teamCount"
                        type="number"
                        min="2"
                        max="4"
                        value={teamCount}
                        onChange={(e) => setTeamCount(Math.max(2, Math.min(4, parseInt(e.target.value) || 2)))}
                        className="w-14 h-7 text-center text-xs"
                      />
                      <Button type="button" variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={randomizeTeams}>
                        <Shuffle className="h-3 w-3" />
                        Randomize
                      </Button>
                    </div>
                  </div>

                  {teams.length > 0 ? (
                    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${teams.length}, 1fr)` }}>
                      {teams.map((team, tIndex) => (
                        <div key={tIndex} className="border border-border rounded-md p-2 space-y-1.5">
                          <Input
                            value={team.name}
                            onChange={(e) => setTeams(prev => prev.map((t, i) => i === tIndex ? { ...t, name: e.target.value } : t))}
                            className="h-7 text-xs font-medium"
                          />
                          <div className="space-y-1 min-h-[2rem]">
                            {team.playerIds.map(pid => (
                              <div key={pid} className="flex items-center justify-between text-xs bg-muted rounded px-2 py-1">
                                <span>{getPlayerName(pid)}</span>
                                <div className="flex gap-0.5">
                                  {teams.map((_, otherIdx) => otherIdx !== tIndex && (
                                    <button
                                      key={otherIdx}
                                      type="button"
                                      onClick={() => movePlayerToTeam(pid, otherIdx)}
                                      className="text-muted-foreground hover:text-foreground text-[10px] px-1 rounded hover:bg-accent"
                                      title={`Move to ${teams[otherIdx].name}`}
                                    >
                                      →{otherIdx + 1}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Click "Randomize" to split {attendingFieldPlayers.length} field players into teams
                    </p>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>

          <DialogFooter className="gap-2 shrink-0">
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
