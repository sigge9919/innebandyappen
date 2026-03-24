import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useEnhancedGames } from '@/hooks/useEnhancedGames';
import { usePlayers } from '@/hooks/useLocalStorage';
import { useTeam } from '@/contexts/TeamContext';
import { SeasonSelector } from '@/components/SeasonSelector';
import { Button } from '@/components/ui/button';
import { BarChart3, Users, TrendingUp, Link2 } from 'lucide-react';
import { getFinishedGames } from '@/lib/seasonStats';
import { SeasonPlayerStats } from '@/components/stats/SeasonPlayerStats';
import { SeasonTeamStats } from '@/components/stats/SeasonTeamStats';
import { TeamTrends } from '@/components/stats/TeamTrends';
import { PlayerTrends } from '@/components/stats/PlayerTrends';
import { LineCombinationStats } from '@/components/stats/LineCombinationStats';

type StatsViewType = 'player' | 'team' | 'trends' | 'combos';
type StatsPeriodType = 'season' | 'last3';
type TrendsSubView = 'team' | 'player';

export default function Stats() {
  const { games } = useEnhancedGames();
  const { players } = usePlayers();
  const { seasons, selectedSeasonId, setSelectedSeasonId, selectedSeason } = useTeam();
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
        <div className="section-header">
          <div>
            <h1 className="section-title">Statistik</h1>
            <p className="text-muted-foreground mt-1">
              {selectedSeason ? `${selectedSeason.name} — ` : ''}
              {finishedGamesCount} avslutad{finishedGamesCount !== 1 ? 'e' : ''} match{finishedGamesCount !== 1 ? 'er' : ''}
            </p>
          </div>
          <SeasonSelector seasons={seasons} selectedSeasonId={selectedSeasonId} onSeasonChange={setSelectedSeasonId} />
        </div>

        {finishedGamesCount === 0 ? (
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">Inga avslutade matcher att analysera</p>
            <p className="text-sm text-muted-foreground mt-1">
              Spela klart matcher för att se statistik
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex gap-2">
                <Button variant={statsView === 'player' ? 'default' : 'outline'} size="sm" onClick={() => setStatsView('player')} className="gap-2">
                  <Users className="h-4 w-4" />
                  Spelarstatistik
                </Button>
                <Button variant={statsView === 'team' ? 'default' : 'outline'} size="sm" onClick={() => setStatsView('team')} className="gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Lagstatistik
                </Button>
                <Button variant={statsView === 'trends' ? 'default' : 'outline'} size="sm" onClick={() => setStatsView('trends')} className="gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Trender
                </Button>
              </div>

              <div className="flex gap-2">
                <Button variant={statsPeriod === 'season' ? 'default' : 'outline'} size="sm" onClick={() => setStatsPeriod('season')}>
                  Hela säsongen
                </Button>
                <Button variant={statsPeriod === 'last3' ? 'default' : 'outline'} size="sm" onClick={() => setStatsPeriod('last3')}>
                  Senaste 3 matcherna
                </Button>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Visar statistik från {statsGames.length} avslutad{statsGames.length !== 1 ? 'e' : ''} match{statsGames.length !== 1 ? 'er' : ''}
            </p>

            {statsView === 'player' ? (
              <SeasonPlayerStats games={statsGames} players={players} />
            ) : statsView === 'team' ? (
              <SeasonTeamStats games={statsGames} />
            ) : (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button variant={trendsSubView === 'team' ? 'default' : 'outline'} size="sm" onClick={() => setTrendsSubView('team')}>
                    Lagtrender
                  </Button>
                  <Button variant={trendsSubView === 'player' ? 'default' : 'outline'} size="sm" onClick={() => setTrendsSubView('player')}>
                    Spelartrender
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
