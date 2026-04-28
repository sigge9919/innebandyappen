import { useState, useMemo } from 'react';
import { Player } from '@/types';
import { LineSlot, LineLayoutType, getLineCount } from '@/types/lineLayout';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { cn, getGameDisplayName } from '@/lib/utils';
import { X } from 'lucide-react';

interface LineFormationBoardProps {
  type: LineLayoutType;
  slots: LineSlot[];
  players: Player[];
  onChange?: (slots: LineSlot[]) => void;
  readOnly?: boolean;
  /** Force a specific number of boards (overrides default per type). */
  lineCountOverride?: number;
  /** Hide the "Kedja N" title above each board. */
  hideLineTitles?: boolean;
}

/**
 * Renders one half-rink mini-board per line. For 5v5 this means three
 * boards displayed side-by-side. Each board shows fixed positional slots
 * that can be assigned a player by clicking.
 */
export function LineFormationBoard({
  type,
  slots,
  players,
  onChange,
  readOnly = false,
  lineCountOverride,
  hideLineTitles = false,
}: LineFormationBoardProps) {
  const lineCount = lineCountOverride ?? getLineCount(type);

  const slotsByLine = useMemo(() => {
    const map: Record<number, LineSlot[]> = {};
    for (let i = 0; i < lineCount; i++) map[i] = [];
    slots.forEach(s => {
      const li = s.lineIndex ?? 0;
      if (!map[li]) map[li] = [];
      map[li].push(s);
    });
    return map;
  }, [slots, lineCount]);

  const assignedIds = useMemo(
    () => new Set(slots.map(s => s.playerId).filter(Boolean) as string[]),
    [slots]
  );

  const handleAssign = (slotId: string, playerId: string | null) => {
    if (!onChange || readOnly) return;
    const next = slots.map(s => {
      if (s.slotId === slotId) return { ...s, playerId };
      if (playerId && s.playerId === playerId) return { ...s, playerId: null };
      return s;
    });
    onChange(next);
  };

  // Grid columns: side-by-side on wider screens, stacked on small
  const gridCols =
    lineCount === 1
      ? 'grid-cols-1 max-w-xs mx-auto'
      : lineCount === 2
      ? 'grid-cols-2'
      : 'grid-cols-3';

  return (
    <div className={cn('grid gap-2', gridCols)}>
      {Array.from({ length: lineCount }).map((_, li) => (
        <HalfRinkBoard
          key={li}
          title={!hideLineTitles && lineCount > 1 ? `Kedja ${li + 1}` : ''}
          slots={slotsByLine[li] ?? []}
          players={players}
          assignedIds={assignedIds}
          readOnly={readOnly}
          onAssign={handleAssign}
        />
      ))}
    </div>
  );
}

