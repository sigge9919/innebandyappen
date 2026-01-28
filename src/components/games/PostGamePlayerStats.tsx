import { Player } from '@/types';
import { GameEvent, GameLine, PenaltyEvent } from '@/types/game';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Shield, Lock } from 'lucide-react';
import { calculatePlayerStatsFromEvents, CalculatedPlayerStats } from '@/lib/gameStorage';

interface PostGamePlayerStatsProps {
  squadPlayers: Player[];
  events: GameEvent[];
  penalties: PenaltyEvent[];
  lines: GameLine[];
  blockedShotEvents: GameEvent[];
  onAssignBlockedShot: (eventId: string, playerId: string) => void;
}

const NONE_VALUE = '_none';

export function PostGamePlayerStats({
  squadPlayers,
  events,
  penalties,
  lines,
  blockedShotEvents,
  onAssignBlockedShot,
}: PostGamePlayerStatsProps) {
  // Calculate all player stats from events
  const playerStats = calculatePlayerStatsFromEvents(
    events,
    penalties,
    lines,
    squadPlayers.map(p => p.id)
  );

  const getPlayerStats = (playerId: string): CalculatedPlayerStats => {
    return playerStats.find(ps => ps.playerId === playerId) || {
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

  // Filter blocked shots from opponent that can be attributed to our players
  const opponentBlockedShots = blockedShotEvents.filter(e => e.team === 'opponent');

  return (
    <div className="stat-card">
      <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
        <User className="h-5 w-5" />
        Player Statistics
        <Badge variant="secondary" className="ml-2 gap-1">
          <Lock className="h-3 w-3" />
          Auto-calculated
        </Badge>
      </h3>
      <p className="text-xs text-muted-foreground mb-4">
        Stats are derived from game events. Edit goals, penalties, and blocks to update.
      </p>

      <Tabs defaultValue="stats">
        <TabsList className="grid grid-cols-2 w-full mb-4">
          <TabsTrigger value="stats" className="gap-2">
            <User className="h-4 w-4" />
            Player Stats
          </TabsTrigger>
          <TabsTrigger value="blocks" className="gap-2">
            <Shield className="h-4 w-4" />
            Block Attribution
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stats" className="mt-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-2 px-2 text-left font-medium text-muted-foreground">Player</th>
                  <th className="py-2 px-2 text-center font-medium text-muted-foreground">G</th>
                  <th className="py-2 px-2 text-center font-medium text-muted-foreground">A</th>
                  <th className="py-2 px-2 text-center font-medium text-muted-foreground">Pts</th>
                  <th className="py-2 px-2 text-center font-medium text-muted-foreground">Blk</th>
                  <th className="py-2 px-2 text-center font-medium text-muted-foreground">PIM</th>
                  <th className="py-2 px-2 text-center font-medium text-muted-foreground">+/−</th>
                </tr>
              </thead>
              <tbody>
                {squadPlayers.map(player => {
                  const stats = getPlayerStats(player.id);
                  const points = stats.goals + stats.assists;
                  return (
                    <tr key={player.id} className="border-b border-border">
                      <td className="py-2 px-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            #{player.jerseyNumber}
                          </Badge>
                          <span className="font-medium truncate max-w-[100px]">
                            {player.name.split(' ')[0]}
                          </span>
                        </div>
                      </td>
                      <td className="py-2 px-2 text-center tabular-nums">
                        {stats.goals > 0 ? (
                          <Badge variant="default" className="bg-success/20 text-success border-success/30">
                            {stats.goals}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </td>
                      <td className="py-2 px-2 text-center tabular-nums">
                        {stats.assists > 0 ? (
                          <Badge variant="secondary">{stats.assists}</Badge>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </td>
                      <td className="py-2 px-2 text-center tabular-nums font-semibold">
                        {points > 0 ? points : <span className="text-muted-foreground">0</span>}
                      </td>
                      <td className="py-2 px-2 text-center tabular-nums">
                        {stats.shotsBlocked > 0 ? (
                          <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30">
                            {stats.shotsBlocked}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </td>
                      <td className="py-2 px-2 text-center tabular-nums">
                        {stats.penaltyMinutes > 0 ? (
                          <Badge variant="destructive" className="bg-amber-500/10 text-amber-600 border-amber-500/30">
                            {stats.penaltyMinutes}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </td>
                      <td className="py-2 px-2 text-center tabular-nums font-semibold">
                        {stats.plusMinus5v5 > 0 ? (
                          <span className="text-success">+{stats.plusMinus5v5}</span>
                        ) : stats.plusMinus5v5 < 0 ? (
                          <span className="text-destructive">{stats.plusMinus5v5}</span>
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
            G = Goals, A = Assists, Pts = Points, Blk = Blocked Shots, PIM = Penalty Minutes, +/− = Plus/Minus (5v5 only)
          </p>
        </TabsContent>

        <TabsContent value="blocks" className="mt-0">
          {opponentBlockedShots.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No opponent shots were blocked during this game</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground mb-4">
                Assign each blocked opponent shot to the player who made the block.
                This updates the player's blocked shots stat automatically.
              </p>
              {opponentBlockedShots.map((event, index) => (
                <div key={event.id} className="flex items-center gap-3 p-3 border border-border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">P{event.period}</Badge>
                      <span className="text-sm">Blocked Shot #{index + 1}</span>
                      {event.blockedByPlayerId && (
                        <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                          Assigned
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Select
                    value={event.blockedByPlayerId || NONE_VALUE}
                    onValueChange={(value) => {
                      if (value !== NONE_VALUE) {
                        onAssignBlockedShot(event.id, value);
                      }
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select blocker" />
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
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
