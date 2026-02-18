# Add Game-by-Game Trend Charts to Stats Tab

## Overview

Add a new "Trends" view to the Stats tab that shows game-by-game performance trends using line charts. Users can switch between Player Trends and Team Trends, with each chart plotting key metrics across finished games sorted chronologically.

## What You'll See

### Stats Tab Changes

- A third view option added alongside "Player Stats" and "Team Stats": **"Trends"**
- When "Trends" is selected, two sub-tabs appear: **Player Trends** and **Team Trends**

### Team Trends

- Line charts showing game-by-game data with the opponent name as the x-axis label
- **Goals chart**: Our goals vs. opponent goals per game
- **Shots chart**: SOG, shots off goal, and shots blocked per game
- &nbsp;

### Player Trends

- A dropdown to select a specific player
- **Points chart**: Goals and assists per game
- **Shots chart**: SOG, shots off goal, and shots blocked per game
- **Plus/Minus chart**: +/- per game
- Goalie players show: Goals Against and Save % per game instead

## Technical Details

### New Files

1. `**src/components/stats/TeamTrends.tsx**` - Team trend charts component
  - Uses Recharts `LineChart` + `ResponsiveContainer` (already installed)
  - Computes per-game team stats by iterating finished games chronologically
  - Charts: Goals (our vs opponent), Shots breakdown, cumulative W/D/L record
2. `**src/components/stats/PlayerTrends.tsx**` - Player trend charts component
  - Player selector dropdown using existing Select component
  - Computes per-game stats for the selected player using `calculatePlayerStatsFromEvents`
  - Skater charts: Goals, Assists, Points, +/-, SOG per game
  - Goalie charts: Goals Against, Save % per game

### Modified Files

3. `**src/pages/Stats.tsx**`
  - Add `'trends'` to the `StatsViewType` union
  - Add a third toggle button with a `TrendingUp` icon labeled "Trends"
  - Render `TeamTrends` or `PlayerTrends` based on a sub-toggle within the trends view
  - Pass `statsGames` and `players` to the trend components

### Data Flow

- Reuse existing `calculateTeamStats` and `calculatePlayerStatsFromEvents` from `gameStorage.ts`
- Sort finished games by date ascending (oldest first) for chronological x-axis
- Each game becomes one data point; x-axis labels show opponent name + date
- The existing "Full Season" vs "Last 3 Games" period filter will also apply to trends

### Chart Styling

- Use the existing `ChartContainer`, `ChartTooltip`, and `ChartTooltipContent` from `src/components/ui/chart.tsx`
- Color scheme: team colors using CSS variables (green for our team, red for opponent)
- Responsive design with proper mobile sizing