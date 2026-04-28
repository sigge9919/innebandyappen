export type LineLayoutType = '5v5' | 'PP' | 'PK' | '6v5' | '5v6';
export type SlotRole = 'D' | 'C' | 'F';

export interface LineSlot {
  slotId: string;
  role: SlotRole;
  /** Position as percent of a single-line board (0-100) */
  x: number;
  y: number;
  /** Which line this slot belongs to (0,1,2 for 5v5; always 0 for others) */
  lineIndex: number;
  /** Optional label, e.g. "VB", "HB", "C" */
  label?: string;
  playerId?: string | null;
}

export interface LineLayout {
  id: string;
  team_id: string;
  name: string;
  type: LineLayoutType;
  slots: LineSlot[];
  created_at: string;
  updated_at: string;
}

/**
 * Slot positions are percent of a single half-rink board (one per line).
 * The board represents an attacking half: opponent goal at TOP (y=0),
 * center line at BOTTOM (y=100). Forwards high (low y), defenders low (high y).
 */
function build5v5Line(lineIndex: number): LineSlot[] {
  return [
    // Forwards — high (near opponent goal)
    { slotId: `l${lineIndex}-LW`, role: 'F', label: 'VF', x: 28, y: 22, lineIndex },
    { slotId: `l${lineIndex}-RW`, role: 'F', label: 'HF', x: 72, y: 22, lineIndex },
    // Center — middle
    { slotId: `l${lineIndex}-C`, role: 'C', label: 'C', x: 50, y: 50, lineIndex },
    // Defenders — low (near own zone / center line)
    { slotId: `l${lineIndex}-LD`, role: 'D', label: 'VB', x: 32, y: 78, lineIndex },
    { slotId: `l${lineIndex}-RD`, role: 'D', label: 'HB', x: 68, y: 78, lineIndex },
  ];
}

/** Number of separate boards (lines) for a given formation type. */
export function getLineCount(type: LineLayoutType): number {
  if (type === '5v5') return 3;
  return 1;
}

/** Build the default fixed slots for a given formation type. */
export function createDefaultSlots(type: LineLayoutType): LineSlot[] {
  if (type === '5v5') {
    return [...build5v5Line(0), ...build5v5Line(1), ...build5v5Line(2)];
  }
  if (type === 'PP') {
    // 1-2-2: 2 forwards near goal, 2 half-backs, 1 back-point
    return [
      { slotId: 'pp-LF', role: 'F', label: 'VF', x: 32, y: 18, lineIndex: 0 },
      { slotId: 'pp-RF', role: 'F', label: 'HF', x: 68, y: 18, lineIndex: 0 },
      { slotId: 'pp-LH', role: 'F', label: 'VH', x: 22, y: 50, lineIndex: 0 },
      { slotId: 'pp-RH', role: 'F', label: 'HH', x: 78, y: 50, lineIndex: 0 },
      { slotId: 'pp-D', role: 'D', label: 'B', x: 50, y: 82, lineIndex: 0 },
    ];
  }
  if (type === 'PK') {
    // Box: 2 F front, 2 D back
    return [
      { slotId: 'pk-LF', role: 'F', label: 'VF', x: 35, y: 32, lineIndex: 0 },
      { slotId: 'pk-RF', role: 'F', label: 'HF', x: 65, y: 32, lineIndex: 0 },
      { slotId: 'pk-LD', role: 'D', label: 'VB', x: 35, y: 75, lineIndex: 0 },
      { slotId: 'pk-RD', role: 'D', label: 'HB', x: 65, y: 75, lineIndex: 0 },
    ];
  }
  if (type === '6v5') {
    // Empty net offense: 6 skaters, extra forward up top
    return [
      { slotId: '6v5-LF', role: 'F', label: 'VF', x: 25, y: 18, lineIndex: 0 },
      { slotId: '6v5-CF', role: 'F', label: 'CF', x: 50, y: 22, lineIndex: 0 },
      { slotId: '6v5-RF', role: 'F', label: 'HF', x: 75, y: 18, lineIndex: 0 },
      { slotId: '6v5-LH', role: 'F', label: 'VH', x: 25, y: 55, lineIndex: 0 },
      { slotId: '6v5-RH', role: 'F', label: 'HH', x: 75, y: 55, lineIndex: 0 },
      { slotId: '6v5-D', role: 'D', label: 'B', x: 50, y: 82, lineIndex: 0 },
    ];
  }
  // 5v6 — defending against empty net (no goalie). Tight 1-2-2 box
  return [
    { slotId: '5v6-F', role: 'F', label: 'F', x: 50, y: 28, lineIndex: 0 },
    { slotId: '5v6-LH', role: 'F', label: 'VH', x: 30, y: 50, lineIndex: 0 },
    { slotId: '5v6-RH', role: 'F', label: 'HH', x: 70, y: 50, lineIndex: 0 },
    { slotId: '5v6-LD', role: 'D', label: 'VB', x: 35, y: 78, lineIndex: 0 },
    { slotId: '5v6-RD', role: 'D', label: 'HB', x: 65, y: 78, lineIndex: 0 },
  ];
}
