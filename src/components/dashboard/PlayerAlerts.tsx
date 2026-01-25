import { AlertTriangle, Target, ArrowRight, ChevronRight } from 'lucide-react';
import { Player } from '@/types';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PlayerAlertsProps {
  players: Player[];
  onPlayerClick?: (player: Player) => void;
}

export function PlayerAlerts({ players, onPlayerClick }: PlayerAlertsProps) {
  const injuredPlayers = players.filter(p => p.status === 'Injured');
  const focusPlayers = players.filter(p => p.focusFlag && p.status === 'Active');

  if (injuredPlayers.length === 0 && focusPlayers.length === 0) {
    return (
      <div className="stat-card animate-slide-up">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
          Player Alerts
        </h3>
        <p className="text-sm text-muted-foreground">No alerts at this time</p>
      </div>
    );
  }

  return (
    <div className="stat-card animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Player Alerts</h3>
      </div>

      <div className="space-y-3">
        {injuredPlayers.map(player => (
          <div 
            key={player.id} 
            onClick={() => onPlayerClick?.(player)}
            className={cn(
              "flex items-center gap-3 p-2 rounded-lg bg-destructive/5 border border-destructive/10",
              onPlayerClick && "cursor-pointer hover:bg-destructive/10 transition-colors"
            )}
          >
            <div className="p-1.5 rounded-full bg-destructive/10">
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground text-sm">{player.name}</p>
              <p className="text-xs text-muted-foreground truncate">{player.notes}</p>
            </div>
            <span className="status-badge status-injured shrink-0">Injured</span>
            {onPlayerClick && <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
          </div>
        ))}

        {focusPlayers.map(player => (
          <div 
            key={player.id} 
            onClick={() => onPlayerClick?.(player)}
            className={cn(
              "flex items-center gap-3 p-2 rounded-lg bg-accent/5 border border-accent/10",
              onPlayerClick && "cursor-pointer hover:bg-accent/10 transition-colors"
            )}
          >
            <div className="p-1.5 rounded-full bg-accent/10">
              <Target className="h-4 w-4 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground text-sm">{player.name}</p>
              <p className="text-xs text-muted-foreground truncate">{player.notes}</p>
            </div>
            <span className="status-badge status-focus shrink-0">Focus</span>
            {onPlayerClick && <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
          </div>
        ))}

        <Link to="/team">
          <Button variant="ghost" size="sm" className="w-full group text-muted-foreground hover:text-foreground">
            View All Players
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
