import { useState } from 'react';
import { Player } from '@/types';
import { GameLine } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Target, XCircle, Shield } from 'lucide-react';

interface ShotPlayerDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (playerId?: string) => void;
  shotType: 'shot_on_goal' | 'shot_off_goal' | 'shot_blocked' | 'defensive_block';
  squadPlayers: Player[];
  lines: GameLine[];
  activeLineId?: string;
}

const SHOT_TYPE_CONFIG = {
  shot_on_goal: { label: 'Shot on Goal', icon: Target, color: 'text-primary' },
  shot_off_goal: { label: 'Shot Off Goal', icon: XCircle, color: 'text-muted-foreground' },
  shot_blocked: { label: 'Shot Blocked', icon: Shield, color: 'text-muted-foreground' },
  defensive_block: { label: 'Blocked by', icon: Shield, color: 'text-primary' },
};

export function ShotPlayerDialog({
  open,
  onClose,
  onConfirm,
  shotType,
  squadPlayers,
  lines,
  activeLineId,
}: ShotPlayerDialogProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<string | undefined>();
  const config = SHOT_TYPE_CONFIG[shotType];
  const Icon = config.icon;

  const activeLine = lines.find(l => l.id === activeLineId);
  const linePlayerIds = activeLine?.playerIds || [];
  const linePlayers = squadPlayers.filter(p => linePlayerIds.includes(p.id) && !p.positions?.includes('Goalkeeper'));
  const otherPlayers = squadPlayers.filter(p => !linePlayerIds.includes(p.id) && !p.positions?.includes('Goalkeeper'));

  const handleConfirm = () => {
    onConfirm(selectedPlayer);
    setSelectedPlayer(undefined);
  };

  const handleCancel = () => {
    setSelectedPlayer(undefined);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="max-w-md max-h-[70vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className={cn("h-5 w-5", config.color)} />
            {config.label}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <label className="text-sm font-medium">Select Player</label>

          {linePlayers.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Line players:</p>
              <div className="flex flex-wrap gap-1.5">
                {linePlayers.map(player => (
                  <button
                    key={player.id}
                    onClick={() => setSelectedPlayer(player.id)}
                    className={cn(
                      'px-2 py-1.5 rounded text-sm transition-colors',
                      selectedPlayer === player.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    )}
                  >
                    #{player.jerseyNumber} {player.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {otherPlayers.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Other players:</p>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {otherPlayers.map(player => (
                  <button
                    key={player.id}
                    onClick={() => setSelectedPlayer(player.id)}
                    className={cn(
                      'px-2 py-1.5 rounded text-sm transition-colors',
                      selectedPlayer === player.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted/50 hover:bg-muted/80'
                    )}
                  >
                    #{player.jerseyNumber} {player.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleCancel}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={!selectedPlayer}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
