import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Player } from '@/types';
import { GameEvent, GameLine, PenaltyEvent, PlayerGameStats, TeamStats } from '@/types/game';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, AlertTriangle, Shield, Pencil, Check } from 'lucide-react';
import { calculatePlayerStatsFromEvents, CalculatedPlayerStats } from '@/lib/gameStorage';

interface PostGamePlayerStatsProps {
  squadPlayers: Player[];
  goalies?: Player[];
  events: GameEvent[];
  penalties: PenaltyEvent[];
  lines: GameLine[];
  playerStats?: PlayerGameStats[];
  teamStats: TeamStats;
  activeGoalieId?: string;
  onUpdatePlayerStat: (playerId: string, field: keyof Omit<PlayerGameStats, 'playerId'>, value: number) => void;
}

export function PostGamePlayerStats({
  squadPlayers,
  goalies = [],
  events,
  penalties,
  lines,
  playerStats = [],
  teamStats,
  activeGoalieId,
  onUpdatePlayerStat,
}: PostGamePlayerStatsProps) {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

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

  const getManualStats = (playerId: string): PlayerGameStats => {
    return playerStats.find(ps => ps.playerId === playerId) || {
      playerId,
      goals: 0,
      assists: 0,
      shotsOnGoal: 0,
      shotsOffGoal: 0,
      shotsBlocked: 0,
      defensiveBlocks: 0,
      penalties: 0,
    };
  };

  const totalSOG = playerStats.reduce((sum, ps) => sum + (ps.shotsOnGoal || 0), 0);
  const totalMiss = playerStats.reduce((sum, ps) => sum + (ps.shotsOffGoal || 0), 0);
  const totalBlk = playerStats.reduce((sum, ps) => sum + (ps.shotsBlocked || 0), 0);
  const totalDef = playerStats.reduce((sum, ps) => sum + (ps.defensiveBlocks || 0), 0);

  const opponentBlockedShots = events.filter(e => e.team === 'opponent' && e.type === 'shot_blocked').length;

  const sogMismatch = totalSOG !== teamStats.shotsOnGoal;
  const missMismatch = totalMiss !== teamStats.shotsOffGoal;
  const blkMismatch = totalBlk !== teamStats.shotsBlocked;
  const defMismatch = totalDef !== opponentBlockedShots;

  const getGoalieStats = (goalieId: string) => {
    let goalsAgainst = 0;
    let shotsAgainst = 0;
    events.forEach(e => {
      if (e.team !== 'opponent') return;
      const eventGoalieId = e.goalieId || activeGoalieId;
      if (eventGoalieId !== goalieId) return;
      if (e.type === 'goal') { goalsAgainst++; shotsAgainst++; }
      else if (e.type === 'shot_on_goal') { shotsAgainst++; }
    });
    return { goalsAgainst, shotsAgainst };
  };

  const handleStatChange = (playerId: string, field: 'shotsOnGoal' | 'shotsOffGoal' | 'shotsBlocked' | 'defensiveBlocks', value: string) => {
    const numValue = parseInt(value) || 0;
    onUpdatePlayerStat(playerId, field, Math.max(0, numValue));
  };

  const MismatchWarning = ({ current, expected }: { current: number; expected: number }) => (
    <span className="text-amber-500 text-xs ml-1" title={`Spelartotal: ${current}, Lagstatistik: ${expected}`}>
      <AlertTriangle className="h-3 w-3 inline" />
    </span>
  );

  const ReadOnlyCell = ({ value }: { value: number }) => (
    <span className={value > 0 ? 'tabular-nums' : 'text-muted-foreground tabular-nums'}>{value}</span>
  );

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-muted-foreground">
            M, A, UM, +/- beräknas automatiskt från händelser.{isEditing ? ' Redigera skottstatistik nedan.' : ' Tryck Ändra för att redigera skott.'}
          </p>
          <Button
            variant={isEditing ? 'default' : 'outline'}
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="ml-2 shrink-0"
          >
            {isEditing ? (
              <>
                <Check className="h-4 w-4 mr-1" />
                Klar
              </>
            ) : (
              <>
                <Pencil className="h-4 w-4 mr-1" />
                Ändra
              </>
            )}
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2 px-2 text-left font-medium text-muted-foreground">Spelare</th>
                <th className="py-2 px-2 text-center font-medium text-muted-foreground">
                  <span className="flex items-center justify-center gap-1">
                    M <Lock className="h-3 w-3" />
                  </span>
                </th>
                <th className="py-2 px-2 text-center font-medium text-muted-foreground">
                  <span className="flex items-center justify-center gap-1">
                    A <Lock className="h-3 w-3" />
                  </span>
                </th>
                <th className="py-2 px-2 text-center font-medium text-muted-foreground">
                  <span className="flex items-center justify-center gap-1">
                    SOG {isEditing && sogMismatch && <MismatchWarning current={totalSOG} expected={teamStats.shotsOnGoal} />}
                  </span>
                </th>
                <th className="py-2 px-2 text-center font-medium text-muted-foreground">
                  <span className="flex items-center justify-center gap-1">
                    Miss {isEditing && missMismatch && <MismatchWarning current={totalMiss} expected={teamStats.shotsOffGoal} />}
                  </span>
                </th>
                <th className="py-2 px-2 text-center font-medium text-muted-foreground">
                  <span className="flex items-center justify-center gap-1">
                    Blk {isEditing && blkMismatch && <MismatchWarning current={totalBlk} expected={teamStats.shotsBlocked} />}
                  </span>
                </th>
                <th className="py-2 px-2 text-center font-medium text-muted-foreground">
                  <span className="flex items-center justify-center gap-1">
                    Tot <Lock className="h-3 w-3" />
                  </span>
                </th>
                <th className="py-2 px-2 text-center font-medium text-muted-foreground">
                  <span className="flex items-center justify-center gap-1">
                    Def {isEditing && defMismatch && <MismatchWarning current={totalDef} expected={opponentBlockedShots} />}
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
                return (
                  <tr key={player.id} className="border-b border-border">
                    <td className="py-2 px-2">
                      <div
                        className="flex items-center gap-2 cursor-pointer hover:underline"
                        onClick={() => navigate(`/team/${player.id}`)}
                      >
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
                      {isEditing ? (
                        <Input
                          type="number"
                          min="0"
                          value={manualStats.shotsOnGoal || ''}
                          onChange={(e) => handleStatChange(player.id, 'shotsOnGoal', e.target.value)}
                          className="w-16 h-10 text-center text-base px-1"
                          placeholder="0"
                        />
                      ) : (
                        <ReadOnlyCell value={manualStats.shotsOnGoal} />
                      )}
                    </td>
                    <td className="py-2 px-1 text-center">
                      {isEditing ? (
                        <Input
                          type="number"
                          min="0"
                          value={manualStats.shotsOffGoal || ''}
                          onChange={(e) => handleStatChange(player.id, 'shotsOffGoal', e.target.value)}
                          className="w-16 h-10 text-center text-base px-1"
                          placeholder="0"
                        />
                      ) : (
                        <ReadOnlyCell value={manualStats.shotsOffGoal} />
                      )}
                    </td>
                    <td className="py-2 px-1 text-center">
                      {isEditing ? (
                        <Input
                          type="number"
                          min="0"
                          value={manualStats.shotsBlocked || ''}
                          onChange={(e) => handleStatChange(player.id, 'shotsBlocked', e.target.value)}
                          className="w-16 h-10 text-center text-base px-1"
                          placeholder="0"
                        />
                      ) : (
                        <ReadOnlyCell value={manualStats.shotsBlocked} />
                      )}
                    </td>
                    <td className="py-2 px-2 text-center tabular-nums font-semibold">
                      {totalShots > 0 ? totalShots : <span className="text-muted-foreground">0</span>}
                    </td>
                    <td className="py-2 px-1 text-center">
                      {isEditing ? (
                        <Input
                          type="number"
                          min="0"
                          value={manualStats.defensiveBlocks || ''}
                          onChange={(e) => handleStatChange(player.id, 'defensiveBlocks', e.target.value)}
                          className="w-16 h-10 text-center text-base px-1"
                          placeholder="0"
                        />
                      ) : (
                        <ReadOnlyCell value={manualStats.defensiveBlocks} />
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
          M = Mål, A = Assist, SOG = Skott på mål, Miss = Missade skott, Blk = Blockerade skott (av motståndare), Tot = Totala skott, Def = Defensiva blockeringar, UM = Utvisningsminuter, +/− = Plus/Minus (5v5)
        </p>
      </div>

      {/* Goaltender Statistics */}
      {goalies.length > 0 && (
        <div className="pt-4 border-t border-border">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2 mb-4">
            <Shield className="h-4 w-4" />
            Målvaktsstatistik
          </h4>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-2 px-2 text-left font-medium text-muted-foreground">Målvakt</th>
                  <th className="py-2 px-2 text-center font-medium text-muted-foreground">GA</th>
                  <th className="py-2 px-2 text-center font-medium text-muted-foreground">SA</th>
                  <th className="py-2 px-2 text-center font-medium text-muted-foreground">SV</th>
                  <th className="py-2 px-2 text-center font-medium text-muted-foreground">SV%</th>
                </tr>
              </thead>
              <tbody>
                {goalies.map(goalie => {
                  const isActive = goalie.id === activeGoalieId;
                  const { goalsAgainst, shotsAgainst } = getGoalieStats(goalie.id);
                  const saves = shotsAgainst - goalsAgainst;
                  const savePercentage = shotsAgainst > 0
                    ? (saves / shotsAgainst) * 100
                    : 0;

                  return (
                    <tr key={goalie.id} className="border-b border-border">
                      <td className="py-3 px-2">
                        <div
                          className="flex items-center gap-2 cursor-pointer hover:underline"
                          onClick={() => navigate(`/team/${goalie.id}`)}
                        >
                          <Badge variant={isActive ? 'default' : 'outline'} className="text-xs">
                            #{goalie.jerseyNumber}
                          </Badge>
                          <span className="font-medium">
                            {goalie.name}
                          </span>
                          {isActive && (
                            <Badge variant="secondary" className="text-xs">
                              Aktiv
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

          <p className="text-xs text-muted-foreground mt-3">
            GA = Insläppta mål, SA = Skott mot, SV = Räddningar, SV% = Räddningsprocent
          </p>
        </div>
      )}
    </div>
  );
}
