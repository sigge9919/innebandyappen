import { useState } from 'react';
import { Player } from '@/types';
import { GameLine, Team } from '@/types/game';
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
import { CircleDot, Users, User } from 'lucide-react';

interface GoalConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: GoalConfirmData) => void;
  team: Team;
  squadPlayers: Player[];
  lines: GameLine[];
  activeLineId?: string;
  opponentName?: string;
}

export interface GoalConfirmData {
  scorerId?: string;
  assistPlayerIds?: string[];
  lineId?: string;
}

export function GoalConfirmDialog({
  open,
  onClose,
  onConfirm,
  team,
  squadPlayers,
  lines,
  activeLineId,
  opponentName = 'Opponent',
}: GoalConfirmDialogProps) {
  const [selectedScorer, setSelectedScorer] = useState<string | undefined>();
  const [selectedAssists, setSelectedAssists] = useState<string[]>([]);
  const [selectedLineId, setSelectedLineId] = useState<string | undefined>(activeLineId);

  const isHomeGoal = team === 'home';
  
  // Get players on the selected line for quick selection
  const selectedLine = lines.find(l => l.id === selectedLineId);
  const linePlayerIds = selectedLine?.playerIds || [];
  const linePlayers = squadPlayers.filter(p => linePlayerIds.includes(p.id) && !p.positions?.includes('Goalkeeper'));
  const otherPlayers = squadPlayers.filter(p => !linePlayerIds.includes(p.id) && !p.positions?.includes('Goalkeeper'));

  const handleConfirm = () => {
    onConfirm({
      scorerId: selectedScorer,
      assistPlayerIds: selectedAssists.length > 0 ? selectedAssists : undefined,
      lineId: selectedLineId,
    });
    // Reset state
    setSelectedScorer(undefined);
    setSelectedAssists([]);
    setSelectedLineId(activeLineId);
    onClose();
  };

  const handleCancel = () => {
    setSelectedScorer(undefined);
    setSelectedAssists([]);
    setSelectedLineId(activeLineId);
    onClose();
  };

  const toggleAssist = (playerId: string) => {
    if (playerId === selectedScorer) return; // Can't assist own goal
    
    if (selectedAssists.includes(playerId)) {
      setSelectedAssists(selectedAssists.filter(id => id !== playerId));
    } else if (selectedAssists.length < 1) {
      // Max 1 assist
      setSelectedAssists([...selectedAssists, playerId]);
    }
  };

  const selectScorer = (playerId: string) => {
    setSelectedScorer(playerId);
    // Remove from assists if was selected there
    setSelectedAssists(selectedAssists.filter(id => id !== playerId));
  };

  // Show all lines that have players assigned
  const availableLines = lines.filter(l => l.playerIds.length > 0);

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CircleDot className={cn(
              "h-5 w-5",
              isHomeGoal ? "text-success" : "text-destructive"
            )} />
            {isHomeGoal ? 'Mål!' : `${opponentName} mål`}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Line Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              {isHomeGoal ? 'Kedja på plan' : 'Kedja som släppte in'}
            </label>
            <div className="flex flex-wrap gap-2">
              {availableLines.map(line => (
                <Button
                  key={line.id}
                  variant={selectedLineId === line.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedLineId(line.id)}
                >
                  {line.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Only show scorer/assist selection for home goals */}
          {isHomeGoal && (
            <>
              {/* Goal Scorer */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Målskytt
                </label>
                
                {linePlayers.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Kedjespelare:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {linePlayers.map(player => (
                        <button
                          key={player.id}
                          onClick={() => selectScorer(player.id)}
                          className={cn(
                            'px-2 py-1.5 rounded text-sm transition-colors',
                            selectedScorer === player.id
                              ? 'bg-success text-success-foreground'
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
                    <p className="text-xs text-muted-foreground">Övriga spelare:</p>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                      {otherPlayers.map(player => (
                        <button
                          key={player.id}
                          onClick={() => selectScorer(player.id)}
                          className={cn(
                            'px-2 py-1.5 rounded text-sm transition-colors',
                            selectedScorer === player.id
                              ? 'bg-success text-success-foreground'
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

              {/* Assists */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  Assist (valfritt, max 1)
                  {selectedAssists.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {selectedAssists.length}/1
                    </Badge>
                  )}
                </label>
                
                {linePlayers.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Kedjespelare:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {linePlayers.filter(p => p.id !== selectedScorer).map(player => (
                        <button
                          key={player.id}
                          onClick={() => toggleAssist(player.id)}
                          className={cn(
                            'px-2 py-1.5 rounded text-sm transition-colors',
                            selectedAssists.includes(player.id)
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

                {otherPlayers.filter(p => p.id !== selectedScorer).length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Övriga spelare:</p>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                      {otherPlayers.filter(p => p.id !== selectedScorer).map(player => (
                        <button
                          key={player.id}
                          onClick={() => toggleAssist(player.id)}
                          className={cn(
                            'px-2 py-1.5 rounded text-sm transition-colors',
                            selectedAssists.includes(player.id)
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
            </>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleCancel}>
            Avbryt
          </Button>
          <Button 
            onClick={handleConfirm}
            className={cn(
              isHomeGoal ? 'bg-success hover:bg-success/90' : 'bg-destructive hover:bg-destructive/90'
            )}
          >
            Bekräfta mål
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
