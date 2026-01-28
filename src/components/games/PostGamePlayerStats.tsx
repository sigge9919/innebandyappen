import { useState } from 'react';
import { Player } from '@/types';
import { PlayerGameStats, GameEvent, Period } from '@/types/game';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Shield } from 'lucide-react';

interface PostGamePlayerStatsProps {
  squadPlayers: Player[];
  playerStats: PlayerGameStats[];
  blockedShotEvents: GameEvent[];
  onUpdatePlayerStat: (playerId: string, field: keyof Omit<PlayerGameStats, 'playerId'>, value: number) => void;
  onAssignBlockedShot: (eventId: string, playerId: string) => void;
}

const PERIODS: { value: Period | 'total'; label: string }[] = [
  { value: 'total', label: 'All' },
  { value: '1', label: 'P1' },
  { value: '2', label: 'P2' },
  { value: '3', label: 'P3' },
  { value: 'OT', label: 'OT' },
];

export function PostGamePlayerStats({
  squadPlayers,
  playerStats,
  blockedShotEvents,
  onUpdatePlayerStat,
  onAssignBlockedShot,
}: PostGamePlayerStatsProps) {
  const [selectedTab, setSelectedTab] = useState<'stats' | 'blocks'>('stats');

  const getPlayerStats = (playerId: string): PlayerGameStats => {
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

  const getPlayerName = (playerId: string) => {
    const player = squadPlayers.find(p => p.id === playerId);
    return player ? `#${player.jerseyNumber} ${player.name}` : 'Unknown';
  };

  // Filter blocked shots from opponent that can be attributed to our players
  const opponentBlockedShots = blockedShotEvents.filter(e => e.team === 'opponent');

  return (
    <div className="stat-card">
      <h3 className="text-lg font-semibold mb-4">Player Statistics</h3>

      <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as 'stats' | 'blocks')}>
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
                  <th className="py-2 px-2 text-center font-medium text-muted-foreground">SOG</th>
                  <th className="py-2 px-2 text-center font-medium text-muted-foreground">Miss</th>
                  <th className="py-2 px-2 text-center font-medium text-muted-foreground">Blk</th>
                  <th className="py-2 px-2 text-center font-medium text-muted-foreground">PIM</th>
                </tr>
              </thead>
              <tbody>
                {squadPlayers.map(player => {
                  const stats = getPlayerStats(player.id);
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
                      <td className="py-1 px-1">
                        <Input
                          type="number"
                          min={0}
                          value={stats.goals}
                          onChange={(e) => onUpdatePlayerStat(player.id, 'goals', Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-11 text-center h-7 text-xs"
                        />
                      </td>
                      <td className="py-1 px-1">
                        <Input
                          type="number"
                          min={0}
                          value={stats.assists}
                          onChange={(e) => onUpdatePlayerStat(player.id, 'assists', Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-11 text-center h-7 text-xs"
                        />
                      </td>
                      <td className="py-1 px-1">
                        <Input
                          type="number"
                          min={0}
                          value={stats.shotsOnGoal}
                          onChange={(e) => onUpdatePlayerStat(player.id, 'shotsOnGoal', Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-11 text-center h-7 text-xs"
                        />
                      </td>
                      <td className="py-1 px-1">
                        <Input
                          type="number"
                          min={0}
                          value={stats.shotsOffGoal}
                          onChange={(e) => onUpdatePlayerStat(player.id, 'shotsOffGoal', Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-11 text-center h-7 text-xs"
                        />
                      </td>
                      <td className="py-1 px-1">
                        <Input
                          type="number"
                          min={0}
                          value={stats.shotsBlocked}
                          onChange={(e) => onUpdatePlayerStat(player.id, 'shotsBlocked', Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-11 text-center h-7 text-xs"
                        />
                      </td>
                      <td className="py-1 px-1">
                        <Input
                          type="number"
                          min={0}
                          value={stats.penalties}
                          onChange={(e) => onUpdatePlayerStat(player.id, 'penalties', Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-11 text-center h-7 text-xs"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            G = Goals, A = Assists, SOG = Shots on Goal, Miss = Shots off Goal, Blk = Blocked Shots, PIM = Penalties (2 min)
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
              </p>
              {opponentBlockedShots.map((event, index) => (
                <div key={event.id} className="flex items-center gap-3 p-3 border border-border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">P{event.period}</Badge>
                      <span className="text-sm">Blocked Shot #{index + 1}</span>
                    </div>
                  </div>
                  <Select
                    value={event.blockedByPlayerId || ''}
                    onValueChange={(value) => onAssignBlockedShot(event.id, value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select blocker" />
                    </SelectTrigger>
                    <SelectContent>
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
