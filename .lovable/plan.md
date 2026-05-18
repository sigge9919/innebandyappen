## Mål

Gör det möjligt att i efterhand ladda upp och spara bilder/videor som dokumenterar en match. Allt sparas i lagets molnbackend så att alla med åtkomst till laget kan se materialet.

## Vad användaren får

- En ny sektion **"Media"** på matchsidan (`/games/:gameId`) som syns för matcher som är spelade (status `Played`/`Finished`).
- Knapp för att ladda upp foto/video (samma uppladdningsflöde som finns i övningar och spelmoment idag).
- Galleri som visar uppladdade filer (samma `PlayMediaGallery`-komponent som redan används).
- Möjlighet att ta bort enskilda mediafiler.
- Allt sparas direkt — inga "Spara"-knappar behövs.

## Tekniskt

1. **Databas:** Lägg till kolumnen `media_files jsonb default '[]'` på tabellen `games`. Inga RLS-ändringar behövs eftersom befintliga policys på `games` redan ger laget åtkomst.
2. **Typer:** Utöka `EnhancedGame` (`src/types/game.ts`) med `mediaFiles?: PlayMedia[]`. Mappa i `dbToEnhancedGame`/`enhancedGameToDb`/`enhancedGameUpdatesToDb` i `src/lib/gameStorage.ts`.
3. **Hook:** Lägg till `addGameMedia(file)` och `removeGameMedia(mediaId)` i `useGameDetail` (`src/hooks/useEnhancedGames.ts`) som uppdaterar `media_files`-kolumnen.
4. **UI:** Ny komponent `GameMediaSection` i `src/components/games/`, renderad i `GameDetail.tsx` när matchen är spelad. Återanvänder `PlayMediaGallery` och samma upload-mönster (FileReader → data-URL) som `EditPlayDialog.tsx`.

## Att tänka på

Befintlig media (övningar/spelmoment) lagras som base64 data-URL:er direkt i JSONB. Det fungerar bra för bilder men blir tungt för längre videor (varje rad kan bli flera MB och hämtas alltid med matchen). Två alternativ:

- **A. Följ samma mönster** (snabbt, konsekvent med övrig app, men inte idealiskt för stora videor).
- **B. Ladda upp till Lovable Cloud Storage** (skalbar lösning, kräver ny storage bucket + RLS-policys, lite mer kod, men hanterar stora videor utan att blåsa upp databasraden).

Förslag: börja med **A** för att hålla appen konsekvent. Vi kan migrera till **B** senare om videostorleken blir ett problem.