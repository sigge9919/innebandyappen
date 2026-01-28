import { useState } from 'react';
import { Player } from '@/types';
import { GameLine, LineType } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Users, Edit2, Check, X } from 'lucide-react';

interface LineSetupProps {
  lines: GameLine[];
  squadPlayers: Player[];
  onUpdateLine: (lineId: string, updates: Partial<GameLine>) => void;
  disabled?: boolean;
}

const LINE_TYPE_LABELS: Record<LineType, string> = {
  '5v5': '5v5 Lines',
  'PP': 'Power Play',
  'PK': 'Penalty Kill',
  '6v5': '6v5 (Empty Net)',
  '5v6': '5v6 (Defending Empty Net)',
};

export function LineSetup({
  lines,
  squadPlayers,
  onUpdateLine,
  disabled = false,
}: LineSetupProps) {
  const lineTypes: LineType[] = ['5v5', 'PP', 'PK', '6v5', '5v6'];

  return (
    <div className="space-y-6">
      {lineTypes.map(type => {
        const typeLines = lines.filter(l => l.type === type);
        if (typeLines.length === 0) return null;
        
        return (
          <div key={type} className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {LINE_TYPE_LABELS[type]}
            </h4>
            <div className="grid gap-3 md:grid-cols-2">
              {typeLines.map(line => (
                <LineCard
                  key={line.id}
                  line={line}
                  squadPlayers={squadPlayers}
                  onUpdateLine={onUpdateLine}
                  disabled={disabled}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LineCard({
  line,
  squadPlayers,
  onUpdateLine,
  disabled,
}: {
  line: GameLine;
  squadPlayers: Player[];
  onUpdateLine: (lineId: string, updates: Partial<GameLine>) => void;
  disabled?: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(line.name);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>(line.playerIds);

  const handleSave = () => {
    onUpdateLine(line.id, { 
      name: editName, 
      playerIds: selectedPlayerIds 
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditName(line.name);
    setSelectedPlayerIds(line.playerIds);
    setIsEditing(false);
  };

  const togglePlayer = (playerId: string) => {
    if (selectedPlayerIds.includes(playerId)) {
      setSelectedPlayerIds(selectedPlayerIds.filter(id => id !== playerId));
    } else {
      setSelectedPlayerIds([...selectedPlayerIds, playerId]);
    }
  };

  const linePlayers = squadPlayers.filter(p => line.playerIds.includes(p.id));

  if (isEditing) {
    return (
      <div className="stat-card space-y-3">
        <div className="flex items-center gap-2">
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="flex-1"
            placeholder="Line name"
          />
          <Button size="icon" variant="ghost" onClick={handleSave}>
            <Check className="h-4 w-4 text-success" />
          </Button>
          <Button size="icon" variant="ghost" onClick={handleCancel}>
            <X className="h-4 w-4 text-destructive" />
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto">
          {squadPlayers.map(player => (
            <button
              key={player.id}
              onClick={() => togglePlayer(player.id)}
              className={cn(
                'text-left px-2 py-1.5 rounded text-sm transition-colors',
                selectedPlayerIds.includes(player.id)
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              )}
            >
              #{player.jerseyNumber} {player.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-2">
        <h5 className="font-semibold text-foreground">{line.name}</h5>
        {!disabled && (
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-7 w-7"
            onClick={() => setIsEditing(true)}
          >
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
      {linePlayers.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {linePlayers.map(player => (
            <Badge key={player.id} variant="secondary" className="text-xs">
              #{player.jerseyNumber} {player.name.split(' ')[0]}
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground italic">No players assigned</p>
      )}
    </div>
  );
}
