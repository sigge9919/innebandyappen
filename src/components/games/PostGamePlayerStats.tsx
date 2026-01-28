import { Player } from '@/types';
import { GameEvent, GameLine, PenaltyEvent, PlayerGameStats } from '@/types/game';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Lock } from 'lucide-react';
import { calculatePlayerStatsFromEvents, CalculatedPlayerStats } from '@/lib/gameStorage';

interface PostGamePlayerStatsProps {
  squadPlayers: Player[];
  events: GameEvent[];
  penalties: PenaltyEvent[];
  lines: GameLine[];
  blockedShotEvents: GameEvent[];
  playerStats?: PlayerGameStats[];
  onAssignBlockedShot: (eventId: string, playerId: string) => void;
  onUpdatePlayerStat: (playerId: string, field: keyof Omit<PlayerGameStats, 'playerId'>, value: number) => void;
}

const NONE_VALUE = '_none';

export function PostGamePlayerStats({
  squadPlayers,
  events,
  penalties,
  lines,
  blockedShotEvents,
  playerStats = [],
  onAssignBlockedShot,
  onUpdatePlayerStat,
}: PostGamePlayerStatsProps) {
  // Calculate event-driven stats (goals, assists, PIM, +/-)
  const eventDrivenStats = calculatePlayerStatsFromEvents(
    events,
    penalties,
    lines,
    squadPlayers.map(p => p.id)
  );

  const getEventStats = (playerId: string): CalculatedPlayerStats => {
    return eventDrivenStats.find(ps => ps.playerId === playerId) || {
      playerId,
      goals: 0,
      assists: 0,
      shotsOnGoal: 0,
      shotsOffGoal: 0,
      shotsBlocked: 0,
      penaltyMinutes: 0,
      plusMinus5v5: 0,
    };
  };

  // Get manually entered shot stats
  const getManualStats = (playerId: string): PlayerGameStats => {
    return playerStats.find(ps => ps.playerId === playerId) || {
      playerId,
      goals: 0,
      assists: 0,
      shotsOnGoal: 0,
      shotsOffGoal: 0,
      shotsBlocked: 0,
      penalties: 0,
    };
  };

  // Filter blocked shots from opponent that can be attributed to our players
  const opponentBlockedShots = blockedShotEvents.filter(e => e.team === 'opponent');
  const unassignedBlocks = opponentBlockedShots.filter(e => !e.blockedByPlayerId).length;

  // Count defensive blocks per player (opponent shots they blocked)
  const getDefensiveBlocks = (playerId: string): number => {
    return opponentBlockedShots.filter(e => e.blockedByPlayerId === playerId).length;
  };

  const handleStatChange = (playerId: string, field: 'shotsOnGoal' | 'shotsOffGoal' | 'shotsBlocked', value: string) => {
    const numValue = parseInt(value) || 0;
    onUpdatePlayerStat(playerId, field, Math.max(0, numValue));
  };

  return (
    <div className="stat-card">
      <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
        <User className="h-5 w-5" />
        Player Statistics
      </h3>
      <p className="text-xs text-muted-foreground mb-4">
        G, A, PIM, +/- are auto-calculated from events. Shots can be entered manually.
        {unassignedBlocks > 0 && (
          <span className="text-amber-600 ml-1">
            ({unassignedBlocks} blocked shot{unassignedBlocks > 1 ? 's' : ''} unassigned below)
          </span>
        )}
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 px-2 text-left font-medium text-muted-foreground">Player</th>
              <th className="py-2 px-2 text-center font-medium text-muted-foreground">
                <span className="flex items-center justify-center gap-1">
                  G <Lock className="h-3 w-3" />
                </span>
              </th>
              <th className="py-2 px-2 text-center font-medium text-muted-foreground">
                <span className="flex items-center justify-center gap-1">
                  A <Lock className="h-3 w-3" />
                </span>
              </th>
              <th className="py-2 px-2 text-center font-medium text-muted-foreground">SOG</th>
              <th className="py-2 px-2 text-center font-medium text-muted-foreground">Miss</th>
              <th className="py-2 px-2 text-center font-medium text-muted-foreground">Blk</th>
              <th className="py-2 px-2 text-center font-medium text-muted-foreground">
                <span className="flex items-center justify-center gap-1">
                  Tot <Lock className="h-3 w-3" />
                </span>
              </th>
              <th className="py-2 px-2 text-center font-medium text-muted-foreground">
                <span className="flex items-center justify-center gap-1">
                  Def <Lock className="h-3 w-3" />
                </span>
              </th>
              <th className="py-2 px-2 text-center font-medium text-muted-foreground">
                <span className="flex items-center justify-center gap-1">
                  PIM <Lock className="h-3 w-3" />
                </span>
              </th>
              <th className="py-2 px-2 text-center font-medium text-muted-foreground">
                <span className="flex items-center justify-center gap-1">
                  +/− <Lock className="h-3 w-3" />
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {squadPlayers.map(player => {
              const eventStats = getEventStats(player.id);
              const manualStats = getManualStats(player.id);
              const totalShots = manualStats.shotsOnGoal + manualStats.shotsOffGoal + manualStats.shotsBlocked;
              const defensiveBlocks = getDefensiveBlocks(player.id);
              return (
                <tr key={player.id} className="border-b border-border">
                  <td className="py-2 px-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        #{player.jerseyNumber}
                      </Badge>
                      <span className="font-medium truncate max-w-[80px]">
                        {player.name.split(' ')[0]}
                      </span>
                    </div>
                  </td>
                  <td className="py-2 px-2 text-center tabular-nums">
                    {eventStats.goals > 0 ? (
                      <Badge variant="default" className="bg-success/20 text-success border-success/30">
                        {eventStats.goals}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </td>
                  <td className="py-2 px-2 text-center tabular-nums">
                    {eventStats.assists > 0 ? (
                      <Badge variant="secondary">{eventStats.assists}</Badge>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </td>
                  <td className="py-2 px-1 text-center">
                    <Input
                      type="number"
                      min="0"
                      value={manualStats.shotsOnGoal || ''}
                      onChange={(e) => handleStatChange(player.id, 'shotsOnGoal', e.target.value)}
                      className="w-14 h-8 text-center text-sm px-1"
                      placeholder="0"
                    />
                  </td>
                  <td className="py-2 px-1 text-center">
                    <Input
                      type="number"
                      min="0"
                      value={manualStats.shotsOffGoal || ''}
                      onChange={(e) => handleStatChange(player.id, 'shotsOffGoal', e.target.value)}
                      className="w-14 h-8 text-center text-sm px-1"
                      placeholder="0"
                    />
                  </td>
                  <td className="py-2 px-1 text-center">
                    <Input
                      type="number"
                      min="0"
                      value={manualStats.shotsBlocked || ''}
                      onChange={(e) => handleStatChange(player.id, 'shotsBlocked', e.target.value)}
                      className="w-14 h-8 text-center text-sm px-1"
                      placeholder="0"
                    />
                  </td>
                  <td className="py-2 px-2 text-center tabular-nums font-semibold">
                    {totalShots > 0 ? totalShots : <span className="text-muted-foreground">0</span>}
                  </td>
                  <td className="py-2 px-2 text-center tabular-nums">
                    {defensiveBlocks > 0 ? (
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30">
                        {defensiveBlocks}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </td>
                  <td className="py-2 px-2 text-center tabular-nums">
                    {eventStats.penaltyMinutes > 0 ? (
                      <Badge variant="destructive" className="bg-amber-500/10 text-amber-600 border-amber-500/30">
                        {eventStats.penaltyMinutes}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </td>
                  <td className="py-2 px-2 text-center tabular-nums font-semibold">
                    {eventStats.plusMinus5v5 > 0 ? (
                      <span className="text-success">+{eventStats.plusMinus5v5}</span>
                    ) : eventStats.plusMinus5v5 < 0 ? (
                      <span className="text-destructive">{eventStats.plusMinus5v5}</span>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground mt-3">
        G = Goals, A = Assists, SOG = Shots on Goal, Miss = Missed Shots, Blk = Shots Blocked (by opponent), Tot = Total Shots, Def = Defensive Blocks, PIM = Penalty Minutes, +/− = Plus/Minus (5v5 only)
      </p>

      {/* Block Attribution Section */}
      {opponentBlockedShots.length > 0 && (
        <div className="mt-6 pt-4 border-t border-border">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            Assign Blocked Shots (Opponent's shots we blocked)
            {unassignedBlocks > 0 && (
              <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">
                {unassignedBlocks} remaining
              </Badge>
            )}
          </h4>
          <div className="grid gap-2">
            {opponentBlockedShots.map((event, index) => (
              <div key={event.id} className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2 flex-1">
                  <Badge variant="secondary" className="text-xs">P{event.period}</Badge>
                  <span className="text-sm text-muted-foreground">Block #{index + 1}</span>
                </div>
                <Select
                  value={event.blockedByPlayerId || NONE_VALUE}
                  onValueChange={(value) => {
                    if (value !== NONE_VALUE) {
                      onAssignBlockedShot(event.id, value);
                    }
                  }}
                >
                  <SelectTrigger className="w-[160px] h-8 text-xs">
                    <SelectValue placeholder="Assign player" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE_VALUE}>Not assigned</SelectItem>
                    {squadPlayers.map(player => (
                      <SelectItem key={player.id} value={player.id}>
                        #{player.jerseyNumber} {player.name.split(' ')[0]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
