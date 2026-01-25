import { CalendarDays, MapPin, ArrowRight } from 'lucide-react';
import { Game } from '@/types';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface NextGameCardProps {
  game: Game;
}

export function NextGameCard({ game }: NextGameCardProps) {
  return (
    <div className="stat-card animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Next Game</h3>
        <span className="status-badge bg-primary/10 text-primary">Upcoming</span>
      </div>
      
      <div className="space-y-4">
        <div>
          <p className="text-2xl font-bold text-foreground">{game.opponent}</p>
          <div className="flex items-center gap-4 mt-2 text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" />
              {format(new Date(game.date), 'EEE, MMM d')}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {game.location}
            </span>
          </div>
        </div>

        <Link to="/games">
          <Button variant="outline" size="sm" className="w-full group">
            View Game Details
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
