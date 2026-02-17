import { Trophy, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { EnhancedGame } from '@/types/game';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LastGameCardProps {
  game: EnhancedGame;
}

export function LastGameCard({ game }: LastGameCardProps) {
  const won = game.ourScore > game.opponentScore;
  const tied = game.ourScore === game.opponentScore;

  return (
    <div className="stat-card animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Last Game</h3>
        <span className={cn(
          'status-badge',
          won ? 'bg-success/10 text-success' : tied ? 'bg-muted text-muted-foreground' : 'bg-destructive/10 text-destructive'
        )}>
          {won ? 'Win' : tied ? 'Tie' : 'Loss'}
        </span>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-muted-foreground text-sm">vs {game.opponent}</p>
            <p className="text-xs text-muted-foreground/70 mt-0.5">
              {format(new Date(game.date), 'MMM d')} • {game.location}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-foreground">
              {game.ourScore} - {game.opponentScore}
            </p>
          </div>
        </div>

        {game.notes && (
          <div className="bg-muted/50 rounded-lg p-3 space-y-2">
            <div className="flex items-start gap-2">
              <TrendingUp className="h-4 w-4 text-success mt-0.5 shrink-0" />
              <p className="text-sm text-muted-foreground line-clamp-2">{game.notes.whatWorked}</p>
            </div>
            <div className="flex items-start gap-2">
              <TrendingDown className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
              <p className="text-sm text-muted-foreground line-clamp-2">{game.notes.whatDidnt}</p>
            </div>
          </div>
        )}

        <Link to={`/games/${game.id}`}>
          <Button variant="outline" size="sm" className="w-full group">
            View All Games
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
