import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { GameCard } from '@/components/games/GameCard';
import { mockGames } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Plus, Trophy, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

type FilterType = 'all' | 'upcoming' | 'played';

export default function Games() {
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredGames = mockGames.filter(game => {
    switch (filter) {
      case 'upcoming':
        return game.status === 'Upcoming';
      case 'played':
        return game.status === 'Played';
      default:
        return true;
    }
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const gamesWon = mockGames.filter(g => g.status === 'Played' && (g.ourScore ?? 0) > (g.opponentScore ?? 0)).length;
  const gamesLost = mockGames.filter(g => g.status === 'Played' && (g.ourScore ?? 0) < (g.opponentScore ?? 0)).length;
  const gamesPlayed = mockGames.filter(g => g.status === 'Played').length;

  return (
    <AppLayout>
      <div className="page-container">
        {/* Header */}
        <div className="section-header">
          <div>
            <h1 className="section-title">Games & Stats</h1>
            <p className="text-muted-foreground mt-1">
              {gamesPlayed} played • {gamesWon}W - {gamesLost}L
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Game
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="stat-card text-center">
            <p className="metric-label">Wins</p>
            <p className="metric-value text-success">{gamesWon}</p>
          </div>
          <div className="stat-card text-center">
            <p className="metric-label">Losses</p>
            <p className="metric-value text-destructive">{gamesLost}</p>
          </div>
          <div className="stat-card text-center">
            <p className="metric-label">Win Rate</p>
            <p className="metric-value">
              {gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0}%
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All Games
          </Button>
          <Button
            variant={filter === 'upcoming' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('upcoming')}
            className="gap-2"
          >
            <Calendar className="h-4 w-4" />
            Upcoming
          </Button>
          <Button
            variant={filter === 'played' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('played')}
            className="gap-2"
          >
            <Trophy className="h-4 w-4" />
            Played
          </Button>
        </div>

        {/* Games List */}
        <div className="grid gap-4 md:grid-cols-2">
          {filteredGames.map(game => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>

        {filteredGames.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No games found</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
