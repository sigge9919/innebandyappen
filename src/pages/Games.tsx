import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { NewGameDialog } from '@/components/games/NewGameDialog';
import { useEnhancedGames } from '@/hooks/useEnhancedGames';
import { useTeam } from '@/contexts/TeamContext';
import { SeasonSelector } from '@/components/SeasonSelector';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trophy, Calendar, MapPin, Play, CheckCircle, Clock } from 'lucide-react';
import { EnhancedGame, GameStatus } from '@/types/game';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import { cn } from '@/lib/utils';

type GameFilterType = 'all' | 'not_started' | 'live' | 'finished';

export default function Games() {
  const navigate = useNavigate();
  const { games, addEnhancedGame } = useEnhancedGames();
  const { seasons, selectedSeasonId, setSelectedSeasonId } = useTeam();
  const [gameFilter, setGameFilter] = useState<GameFilterType>('all');
  const [dialogOpen, setDialogOpen] = useState(false);

  const filteredGames = games.filter(game => {
    switch (gameFilter) {
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

  const liveGames = games.filter(g => g.status === 'Live').length;
  const finishedGames = games.filter(g => g.status === 'Finished');
  const wins = finishedGames.filter(g => g.ourScore > g.opponentScore).length;
  const losses = finishedGames.filter(g => g.ourScore < g.opponentScore).length;
  const draws = finishedGames.filter(g => g.ourScore === g.opponentScore).length;

  const handleGameClick = (game: EnhancedGame) => {
    navigate(`/games/${game.id}`);
  };

  const handleSaveGame = (game: EnhancedGame) => {
    addEnhancedGame(game);
  };

  const STATUS_LABELS: Record<GameStatus, string> = {
    'Not Started': 'Ej startad',
    'Live': 'Live',
    'Finished': 'Avslutad',
  };

  return (
    <AppLayout>
      <div className="page-container">
        {/* Header */}
        <div className="section-header">
          <div>
            <h1 className="section-title">Matcher</h1>
            <p className="text-muted-foreground mt-1">
              {games.length} matcher totalt
              {liveGames > 0 && (
                <span className="ml-2 text-success font-medium">• {liveGames} Live</span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <SeasonSelector seasons={seasons} selectedSeasonId={selectedSeasonId} onSeasonChange={setSelectedSeasonId} />
            <Button className="gap-2" onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              Lägg till match
            </Button>
          </div>
        </div>

        {/* Stats Banner */}
        {finishedGames.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            <div className="stat-card flex flex-col items-center py-4">
              <span className="text-2xl font-bold text-success">{wins}</span>
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Vinster</span>
            </div>
            <div className="stat-card flex flex-col items-center py-4">
              <span className="text-2xl font-bold text-muted-foreground">{draws}</span>
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Oavgjorda</span>
            </div>
            <div className="stat-card flex flex-col items-center py-4">
              <span className="text-2xl font-bold text-destructive">{losses}</span>
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Förluster</span>
            </div>
          </div>
        )}

        {/* Game Filters */}
        <div className="flex gap-2 flex-wrap">
          <Button variant={gameFilter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setGameFilter('all')}>
            Alla matcher
          </Button>
          <Button variant={gameFilter === 'not_started' ? 'default' : 'outline'} size="sm" onClick={() => setGameFilter('not_started')} className="gap-2">
            <Clock className="h-4 w-4" />
            Ej startade
          </Button>
          <Button variant={gameFilter === 'live' ? 'default' : 'outline'} size="sm" onClick={() => setGameFilter('live')} className="gap-2">
            <Play className="h-4 w-4" />
            Live
          </Button>
          <Button variant={gameFilter === 'finished' ? 'default' : 'outline'} size="sm" onClick={() => setGameFilter('finished')} className="gap-2">
            <CheckCircle className="h-4 w-4" />
            Avslutade
          </Button>
        </div>

        {/* Games List */}
        <div className="grid gap-4 md:grid-cols-2">
          {filteredGames.map(game => (
            <GameListCard 
              key={game.id} 
              game={game}
              onClick={() => handleGameClick(game)}
              statusLabels={STATUS_LABELS}
            />
          ))}
        </div>

        {filteredGames.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">Inga matcher hittades</p>
            <Button className="mt-4" onClick={() => setDialogOpen(true)}>
              Lägg till din första match
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

function GameListCard({ game, onClick, statusLabels }: { game: EnhancedGame; onClick: () => void; statusLabels: Record<GameStatus, string> }) {
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
          {format(new Date(game.date), 'EEE d MMM yyyy', { locale: sv })}
        </div>
        <Badge className={cn('gap-1', color)}>
          <StatusIcon className="h-3 w-3" />
          {statusLabels[game.status]}
        </Badge>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{game.opponent}</h3>
          <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {game.location === 'Home' ? 'Hemma' : 'Borta'}
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
            Trupp: {game.squadPlayerIds.length} spelare valda
          </p>
        </div>
      )}

      {isFinished && game.notes?.focusNextWeek && (
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Fokus nästa vecka</p>
          <p className="text-sm text-foreground line-clamp-2">{game.notes.focusNextWeek}</p>
        </div>
      )}
    </div>
  );
}
