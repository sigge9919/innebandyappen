import { useState } from 'react';
import { Player } from '@/types';
import { GameLine, LineType } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn, getGameDisplayName } from '@/lib/utils';
import { Users, Edit2, Check, X, Shield, FolderOpen } from 'lucide-react';
import { useLineLayouts } from '@/hooks/useLineLayouts';
import { LineLayoutType } from '@/types/lineLayout';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface LineSetupProps {
  lines: GameLine[];
  squadPlayers: Player[];
  onUpdateLine: (lineId: string, updates: Partial<GameLine>) => void;
  disabled?: boolean;
  goalies?: Player[];
  selectedGoalieId?: string;
  onSelectGoalie?: (goalieId: string | undefined) => void;
}

const LINE_TYPE_LABELS: Record<LineType, string> = {
  '5v5': '5v5 Lines',
  'PP': 'Power Play',
  'PK': 'Penalty Kill',
  '6v5': '6v5 (Empty Net)',
  '5v6': '5v6 (Defending Empty Net)',
};

const NONE_VALUE = '_none';

const LINE_TYPE_TO_LAYOUT_TYPE: Partial<Record<LineType, LineLayoutType>> = {
  '5v5': '5v5',
  PP: 'PP',
  PK: 'PK',
  '6v5': '6v5',
  '5v6': '5v6',
};

