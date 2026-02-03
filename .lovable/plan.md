
# Navigate to Player Detail from All Locations

## Overview

Update all locations where players are displayed to navigate to the Player Detail page (`/team/:playerId`) when clicked. This provides a consistent user experience throughout the app.

## Locations to Update

| Location | Component | Current Behavior | New Behavior |
|----------|-----------|-----------------|--------------|
| Dashboard | PlayerAlerts | Goes to `/team` | Goes to `/team/:playerId` |
| Development | Player IDP cards | Opens IDP dialog | Goes to `/team/:playerId` |
| Games - Stats tab | SeasonPlayerStats table | No click handler | Goes to `/team/:playerId` |
| Game Detail | PostGamePlayerStats table | No click handler | Goes to `/team/:playerId` |

---

## Technical Details

### Files to Modify

**1. `src/pages/Dashboard.tsx`**
- Update line 104: Change `navigate('/team')` to `navigate('/team/${player.id}')`

**2. `src/pages/Development.tsx`**
- Add `useNavigate` import from react-router-dom
- Update `handlePlayerClick` function to navigate to player detail page instead of opening IDP dialog
- The IDP editing will still be accessible from the Player Detail page

**3. `src/components/stats/SeasonPlayerStats.tsx`**
- Add `useNavigate` hook
- Make player rows clickable with hover styles
- Navigate to `/team/:playerId` on row click

**4. `src/components/games/PostGamePlayerStats.tsx`**
- Add `useNavigate` hook
- Make player name cells clickable
- Navigate to `/team/:playerId` on click
- Add visual indicator (underline on hover) to show players are clickable

### Implementation Details

**SeasonPlayerStats changes:**
```typescript
// Add hook
const navigate = useNavigate();

// Make table rows clickable
<TableRow 
  key={stat.playerId}
  className="cursor-pointer hover:bg-muted/50"
  onClick={() => navigate(`/team/${stat.playerId}`)}
>
```

**PostGamePlayerStats changes:**
```typescript
// Add hook
const navigate = useNavigate();

// Make player cell clickable
<td className="py-2 px-2">
  <div 
    className="flex items-center gap-2 cursor-pointer hover:underline"
    onClick={() => navigate(`/team/${player.id}`)}
  >
    ...
  </div>
</td>
```

### User Experience

After these changes:
- Clicking any player name or row anywhere in the app takes you to their detail page
- Consistent navigation pattern across all modules
- Player detail page shows stats, test results, and IDP information
- Back button on player detail returns to the previous page
