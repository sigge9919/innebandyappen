

## Plan: Snyggare och mer informativa trenddiagram

### Problem med nuvarande lösning
- **Visuell överbelastning**: 8 dubbla diagram + 6 enkla = 14 separata kort att skanna
- **Standard recharts-look**: Tunna linjer, hårda gridlinjer, ingen visuell hierarki
- **Svårt att se trend i ett ögonkast**: Linjer utan area, ingen riktningsindikator, ingen jämförelse mot snitt
- **Ingen sammanhang**: Saknas snitt-linjer, max/min, trendpilar eller "form"-indikatorer

### Föreslagen lösning — tre förbättringar i kombination

#### 1. Estetisk uppgradering av befintliga diagram
- **Area + linje** istället för bara linje (gradient fill med låg opacitet) — ger volym och gör trender tydligare
- **Mjukare grid** (dashed, lägre opacitet) och borttagna axlar utan värde
- **Avrundade tooltips** med tema-färger (cyan/navy från logotypen)
- **Snittlinje** (streckad referenslinje) per metric — visar direkt om senaste matchen är över/under snitt
- **Färgharmonisering**: Använd cyan (logotypens primärfärg) för "vårt lag" istället för grönt, och en varm korall för motståndare istället för hård röd. Behåll grön/röd bara för PP/PK där det signalerar bra/dåligt
- **Y-axel borttagen** på de flesta diagram — värdet visas i tooltip + senaste värdet som stor siffra i kortets header

#### 2. Ny "Sparkline-översikt" överst
Ett kompakt rutnät (3-4 kolumner) där varje metric visas som:
```text
┌────────────────────────────┐
│ SOG               ↑ +12%   │
│ 28  ─╲╱─╱╲╱──             │  ← mini sparkline
│ snitt 24  │  senaste 28    │
└────────────────────────────┘
```
- Ger en helhetsbild på en skärm innan man dyker ner i detaljer
- Trendpil (↑↓→) baserat på senaste 3 vs föregående 3 matcher
- Färgad enligt riktning (cyan = bättre, korall = sämre)

#### 3. Gruppering med tabs
Istället för 14 kort i en lång lista, gruppera i tabs:
- **Offensiv** (Mål, SOG, SOG%, Totala skott, Skott utanför)
- **Defensiv** (Blockerade, BLK%, Defensiva blockeringar)
- **Special teams** (PP-mål, PP SOG, PP%, PK-mål, PK SOG, PK%)

### Filer som ändras
- `src/components/stats/TeamTrends.tsx` — refaktorering med sparkline-översikt, tabs, area-charts, snittlinjer
- `src/components/stats/PlayerTrends.tsx` — samma estetiska uppgradering (area + snittlinje + nya färger)
- Nya hjälpkomponenter:
  - `src/components/stats/TrendSparkline.tsx` — kompakt sparkline-kort
  - `src/components/stats/TrendChart.tsx` — återanvändbar area+linje-chart med snittlinje

### Tekniska detaljer
- Använder `recharts` `AreaChart` + `linearGradient` för gradient-fill
- `ReferenceLine` för snittvärde (streckad)
- Tab-gruppering via befintlig `Tabs`-komponent
- Trendberäkning: snitt(senaste 3) vs snitt(föregående 3) → procent + riktning
- Färger från CSS-variabler (`--primary` cyan) + en ny `--chart-opponent` ton

