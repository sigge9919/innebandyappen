

## Problem

Two bugs with the same root cause: **events don't snapshot who was on ice when they happened**.

### Bug 1: Player +/- breaks when players change lines

`calculatePlayerStatsFromEvents` (gameStorage.ts, line 199-205) processes each 5v5 goal event by looking up `event.lineId`, finding the **current** line object, and applying +/- to **all players currently on that line**. If a player moved from Line 1 to Line 2 mid-game, the calculation uses the current roster of each line, not who was actually on ice when the goal was scored.

### Bug 2: Goalie stats all go to current active goalie

`GoalieStats.tsx` and `PostGamePlayerStats.tsx` attribute **all** opponent shots/goals to whoever is currently `activeGoalieId`. If a goalie is swapped mid-game, the replacement goalie gets all the stats and the original goalie gets zero.

---

## Solution

**Store a snapshot of on-ice players and active goalie on each event at recording time.** This is a data-level fix that makes calculations historically accurate regardless of later roster changes.

### 1. Extend `GameEvent` type with snapshot fields

Add two optional fields to the `GameEvent` interface in `src/types/game.ts`:
- `onIcePlayerIds?: string[]` — the player IDs from the active line at event time
- `goalieId?: string` — the active goalie ID at event time

### 2. Record snapshot data when events are created

In `src/hooks/useEnhancedGames.ts` `recordEvent` function, populate the new fields from the current game state:
- `onIcePlayerIds`: look up the active line's `playerIds` at the moment of recording
- `goalieId`: use `game.activeGoalieId || game.startingGoalieId`

Also do the same in `recordPenalty` if penalty events need goalie tracking.

### 3. Fix `calculatePlayerStatsFromEvents` in `src/lib/gameStorage.ts`

Change the +/- calculation (lines 199-205) from looking up the current line roster to using `event.onIcePlayerIds` when available, falling back to the current line lookup for backward compatibility with older events.

### 4. Fix `GoalieStats.tsx` — attribute stats per event

Instead of dumping all opponent stats onto the current active goalie, iterate through opponent shot/goal events and attribute each to `event.goalieId`. Fall back to `activeGoalieId` for old events without the field.

### 5. Fix `PostGamePlayerStats.tsx` — same goalie fix

Apply the same per-event goalie attribution logic.

### 6. Fix `seasonStats.ts` goalie aggregation

Update `aggregateGoalieStats` to use per-event `goalieId` when available instead of attributing everything to `startingGoalieId`.

### 7. Fix line +/- display components

`EnhancedLinePerformance.tsx` calculates line-level +/- using `event.lineId` which is correct (it tracks which line was active when the event happened, not which players were on that line). This is fine and doesn't need changes — line +/- is about the line identity, not its current members.

### Backward compatibility

All new fields are optional. Old events without `onIcePlayerIds` or `goalieId` fall back to the existing (imperfect) logic. No migration needed.

