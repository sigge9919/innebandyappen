## Sortera spelare i Lag-vyn

Lägg till möjlighet att sortera spellistan på sidan **Lag** (`src/pages/Team.tsx`) utifrån:

- **Nummer** (tröjnummer, stigande) — standardval
- **Namn** (A–Ö)
- **Position** (gruppvis: Målvakt → Back → Forward, sen efter nummer)

### Ändringar i `src/pages/Team.tsx`

1. Ny state-variabel `sort` med typen `'number' | 'name' | 'position'`, default `'number'`.
2. Lägg till en `Select` (shadcn) bredvid filterknapparna med etiketten "Sortera" och de tre valen.
3. Sortera `filteredPlayers` innan rendering enligt valt sorteringsläge:
   - `number`: stigande på `jerseyNumber` (numeriskt).
   - `name`: `localeCompare` med svensk locale (`sv`).
   - `position`: först ordning Målvakt/Back/Forward via en rank-map på `positions[0]`, därefter tröjnummer som tiebreaker.

### UI-placering

Sorteringskontrollen läggs i samma rad som sök/filter, kompakt (h-9), så att layouten förblir click-sparse och fungerar även på mobil (wrap).

### Inget annat påverkas

Inga ändringar i datamodell, lagring eller andra komponenter behövs.