import { EnhancedGame } from '@/types/game';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import { Link } from 'react-router-dom';

interface NextGameCardProps {
  game: EnhancedGame;
}

export function NextGameCard({ game }: NextGameCardProps) {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="metric-label">Nästa match</h3>
        <span className="status-badge bg-primary/10 text-primary border-primary/20">Kommande</span>
      </div>
      
      <p className="text-lg font-semibold text-foreground">{game.opponent}</p>
      <p className="text-xs text-muted-foreground mt-1">
        {format(new Date(game.date), 'EEE d MMM', { locale: sv })} &middot; {game.location === 'Home' ? 'Hemma' : 'Borta'}
      </p>

      <Link to={`/games/${game.id}`} className="block mt-3 text-xs font-medium text-primary hover:underline">
        Visa detaljer
      </Link>
    </div>
  );
}
