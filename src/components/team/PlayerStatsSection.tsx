import { Player } from '@/types';
import { EnhancedGame } from '@/types/game';
import { aggregatePlayerStats, aggregateGoalieStats, getFinishedGames } from '@/lib/seasonStats';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface PlayerStatsSectionProps {
  player: Player;
  games: EnhancedGame[];
}

export function PlayerStatsSection({ player, games }: PlayerStatsSectionProps) {
  const finishedGames = getFinishedGames(games);
  const isGoalie = player.positions?.includes('Goalkeeper');
  
  if (isGoalie) {
    const goalieStats = aggregateGoalieStats(finishedGames, [player]);
    const stats = goalieStats.find(g => g.playerId === player.id);
    
    if (!stats || stats.gamesPlayed === 0) {
      return (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
             Ingen matchstatistik tillgänglig ännu
          </CardContent>
        </Card>
      );
    }
    
    return (
      <div className="space-y-4">
        {/* Key Stats Cards */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-2xl font-bold">{stats.gamesPlayed}</p>
              <p className="text-xs text-muted-foreground">GP</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-2xl font-bold">{stats.goalsAgainst}</p>
              <p className="text-xs text-muted-foreground">GA</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-2xl font-bold">{stats.shotsAgainst}</p>
              <p className="text-xs text-muted-foreground">SA</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-2xl font-bold text-primary">
                {stats.savePercentage.toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground">SV%</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Detailed Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>GP</TableHead>
                  <TableHead>GA</TableHead>
                  <TableHead>SA</TableHead>
                  <TableHead>Räddningar</TableHead>
                  <TableHead>SV%</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>{stats.gamesPlayed}</TableCell>
                  <TableCell>{stats.goalsAgainst}</TableCell>
                  <TableCell>{stats.shotsAgainst}</TableCell>
                  <TableCell>{stats.shotsAgainst - stats.goalsAgainst}</TableCell>
                  <TableCell className="font-semibold">
                    {stats.savePercentage.toFixed(1)}%
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Skater stats
  const skaterStats = aggregatePlayerStats(finishedGames, [player]);
  const stats = skaterStats.find(s => s.playerId === player.id);
  
  if (!stats || stats.gamesPlayed === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Ingen matchstatistik tillgänglig ännu
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Key Stats Cards */}
      <div className="grid grid-cols-5 gap-3">
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-2xl font-bold">{stats.gamesPlayed}</p>
            <p className="text-xs text-muted-foreground">GP</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-2xl font-bold text-primary">{stats.goals}</p>
            <p className="text-xs text-muted-foreground">Mål</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-2xl font-bold">{stats.assists}</p>
            <p className="text-xs text-muted-foreground">Assists</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-2xl font-bold text-primary">{stats.points}</p>
            <p className="text-xs text-muted-foreground">Points</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className={`text-2xl font-bold ${stats.plusMinus5v5 > 0 ? 'text-success' : stats.plusMinus5v5 < 0 ? 'text-destructive' : ''}`}>
              {stats.plusMinus5v5 > 0 ? '+' : ''}{stats.plusMinus5v5}
            </p>
            <p className="text-xs text-muted-foreground">+/-</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Detailed Stats Table */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>GP</TableHead>
                <TableHead>G</TableHead>
                <TableHead>A</TableHead>
                <TableHead>P</TableHead>
                <TableHead>+/-</TableHead>
                <TableHead>PIM</TableHead>
                <TableHead>SOG</TableHead>
                <TableHead>Miss</TableHead>
                <TableHead>Blk</TableHead>
                <TableHead>SOG%</TableHead>
                <TableHead>Blk%</TableHead>
                <TableHead>Def</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>{stats.gamesPlayed}</TableCell>
                <TableCell className="font-semibold">{stats.goals}</TableCell>
                <TableCell>{stats.assists}</TableCell>
                <TableCell className="font-semibold">{stats.points}</TableCell>
                <TableCell className={stats.plusMinus5v5 > 0 ? 'text-success' : stats.plusMinus5v5 < 0 ? 'text-destructive' : ''}>
                  {stats.plusMinus5v5 > 0 ? '+' : ''}{stats.plusMinus5v5}
                </TableCell>
                <TableCell>{stats.penaltyMinutes}</TableCell>
                <TableCell>{stats.shotsOnGoal}</TableCell>
                <TableCell>{stats.shotsOffGoal}</TableCell>
                <TableCell>{stats.shotsBlocked}</TableCell>
                <TableCell className="text-muted-foreground">{stats.shotOnGoalPct.toFixed(0)}%</TableCell>
                <TableCell className="text-muted-foreground">{stats.shotBlockedPct.toFixed(0)}%</TableCell>
                <TableCell>{stats.defensiveBlocks}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
