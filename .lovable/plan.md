

## Plan: Kedjor utan matchstart + Kombinationsstatistik

### Vad som ändras

**1. Tillåt kedjeuppställning på "Ej startade" matcher (redan fungerar)**

Nuvarande kod visar redan kedjor (LineSetup) i "Not Started"-vyn i `GameDetail.tsx` (rad 247-257). Kedjorna sparas direkt via `updateLine` → `saveGame` till databasen. Så kedjeuppställning *utan att starta matchen* fungerar redan.

Det som behövs är att göra detta tydligare i UX: lägga till en rubrik/sektion som gör det klart att man kan sätta upp kedjor oberoende av matchstart.

**2. Ny statistikvy: "Bästa kombinationer" (Line Chemistry)**

Skapa en ny komponent som analyserar alla avslutade matcher och visar vilka spelargrupper (kedjor) som presterat bäst tillsammans, baserat på +/- och mål.

### Tekniska detaljer

**Fil: `src/components/stats/LineCombinationStats.tsx` (ny)**
- Analyserar alla `Finished`-matcher
- Itererar genom varje matchs `lines` och `events`
- Aggregerar per unik spelarkombination (sorterade spelar-ID:n som nyckel):
  - Antal matcher tillsammans
  - Totala mål för/emot
  - Total +/-
  - Mål per match
- Sorterar på +/- per match eller total +/-
- Visar spelarnamn, antal matcher, GF, GA, +/- i en tabell

**Fil: `src/pages/Stats.tsx` (ändra)**
- Lägg till ny flik/vy "Kedjor" (eller "Kombinationer") bredvid befintliga "Spelare", "Lag", "Trender"
- Visa `LineCombinationStats` i den nya vyn

**Fil: `src/pages/GameDetail.tsx` (mindre ändring)**
- Förtydliga UX i "Not Started"-vyn: lägg till en kort beskrivande text under kedjerubriken som indikerar att kedjor kan sättas upp innan match

### Avgränsning
- Statistiken baseras på de kedjor (lines) som redan finns sparade per match
- Inga databasändringar behövs — all data finns redan i `games`-tabellens `lines` och `events` JSON-kolumner

