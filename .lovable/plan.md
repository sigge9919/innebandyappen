

# Player Detail View

## Overview

Create a dedicated player detail page that opens when clicking on a player card in the Team tab. This page will display the player's profile information, season statistics (from the Stats tab), and their test results with trends.

## What You'll Get

- A new `/team/:playerId` route for individual player profiles
- Full player information display (jersey, position, status, notes)
- Season statistics table showing games played, goals, assists, points, +/-, shots, etc.
- Recent test results with trend indicators
- Quick actions to edit player profile or add new tests

## User Flow

1. Navigate to Team tab
2. Click on any player card
3. View opens as a full page with player details, stats, and test results
4. Use back button to return to Team list
5. Option to edit player profile from the detail view

---

## Technical Details

### New Files to Create

**1. `src/pages/PlayerDetail.tsx`**
- New page component for player detail view
- Uses `useParams` to get `playerId` from URL (following GameDetail pattern)
- Fetches player data from `usePlayers()` hook
- Fetches games from `useEnhancedGames()` for stats calculation
- Fetches test results from `useTestResults()` hook
- Fetches IDP from `useIDPs()` hook
- Includes back navigation button
- Edit player button opens `PlayerFormDialog`

**2. `src/components/team/PlayerStatsSection.tsx`**
- Displays individual player's season statistics
- Reuses `aggregatePlayerStats` or `aggregateGoalieStats` from `@/lib/seasonStats`
- Shows skater stats (GP, G, A, P, +/-, PIM, SOG, Miss, Blk, SOG%, Blk%, Def)
- Shows goalie stats (GP, GA, SA, SV%) for goalkeepers
- Uses stat cards layout for key metrics

**3. `src/components/team/PlayerTestResults.tsx`**
- Lists all test results for the specific player
- Shows test name, type, date, result, previous result, and trend
- Uses existing `TrendIcon` pattern from Development page
- Option to add new test for this player

### Files to Modify

**1. `src/App.tsx`**
- Add new route: `/team/:playerId`
- Import new `PlayerDetail` component

**2. `src/pages/Team.tsx`**
- Modify `handlePlayerClick` to navigate to `/team/${player.id}` instead of opening dialog
- Keep "Add Player" button behavior (opens dialog for new players)

### Component Structure

```text
PlayerDetail Page
+----------------------------------------------+
| [<- Back]               [Edit Player Button] |
|----------------------------------------------|
| Player Header Card                           |
| +------------------------------------------+ |
| | #23  |  John Smith       | Active/Focus | |
| |      |  Forward - Right stick            | |
| +------------------------------------------+ |
|                                              |
| Season Statistics                            |
| +------------------------------------------+ |
| | Key Stats Cards (GP, G, A, P, +/-)       | |
| +------------------------------------------+ |
| | Detailed Stats Table                     | |
| +------------------------------------------+ |
|                                              |
| Development                                  |
| +------------------------------------------+ |
| | Focus Areas (from IDP)                   | |
| +------------------------------------------+ |
|                                              |
| Test Results                        [+ Add]  |
| +------------------------------------------+ |
| | Test 1 | Fitness | 8.5s | up trend       | |
| | Test 2 | Skill   | 92%  | same trend     | |
| +------------------------------------------+ |
+----------------------------------------------+
```

### Data Flow

1. Player info: `usePlayers()` - find by ID
2. Season stats: `useEnhancedGames()` + `aggregatePlayerStats()` - filter to single player
3. Test results: `useTestResults()` - filter by playerId
4. IDP: `useIDPs()` - find by playerId

### Routing Pattern

Following the existing `GameDetail` pattern:
- Route: `/team/:playerId`
- Navigation: `useNavigate()` and `useParams()`
- Back button navigates to `/team`

