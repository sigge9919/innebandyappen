import { Game } from '@/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarDays, MapPin } from 'lucide-react';

interface GameCardProps {
  game: Game;
  onClick?: () => void;
}

export function GameCard({ game, onClick }: GameCardProps) {
  const isPlayed = game.status === 'Played';
  const won = isPlayed && (game.ourScore ?? 0) > (game.opponentScore ?? 0);
  const tied = isPlayed && game.ourScore === game.opponentScore;

  return (
    <div
      onClick={onClick}
      className={cn(
        'stat-card cursor-pointer hover:shadow-md transition-all duration-200',
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="h-4 w-4" />
          {format(new Date(game.date), 'EEE, MMM d, yyyy')}
        </div>
        <span className={cn(
          'status-badge',
          isPlayed
            ? won ? 'bg-success/10 text-success' : tied ? 'bg-muted text-muted-foreground' : 'bg-destructive/10 text-destructive'
            : 'bg-primary/10 text-primary'
        )}>
          {isPlayed ? (won ? 'Win' : tied ? 'Tie' : 'Loss') : 'Upcoming'}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{game.opponent}</h3>
          <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {game.location}
          </div>
        </div>

        {isPlayed && (
          <div className="text-right">
            <p className="text-3xl font-bold text-foreground">
              {game.ourScore} - {game.opponentScore}
            </p>
          </div>
        )}
      </div>

      {game.notes && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Focus Next Week</p>
          <p className="text-sm text-foreground">{game.notes.focusNextWeek}</p>
        </div>
      )}
    </div>
  );
}
