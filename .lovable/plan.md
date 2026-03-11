

## Pre-populate Drill Library with Övningsbanken Drills

### Overview
When a new team is created, automatically seed the drill library with all ~80 drills from innebandy.se/ovningsbanken, each tagged with "Övningsbanken".

### Approach
Since the drill data is static and known upfront, we hardcode it rather than scraping at runtime. This avoids external dependencies and ensures reliability.

### Implementation Steps

**1. Database migration — create `seed_default_drills` function**
- Create a `SECURITY DEFINER` SQL function `seed_default_drills(_team_id uuid)` that bulk-inserts all ~80 drills into the `drills` table with `categories = '{Övningsbanken}'` plus any relevant sub-category from the source
- Each drill gets: `name`, `description`, `categories` (always includes "Övningsbanken"), `team_id`

**2. Update `create_team` function**
- Add a call to `seed_default_drills(_team_id)` at the end of the existing `create_team` RPC, so every new team starts with the full drill library

**3. No frontend changes needed**
- The existing `useDrills` hook already fetches all drills for the active team — the seeded drills will appear automatically

### Technical Details
- All drill names and descriptions are extracted from the scraped page content (already captured)
- The SQL function will use a single multi-row `INSERT INTO drills (team_id, name, description, categories) VALUES (...)` statement
- Existing teams won't be affected unless the coach manually triggers a re-seed (out of scope for now, but could be added later)

### Files
- **Database migration**: New migration with `seed_default_drills` function + updated `create_team` function

