## Mål
Lägg till en ny vy "Tester" i Statistik där tränaren väljer **testtyp** (och valfritt specifikt test) och får upp en tabell med varje spelares **senaste resultat** + **datum**.

## UI

I `src/pages/Stats.tsx`:
- Lägg till en femte knapp i vyväljaren: **Tester** (ikon: `ClipboardList`).
- När vyn är aktiv döljs "Välj matcher"/säsongsfilter-raden (testdata är inte matchberoende) — säsongsväljaren högst upp behålls men används inte för filtrering här (tester saknar säsongskoppling i databasen).

## Ny komponent: `src/components/stats/TestStats.tsx`

Props: `players: Player[]`.

Internt:
- Använder `useTestResults()` för att hämta lagets test_results.
- **Testtyp-filter**: knappar för varje unik `testType` i resultaten (vanligen `Fitness`/`Skill`) + "Alla".
- **Testnamn-väljare**: `Select` med alla unika `testName` som matchar vald typ. Standardval: "Alla tester".
- **Tabell** (en rad per spelare i aktiv trupp):
  - Spelare (namn + tröjnr)
  - Test (om "Alla tester" valt — visa testnamnet på den senaste posten)
  - Senaste resultat
  - Datum
  - Trend-indikator (`trend` från TestResult, pil upp/ner/=)
- Logik: gruppera resultat per `playerId` (+ `testName` om specifikt test valt), sortera efter `date` desc, ta första.
- Spelare utan resultat visas med "—".
- Tom state om inga tester finns: meddelande "Inga testresultat registrerade ännu" med länk till Spelare-sidan.
- Sortering: tabell sorterbar på resultat (numeriskt om möjligt) och datum.

## Integration

I `Stats.tsx`:
- `statsView` utökas med `'tests'`.
- Rendera `<TestStats players={players} />` när aktiv.
- Räknaren "X avslutade matcher" göms i testvyn.

## Inga DB-ändringar

Använder befintlig `test_results`-tabell och `useTestResults`-hook.
