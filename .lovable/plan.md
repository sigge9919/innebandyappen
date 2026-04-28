## Fix half-rink visuals and force 3-up layout for 5v5

### Problems
1. The half-rink in `LineFormationBoard.tsx` has rounded corners on all four sides — the center line side should be **straight** (it's a cut, not a rink end).
2. The goal/crease shape doesn't match `TacticsBoardRenderer.tsx` proportions — needs to use the same crease/goal style.
3. On the current 1000px viewport the 3 lines stack into 2 columns (`sm:grid-cols-2 lg:grid-cols-3`, lg = 1024px). User wants all 3 side-by-side always.

### Changes — `src/components/lines/LineFormationBoard.tsx`

**Layout grid**
- Replace responsive grid with always-3-columns when `lineCount === 3`: `grid-cols-3` (no responsive breakpoints). Reduce gap to `gap-2` so they fit on narrower screens. Each board scales down via `w-full`.

**SVG half-rink redraw**
- Replace the single `<rect rx={cornerRadius}>` with a `<path>` that has rounded corners only at the **top** (goal end) and **straight square corners** at the **bottom** (center-line cut). Path outline:
  ```
  M padding,(H-padding)                 // bottom-left, square
  L padding,(padding+R)                 // up left side
  Q padding,padding  (padding+R),padding   // top-left rounded
  L (W-padding-R),padding               // top edge
  Q (W-padding),padding (W-padding),(padding+R)  // top-right rounded
  L (W-padding),(H-padding)             // down right side
  Z                                     // close along bottom (straight)
  ```
- Background `<rect>` for muted area stays full-size; the rink fill uses the path above.

**Goal & crease — match TacticsBoardRenderer style**
The tactics board uses (for a horizontal end): crease 70×120, goal 25×60, goalInset 40, plus the goal sits **inside** the crease offset by 15. Translate to a rotated top-end on a `220×320` board with proportional scaling (~factor 0.35):
- Crease: width 90, height 36, positioned `x = W/2 - 45`, `y = padding + 14` (inset from top edge, matching tactics board's goalInset proportion)
- Goal: width 32, height 12, positioned `x = W/2 - 16`, `y = padding + 14 + 8` (offset inside crease, like tactics board)
- Both stroked with `hsl(var(--primary))`, no fill — matching tactics board.

**Center line & half center circle (bottom)**
- Keep red center line at `y = H - padding`.
- Half center circle radius 50 scaled to ~22, opens upward into the half (already correct, just adjust radius for new proportions).

**Slot button sizing**
- Since boards are now narrower (3 across in 1000px ≈ ~310px each minus gaps), reduce slot button to `h-8 w-8 text-[10px]` and player name label to `max-w-[60px]` to avoid overlap.

### Files
- Modified: `src/components/lines/LineFormationBoard.tsx`

### Out of scope
- No DB / type changes.
- No changes to slot coordinates (`src/types/lineLayout.ts`) — current x/y percentages still work on the redrawn board.
