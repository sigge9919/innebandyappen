import { useNavigate } from 'react-router-dom';
import { Player } from '@/types';
import { EnhancedGame } from '@/types/game';
import { aggregatePlayerStats, aggregateGoalieStats } from '@/lib/seasonStats';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface SeasonPlayerStatsProps {
  games: EnhancedGame[];
  players: Player[];
}

export function SeasonPlayerStats({ games, players }: SeasonPlayerStatsProps) {
  const navigate = useNavigate();
  const skaters = players.filter(p => !p.positions?.includes('Goalkeeper'));
  const goalies = players.filter(p => p.positions?.includes('Goalkeeper'));
  
  const skaterStats = aggregatePlayerStats(games, skaters);
  const goalieStats = aggregateGoalieStats(games, goalies);
  
  // Also show goalies who haven't played but are in the roster
  const allGoalieStats = goalies.map(goalie => {
    const existing = goalieStats.find(g => g.playerId === goalie.id);
    if (existing) return existing;
    return {
      playerId: goalie.id,
      playerName: goalie.name,
      jerseyNumber: goalie.jerseyNumber,
      gamesPlayed: 0,
      goalsAgainst: 0,
      shotsAgainst: 0,
      savePercentage: 0,
    };
  }).sort((a, b) => b.gamesPlayed - a.gamesPlayed || b.savePercentage - a.savePercentage);
  return (
    <div className="space-y-6">
      {/* Skater Stats */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Utespelarstatistik</h3>
        <div className="rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead>Spelare</TableHead>
                <TableHead className="text-center">GP</TableHead>
                <TableHead className="text-center">G</TableHead>
                <TableHead className="text-center">A</TableHead>
                <TableHead className="text-center">P</TableHead>
                <TableHead className="text-center">+/-</TableHead>
                <TableHead className="text-center">PIM</TableHead>
                <TableHead className="text-center">Skott på mål</TableHead>
                <TableHead className="text-center">Miss</TableHead>
                <TableHead className="text-center">Blk</TableHead>
                <TableHead className="text-center">Skott på mål %</TableHead>
                <TableHead className="text-center">Blk%</TableHead>
                <TableHead className="text-center">Def</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {skaterStats.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={14} className="text-center text-muted-foreground py-8">
                    Ingen spelarstatistik tillgänglig
                  </TableCell>
                </TableRow>
              ) : (
              skaterStats.map(stat => (
                  <TableRow 
                    key={stat.playerId}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/team/${stat.playerId}`)}
                  >
                    <TableCell className="font-medium">{stat.jerseyNumber}</TableCell>
                    <TableCell>{stat.playerName}</TableCell>
                    <TableCell className="text-center">{stat.gamesPlayed}</TableCell>
                    <TableCell className="text-center font-semibold">{stat.goals}</TableCell>
                    <TableCell className="text-center">{stat.assists}</TableCell>
                    <TableCell className="text-center font-semibold">{stat.points}</TableCell>
                    <TableCell className={`text-center ${stat.plusMinus5v5 > 0 ? 'text-success' : stat.plusMinus5v5 < 0 ? 'text-destructive' : ''}`}>
                      {stat.plusMinus5v5 > 0 ? '+' : ''}{stat.plusMinus5v5}
                    </TableCell>
                    <TableCell className="text-center">{stat.penaltyMinutes}</TableCell>
                    <TableCell className="text-center">{stat.shotsOnGoal}</TableCell>
                    <TableCell className="text-center">{stat.shotsOffGoal}</TableCell>
                    <TableCell className="text-center">{stat.shotsBlocked}</TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {stat.shotOnGoalPct.toFixed(0)}%
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {stat.shotBlockedPct.toFixed(0)}%
                    </TableCell>
                    <TableCell className="text-center">{stat.defensiveBlocks}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Goalie Stats */}
      {allGoalieStats.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Målvaktsstatistik</h3>
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead>Målvakt</TableHead>
                  <TableHead className="text-center">GP</TableHead>
                  <TableHead className="text-center">GA</TableHead>
                  <TableHead className="text-center">SA</TableHead>
                  <TableHead className="text-center">SV%</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allGoalieStats.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Ingen målvaktsstatistik tillgänglig
                    </TableCell>
                  </TableRow>
                ) : (
                allGoalieStats.map(stat => (
                    <TableRow 
                      key={stat.playerId}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/team/${stat.playerId}`)}
                    >
                      <TableCell className="font-medium">{stat.jerseyNumber}</TableCell>
                      <TableCell>{stat.playerName}</TableCell>
                      <TableCell className="text-center">{stat.gamesPlayed}</TableCell>
                      <TableCell className="text-center">{stat.goalsAgainst}</TableCell>
                      <TableCell className="text-center">{stat.shotsAgainst}</TableCell>
                      <TableCell className="text-center font-semibold">
                        {stat.gamesPlayed > 0 ? `${stat.savePercentage.toFixed(1)}%` : '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
