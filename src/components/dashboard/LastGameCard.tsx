import { EnhancedGame } from '@/types/game';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface LastGameCardProps {
  game: EnhancedGame;
}

export function LastGameCard({ game }: LastGameCardProps) {
  const won = game.ourScore > game.opponentScore;
  const tied = game.ourScore === game.opponentScore;

  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="metric-label">Last Game</h3>
        <span className={cn(
          'status-badge',
          won ? 'bg-success/10 text-success border-success/20' : tied ? 'bg-muted text-muted-foreground' : 'bg-destructive/10 text-destructive border-destructive/20'
        )}>
          {won ? 'W' : tied ? 'D' : 'L'}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">vs {game.opponent}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {format(new Date(game.date), 'MMM d')} &middot; {game.location}
          </p>
        </div>
        <p className="text-2xl font-bold text-foreground tabular-nums">
          {game.ourScore}&ndash;{game.opponentScore}
        </p>
      </div>

      {game.notes && (
        <div className="mt-3 pt-3 border-t border-border space-y-1">
          {game.notes.whatWorked && (
            <p className="text-xs text-muted-foreground"><span className="font-medium text-success">+</span> {game.notes.whatWorked}</p>
          )}
          {game.notes.whatDidnt && (
            <p className="text-xs text-muted-foreground"><span className="font-medium text-destructive">&minus;</span> {game.notes.whatDidnt}</p>
          )}
        </div>
      )}

      <Link to={`/games/${game.id}`} className="block mt-3 text-xs font-medium text-primary hover:underline">
        View all games
      </Link>
    </div>
  );
}
