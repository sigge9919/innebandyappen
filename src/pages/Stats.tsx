import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useEnhancedGames } from '@/hooks/useEnhancedGames';
import { usePlayers } from '@/hooks/useLocalStorage';
import { Button } from '@/components/ui/button';
import { BarChart3, Users, TrendingUp } from 'lucide-react';
import { getFinishedGames } from '@/lib/seasonStats';
import { SeasonPlayerStats } from '@/components/stats/SeasonPlayerStats';
import { SeasonTeamStats } from '@/components/stats/SeasonTeamStats';
import { TeamTrends } from '@/components/stats/TeamTrends';
import { PlayerTrends } from '@/components/stats/PlayerTrends';

type StatsViewType = 'player' | 'team' | 'trends';
type StatsPeriodType = 'season' | 'last3';
type TrendsSubView = 'team' | 'player';

export default function Stats() {
  const { games } = useEnhancedGames();
  const { players } = usePlayers();
  const [statsView, setStatsView] = useState<StatsViewType>('player');
  const [statsPeriod, setStatsPeriod] = useState<StatsPeriodType>('season');
  const [trendsSubView, setTrendsSubView] = useState<TrendsSubView>('team');

  const finishedGamesCount = games.filter(g => g.status === 'Finished').length;

  const statsGames = statsPeriod === 'last3'
    ? getFinishedGames(games, 3)
    : getFinishedGames(games);

  return (
    <AppLayout>
      <div className="page-container">
        {/* Header */}
        <div className="section-header">
          <div>
            <h1 className="section-title">Stats</h1>
            <p className="text-muted-foreground mt-1">
              Season statistics from {finishedGamesCount} finished game{finishedGamesCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {finishedGamesCount === 0 ? (
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No finished games to analyze</p>
            <p className="text-sm text-muted-foreground mt-1">
              Complete some games to see statistics
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Stats Controls */}
            <div className="flex flex-wrap items-center gap-4">
              {/* View Toggle */}
              <div className="flex gap-2">
                <Button
                  variant={statsView === 'player' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatsView('player')}
                  className="gap-2"
                >
                  <Users className="h-4 w-4" />
                  Player Stats
                </Button>
                <Button
                  variant={statsView === 'team' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatsView('team')}
                  className="gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  Team Stats
                </Button>
                <Button
                  variant={statsView === 'trends' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatsView('trends')}
                  className="gap-2"
                >
                  <TrendingUp className="h-4 w-4" />
                  Trends
                </Button>
              </div>

              {/* Period Toggle */}
              <div className="flex gap-2">
                <Button
                  variant={statsPeriod === 'season' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatsPeriod('season')}
                >
                  Full Season
                </Button>
                <Button
                  variant={statsPeriod === 'last3' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatsPeriod('last3')}
                >
                  Last 3 Games
                </Button>
              </div>
            </div>

            {/* Stats Period Info */}
            <p className="text-sm text-muted-foreground">
              Showing stats from {statsGames.length} finished game{statsGames.length !== 1 ? 's' : ''}
            </p>

            {/* Stats Content */}
            {statsView === 'player' ? (
              <SeasonPlayerStats games={statsGames} players={players} />
            ) : statsView === 'team' ? (
              <SeasonTeamStats games={statsGames} />
            ) : (
              <div className="space-y-4">
                {/* Trends Sub-Toggle */}
                <div className="flex gap-2">
                  <Button
                    variant={trendsSubView === 'team' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTrendsSubView('team')}
                  >
                    Team Trends
                  </Button>
                  <Button
                    variant={trendsSubView === 'player' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTrendsSubView('player')}
                  >
                    Player Trends
                  </Button>
                </div>

                {trendsSubView === 'team' ? (
                  <TeamTrends games={statsGames} />
                ) : (
                  <PlayerTrends games={statsGames} players={players} />
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
