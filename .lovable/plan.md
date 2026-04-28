## Mål

Anpassa det visuella uttrycket på sidan **Översikt** (`/`) och dess **sidomeny** så att det matchar den bifogade referensbilden. Inga texter, etiketter, namn, navigation eller logik ändras — endast färger, ytor, kortstil, typografi och layout.

## Visuella förändringar (referens → app)

Referensen visar:
- Mörk djupblå bakgrund (nästan svart-navy) över hela appen, även huvudytan (inte bara sidebar).
- Subtil cyan/turkos linjekonst-grafik som dekorativ bakgrund i hörn (logotypens X-mönster).
- Sidebar utan synlig kant — flyter ihop med bakgrunden, aktiv post markerad med cyan-text + cyan vänsterstreck istället för ljusare ruta.
- Stora rubriker i vit, fet, generös typografi ("Dashboard"-stil).
- Korten är mörka paneler (något ljusare än bakgrunden), **rundade hörn** (~12 px), mjuk inre cyan glow/border, ingen hård linje.
- Metriker visas stort i cyan, etiketter i ljusgrå/dimmad vit.
- Små cyan ikoner i kortets övre högra hörn.
- Tunna cyan-streck och bars i sparklines/diagram (redan i appens chart-färg).

## Förändringsplan (filvis)

### 1. `src/index.css` — färgtema (light mode)
Ändra `:root`-blocket så att light mode efterliknar dark mode-nivåerna i referensen (dvs hela appen blir mörk för inloggade användare — referensen är genomgående mörk):
- `--background`: djup navy, t.ex. `215 45% 7%`
- `--foreground`: nära vit `210 20% 95%`
- `--card`: något ljusare panel `215 35% 12%`
- `--card-foreground`: `210 20% 95%`
- `--border`: subtilt cyan-tonad `190 40% 20% / låg opacitet via separat klass`
- `--muted-foreground`: `215 15% 60%`
- `--primary`: behålls (cyan `190 100% 50%`)
- `--radius`: höjs från `0.25rem` till `0.75rem` för rundade kort

Lägg till nya utility-klasser i `@layer components`:
- `.glow-card` — `bg-card rounded-xl border border-primary/15 shadow-[0_0_0_1px_hsl(var(--primary)/0.08),0_8px_32px_-12px_hsl(var(--primary)/0.25)] p-4`
- `.dashboard-bg` — bakgrundslagret med två dekorativa SVG/gradient-pseudoelement i hörnen (cyan X-mönster, väldigt låg opacitet)
- Uppdatera `.stat-card` så den ärver `glow-card`-utseendet (rundad, mjuk cyan-kant, ingen hård linje).
- Uppdatera `.metric-value` — större (`text-3xl`), tabular, primary-färg på hero-värden.
- Uppdatera `.nav-item-active` — transparent bg, cyan textfärg, behåll cyan vänsterstreck.

### 2. `src/components/layout/AppSidebar.tsx`
- Ta bort höger-bordern på `<aside>` (eller gör den helt transparent) så sidebar smälter in.
- Behåll logotyp + team-switcher + nav exakt som idag (texter oförändrade).
- Lite mer luft i `nav-item` (py-2.5, gap-3).
- Gör aktiv ikon cyan (ärvs via `nav-item-active`).

### 3. `src/components/layout/AppLayout.tsx`
- Lägg `dashboard-bg` på `<main>`-elementet så de dekorativa hörnmönstren visas.

### 4. `src/pages/Dashboard.tsx`
- Byt rubrikstil: `<h1>` blir `text-3xl font-bold` (kvar: "Översikt", säsongstext oförändrad).
- Stats-raden: ta bort `gap-px bg-border` och hård border. Ersätt med `grid gap-3` där varje `StatCard` är ett rundat glow-kort.
- Behåll alla 4 stat-kort, "Priority row" (4 kort) och "Secondary row" (3 kort) — samma komponenter, samma data, oförändrad ordning och oförändrade texter.

### 5. `src/components/dashboard/StatCard.tsx`
- Lägg till valfri ikon uppe till höger (cyan, opacitet 70 %) — använder den redan deklarerade men oanvända `icon`-propen. Dashboard skickar redan in ikon-namn implicit; om inte sätts, skippas den. Inga API-ändringar utåt.
- Värdet i `text-3xl text-primary font-bold`.
- Etikett i `text-[11px] uppercase tracking-wider text-muted-foreground`.

### 6. Övriga dashboard-kort
`NextGameCard`, `LastGameCard`, `NextTrainingCard`, `WeeklyFocusCard`, `TeamRPECard`, `RPEAlertsCard`, `PlayerAlerts`:
- Byt yttersta `<div className="stat-card">` så de får det nya rundade glow-utseendet automatiskt via uppdaterad `.stat-card`-stil. Inga props eller texter ändras.
- `RPEAlertsCard` & `TeamRPECard` använder `<Card>` från `ui/card` — `Card`-komponenten ärver `--radius` och får automatiskt rundade hörn när radie höjs.
- Mindre justering: säkerställ att rubriker (`metric-label`) och knappar fortsatt är läsbara mot mörkare bakgrund (tester via befintliga tokens).

## Vad som INTE ändras

- Inga sidnamn, menyetiketter, knapptexter, kortrubriker eller datavärden.
- Ingen routing, hooks, state, datakällor, RLS, edge-funktioner.
- Inga andra sidor än Översikt + delad sidebar/layout (övriga sidor använder samma tokens och får automatiskt det nya temat — det är önskat då temat är globalt, men ingen layout på andra sidor justeras strukturellt).
- Ingen ny databas, inga nya tabeller eller kolumner.

## Resultat

Användaren loggar in och möts av en mörk dashboard med rundade glow-kort, cyan accentfärg, stor rubrik och dekorativ X-mönsterbakgrund i hörnen — visuellt likt referensbilden, men med samma innehåll, samma struktur och samma logik som idag.