export function LineSetup({
  lines,
  squadPlayers,
  onUpdateLine,
  disabled = false,
  goalies = [],
  selectedGoalieId,
  onSelectGoalie,
}: LineSetupProps) {
  const lineTypes: LineType[] = ['5v5', 'PP', 'PK', '6v5', '5v6'];
  const { layouts } = useLineLayouts();

  const handleLoadLayout = (lineType: LineType, layoutId: string) => {
    const layout = layouts.find(l => l.id === layoutId);
    if (!layout) return;
    const squadIds = new Set(squadPlayers.map(p => p.id));
    // Group slots by lineIndex (0,1,2 for 5v5; 0 for PP/PK)
    const byLineIndex: Record<number, string[]> = {};
    layout.slots.forEach(s => {
      const li = s.lineIndex ?? 0;
      if (!byLineIndex[li]) byLineIndex[li] = [];
      if (s.playerId && squadIds.has(s.playerId)) byLineIndex[li].push(s.playerId);
    });
    // Find target lines for this type, in order
    const targetLines = lines.filter(l => l.type === lineType);
    Object.entries(byLineIndex).forEach(([liStr, ids]) => {
      const li = parseInt(liStr, 10);
      const target = targetLines[li];
      if (target) onUpdateLine(target.id, { playerIds: ids });
    });
    toast.success(`"${layout.name}" laddad`);
  };

  const handleLoadLayoutToLine = (
    lineType: LineType,
    layoutId: string,
    targetLineId: string
  ) => {
    const layout = layouts.find(l => l.id === layoutId);
    if (!layout) return;
    const squadIds = new Set(squadPlayers.map(p => p.id));
    const ids = layout.slots
      .filter(s => (s.lineIndex ?? 0) === 0 && s.playerId && squadIds.has(s.playerId))
      .map(s => s.playerId as string);
    onUpdateLine(targetLineId, { playerIds: ids });
    const target = lines.find(l => l.id === targetLineId);
    toast.success(`"${layout.name}" laddad till ${target?.name ?? lineType}`);
  };

  return (
    <div className="space-y-6">
      {/* Goalie Selection */}
      {goalies.length > 0 && onSelectGoalie && (
        <div className="flex items-center gap-3 pb-4 border-b border-border">
          <Shield className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Active Goalie:</span>
          <Select
            value={selectedGoalieId || NONE_VALUE}
            onValueChange={(value) => onSelectGoalie(value === NONE_VALUE ? undefined : value)}
          >
            <SelectTrigger className="w-[180px] h-9">
              <SelectValue placeholder="Välj målvakt" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE_VALUE}>Not selected</SelectItem>
              {goalies.map(goalie => (
                <SelectItem key={goalie.id} value={goalie.id}>
                  #{goalie.jerseyNumber} {goalie.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {lineTypes.map(type => {
        const typeLines = lines.filter(l => l.type === type);
        if (typeLines.length === 0) return null;
        const layoutType = LINE_TYPE_TO_LAYOUT_TYPE[type];
        const availableLayouts = layoutType
          ? layouts.filter(l => l.type === layoutType)
          : [];
        
        return (
          <div key={type} className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                {LINE_TYPE_LABELS[type]}
              </h4>
              {!disabled && availableLayouts.length > 0 && type === '5v5' && (
                <LoadLayoutButton
                  layouts={availableLayouts}
                  onSelect={(id) => handleLoadLayout(type, id)}
                />
              )}
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {typeLines.map(line => (
                <LineCard
                  key={line.id}
                  line={line}
                  squadPlayers={squadPlayers}
                  onUpdateLine={onUpdateLine}
                  disabled={disabled}
                  availableLayouts={
                    type !== '5v5' && !disabled ? availableLayouts : []
                  }
                  onLoadLayout={(layoutId) =>
                    handleLoadLayoutToLine(type, layoutId, line.id)
                  }
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LoadLayoutButton({
  layouts,
  onSelect,
}: {
  layouts: { id: string; name: string; slots: { playerId?: string | null }[] }[];
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <FolderOpen className="h-4 w-4" />
          Ladda sparad
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Välj sparad uppställning</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {layouts.map(l => {
            const filled = l.slots.filter(s => s.playerId).length;
            return (
              <button
                key={l.id}
                onClick={() => {
                  onSelect(l.id);
                  setOpen(false);
                }}
                className="w-full text-left p-3 rounded-md border border-border hover:border-primary hover:bg-primary/5 transition-colors flex items-center justify-between"
              >
                <span className="font-medium">{l.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {filled}/{l.slots.length} positioner
                </Badge>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function LineCard({
  line,
  squadPlayers,
  onUpdateLine,
  disabled,
  availableLayouts = [],
  onLoadLayout,
}: {
  line: GameLine;
  squadPlayers: Player[];
  onUpdateLine: (lineId: string, updates: Partial<GameLine>) => void;
  disabled?: boolean;
  availableLayouts?: { id: string; name: string; slots: { playerId?: string | null }[] }[];
  onLoadLayout?: (layoutId: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(line.name);

  // Toggle player and immediately save
  const togglePlayer = (playerId: string) => {
    const newPlayerIds = line.playerIds.includes(playerId)
      ? line.playerIds.filter(id => id !== playerId)
      : [...line.playerIds, playerId];
    
    onUpdateLine(line.id, { playerIds: newPlayerIds });
  };

  const handleSaveName = () => {
    if (editName.trim() && editName !== line.name) {
      onUpdateLine(line.id, { name: editName.trim() });
    }
    setIsEditing(false);
  };

  const handleCancelName = () => {
    setEditName(line.name);
    setIsEditing(false);
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
            placeholder="Kedjenamn"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveName();
              if (e.key === 'Escape') handleCancelName();
            }}
            autoFocus
          />
          <Button size="icon" variant="ghost" onClick={handleSaveName}>
            <Check className="h-4 w-4 text-success" />
          </Button>
          <Button size="icon" variant="ghost" onClick={handleCancelName}>
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
                line.playerIds.includes(player.id)
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              )}
            >
              #{player.jerseyNumber} {getGameDisplayName(player)}
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
          <div className="flex items-center gap-1">
            {availableLayouts.length > 0 && onLoadLayout && (
              <LoadLayoutButton
                layouts={availableLayouts}
                onSelect={onLoadLayout}
                compact
                title={`Ladda till ${line.name}`}
              />
            )}
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>
      {linePlayers.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {linePlayers.map(player => (
            <Badge key={player.id} variant="secondary" className="text-xs">
              #{player.jerseyNumber} {getGameDisplayName(player)}
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground italic">Inga spelare tilldelade</p>
      )}
    </div>
  );
}
