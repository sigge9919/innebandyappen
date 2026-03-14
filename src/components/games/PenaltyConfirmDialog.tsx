import { useState } from 'react';
import { Player } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { AlertOctagon, User } from 'lucide-react';

interface PenaltyConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (playerId?: string) => void;
  squadPlayers: Player[];
}

export function PenaltyConfirmDialog({
  open,
  onClose,
  onConfirm,
  squadPlayers,
}: PenaltyConfirmDialogProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<string | undefined>();

  // Filter out goalkeepers for penalty selection
  const fieldPlayers = squadPlayers.filter(p => !p.positions?.includes('Goalkeeper'));

  const handleConfirm = () => {
    onConfirm(selectedPlayer);
    setSelectedPlayer(undefined);
    onClose();
  };

  const handleCancel = () => {
    setSelectedPlayer(undefined);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertOctagon className="h-5 w-5 text-amber-500" />
            Utvisning - Vårt lag
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Player Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Spelare som begick utvisning
            </label>
            
            <div className="flex flex-wrap gap-1.5">
              {fieldPlayers.map(player => (
                <button
                  key={player.id}
                  onClick={() => setSelectedPlayer(player.id)}
                  className={cn(
                    'px-2 py-1.5 rounded text-sm transition-colors',
                    selectedPlayer === player.id
                      ? 'bg-amber-500 text-white'
                      : 'bg-muted hover:bg-muted/80'
                  )}
                >
                  #{player.jerseyNumber} {player.name.split(' ')[0]}
                </button>
              ))}
            </div>

            <p className="text-xs text-muted-foreground mt-2">
              Du kan hoppa över spelarval och tilldela senare i eftermatchgenomgången.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            Confirm Penalty
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

