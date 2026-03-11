

## Embed Videos and Images from Övningsbanken into Drills

### Problem
Currently each seeded drill stores the innebandy.se page URL as `video_url`, which renders as a plain link. The actual content (Vimeo MP4 videos and thumbnail images) is embedded in the HTML of each drill page. The user wants these media assets extracted and displayed inline.

### Approach
Create an edge function that scrapes each drill's source page on-demand, extracts the direct Vimeo MP4 URL and the thumbnail image URL, then caches both in the database. The DrillDetail page renders an inline `<video>` player and/or image.

### Implementation Steps

**1. Database migration — add caching columns**
- Add `direct_video_url text` column to `drills` table (cached MP4 URL)
- Add `thumbnail_url text` column to `drills` table (cached image URL)
- Add `media_fetched boolean DEFAULT false` to track whether scraping has been attempted

**2. Create edge function `scrape-drill-media`**
- Accepts a drill source URL (the `video_url` field pointing to innebandy.se)
- Fetches the HTML page directly (no Firecrawl needed — simple fetch)
- Extracts with regex:
  - Video: `<source src="(https://player.vimeo.com/...mp4...)"` → direct MP4 URL
  - Image: `<img class="...thumbnail..." src="(https://www.innebandy.se/media/...)"` → if not `placeholder-exercise.jpg`, use as thumbnail
- Returns `{ videoSrc: string | null, thumbnailSrc: string | null }`

**3. Update `DrillDetail.tsx` — fetch and display media**
- When a drill has a `video_url` pointing to innebandy.se and `media_fetched` is false:
  - Call the edge function
  - Update the drill record with the results (`direct_video_url`, `thumbnail_url`, `media_fetched = true`)
- Render:
  - If `direct_video_url` exists: inline `<video>` player with controls
  - If `thumbnail_url` exists (and no video): display the image
  - Fallback: link to source page

**4. Update `DrillCard.tsx` — show thumbnail**
- If `thumbnail_url` exists, show it as a small preview image on the card

### Technical Details
- Edge function: `supabase/functions/scrape-drill-media/index.ts`
- Regex for video: `<source src="(https://player\.vimeo\.com/[^"]+\.mp4[^"]*)"`
- Regex for image: `<img[^>]+src="(https://www\.innebandy\.se/media/[^"]+)"` (exclude placeholder)
- Vimeo progressive URLs contain signatures and may expire — the `media_fetched` flag can be reset to re-scrape if needed
- No external API keys required (direct HTTP fetch to public pages)

### Files
- **Database migration**: Add `direct_video_url`, `thumbnail_url`, `media_fetched` columns to `drills`
- **New**: `supabase/functions/scrape-drill-media/index.ts`
- **Modified**: `src/pages/DrillDetail.tsx` (fetch + render inline media)
- **Modified**: `src/components/training/DrillCard.tsx` (optional thumbnail preview)

