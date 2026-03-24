import { Player } from '@/types';
import { GameLine } from '@/types/game';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  shot_on_goal: { label: 'Skott på mål', icon: Target, color: 'text-primary' },
  shot_off_goal: { label: 'Skott utanför', icon: XCircle, color: 'text-muted-foreground' },
  shot_blocked: { label: 'Blockerat skott', icon: Shield, color: 'text-muted-foreground' },
  defensive_block: { label: 'Blockerat av', icon: Shield, color: 'text-primary' },
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
  const config = SHOT_TYPE_CONFIG[shotType];
  const Icon = config.icon;

  const activeLine = lines.find(l => l.id === activeLineId);
  const linePlayerIds = activeLine?.playerIds || [];
  const linePlayers = squadPlayers.filter(p => linePlayerIds.includes(p.id) && !p.positions?.includes('Goalkeeper'));
  const otherPlayers = squadPlayers.filter(p => !linePlayerIds.includes(p.id) && !p.positions?.includes('Goalkeeper'));

  const handleSelect = (playerId: string) => {
    onConfirm(playerId);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md max-h-[70vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className={cn("h-5 w-5", config.color)} />
            {config.label}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <label className="text-sm font-medium">Välj spelare</label>

           {linePlayers.length > 0 && (
             <div className="space-y-1">
               <p className="text-xs font-medium text-primary">
                 {activeLine ? `${activeLine.name} (aktiv kedja)` : 'Kedjespelare'}:
               </p>
               <div className="flex flex-wrap gap-2">
                 {linePlayers.map(player => (
                   <button
                     key={player.id}
                     onClick={() => handleSelect(player.id)}
                     className="px-4 py-3 rounded text-base font-medium transition-colors bg-primary/10 border border-primary/30 hover:bg-primary hover:text-primary-foreground"
                   >
                     #{player.jerseyNumber} {player.name.split(' ')[0]}
                   </button>
                 ))}
               </div>
             </div>
           )}

           {otherPlayers.length > 0 && (
             <div className="space-y-1">
               <p className="text-xs text-muted-foreground">Övriga spelare:</p>
               <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                 {otherPlayers.map(player => (
                   <button
                     key={player.id}
                     onClick={() => handleSelect(player.id)}
                     className="px-4 py-3 rounded text-base font-medium transition-colors bg-muted/50 hover:bg-primary hover:text-primary-foreground"
                   >
                     #{player.jerseyNumber} {player.name.split(' ')[0]}
                   </button>
                 ))}
               </div>
             </div>
           )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
