import { Player } from '@/types';
import { Link } from 'react-router-dom';
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
      <div className="stat-card">
        <h3 className="metric-label mb-3">Player Alerts</h3>
        <p className="text-sm text-muted-foreground">No alerts</p>
      </div>
    );
  }

  return (
    <div className="stat-card">
      <h3 className="metric-label mb-3">Player Alerts</h3>

      <div className="space-y-0 divide-y divide-border">
        {injuredPlayers.map(player => (
          <div 
            key={player.id} 
            onClick={() => onPlayerClick?.(player)}
            className={cn(
              "flex items-center justify-between py-2",
              onPlayerClick && "cursor-pointer hover:bg-muted/50"
            )}
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">{player.name}</p>
              {player.notes && <p className="text-xs text-muted-foreground truncate">{player.notes}</p>}
            </div>
            <span className="status-badge status-injured shrink-0 ml-2">Injured</span>
          </div>
        ))}

        {focusPlayers.map(player => (
          <div 
            key={player.id} 
            onClick={() => onPlayerClick?.(player)}
            className={cn(
              "flex items-center justify-between py-2",
              onPlayerClick && "cursor-pointer hover:bg-muted/50"
            )}
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">{player.name}</p>
              {player.notes && <p className="text-xs text-muted-foreground truncate">{player.notes}</p>}
            </div>
            <span className="status-badge status-focus shrink-0 ml-2">Focus</span>
          </div>
        ))}
      </div>

      <Link to="/team" className="block mt-3 text-xs font-medium text-primary hover:underline">
        View all players
      </Link>
    </div>
  );
}
