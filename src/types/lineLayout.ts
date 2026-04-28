export type LineLayoutType = '5v5' | 'PP' | 'PK';
export type SlotRole = 'D' | 'C' | 'F';

export interface LineSlot {
  slotId: string;
  role: SlotRole;
  /** Position as percent of board (0-100) */
  x: number;
  y: number;
  /** Which line this slot belongs to (0,1,2 for 5v5; always 0 for PP/PK) */
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

/** Build the default fixed slots for a given formation type. */
export function createDefaultSlots(type: LineLayoutType): LineSlot[] {
  if (type === '5v5') {
    // Three lines stacked vertically. For each line: 2 D (bottom of band),
    // 1 C (middle), 2 F (top of band). Y coords are percent of board height.
    const bandCenters = [20, 50, 80]; // three line bands
    const bandHalf = 12; // distance from band center to forward/defender row
    const slots: LineSlot[] = [];
    bandCenters.forEach((cy, lineIndex) => {
      const fY = cy - bandHalf;
      const cY = cy;
      const dY = cy + bandHalf;
      // Forwards
      slots.push({ slotId: `l${lineIndex}-LW`, role: 'F', label: 'LW', x: 30, y: fY, lineIndex });
      slots.push({ slotId: `l${lineIndex}-RW`, role: 'F', label: 'RW', x: 70, y: fY, lineIndex });
      // Center
      slots.push({ slotId: `l${lineIndex}-C`, role: 'C', label: 'C', x: 50, y: cY, lineIndex });
      // Defenders
      slots.push({ slotId: `l${lineIndex}-LD`, role: 'D', label: 'LB', x: 35, y: dY, lineIndex });
      slots.push({ slotId: `l${lineIndex}-RD`, role: 'D', label: 'RB', x: 65, y: dY, lineIndex });
    });
    return slots;
  }
  if (type === 'PP') {
    // 1-2-2: 1 high D, 2 half-backs, 2 forwards near goal
    return [
      { slotId: 'pp-D', role: 'D', label: 'B', x: 50, y: 85, lineIndex: 0 },
      { slotId: 'pp-LH', role: 'F', label: 'VH', x: 25, y: 55, lineIndex: 0 },
      { slotId: 'pp-RH', role: 'F', label: 'HH', x: 75, y: 55, lineIndex: 0 },
      { slotId: 'pp-LF', role: 'F', label: 'VF', x: 35, y: 22, lineIndex: 0 },
      { slotId: 'pp-RF', role: 'F', label: 'HF', x: 65, y: 22, lineIndex: 0 },
    ];
  }
  // PK box: 2 D back, 2 F front
  return [
    { slotId: 'pk-LD', role: 'D', label: 'VB', x: 35, y: 75, lineIndex: 0 },
    { slotId: 'pk-RD', role: 'D', label: 'HB', x: 65, y: 75, lineIndex: 0 },
    { slotId: 'pk-LF', role: 'F', label: 'VF', x: 35, y: 35, lineIndex: 0 },
    { slotId: 'pk-RF', role: 'F', label: 'HF', x: 65, y: 35, lineIndex: 0 },
  ];
}