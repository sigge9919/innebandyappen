import { useEffect, useMemo, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useEnhancedGames } from '@/hooks/useEnhancedGames';
import { usePlayers } from '@/hooks/useLocalStorage';
import { useTeam } from '@/contexts/TeamContext';
import { SeasonSelector } from '@/components/SeasonSelector';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Users, TrendingUp, Link2, Filter, X } from 'lucide-react';
import { getFinishedGames } from '@/lib/seasonStats';
import { SeasonPlayerStats } from '@/components/stats/SeasonPlayerStats';
import { SeasonTeamStats } from '@/components/stats/SeasonTeamStats';
import { TeamTrends } from '@/components/stats/TeamTrends';
import { PlayerTrends } from '@/components/stats/PlayerTrends';
import { LineCombinationStats } from '@/components/stats/LineCombinationStats';
import { GameFilterDialog } from '@/components/stats/GameFilterDialog';

type StatsViewType = 'player' | 'team' | 'trends' | 'combos';
type TrendsSubView = 'team' | 'player';

export default function Stats() {
  const { games } = useEnhancedGames();
  const { players } = usePlayers();
  const { seasons, selectedSeasonId, setSelectedSeasonId, selectedSeason } = useTeam();
  const [statsView, setStatsView] = useState<StatsViewType>('player');
  const [trendsSubView, setTrendsSubView] = useState<TrendsSubView>('team');
  const [selectedGameIds, setSelectedGameIds] = useState<string[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    setSelectedGameIds([]);
  }, [selectedSeasonId]);

  const allFinished = useMemo(() => getFinishedGames(games), [games]);
  const finishedGamesCount = allFinished.length;

  const statsGames = selectedGameIds.length === 0
    ? allFinished
    : allFinished.filter(g => selectedGameIds.includes(g.id));

  const selectedGames = allFinished.filter(g => selectedGameIds.includes(g.id));

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
                <Button variant={statsView === 'combos' ? 'default' : 'outline'} size="sm" onClick={() => setStatsView('combos')} className="gap-2">
                  <Link2 className="h-4 w-4" />
                  Kombinationer
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  variant={selectedGameIds.length === 0 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedGameIds([])}
                >
                  Hela säsongen
                </Button>
                <Button
                  variant={selectedGameIds.length > 0 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterOpen(true)}
                  className="gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Välj matcher{selectedGameIds.length > 0 ? ` (${selectedGameIds.length})` : '…'}
                </Button>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Visar statistik från {statsGames.length} avslutad{statsGames.length !== 1 ? 'e' : ''} match{statsGames.length !== 1 ? 'er' : ''}
              {selectedGameIds.length > 0 ? ` av ${finishedGamesCount}` : ''}
            </p>

            {selectedGames.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {selectedGames.map(g => (
                  <Badge key={g.id} variant="secondary" className="gap-1.5 pr-1">
                    <span>{g.location === 'Home' ? 'vs' : '@'} {g.opponent} ({g.date})</span>
                    <button
                      onClick={() => setSelectedGameIds(prev => prev.filter(id => id !== g.id))}
                      className="hover:bg-muted-foreground/20 rounded-sm p-0.5"
                      aria-label="Ta bort"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {statsView === 'player' ? (
              <SeasonPlayerStats games={statsGames} players={players} />
            ) : statsView === 'team' ? (
              <SeasonTeamStats games={statsGames} />
            ) : statsView === 'combos' ? (
              <LineCombinationStats games={statsGames} players={players} />
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

      <GameFilterDialog
        open={filterOpen}
        onOpenChange={setFilterOpen}
        games={allFinished}
        selectedIds={selectedGameIds}
        onConfirm={setSelectedGameIds}
      />
    </AppLayout>
  );
}
