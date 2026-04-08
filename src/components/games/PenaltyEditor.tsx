import { Player } from '@/types';
import { getGameDisplayName } from '@/lib/utils';
import { PenaltyEvent, Period } from '@/types/game';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertOctagon } from 'lucide-react';

interface PenaltyEditorProps {
  penalties: PenaltyEvent[];
  squadPlayers: Player[];
  onAssignPenaltyPlayer: (penaltyId: string, playerId: string) => void;
}

const NONE_VALUE = '_none';

export function PenaltyEditor({
  penalties,
  squadPlayers,
  onAssignPenaltyPlayer,
}: PenaltyEditorProps) {
  const homePenalties = penalties.filter(p => p.team === 'home');
  const opponentPenalties = penalties.filter(p => p.team === 'opponent');

  if (penalties.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <AlertOctagon className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>Inga utvisningar registrerade i denna match</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-4">
        Tilldela utvisningar till spelarna som begick dem.
      </p>
      
      <div className="space-y-4">
        {/* Our Team Penalties */}
        {homePenalties.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Våra utvisningar ({homePenalties.length})</h4>
            <div className="space-y-2">
              {homePenalties.map((penalty, index) => (
                <div key={penalty.id} className="flex items-center gap-3 p-3 border border-border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive" className="bg-amber-500/10 text-amber-600 border-amber-500">
                        2 min
                      </Badge>
                      <Badge variant="secondary">P{penalty.period}</Badge>
                      <span className="text-sm text-muted-foreground">
                        Utvisning #{index + 1}
                      </span>
                    </div>
                  </div>
                  <Select
                    value={penalty.playerId || NONE_VALUE}
                    onValueChange={(value) => {
                      if (value !== NONE_VALUE) {
                        onAssignPenaltyPlayer(penalty.id, value);
                      }
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Välj spelare" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE_VALUE}>Ej tilldelad</SelectItem>
                      {squadPlayers.map(player => (
                        <SelectItem key={player.id} value={player.id}>
                          #{player.jerseyNumber} {getGameDisplayName(player)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Opponent Penalties */}
        {opponentPenalties.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-3">
              Motståndarens utvisningar ({opponentPenalties.length})
            </h4>
            <div className="space-y-2">
              {opponentPenalties.map((penalty, index) => (
                <div key={penalty.id} className="flex items-center gap-3 p-3 border border-border rounded-lg bg-muted/30">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">2 min</Badge>
                      <Badge variant="outline">P{penalty.period}</Badge>
                      <span className="text-sm text-muted-foreground">
                        Motståndarutvisning #{index + 1}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
