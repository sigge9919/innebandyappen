## Mål
Byt ut det fasta filtret "Senaste 3 matcherna" på `/stats` mot en flexibel väljare där användaren själv markerar vilka avslutade matcher som ska ingå i statistiken.

## Ändringar

**`src/pages/Stats.tsx`**
- Ta bort `statsPeriod`-state (`'season' | 'last3'`) och de två knapparna.
- Inför istället:
  - `selectedGameIds: string[]` — tomt = alla avslutade matcher (hela säsongen).
  - Två knappar: `Hela säsongen` (rensar urvalet) och `Välj matcher…` (öppnar dialog).
- `statsGames` = om urvalet är tomt → alla avslutade; annars filtrera `getFinishedGames(games)` på valda id:n (behåll kronologisk ordning).
- Visa en liten sammanfattning: "Visar statistik från X av Y matcher" + chips/badges för valda matcher med kryss för att ta bort enskild match snabbt.

**Ny komponent `src/components/stats/GameFilterDialog.tsx`**
- Dialog med lista över alla avslutade matcher i säsongen, nyast först.
- Varje rad: checkbox + datum, motståndare, hemma/borta, resultat.
- Topprad: "Markera alla" / "Avmarkera alla".
- Knappar: `Avbryt` och `Använd urval`.
- Props: `games`, `selectedIds`, `onConfirm(ids)`, `open`, `onOpenChange`.

## Beteende
- Urvalet lever bara i komponentstate (ingen persistens) — nollställs vid sidbyte/säsongbyte.
- Vid säsongsbyte rensas `selectedGameIds` automatiskt via effekt på `selectedSeasonId`.
- Alla underliggande vyer (Spelar-, Lag-, Trender-, Kombinationer) tar redan emot `statsGames` och behöver inga ändringar.

## Inga backend-ändringar
Rent UI/state-arbete i frontend.
