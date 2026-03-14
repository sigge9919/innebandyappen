import { Player } from '@/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Target, AlertTriangle } from 'lucide-react';

interface PlayerCardProps {
  player: Player;
  onClick?: () => void;
}

export function PlayerCard({ player, onClick }: PlayerCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'stat-card cursor-pointer hover:shadow-md transition-all duration-200',
        'flex items-center gap-4'
      )}
    >
      {/* Jersey Number */}
      <div className={cn(
        'w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold',
        player.status === 'Injured' 
          ? 'bg-destructive/10 text-destructive'
          : 'bg-primary text-primary-foreground'
      )}>
        {player.jerseyNumber}
      </div>

      {/* Player Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-foreground truncate">{player.name}</h3>
          {player.focusFlag && (
            <Target className="h-4 w-4 text-accent shrink-0" />
          )}
          {player.status === 'Injured' && (
            <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
          )}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="secondary" className="text-xs">
            {player.positions?.join(' / ') || (player as any).position || 'Forward'}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {player.stickSide === 'Left' ? 'Vänster' : player.stickSide === 'Right' ? 'Höger' : player.stickSide}
          </span>
        </div>
      </div>

      {/* Status */}
      <span className={cn(
        'status-badge shrink-0',
        player.status === 'Active' ? 'status-active' : 'status-injured'
      )}>
        {player.status === 'Active' ? 'Aktiv' : player.status === 'Injured' ? 'Skadad' : player.status}
      </span>
    </div>
  );
}
