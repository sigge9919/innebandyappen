

## Plan: Add Penalty Shot Situation

Add a "Penalty Shot" option to the situation controls. When triggered, it opens a dialog to record the full penalty shot sequence: which team is shooting, player selection (if our team), and the outcome (scored/saved). No +/- is affected. Player and goalie stats are recorded.

### Changes

**1. `src/types/game.ts` — extend types**
- Add `'PS'` to `GameSituation` type: `'5v5' | '5v4' | '4v5' | '6v5' | '5v6' | 'PS'`
- Add `'PS'` label to `getSituationLabel`: `'PS': 'Penalty Shot'`

**2. New component: `src/components/games/PenaltyShotDialog.tsx`**
- Multi-step dialog:
  - Step 1: Choose team shooting (Our Team / Opponent)
  - Step 2 (if our team): Select the penalty taker from squad players (field players only)
  - Step 3: Outcome — Scored or Saved
- On confirm, calls back with `{ shootingTeam: Team, playerId?: string, scored: boolean }`

**3. `src/components/games/LiveTracking.tsx` — add penalty shot flow**
- Add a "Penalty Shot" button (separate from the situation row, perhaps below or between the two team columns as a full-width button, or in each team column)
- Actually: add a single full-width "Penalty Shot" button below both team columns (since the dialog handles team selection)
- On confirm from dialog:
  - Record a `shot_on_goal` event with situation `'PS'` for the shooting team
  - If scored: also record a `goal` event with situation `'PS'`
  - If our team scored: increment scorer's `shotsOnGoal` and `goals` in manual playerStats (via `onUpdatePlayerStat`)
  - If our team missed: increment scorer's `shotsOnGoal` only
  - The goalie snapshot is captured automatically via existing `recordEvent` logic (goalieId on event)

**4. `src/lib/gameStorage.ts` — exclude PS from +/- calculation**
- In `calculatePlayerStatsFromEvents`, the +/- loop already filters by `situation === '5v5'`, so penalty shot goals (`situation === 'PS'`) are automatically excluded. No change needed.

**5. No change to situation buttons row** — Penalty Shot is not a "game state" like 5v4; it's a discrete event. The situation selector stays as-is. The PS situation is only stamped on the events created during the penalty shot sequence.

### Flow Summary
1. Coach taps "Penalty Shot" button
2. Dialog asks: Our Team or Opponent?
3. If Our Team: select player, then Scored/Saved
4. If Opponent: just Scored/Saved
5. Events recorded with `situation: 'PS'`:
   - Always: `shot_on_goal` for shooting team (counted in team SOG and goalie SA)
   - If scored: `goal` for shooting team (counted in team goals and goalie GA)
   - If our player: manual playerStats updated (SOG, and goal if scored)
6. No +/- impact (already excluded by existing 5v5 filter)

