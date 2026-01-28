import { useState } from 'react';
import { Player } from '@/types';
import { GameEvent, Period, GameSituation, getSituationLabel } from '@/types/game';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CircleDot, Users } from 'lucide-react';

interface GoalDetailsEditorProps {
  goalEvents: GameEvent[];
  squadPlayers: Player[];
  onUpdateGoalDetails: (eventId: string, scorerId?: string, assistPlayerIds?: string[]) => void;
}

export function GoalDetailsEditor({
  goalEvents,
  squadPlayers,
  onUpdateGoalDetails,
}: GoalDetailsEditorProps) {
  const homeGoals = goalEvents.filter(e => e.team === 'home');

  const getPlayerName = (playerId?: string) => {
    if (!playerId) return null;
    const player = squadPlayers.find(p => p.id === playerId);
    return player ? `#${player.jerseyNumber} ${player.name.split(' ')[0]}` : null;
  };

  if (homeGoals.length === 0) {
    return (
      <div className="stat-card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <CircleDot className="h-5 w-5 text-success" />
          Goal Details
        </h3>
        <div className="text-center py-8 text-muted-foreground">
          <CircleDot className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No goals scored this game</p>
        </div>
      </div>
    );
  }

  return (
    <div className="stat-card">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <CircleDot className="h-5 w-5 text-success" />
        Goal Details
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        Assign goal scorers and assists (0-2 assistants per goal).
      </p>
      
      <div className="space-y-4">
        {homeGoals.map((event, index) => {
          const assists = event.assistPlayerIds || [];
          
          return (
            <div key={event.id} className="p-4 border border-border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="bg-success text-success-foreground">
                    Goal #{index + 1}
                  </Badge>
                  <Badge variant="secondary">P{event.period}</Badge>
                  <Badge variant="outline">{getSituationLabel(event.situation)}</Badge>
                </div>
              </div>
              
              {/* Goal Scorer */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Goal Scorer</label>
                <Select
                  value={event.playerId || ''}
                  onValueChange={(value) => onUpdateGoalDetails(event.id, value, assists)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select scorer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No scorer assigned</SelectItem>
                    {squadPlayers.map(player => (
                      <SelectItem key={player.id} value={player.id}>
                        #{player.jerseyNumber} {player.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Assists */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">1st Assist</label>
                  <Select
                    value={assists[0] || ''}
                    onValueChange={(value) => {
                      const newAssists = [...assists];
                      if (value) {
                        newAssists[0] = value;
                      } else {
                        newAssists.splice(0, 1);
                      }
                      onUpdateGoalDetails(event.id, event.playerId, newAssists);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {squadPlayers
                        .filter(p => p.id !== event.playerId && p.id !== assists[1])
                        .map(player => (
                          <SelectItem key={player.id} value={player.id}>
                            #{player.jerseyNumber} {player.name.split(' ')[0]}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">2nd Assist</label>
                  <Select
                    value={assists[1] || ''}
                    onValueChange={(value) => {
                      const newAssists = [...assists];
                      if (value) {
                        if (newAssists.length === 0) newAssists.push('');
                        newAssists[1] = value;
                      } else if (newAssists.length > 1) {
                        newAssists.splice(1, 1);
                      }
                      onUpdateGoalDetails(event.id, event.playerId, newAssists.filter(Boolean));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {squadPlayers
                        .filter(p => p.id !== event.playerId && p.id !== assists[0])
                        .map(player => (
                          <SelectItem key={player.id} value={player.id}>
                            #{player.jerseyNumber} {player.name.split(' ')[0]}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
