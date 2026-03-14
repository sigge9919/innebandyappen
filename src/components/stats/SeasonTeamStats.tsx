import { EnhancedGame, GameSituation } from '@/types/game';
import { aggregateTeamStats, getAllSituationStats, AggregatedTeamStats } from '@/lib/seasonStats';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getSituationLabel } from '@/types/game';

interface SeasonTeamStatsProps {
  games: EnhancedGame[];
}

function StatsRow({ label, stats, isHighlight = false }: { 
  label: string; 
  stats: AggregatedTeamStats;
  isHighlight?: boolean;
}) {
  return (
    <TableRow className={isHighlight ? 'bg-muted/50' : ''}>
      <TableCell className="font-medium">{label}</TableCell>
      <TableCell className="text-center">{stats.gamesPlayed}</TableCell>
      <TableCell className="text-center font-semibold">{stats.goals}</TableCell>
      <TableCell className="text-center">{stats.shotsOnGoal}</TableCell>
      <TableCell className="text-center">{stats.shotsOffGoal}</TableCell>
      <TableCell className="text-center">{stats.shotsBlocked}</TableCell>
      <TableCell className="text-center">{stats.totalShots}</TableCell>
      <TableCell className="text-center text-muted-foreground">
        {stats.shotOnGoalPct.toFixed(1)}%
      </TableCell>
      <TableCell className="text-center text-muted-foreground">
        {stats.shotBlockedPct.toFixed(1)}%
      </TableCell>
    </TableRow>
  );
}

export function SeasonTeamStats({ games }: SeasonTeamStatsProps) {
  const homeStats = aggregateTeamStats(games, 'home');
  const opponentStats = aggregateTeamStats(games, 'opponent');
  const situationStats = getAllSituationStats(games);

  const gamesPlayed = games.length;
  const wins = games.filter(g => g.ourScore > g.opponentScore).length;
  const losses = games.filter(g => g.ourScore < g.opponentScore).length;
  const winRate = gamesPlayed > 0 ? (wins / gamesPlayed) * 100 : 0;

  // Calculate PP and BP efficiency
  const ppStats = situationStats.find(s => s.situation === '5v4');
  const bpStats = situationStats.find(s => s.situation === '4v5');
  
  const ppOpportunities = ppStats?.opportunities || 0;
  const ppGoals = ppStats?.home.goals || 0;
  const ppEfficiency = ppOpportunities > 0 ? (ppGoals / ppOpportunities) * 100 : 0;
  
  const bpOpportunities = bpStats?.opportunities || 0;
  const bpGoalsAgainst = bpStats?.opponent.goals || 0;
  const bpKillRate = bpOpportunities > 0 ? ((bpOpportunities - bpGoalsAgainst) / bpOpportunities) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Record Summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="stat-card text-center">
          <p className="metric-label">Matcher</p>
          <p className="metric-value">{gamesPlayed}</p>
        </div>
        <div className="stat-card text-center">
          <p className="metric-label">Vinster</p>
          <p className="metric-value text-success">{wins}</p>
        </div>
        <div className="stat-card text-center">
          <p className="metric-label">Förluster</p>
          <p className="metric-value text-destructive">{losses}</p>
        </div>
        <div className="stat-card text-center">
          <p className="metric-label">Win Rate</p>
          <p className="metric-value">{winRate.toFixed(0)}%</p>
        </div>
      </div>

      {/* Special Teams Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <p className="metric-label">Power Play (PP)</p>
            <span className="text-xs text-muted-foreground">{ppGoals}/{ppOpportunities}</span>
          </div>
          <p className="metric-value text-2xl">
            {ppOpportunities > 0 ? `${ppEfficiency.toFixed(1)}%` : '-'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Goals per opportunity</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <p className="metric-label">Box Play (BP)</p>
            <span className="text-xs text-muted-foreground">{bpOpportunities - bpGoalsAgainst}/{bpOpportunities}</span>
          </div>
          <p className="metric-value text-2xl">
            {bpOpportunities > 0 ? `${bpKillRate.toFixed(1)}%` : '-'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Penalty kills</p>
        </div>
      </div>

      {/* Overall Stats */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Overall Statistics</h3>
        <div className="rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Team</TableHead>
                <TableHead className="text-center">GP</TableHead>
                <TableHead className="text-center">G</TableHead>
                <TableHead className="text-center">SOG</TableHead>
                <TableHead className="text-center">Miss</TableHead>
                <TableHead className="text-center">Blk</TableHead>
                <TableHead className="text-center">Total</TableHead>
                <TableHead className="text-center">SOG%</TableHead>
                <TableHead className="text-center">Blk%</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <StatsRow label="Our Team" stats={homeStats} isHighlight />
              <StatsRow label="Opponents (combined)" stats={opponentStats} />
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Situation Breakdown */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Situation Breakdown</h3>
        <div className="space-y-4">
          {situationStats.map(({ situation, home, opponent, opportunities }) => {
            // Skip if no activity in this situation
            if (home.totalShots === 0 && opponent.totalShots === 0 && home.goals === 0 && opponent.goals === 0) {
              return null;
            }
            
            return (
              <div key={situation} className="rounded-lg border overflow-hidden">
                <div className="bg-muted/50 px-4 py-2 border-b flex items-center justify-between">
                  <span className="font-medium">{getSituationLabel(situation)}</span>
                  {opportunities !== undefined && opportunities > 0 && (
                    <span className="text-sm text-muted-foreground">
                      {opportunities} opportunities
                    </span>
                  )}
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Team</TableHead>
                      <TableHead className="text-center">G</TableHead>
                      <TableHead className="text-center">SOG</TableHead>
                      <TableHead className="text-center">Miss</TableHead>
                      <TableHead className="text-center">Blk</TableHead>
                      <TableHead className="text-center">Total</TableHead>
                      <TableHead className="text-center">SOG%</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Our Team</TableCell>
                      <TableCell className="text-center font-semibold">{home.goals}</TableCell>
                      <TableCell className="text-center">{home.shotsOnGoal}</TableCell>
                      <TableCell className="text-center">{home.shotsOffGoal}</TableCell>
                      <TableCell className="text-center">{home.shotsBlocked}</TableCell>
                      <TableCell className="text-center">{home.totalShots}</TableCell>
                      <TableCell className="text-center text-muted-foreground">
                        {home.shotOnGoalPct.toFixed(0)}%
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Opponents</TableCell>
                      <TableCell className="text-center font-semibold">{opponent.goals}</TableCell>
                      <TableCell className="text-center">{opponent.shotsOnGoal}</TableCell>
                      <TableCell className="text-center">{opponent.shotsOffGoal}</TableCell>
                      <TableCell className="text-center">{opponent.shotsBlocked}</TableCell>
                      <TableCell className="text-center">{opponent.totalShots}</TableCell>
                      <TableCell className="text-center text-muted-foreground">
                        {opponent.shotOnGoalPct.toFixed(0)}%
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
