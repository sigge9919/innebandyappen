

## Plan: Minimalistisk landningssida med logotyp

Ersätter den nuvarande långa scroll-landningssidan med en enkel, centrerad sida som matchar den uppladdade HTML-filen exakt.

### Designspråk (från uppladdad fil)
- **Bakgrund**: Solid mörk navy `#0b1829` (samma som filen, full skärm)
- **Logotyp**: Inline SVG av korsade innebandyklubbor (X-form i `#1a3a6b` mörkblå + `#00d9f5` cyan-glow) med boll i mitten (cyan ring runt mörk kärna)
- **Text**: "FLOORBALL TACTIX" i bold sans-serif, vit (`#f0f6ff`), letter-spacing 4px, under logotypen
- **Layout**: Allt centrerat vertikalt och horisontellt på skärmen, inga sektioner, ingen scroll

### Sidstruktur (en skärm, ingen scroll)

1. **Centrerad SVG-logotyp** — exakt SVG från uppladdad fil (korsade klubbor + boll), ca 280×280px
2. **Wordmark** — "FLOORBALL TACTIX" under logotypen
3. **Tagline** (ny, kort) — "Digital taktikplattform för innebandy" i ljusgrå under wordmarket
4. **Två CTA-knappar** sida vid sida:
   - Cyan **"Kom igång"** (primary) → `/login`
   - Outline **"Logga in"** → `/login`
5. **Diskret footer** längst ner — `© 2026 Floorball Tactix`

### Filer som ändras

- **`src/pages/Landing.tsx`** — skrivs om från grunden till minimalistisk version
- **Tas bort** (oanvända efter omskrivning):
  - `src/components/landing/LandingNav.tsx`
  - `src/components/landing/HeroBoard.tsx`
  - `src/components/landing/FeatureCard.tsx`
  - `src/components/landing/PricingCard.tsx`

### Oförändrat
- `src/components/guards/AppGuard.tsx` — routing-logik fungerar redan (utloggad på `/` → `<Landing />`)
- `src/App.tsx` — `/login`-route finns redan
- `src/index.css` — befintliga `.glow-cyan` / `.text-glow-cyan`-utilities återanvänds på CTA-knappen

### Tekniska detaljer
- SVG inlinas direkt i komponenten (ingen extern fil) för perfekt skalning
- `min-h-screen flex items-center justify-center` för centrering
- Färgvärden hårdkodade till exakt match med filen (`#0b1829`, `#1a3a6b`, `#00d9f5`, `#f0f6ff`) snarare än CSS-variabler, för pixelperfekt visuell likhet med ursprungsdesignen
- Responsiv: logotyp skalar ner på mobil, knappar staplas vertikalt under `sm`-breakpoint
- Inga nya dependencies

