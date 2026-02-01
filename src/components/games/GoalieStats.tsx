import { Player } from '@/types';
import { GameEvent } from '@/types/game';
import { Badge } from '@/components/ui/badge';
import { Shield, Target, Percent } from 'lucide-react';

interface GoalieStatsProps {
  goalies: Player[];
  events: GameEvent[];
  activeGoalieId?: string;
}

interface GoalieStatLine {
  goalie: Player;
  goalsAgainst: number;
  shotsAgainst: number;
  savePercentage: number;
}

export function GoalieStats({
  goalies,
  events,
  activeGoalieId,
}: GoalieStatsProps) {
  if (goalies.length === 0) {
    return (
      <div className="text-sm text-muted-foreground italic py-4 text-center">
        No goalkeepers in squad
      </div>
    );
  }

  // Calculate opponent shots on goal (includes goals)
  const opponentShotsOnGoal = events.filter(
    e => e.team === 'opponent' && (e.type === 'shot_on_goal' || e.type === 'goal')
  ).length;

  // Calculate opponent goals
  const opponentGoals = events.filter(
    e => e.team === 'opponent' && e.type === 'goal'
  ).length;

  // For now, attribute all stats to the active/starting goalie
  // In a more advanced version, you'd track goalie changes and split stats
  const goalieStats: GoalieStatLine[] = goalies.map(goalie => {
    const isActive = goalie.id === activeGoalieId;
    const goalsAgainst = isActive ? opponentGoals : 0;
    const shotsAgainst = isActive ? opponentShotsOnGoal : 0;
    const saves = shotsAgainst - goalsAgainst;
    const savePercentage = shotsAgainst > 0 
      ? (saves / shotsAgainst) * 100 
      : 0;

    return {
      goalie,
      goalsAgainst,
      shotsAgainst,
      savePercentage,
    };
  });

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
        <Shield className="h-4 w-4" />
        Goaltender Statistics
      </h4>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 px-2 text-left font-medium text-muted-foreground">Goalie</th>
              <th className="py-2 px-2 text-center font-medium text-muted-foreground">
                <span className="flex items-center justify-center gap-1">
                  GA
                </span>
              </th>
              <th className="py-2 px-2 text-center font-medium text-muted-foreground">
                <span className="flex items-center justify-center gap-1">
                  SA
                </span>
              </th>
              <th className="py-2 px-2 text-center font-medium text-muted-foreground">
                <span className="flex items-center justify-center gap-1">
                  SV
                </span>
              </th>
              <th className="py-2 px-2 text-center font-medium text-muted-foreground">
                <span className="flex items-center justify-center gap-1">
                  SV%
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {goalieStats.map(({ goalie, goalsAgainst, shotsAgainst, savePercentage }) => {
              const saves = shotsAgainst - goalsAgainst;
              const isActive = goalie.id === activeGoalieId;
              
              return (
                <tr key={goalie.id} className="border-b border-border">
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={isActive ? 'default' : 'outline'} className="text-xs">
                        #{goalie.jerseyNumber}
                      </Badge>
                      <span className="font-medium">
                        {goalie.name}
                      </span>
                      {isActive && (
                        <Badge variant="secondary" className="text-xs">
                          Active
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-2 text-center tabular-nums">
                    {goalsAgainst > 0 ? (
                      <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/30">
                        {goalsAgainst}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </td>
                  <td className="py-3 px-2 text-center tabular-nums font-medium">
                    {shotsAgainst > 0 ? shotsAgainst : <span className="text-muted-foreground">0</span>}
                  </td>
                  <td className="py-3 px-2 text-center tabular-nums">
                    {saves > 0 ? (
                      <Badge variant="secondary" className="bg-success/10 text-success border-success/30">
                        {saves}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </td>
                  <td className="py-3 px-2 text-center tabular-nums font-bold">
                    {shotsAgainst > 0 ? (
                      <span className={savePercentage >= 90 ? 'text-success' : savePercentage >= 85 ? 'text-foreground' : 'text-destructive'}>
                        {savePercentage.toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground">
        GA = Goals Against, SA = Shots Against, SV = Saves, SV% = Save Percentage
      </p>
    </div>
  );
}
