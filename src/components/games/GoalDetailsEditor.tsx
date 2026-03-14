import { Player } from '@/types';
import { GameEvent, getSituationLabel } from '@/types/game';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CircleDot } from 'lucide-react';

interface GoalDetailsEditorProps {
  goalEvents: GameEvent[];
  squadPlayers: Player[];
  onUpdateGoalDetails: (eventId: string, scorerId?: string, assistPlayerIds?: string[]) => void;
}

const NONE_VALUE = '_none';

export function GoalDetailsEditor({
  goalEvents,
  squadPlayers,
  onUpdateGoalDetails,
}: GoalDetailsEditorProps) {
  const homeGoals = goalEvents.filter(e => e.team === 'home');

  if (homeGoals.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <CircleDot className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>Inga mål gjorda i denna match</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-4">
        Tilldela målskyttar och assister (0–1 assist per mål).
      </p>
      
      <div className="space-y-4">
        {homeGoals.map((event, index) => {
          const assist = event.assistPlayerIds?.[0];
          
          return (
            <div key={event.id} className="p-4 border border-border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="bg-success text-success-foreground">
                    Mål #{index + 1}
                  </Badge>
                  <Badge variant="secondary">P{event.period}</Badge>
                  <Badge variant="outline">{getSituationLabel(event.situation)}</Badge>
                </div>
              </div>
              
              {/* Goal Scorer */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Goal Scorer</label>
                  <Select
                    value={event.playerId || NONE_VALUE}
                    onValueChange={(value) => {
                      const scorerId = value === NONE_VALUE ? undefined : value;
                      onUpdateGoalDetails(event.id, scorerId, assist ? [assist] : []);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select scorer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE_VALUE}>No scorer assigned</SelectItem>
                      {squadPlayers.map(player => (
                        <SelectItem key={player.id} value={player.id}>
                          #{player.jerseyNumber} {player.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Assist */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Assist</label>
                  <Select
                    value={assist || NONE_VALUE}
                    onValueChange={(value) => {
                      const newAssist = value === NONE_VALUE ? [] : [value];
                      onUpdateGoalDetails(event.id, event.playerId, newAssist);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE_VALUE}>None</SelectItem>
                      {squadPlayers
                        .filter(p => p.id !== event.playerId)
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
