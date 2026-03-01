

## Plan: Add SOG to manual playerStats when a goal is scored

The current approach calculates SOG from goals inside `calculatePlayerStatsFromEvents`, which shows as a separate "1+" prefix in the stats table. Instead, when a home goal is confirmed with a scorer, the scorer's manual `playerStats.shotsOnGoal` should be incremented — exactly how advanced mode handles shot attribution.

### Changes

**1. `src/components/games/LiveTracking.tsx` — increment SOG on goal confirm**

In `handleGoalConfirm`, after recording the goal event, also increment the scorer's `shotsOnGoal` in manual `playerStats` via `onUpdatePlayerStat`:

```typescript
const handleGoalConfirm = (data: GoalConfirmData) => {
  if (!pendingGoal) return;
  onRecordEvent('goal', pendingGoal.team, { ... });
  
  // Auto-add SOG for the goal scorer (same as advanced mode shot attribution)
  if (pendingGoal.team === 'home' && data.scorerId && onUpdatePlayerStat) {
    const currentStats = playerStats.find(ps => ps.playerId === data.scorerId);
    const currentValue = currentStats?.shotsOnGoal || 0;
    onUpdatePlayerStat(data.scorerId, 'shotsOnGoal', currentValue + 1);
  }
  
  setPendingGoal(null);
};
```

**2. `src/lib/gameStorage.ts` — remove SOG increment from goal calculation**

Remove the `shotsOnGoal += 1` line from the goal processing block in `calculatePlayerStatsFromEvents` (line 189), so goals no longer double-count as event-driven SOG.

**3. `src/components/games/PostGamePlayerStats.tsx` — revert the "X+" prefix display**

Revert the recent changes that show event-driven SOG as a prefix. The SOG column goes back to showing just the manual input since goals now feed directly into manual stats. Remove the `eventDrivenStatsAll` recalculation for `totalSOG` and simplify back to just summing `playerStats.shotsOnGoal`.

