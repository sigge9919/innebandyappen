## Problem

Spelarpositioner, bollar, skuggzoner och kurvkontrollpunkter sparas i taktiktavlan som **absoluta pixelkoordinater** kopplade till canvasens aktuella storlek. När tabletten roteras (eller fönsterbredden ändras) räknas canvasens bredd/höjd om i `updateSize` (`src/components/tactics/TacticsBoardCanvas.tsx`, rad ~335–348), men de sparade koordinaterna gör det inte. Resultat: rinken ritas om i ny storlek, men spelarna sitter kvar på sina gamla pixelvärden och hamnar därmed på fel ställen relativt planen — precis det du ser i porträtt vs landskap.

Samma problem uppstår vid Spara/Ladda mellan enheter med olika skärmstorlek.

## Lösning (översikt)

Gör alla positionsdata **proportionella** mot canvasstorleken i stället för absoluta pixlar. Två steg:

1. **Skalning vid storleksändring** — när `canvasSize` ändras, multiplicera alla existerande `x`/`y` med `newWidth/oldWidth` respektive `newHeight/oldHeight`. Gäller `players`, `zones`, `keyframes[].players`, `keyframes[].curveControlPoints`.
2. **Skalning vid Ladda** — spara `canvasWidth`/`canvasHeight` tillsammans med en layout. Vid laddning, skala om alla koordinater från sparad storlek till aktuell canvasstorlek.

Detta gör att samma spelmönster ser identiskt ut i porträtt, landskap, telefon, surfplatta och desktop.

## Tekniska detaljer

Fil: `src/components/tactics/TacticsBoardCanvas.tsx`

1. **`TacticsLayout`-typ**: lägg till `canvasWidth: number` och `canvasHeight: number`. Vid `handleSaveLayout` skriv in nuvarande `canvasSize`.
2. **`handleLoadLayout`**: räkna ut `sx = canvasSize.width / layout.canvasWidth`, `sy = canvasSize.height / layout.canvasHeight` (fallback 1 om saknas → bakåtkompatibelt med gamla sparade layouts, men varna i toast att de kan se förskjutna ut). Skala alla `players`, `zones`, `keyframes`, `curveControlPoints` innan de sätts i state.
3. **`updateSize`-effekten**: använd en ref för `prevCanvasSize`. När ny storlek beräknas, om den skiljer sig: skala alla state-positioner med samma `sx`/`sy` innan `setCanvasSize`.
4. **Ritcanvasen (`drawingCanvasRef`)**: free-hand-teckningen är också i pixelkoordinater. Enklaste lösningen: vid resize, rita om innehållet på en temporär canvas i ny storlek via `drawImage(src, 0, 0, newW, newH)`. Acceptabel kvalitet för taktikpilar.
5. **Aspect ratio**: behåll nuvarande `height = width * 0.625` så att rinkens proportioner är konstanta — det är skalfaktorerna `sx`/`sy` som hanterar resten.

## Vad detta INTE ändrar

- Inga databasändringar (taktiklayouter ligger fortfarande i `localStorage`).
- Inget förändras visuellt om man bara står still i ett läge.
- Befintliga sparade layouter laddas fortfarande, men gamla utan `canvasWidth/Height` kan se något förskjutna ut första gången tills de sparas om.

## Test efter implementation

Öppna samma layout i porträtt och landskap (preview-viewport) och verifiera att spelarnas position relativt mittlinjen, målburar och rinkkanter är identisk.
