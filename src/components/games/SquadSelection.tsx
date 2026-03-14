import { useState } from 'react';
import { Player } from '@/types';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { Users, Check } from 'lucide-react';

interface SquadSelectionProps {
  allPlayers: Player[];
  selectedPlayerIds: string[];
  onSelectionChange: (playerIds: string[]) => void;
  disabled?: boolean;
}

export function SquadSelection({
  allPlayers,
  selectedPlayerIds,
  onSelectionChange,
  disabled = false,
}: SquadSelectionProps) {
  const activePlayers = allPlayers.filter(p => p.status === 'Active');
  const injuredPlayers = allPlayers.filter(p => p.status === 'Injured');

  const togglePlayer = (playerId: string) => {
    if (disabled) return;
    if (selectedPlayerIds.includes(playerId)) {
      onSelectionChange(selectedPlayerIds.filter(id => id !== playerId));
    } else {
      onSelectionChange([...selectedPlayerIds, playerId]);
    }
  };

  const selectAll = () => {
    if (disabled) return;
    onSelectionChange(activePlayers.map(p => p.id));
  };

  const clearAll = () => {
    if (disabled) return;
    onSelectionChange([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Truppval</h3>
          <span className="text-sm text-muted-foreground">
            ({selectedPlayerIds.length} valda)
          </span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={selectAll} disabled={disabled}>
            Välj alla
          </Button>
          <Button variant="outline" size="sm" onClick={clearAll} disabled={disabled}>
            Rensa
          </Button>
        </div>
      </div>

      {/* Active Players */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">Aktiva spelare</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {activePlayers.map(player => (
            <PlayerCheckItem
              key={player.id}
              player={player}
              checked={selectedPlayerIds.includes(player.id)}
              onToggle={() => togglePlayer(player.id)}
              disabled={disabled}
            />
          ))}
        </div>
      </div>

      {/* Injured Players */}
      {injuredPlayers.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Injured Players</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {injuredPlayers.map(player => (
              <PlayerCheckItem
                key={player.id}
                player={player}
                checked={selectedPlayerIds.includes(player.id)}
                onToggle={() => togglePlayer(player.id)}
                disabled={disabled}
                injured
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PlayerCheckItem({
  player,
  checked,
  onToggle,
  disabled,
  injured = false,
}: {
  player: Player;
  checked: boolean;
  onToggle: () => void;
  disabled?: boolean;
  injured?: boolean;
}) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border transition-all text-left w-full',
        checked 
          ? 'border-primary bg-primary/5' 
          : 'border-border bg-card hover:border-primary/50',
        injured && 'opacity-60',
        disabled && 'cursor-not-allowed opacity-50'
      )}
    >
      <div className={cn(
        'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
        checked ? 'bg-primary border-primary' : 'border-muted-foreground'
      )}>
        {checked && <Check className="h-3 w-3 text-primary-foreground" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">
          #{player.jerseyNumber} {player.name}
        </p>
        <p className="text-xs text-muted-foreground">
          {player.positions?.join('/') || (player as any).position || 'Forward'} • {player.stickSide}
        </p>
      </div>
    </button>
  );
}
