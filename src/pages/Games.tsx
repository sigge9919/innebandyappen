import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { NewGameDialog } from '@/components/games/NewGameDialog';
import { useEnhancedGames } from '@/hooks/useEnhancedGames';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trophy, Calendar, MapPin, Play, CheckCircle, Clock } from 'lucide-react';
import { EnhancedGame, GameStatus } from '@/types/game';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

type FilterType = 'all' | 'not_started' | 'live' | 'finished';

export default function Games() {
  const navigate = useNavigate();
  const { games, addEnhancedGame, deleteEnhancedGame } = useEnhancedGames();
  const [filter, setFilter] = useState<FilterType>('all');
  const [dialogOpen, setDialogOpen] = useState(false);

  const filteredGames = games.filter(game => {
    switch (filter) {
      case 'not_started':
        return game.status === 'Not Started';
      case 'live':
        return game.status === 'Live';
      case 'finished':
        return game.status === 'Finished';
      default:
        return true;
    }
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const gamesPlayed = games.filter(g => g.status === 'Finished').length;
  const gamesWon = games.filter(g => g.status === 'Finished' && g.ourScore > g.opponentScore).length;
  const gamesLost = games.filter(g => g.status === 'Finished' && g.ourScore < g.opponentScore).length;
  const liveGames = games.filter(g => g.status === 'Live').length;

  const handleGameClick = (game: EnhancedGame) => {
    navigate(`/games/${game.id}`);
  };

  const handleSaveGame = (game: EnhancedGame) => {
    addEnhancedGame(game);
  };

  return (
    <AppLayout>
      <div className="page-container">
        {/* Header */}
        <div className="section-header">
          <div>
            <h1 className="section-title">Games & Stats</h1>
            <p className="text-muted-foreground mt-1">
              {gamesPlayed} played • {gamesWon}W - {gamesLost}L
              {liveGames > 0 && (
                <span className="ml-2 text-success font-medium">• {liveGames} Live</span>
              )}
            </p>
          </div>
          <Button className="gap-2" onClick={() => setDialogOpen(true)}>
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
        <div className="flex gap-2 mb-6 flex-wrap">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All Games
          </Button>
          <Button
            variant={filter === 'not_started' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('not_started')}
            className="gap-2"
          >
            <Clock className="h-4 w-4" />
            Not Started
          </Button>
          <Button
            variant={filter === 'live' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('live')}
            className="gap-2"
          >
            <Play className="h-4 w-4" />
            Live
          </Button>
          <Button
            variant={filter === 'finished' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('finished')}
            className="gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Finished
          </Button>
        </div>

        {/* Games List */}
        <div className="grid gap-4 md:grid-cols-2">
          {filteredGames.map(game => (
            <GameListCard 
              key={game.id} 
              game={game}
              onClick={() => handleGameClick(game)}
            />
          ))}
        </div>

        {filteredGames.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No games found</p>
            <Button className="mt-4" onClick={() => setDialogOpen(true)}>
              Add Your First Game
            </Button>
          </div>
        )}
      </div>

      <NewGameDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSaveGame}
      />
    </AppLayout>
  );
}

function GameListCard({ game, onClick }: { game: EnhancedGame; onClick: () => void }) {
  const statusConfig: Record<GameStatus, { color: string; icon: React.ComponentType<{ className?: string }> }> = {
    'Not Started': { color: 'bg-muted text-muted-foreground', icon: Clock },
    'Live': { color: 'bg-success/10 text-success border border-success animate-pulse', icon: Play },
    'Finished': { color: 'bg-primary/10 text-primary', icon: CheckCircle },
  };

  const { color, icon: StatusIcon } = statusConfig[game.status];
  const isFinished = game.status === 'Finished';
  const won = isFinished && game.ourScore > game.opponentScore;
  const lost = isFinished && game.ourScore < game.opponentScore;

  return (
    <div
      onClick={onClick}
      className="stat-card cursor-pointer hover:shadow-md hover:border-primary/30 transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {format(new Date(game.date), 'EEE, MMM d, yyyy')}
        </div>
        <Badge className={cn('gap-1', color)}>
          <StatusIcon className="h-3 w-3" />
          {game.status}
        </Badge>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{game.opponent}</h3>
          <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {game.location}
          </div>
        </div>

        {(game.status === 'Live' || game.status === 'Finished') && (
          <div className="text-right">
            <p className={cn(
              'text-3xl font-bold tabular-nums',
              won ? 'text-success' : lost ? 'text-destructive' : 'text-foreground'
            )}>
              {game.ourScore} - {game.opponentScore}
            </p>
          </div>
        )}
      </div>

      {game.status === 'Not Started' && game.squadPlayerIds.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Squad: {game.squadPlayerIds.length} players selected
          </p>
        </div>
      )}

      {isFinished && game.notes?.focusNextWeek && (
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Focus Next Week</p>
          <p className="text-sm text-foreground line-clamp-2">{game.notes.focusNextWeek}</p>
        </div>
      )}
    </div>
  );
}
