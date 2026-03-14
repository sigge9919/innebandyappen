import { useState } from 'react';
import { Player } from '@/types';
import { Team } from '@/types/game';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CircleDot, Shield, ArrowLeft } from 'lucide-react';

export interface PenaltyShotResult {
  shootingTeam: Team;
  playerId?: string;
  scored: boolean;
}

interface PenaltyShotDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (result: PenaltyShotResult) => void;
  squadPlayers: Player[];
  opponentName: string;
}

type Step = 'team' | 'player' | 'outcome';

export function PenaltyShotDialog({
  open,
  onClose,
  onConfirm,
  squadPlayers,
  opponentName,
}: PenaltyShotDialogProps) {
  const [step, setStep] = useState<Step>('team');
  const [shootingTeam, setShootingTeam] = useState<Team | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | undefined>();

  const fieldPlayers = squadPlayers.filter(
    p => !p.positions?.includes('Goalkeeper')
  );

  const reset = () => {
    setStep('team');
    setShootingTeam(null);
    setSelectedPlayerId(undefined);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleTeamSelect = (team: Team) => {
    setShootingTeam(team);
    if (team === 'home') {
      setStep('player');
    } else {
      setStep('outcome');
    }
  };

  const handlePlayerSelect = (playerId: string) => {
    setSelectedPlayerId(playerId);
    setStep('outcome');
  };

  const handleOutcome = (scored: boolean) => {
    if (!shootingTeam) return;
    onConfirm({
      shootingTeam,
      playerId: selectedPlayerId,
      scored,
    });
    reset();
  };

  const handleBack = () => {
    if (step === 'outcome') {
      if (shootingTeam === 'home') {
        setStep('player');
        setSelectedPlayerId(undefined);
      } else {
        setStep('team');
        setShootingTeam(null);
      }
    } else if (step === 'player') {
      setStep('team');
      setShootingTeam(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step !== 'team' && (
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            Straffslag
          </DialogTitle>
        </DialogHeader>

        {step === 'team' && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Vem tar straffslaget?</p>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-16 flex-col gap-1"
                onClick={() => handleTeamSelect('home')}
              >
                <CircleDot className="h-5 w-5 text-success" />
                <span className="text-sm font-semibold">Vårt lag</span>
              </Button>
              <Button
                variant="outline"
                className="h-16 flex-col gap-1"
                onClick={() => handleTeamSelect('opponent')}
              >
                <CircleDot className="h-5 w-5 text-destructive" />
                <span className="text-sm font-semibold">{opponentName}</span>
              </Button>
            </div>
          </div>
        )}

        {step === 'player' && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Välj straffskjutare</p>
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {fieldPlayers.map(player => (
                <Button
                  key={player.id}
                  variant="outline"
                  className="h-12 justify-start gap-2"
                  onClick={() => handlePlayerSelect(player.id)}
                >
                  <Badge variant="secondary" className="text-xs">#{player.jerseyNumber}</Badge>
                  <span className="text-sm truncate">{player.name}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {step === 'outcome' && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {shootingTeam === 'home' ? 'Our' : opponentName + "'s"} penalty shot — what happened?
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Button
                className="h-16 flex-col gap-1 bg-success hover:bg-success/90 text-success-foreground"
                onClick={() => handleOutcome(true)}
              >
                <CircleDot className="h-6 w-6" />
                <span className="font-semibold">Goal!</span>
              </Button>
              <Button
                variant="outline"
                className="h-16 flex-col gap-1"
                onClick={() => handleOutcome(false)}
              >
                <Shield className="h-6 w-6" />
                <span className="font-semibold">Saved</span>
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
