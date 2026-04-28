import { useState } from 'react';
import { Player } from '@/types';
import { LineSlot, LineLayoutType } from '@/types/lineLayout';
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
import { Button } from '@/components/ui/button';
import { cn, getGameDisplayName } from '@/lib/utils';
import { X } from 'lucide-react';

interface LineFormationBoardProps {
  type: LineLayoutType;
  slots: LineSlot[];
  players: Player[];
  onChange?: (slots: LineSlot[]) => void;
  /** Read-only mode for previews. */
  readOnly?: boolean;
  /** Aspect ratio adjustments — 5v5 board is taller (vertical rink). */
  height?: number;
  width?: number;
}

/**
 * Vertical floorball rink (rotated 90deg from tactics board).
 * Goals are at top and bottom. Slots are positioned by percent (x,y in 0-100).
 */
export function LineFormationBoard({
  type,
  slots,
  players,
  onChange,
  readOnly = false,
  height,
  width = 360,
}: LineFormationBoardProps) {
  // Vertical rink: width < height
  const W = width;
  const H = height ?? Math.round(W * 1.6);
  const padding = 14;
  const cornerRadius = 28;
  const rinkW = W - padding * 2;
  const rinkH = H - padding * 2;

  // Goal/crease (top + bottom)
  const creaseW = 80;
  const creaseH = 46;
  const goalW = 36;
  const goalH = 12;
  const goalInset = 24;

  // For 5v5 we draw three line bands as soft horizontal stripes
  const bands =
    type === '5v5'
      ? [
          { y: 8, h: 28, label: 'Kedja 1' },
          { y: 38, h: 24, label: 'Kedja 2' },
          { y: 68, h: 24, label: 'Kedja 3' },
        ]
      : [];

  const slotXY = (s: LineSlot) => ({
    cx: padding + (s.x / 100) * rinkW,
    cy: padding + (s.y / 100) * rinkH,
  });

  const playerById = (id?: string | null) =>
    id ? players.find(p => p.id === id) : undefined;

  const assignedIds = new Set(slots.map(s => s.playerId).filter(Boolean) as string[]);

  const handleAssign = (slotId: string, playerId: string | null) => {
    if (!onChange || readOnly) return;
    const next = slots.map(s => {
      if (s.slotId === slotId) return { ...s, playerId };
      // Prevent same player in two slots
      if (playerId && s.playerId === playerId) return { ...s, playerId: null };
      return s;
    });
    onChange(next);
  };

  return (
    <div className="relative w-full flex justify-center">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto max-w-[420px]"
        style={{ touchAction: 'manipulation' }}
      >
        {/* Outer area */}
        <rect x={0} y={0} width={W} height={H} fill="hsl(var(--muted))" />
        {/* Rink playing surface */}
        <rect
          x={padding}
          y={padding}
          width={rinkW}
          height={rinkH}
          rx={cornerRadius}
          fill="hsl(var(--background))"
          stroke="hsl(var(--border))"
          strokeWidth={2}
        />
        {/* Center line (horizontal) */}
        <line
          x1={padding}
          x2={padding + rinkW}
          y1={H / 2}
          y2={H / 2}
          stroke="hsl(var(--primary))"
          strokeWidth={1.5}
          opacity={0.5}
        />
        {/* Center circle */}
        <circle
          cx={W / 2}
          cy={H / 2}
          r={36}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={1.5}
          opacity={0.5}
        />
        <circle cx={W / 2} cy={H / 2} r={3} fill="hsl(var(--primary))" />

        {/* Top crease + goal */}
        <rect
          x={W / 2 - creaseW / 2}
          y={padding + goalInset}
          width={creaseW}
          height={creaseH}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={1.5}
        />
        <rect
          x={W / 2 - goalW / 2}
          y={padding + goalInset - goalH}
          width={goalW}
          height={goalH}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={1.5}
        />
        {/* Bottom crease + goal */}
        <rect
          x={W / 2 - creaseW / 2}
          y={H - padding - goalInset - creaseH}
          width={creaseW}
          height={creaseH}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={1.5}
        />
        <rect
          x={W / 2 - goalW / 2}
          y={H - padding - goalInset}
          width={goalW}
          height={goalH}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={1.5}
        />

        {/* 5v5 line bands */}
        {bands.map((b, i) => (
          <g key={i}>
            <rect
              x={padding + 4}
              y={padding + (b.y / 100) * rinkH}
              width={rinkW - 8}
              height={(b.h / 100) * rinkH}
              fill="hsl(var(--primary))"
              fillOpacity={0.05}
              rx={6}
            />
            <text
              x={padding + 10}
              y={padding + (b.y / 100) * rinkH + 12}
              fill="hsl(var(--muted-foreground))"
              fontSize={9}
              fontWeight={600}
            >
              {b.label}
            </text>
          </g>
        ))}
      </svg>

      {/* Slots overlay (HTML for accessible popovers) */}
      <div className="absolute inset-0 pointer-events-none">
        {slots.map(s => {
          const { cx, cy } = slotXY(s);
          const player = playerById(s.playerId);
          const leftPct = (cx / W) * 100;
          const topPct = (cy / H) * 100;
          return (
            <div
              key={s.slotId}
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
              style={{ left: `${leftPct}%`, top: `${topPct}%` }}
            >
              <SlotButton
                slot={s}
                player={player}
                players={players}
                assignedIds={assignedIds}
                readOnly={readOnly}
                onAssign={pid => handleAssign(s.slotId, pid)}
              />
            </div>
          );
        })}
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

  // Suggest players matching slot role first, but allow all
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
        'h-10 w-10 text-[11px] font-bold',
        filledClasses,
        !readOnly && 'hover:scale-105 cursor-pointer',
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
        <span className="text-[10px] mt-0.5 px-1 rounded bg-background/80 text-foreground max-w-[72px] truncate">
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