function HalfRinkBoard({
  title,
  slots,
  players,
  assignedIds,
  readOnly,
  onAssign,
}: {
  title: string;
  slots: LineSlot[];
  players: Player[];
  assignedIds: Set<string>;
  readOnly: boolean;
  onAssign: (slotId: string, playerId: string | null) => void;
}) {
  // Half-rink: vertical. Goal end (rounded) at top, center-line cut (square) at bottom.
  const W = 220;
  const H = 320;
  const padding = 10;
  const R = 28; // corner radius (top only)
  const rinkW = W - padding * 2;
  const rinkH = H - padding * 2;

  const left = padding;
  const right = W - padding;
  const top = padding;
  const bottom = H - padding;

  // Path: square bottom corners, rounded top corners.
  const rinkPath = [
    `M ${left} ${bottom}`,
    `L ${left} ${top + R}`,
    `Q ${left} ${top} ${left + R} ${top}`,
    `L ${right - R} ${top}`,
    `Q ${right} ${top} ${right} ${top + R}`,
    `L ${right} ${bottom}`,
    'Z',
  ].join(' ');

  // Crease + goal at top — proportions mirror TacticsBoardRenderer
  // (crease 70x120, goal 25x60, goalInset 40 on a 800x500 board → ~factor 0.45)
  const creaseW = 90;
  const creaseH = 32;
  const goalW = 32;
  const goalH = 10;
  const creaseInset = 14; // distance from rink top edge to crease

  return (
    <div className="flex flex-col items-center gap-2">
      {title && (
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {title}
        </div>
      )}
      <div className="relative w-full">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          {/* Outer */}
          <rect x={0} y={0} width={W} height={H} fill="hsl(var(--muted))" />
          {/* Rink surface — rounded top, square bottom (cut at center line) */}
          <path
            d={rinkPath}
            fill="hsl(var(--background))"
            stroke="hsl(var(--border))"
            strokeWidth={2}
          />
          {/* Crease at top — outline only, matches tactics board */}
          <rect
            x={W / 2 - creaseW / 2}
            y={top + creaseInset}
            width={creaseW}
            height={creaseH}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
          />
          {/* Goal — sits inside the crease, like tactics board */}
          <rect
            x={W / 2 - goalW / 2}
            y={top + creaseInset + 8}
            width={goalW}
            height={goalH}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
          />
          {/* Center line at bottom (the cut) */}
          <line
            x1={left}
            x2={right}
            y1={bottom}
            y2={bottom}
            stroke="hsl(var(--primary))"
            strokeWidth={2}
          />
          {/* Half center circle opening upward into the half */}
          <path
            d={`M ${W / 2 - 26} ${bottom} A 26 26 0 0 1 ${W / 2 + 26} ${bottom}`}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
          />
          {/* Center dot */}
          <circle cx={W / 2} cy={bottom} r={3} fill="hsl(var(--primary))" />
        </svg>

        {/* Slot overlay */}
        <div className="absolute inset-0">
          {slots.map(s => {
            const leftPct = ((padding + (s.x / 100) * rinkW) / W) * 100;
            const topPct = ((padding + (s.y / 100) * rinkH) / H) * 100;
            const player = s.playerId
              ? players.find(p => p.id === s.playerId)
              : undefined;
            return (
              <div
                key={s.slotId}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${leftPct}%`, top: `${topPct}%` }}
              >
                <SlotButton
                  slot={s}
                  player={player}
                  players={players}
                  assignedIds={assignedIds}
                  readOnly={readOnly}
                  onAssign={pid => onAssign(s.slotId, pid)}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SlotButton({
  slot,
  player,
  players,
  assignedIds,
  readOnly,
  onAssign,
}: {
  slot: LineSlot;
  player?: Player;
  players: Player[];
  assignedIds: Set<string>;
  readOnly: boolean;
  onAssign: (playerId: string | null) => void;
}) {
  const [open, setOpen] = useState(false);

  const filled = !!player;
  const filledClasses = filled
    ? 'bg-primary text-primary-foreground border-primary shadow-md'
    : 'bg-card text-muted-foreground border-dashed border-muted-foreground/50';

  const suggested = players
    .slice()
    .sort((a, b) => {
      const aMatch = matchesRole(a, slot.role) ? 0 : 1;
      const bMatch = matchesRole(b, slot.role) ? 0 : 1;
      if (aMatch !== bMatch) return aMatch - bMatch;
      return (a.jerseyNumber ?? 0) - (b.jerseyNumber ?? 0);
    });

  const button = (
    <button
      type="button"
      disabled={readOnly}
      className={cn(
        'flex flex-col items-center justify-center rounded-full border-2 transition-all',
        'h-8 w-8 text-[10px] font-bold',
        filledClasses,
        !readOnly && 'hover:scale-110 cursor-pointer'
      )}
    >
      {filled ? `#${player.jerseyNumber}` : slot.label ?? slot.role}
    </button>
  );

  return (
    <div className="flex flex-col items-center">
      {readOnly ? (
        button
      ) : (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>{button}</PopoverTrigger>
          <PopoverContent className="w-64 p-0" align="center">
            <Command>
              <CommandInput placeholder="Sök spelare..." />
              <CommandList>
                <CommandEmpty>Inga spelare</CommandEmpty>
                {filled && (
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => {
                        onAssign(null);
                        setOpen(false);
                      }}
                      className="text-destructive"
                    >
                      <X className="h-4 w-4 mr-2" /> Ta bort spelare
                    </CommandItem>
                  </CommandGroup>
                )}
                <CommandGroup heading={`Spelare (${slot.label ?? slot.role})`}>
                  {suggested.map(p => {
                    const isAssignedElsewhere =
                      assignedIds.has(p.id) && p.id !== player?.id;
                    return (
                      <CommandItem
                        key={p.id}
                        value={`${p.jerseyNumber} ${p.name}`}
                        onSelect={() => {
                          onAssign(p.id);
                          setOpen(false);
                        }}
                      >
                        <span className="font-mono w-8 text-muted-foreground">
                          #{p.jerseyNumber}
                        </span>
                        <span className="flex-1 truncate">
                          {getGameDisplayName(p)}
                        </span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {p.positions?.join('/') ?? ''}
                          {isAssignedElsewhere && ' • flyttas'}
                        </span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}
      {filled && (
        <span className="text-[9px] mt-0.5 px-1 rounded bg-background/90 text-foreground max-w-[60px] truncate leading-tight">
          {getGameDisplayName(player!)}
        </span>
      )}
    </div>
  );
}

function matchesRole(p: Player, role: 'D' | 'C' | 'F'): boolean {
  const positions = (p.positions ?? []) as string[];
  if (role === 'D') return positions.includes('Defender');
  if (role === 'C') return positions.includes('Center');
  return positions.includes('Forward') || positions.includes('Center');
}
