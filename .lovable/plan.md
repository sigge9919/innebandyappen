

## Plan: Add Stats View Toggle During Live Games

Add a toggle in the live game header that switches between the live tracking view and the post-game stats view (team stats, player stats, line performance, etc.) — all while the game is still live.

### Implementation

**1. Add view state toggle in `src/pages/GameDetail.tsx`**
- Add a `useState` for `liveView: 'tracking' | 'stats'` (default `'tracking'`)
- Add a toggle button in the live game header controls (next to Edit Lines / Tactics) labeled "Stats" with a `BarChart3` icon
- When `liveView === 'tracking'`, show the existing `LiveTracking` component
- When `liveView === 'stats'`, render the same post-game sections (Team Statistics, Player Statistics, Line Performance, Special Teams) but reusing the existing components with live data — without the post-game-only sections (Goal Details editor, Penalty Attribution editor, Post-Game Notes)

**2. Reuse existing post-game components**
- `PostGameTeamStats` — show current team stats
- `PostGamePlayerStats` — show current player stats  
- `EnhancedLinePerformance` — show current line performance
- `SpecialTeamsSummary` — show current special teams
- All wrapped in `CollapsibleSection` just like the finished view
- No "Final Score" trophy card (game is still in progress)

No new components needed — just conditional rendering of existing ones within the live game block.

