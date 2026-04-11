## Plan: Byt namn från Coach OS till Floorball Tactix

### Bakgrund

Användaren vill byta appens namn från "Coach OS" till "Floorball Tactix" och använda den uppladdade logotypen.

### Ändringar

#### 1. Uppdatera index.html

- Ändra `<title>` från "Lovable App" till "Floorball Tactix"
- Uppdatera `meta name="description"` till "Floorball Tactix - Master the Tactix, Improve your team"
- Uppdatera `og:title` och `twitter:title` till "Floorball Tactix"
- Uppdatera `og:description` och `twitter:description` till "Floorball Tactix - Master the Tactix, Improve your team"

#### 2. Uppdatera AppSidebar.tsx

- Ändra "Coach OS" till "Floorball Tactix" i sidomenyns header (text-xs label)
- Ändra fallback-text från "Coach OS" till "Floorball Tactix" när inget lag är valt

#### 3. Uppdatera Login.tsx

- Ändra "Coach OS" till "CardTitle" till "Floorball Tactix"
- Ändra ikon-bokstav från "C" till "F"

#### 4. Uppdatera index.css

- Ändra kommentaren från "Coach OS — Professional coaching tool" till "Floorball Tactix — Master the Tactix, Improve your team"

#### 5. Lägg till logotyp

- Kopiera den uppladdade bilden (user-uploads://image-3.png) till public/logo.png
- Uppdatera Login.tsx för att använda logotyp-bilden istället för bokstavs-ikonen (valbart)

### Tekniska detaljer

- 4 filer ändras för text-uppdateringar
- Logotyp kan läggas till som separat steg