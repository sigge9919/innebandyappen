export interface DefaultDrill {
  name: string;
  description: string;
  video_url: string;
  group: string; // derived category for grouping in the picker
}

function deriveGroup(name: string): string {
  const lower = name.toLowerCase();
  if (lower.startsWith('målvaktsövning') || lower.startsWith('målvakten och laget')) return 'Målvakt';
  if (lower.startsWith('spelövning')) return 'Spelövningar';
  if (lower.startsWith('passa') || lower.startsWith('passning')) return 'Passningar';
  if (lower.startsWith('driva boll')) return 'Driva boll';
  if (lower.startsWith('pressa') || lower.startsWith('duellspel')) return 'Press & duell';
  if (lower.startsWith('avslut') || lower.startsWith('skjuta') || lower.startsWith('direktskott') || lower.startsWith('handledsskott')) return 'Avslut & skott';
  if (lower.startsWith('utmana') || lower.startsWith('gyllene')) return 'Finter & dribbling';
  if (lower.startsWith('vända')) return 'Vändningar';
  if (lower.startsWith('snurr') || lower.startsWith('vickningar') || lower.startsWith('växlingar') || lower.startsWith('dragpassningar') || lower.startsWith('360 kontroll') || lower.startsWith('jag och bollen') || lower.startsWith('balansera') || lower.startsWith('teknikbana') || lower.startsWith('passning till')) return 'Teknik & bollkontroll';
  if (lower.startsWith('spelbarhet') || lower.startsWith('speldjup') || lower.startsWith('spelavstånd')) return 'Spelförståelse';
  if (lower.startsWith('etablerat') || lower.startsWith('omställning') || lower.startsWith('kontringar')) return 'Speluppbyggnad';
  if (lower.includes('hamstring') || lower.includes('benböj') || lower.includes('squat') || lower.includes('step up') || lower.includes('marklyft') || lower.includes('rodd') || lower.includes('press') || lower.includes('armhävning') || lower.includes('bålsträckning') || lower.includes('copenhagen') || lower.includes('pallof') || lower.includes('walkout') || lower.includes('woodchop') || lower.includes('kast i sidled') || lower.includes('glider')) return 'Styrka & fysik';
  if (lower.includes('knäkontroll')) return 'Skadeförebyggande';
  if (lower.includes('stafett') || lower.includes('kull') || lower.includes('bulldogs') || lower.includes('kaos') || lower.includes('reflexen') || lower.includes('krabb') || lower.includes('kon-kaos') || lower.includes('tjuva') || lower.includes('hinderbana') || lower.includes('jaktlek') || lower.includes('evighets')) return 'Lekar & uppvärmning';
  return 'Övrigt';
}

const RAW_DRILLS: Omit<DefaultDrill, 'group'>[] = [
  { name: '3 mot 3 med väggar - Skjuta - snabba avslut', description: 'Spel på begränsad yta med möjlighet till väggspel hos vilande spelare. I denna övning vill vi uppmuntra många avslut på olika sätt.', video_url: 'https://www.innebandy.se/ovningsbanken/3-mot-3-med-vaggar-skjuta-snabba-avslut' },
  { name: '360 kontroll - 1 v 1', description: 'Övningen syftar till att röra sig i alla olika riktningar med olika hastigheter och god bollkontroll.', video_url: 'https://www.innebandy.se/ovningsbanken/360-kontroll-1-v-1' },
  { name: '360 kontroll - Innebandykull', description: 'Att kunna röra sig i alla olika riktningar med olika hastigheter och god bollkontroll kommer att hjälpa bollförare att navigera i den ständigt förändrade miljö som ett matchspel innebär.', video_url: 'https://www.innebandy.se/ovningsbanken/360-kontroll-innebandykull' },
  { name: '360 kontroll - spegeln', description: 'Övningen syftar till att röra sig i alla olika riktningar med olika hastigheter och god bollkontroll.', video_url: 'https://www.innebandy.se/ovningsbanken/360-kontroll-spegeln' },
  { name: 'Armhävning', description: 'Tränar i första hand styrkan i bröstmusklerna och triceps (armarnas baksida).', video_url: 'https://www.innebandy.se/ovningsbanken/armhavning' },
  { name: 'Avslut - 1 v 1 + 1', description: 'Avslutsträning centralt i banan för att lära sig hitta lösningar och alternativ för avslut inne centralt i banan.', video_url: 'https://www.innebandy.se/ovningsbanken/avslut-1-v-1-plus-1' },
  { name: 'Avslut - Markan', description: 'Att träna avslut och när avslut ska tas är en viktig del i innebandy. Här jobbar vi med avslut kopplat till olika spelsituationer i varierande svårighetsgrad.', video_url: 'https://www.innebandy.se/ovningsbanken/avslut-markan' },
  { name: 'Avslut - skottormen', description: 'Driva boll i fart under lite stress samt att skjuta mot mål i fart.', video_url: 'https://www.innebandy.se/ovningsbanken/avslut-skottormen' },
  { name: 'Balansera över bänkar', description: 'Bollkontroll och grundteknik. Lär dig att hantera boll och klubba i olika typer av rörelser.', video_url: 'https://www.innebandy.se/ovningsbanken/balansera-over-bankar' },
  { name: 'Benböj', description: 'Tränar styrkan i benens muskler och bidrar till att spelaren kan utveckla mer kraft i olika rörelser.', video_url: 'https://www.innebandy.se/ovningsbanken/benboj' },
  { name: 'British Bulldogs', description: 'Övningen är i grunden en lek, men som också syftar till att kunna driva boll och samtidigt ha koll på vad som händer runt sig.', video_url: 'https://www.innebandy.se/ovningsbanken/british-bulldogs' },
  { name: 'Bålsträckning med boll', description: 'Tränar i första hand bålens muskulatur och förmågan att ha god bålkontroll.', video_url: 'https://www.innebandy.se/ovningsbanken/balstrackning-med-boll' },
  { name: 'Copenhagen Hip', description: 'Tränar i första hand excentrisk styrka i ljumskens muskler. Används främst för att förebygga skador i ljumsken.', video_url: 'https://www.innebandy.se/ovningsbanken/copenhagen-hip' },
  { name: 'Direktskott', description: 'Bollkontroll och grundteknik. Träna i lugnt tempo på att skjuta direktskott.', video_url: 'https://www.innebandy.se/ovningsbanken/direktskott' },
  { name: 'Dragpassningar', description: 'Grundteknik när det gäller att dra iväg passningar, men även att ta emot passningar med kontroll.', video_url: 'https://www.innebandy.se/ovningsbanken/dragpassningar' },
  { name: 'Driva boll - 4 målsmatchen', description: 'Driva med boll är en central egenskap för att erövra ytor, utmana och ta sig förbi motståndare.', video_url: 'https://www.innebandy.se/ovningsbanken/driva-boll-4-malsmatchen' },
  { name: 'Driva boll - färgbollen', description: 'Driva med boll är en central egenskap för att erövra ytor, utmana och ta sig förbi motståndare. Behålla bollen inom laget.', video_url: 'https://www.innebandy.se/ovningsbanken/driva-boll-fargbollen' },
  { name: 'Driva boll - gatloppet', description: 'Driva boll på yta, utmana och ta sig förbi motståndare.', video_url: 'https://www.innebandy.se/ovningsbanken/driva-boll-gatloppet' },
  { name: 'Driva boll - Jaktlek', description: 'Driva boll i fart. Ta avslut i stressad situation.', video_url: 'https://www.innebandy.se/ovningsbanken/driva-boll-jaktlek' },
  { name: 'Duell och direktpass', description: 'I denna övning jobbar vi växelvis med passningar och att utmana sin motståndare.', video_url: 'https://www.innebandy.se/ovningsbanken/duell-och-direktpass' },
  { name: 'Duellspel - 3 v 2', description: 'Att spela ett aktivt presspel innebär att målsättningen är att minska bollförande lags tid och spelytor.', video_url: 'https://www.innebandy.se/ovningsbanken/duellspel-3-v-2' },
  { name: 'Etablerat anfall & försvar A', description: 'Öva på etablerat anfall och försvar på normalstor plan.', video_url: 'https://www.innebandy.se/ovningsbanken/etablerat-anfall-forsvar-a' },
  { name: 'Etablerat anfall & försvar B', description: 'Spelövning där försvarande lag eller anfallande lag spelar med en backjoker.', video_url: 'https://www.innebandy.se/ovningsbanken/etablerat-anfall-forsvar-b' },
  { name: 'Etablerat anfall & försvar C', description: 'Spelövning på halvplan som syftar till att öva på etablerat anfallsspel och försvarsspel.', video_url: 'https://www.innebandy.se/ovningsbanken/etablerat-anfall-forsvar-c' },
  { name: 'Evighetsstafett', description: 'Fysfokus under tävlingsform.', video_url: 'https://www.innebandy.se/ovningsbanken/evighetsstafett' },
  { name: 'Gyllene Kvadraten', description: 'I denna övning jobbar vi att ha kontroll på bollen samtidigt som du stöter på olika utmaningar.', video_url: 'https://www.innebandy.se/ovningsbanken/gyllene-kvadraten' },
  { name: 'Hamstring curl på boll', description: 'Tränar i första hand styrkan i lårens baksida och i sätesmusklerna.', video_url: 'https://www.innebandy.se/ovningsbanken/hamstring-curl-pa-boll' },
  { name: 'Handledsskott', description: 'Bollkontroll och grundteknik. Träna i lugnt tempo på att skjuta handledsskott.', video_url: 'https://www.innebandy.se/ovningsbanken/handledsskott' },
  { name: 'Hantelpress med en arm', description: 'Tränar i första hand styrkan i bröstmusklerna, triceps och axelmusklerna.', video_url: 'https://www.innebandy.se/ovningsbanken/hantelpress-med-en-arm' },
  { name: 'Hantelrodd', description: 'Tränar i första hand styrkan i ryggens övre muskler, biceps och axlarna.', video_url: 'https://www.innebandy.se/ovningsbanken/hantelrodd' },
  { name: 'Hinderbana', description: 'Att bygga upp en hinderbana till uppvärmningen uppmuntrar barn att röra på sig på ett roligt och lekfullt sätt.', video_url: 'https://www.innebandy.se/ovningsbanken/hinderbana' },
  { name: 'Hängande rodd', description: 'Tränar i första hand styrkan i ryggens övre muskler, biceps och axlarna.', video_url: 'https://www.innebandy.se/ovningsbanken/hangande-rodd' },
  { name: 'Jag och bollen', description: 'I denna övning jobbar vi att ha kontroll på bollen genom att spegla rörelsen som din tränare framför dig gör.', video_url: 'https://www.innebandy.se/ovningsbanken/jag-och-bollen' },
  { name: 'Kast i sidled med medicinboll', description: 'Tränar i första hand bålens muskulatur och förmågan att utveckla kraft i rotationer.', video_url: 'https://www.innebandy.se/ovningsbanken/kast-i-sidled-med-medicinboll' },
  { name: 'Knäkontrollen', description: 'Starta med övningarna redan i de yngre åldrarna för att göra den skadeförebyggande träningen till en naturlig del av innebandyn.', video_url: 'https://www.innebandy.se/ovningsbanken/knakontroll' },
  { name: 'Kon-kaos', description: 'Lek eller uppvärmningsövning som innehåller tävlingsmoment!', video_url: 'https://www.innebandy.se/ovningsbanken/kon-kaos' },
  { name: 'Kontringar - stora coast to coast', description: 'Genom att ställa om snabbt till kontring efter bollvinst vill vi såra våra motståndare innan de hunnit strukturera sig.', video_url: 'https://www.innebandy.se/ovningsbanken/kontringar-stora-coast-to-coast' },
  { name: 'Krabb-boll', description: 'Lek eller uppvärmningsövning som innehåller tävlingsmoment!', video_url: 'https://www.innebandy.se/ovningsbanken/krabb-boll' },
  { name: 'Målvakten och laget - inbågningar', description: 'Rädda skott från ficka. Förflyttning från stolpe ut mot skytt.', video_url: 'https://www.innebandy.se/ovningsbanken/malvakten-och-laget-inbagningar' },
  { name: 'Målvakten och laget - inspel från hörn, skanna', description: 'Inspel från hörn till avslutare som ska skjuta direktskott.', video_url: 'https://www.innebandy.se/ovningsbanken/malvakten-och-laget-inspel-fran-horn-skanna' },
  { name: 'Målvakten och laget - läsa spelet, intentioner', description: 'Övning som ger flera avslutsalternativ och syftar till att utmana målvakten att läsa vad bollförare kommer att göra.', video_url: 'https://www.innebandy.se/ovningsbanken/malvakten-och-laget-lasa-spelet-intentioner' },
  { name: 'Målvaktsövning - följa John', description: 'Övning där målvakterna får träna olika typer av förflyttningar.', video_url: 'https://www.innebandy.se/ovningsbanken/malvaktsovning-folja-john' },
  { name: 'Målvaktsövning - hand-öga koordination - parövning Kast', description: 'Övning där målvakterna får träna på sin hand-öga koordination.', video_url: 'https://www.innebandy.se/ovningsbanken/malvaktsovning-hand-oga-koordination-parovning-kast' },
  { name: 'Målvaktsövning - hand-öga koordination - under förflyttning parövning', description: 'Övning där målvakterna får träna på sin hand-öga koordination.', video_url: 'https://www.innebandy.se/ovningsbanken/malvaktsovning-hand-oga-koordination-under-forflyttning-parovning' },
  { name: 'Målvaktsövning - hand-öga koordination med skott', description: 'Övning där målvakterna får träna på sin hand-öga koordination.', video_url: 'https://www.innebandy.se/ovningsbanken/malvaktsovning-hand-oga-koordination-med-skott' },
  { name: 'Målvaktsövning - returkontroll', description: 'Övning där målvakterna får träna på sin returkontroll.', video_url: 'https://www.innebandy.se/ovningsbanken/malvaktsovning-returkontroll' },
  { name: 'Målvaktsövning - returkontroll under förflyttning', description: 'Övning där målvakterna får träna på sin returkontroll efter en kort förflyttning.', video_url: 'https://www.innebandy.se/ovningsbanken/malvaktsovning-returkontroll-under-forflyttning' },
  { name: 'Nordisk hamstring', description: 'Tränar i första hand excentrisk styrka i lårens baksida. Förebygger effektivt skador.', video_url: 'https://www.innebandy.se/ovningsbanken/nordisk-hamstring' },
  { name: 'Omställning A', description: 'Träna spelarnas färdigheter utifrån de spelbeteenden som krävs kopplat till omställningsspelet.', video_url: 'https://www.innebandy.se/ovningsbanken/omstallning-a' },
  { name: 'Omställning B', description: 'Träna spelarnas färdigheter utifrån omställningsspelet. Öva på etablerat anfall och försvar.', video_url: 'https://www.innebandy.se/ovningsbanken/omstallning-b' },
  { name: 'Pallof press', description: 'Tränar i första hand bålens muskulatur och förmågan att ha god bålkontroll genom att motstå rotationer.', video_url: 'https://www.innebandy.se/ovningsbanken/pallof-press' },
  { name: 'Passa - 4 v 1', description: 'Träna på passningar, hitta passningsvägar och göra sig spelbar utan bollen.', video_url: 'https://www.innebandy.se/ovningsbanken/passa-4-v-1' },
  { name: 'Passa - 4 v 2', description: 'Träna på passningar, hitta passningsvägar och göra sig spelbar utan bollen.', video_url: 'https://www.innebandy.se/ovningsbanken/passa-4-v-2' },
  { name: 'Passa - passningsleken', description: 'Träna passningar och kommunikation i rörelse.', video_url: 'https://www.innebandy.se/ovningsbanken/passa-passningsleken' },
  { name: 'Passa - passningsleken Steg 2', description: 'Träna passningar och kommunikation i rörelse. Undvik att bli av med bollen.', video_url: 'https://www.innebandy.se/ovningsbanken/passa-passningsleken-steg-2' },
  { name: 'Passa och mottagning - Basketbollen', description: 'Träna på passningar under rörelse, titta upp och kommunicera med medspelare.', video_url: 'https://www.innebandy.se/ovningsbanken/passa-och-mottagning-basketbollen' },
  { name: 'Passning & spelbarhet - Zon till zon', description: 'Spelövning som syftar till att ge bollhållaren passningsalternativ.', video_url: 'https://www.innebandy.se/ovningsbanken/passning-spelbarhet-zon-till-zon' },
  { name: 'Passning till nedfälld bänk', description: 'Bollkontroll och passningsteknik i fart. Slå passningar och skjuta direktskott.', video_url: 'https://www.innebandy.se/ovningsbanken/passning-till-nedfalld-bank' },
  { name: 'Passningar - Ajax leken', description: 'Jobba med att göra dig spelbar för medspelare och sedan leverera passningar till kompisar.', video_url: 'https://www.innebandy.se/ovningsbanken/passningar-ajax-leken' },
  { name: 'Pressa - 1 v 2 & 2 v 1', description: 'Övning som syftar till att träna på strategier för att hindra motståndaren vid numerärt underläge.', video_url: 'https://www.innebandy.se/ovningsbanken/pressa-1-v-2-2-v-1' },
  { name: 'Pressa - Pressen', description: 'Spelövning som syftar till att träna på att förhindra speluppbyggnad.', video_url: 'https://www.innebandy.se/ovningsbanken/pressa-pressen' },
  { name: 'Pressa - Sargduellen', description: 'Att spela ett aktivt presspel innebär att snabbt minska avståndet till motståndare.', video_url: 'https://www.innebandy.se/ovningsbanken/pressa-sargduellen' },
  { name: 'Pressa - Tampa Deluxe', description: 'Att spela ett aktivt presspel innebär att snabbt minska avståndet till motståndare.', video_url: 'https://www.innebandy.se/ovningsbanken/pressa-tampa-deluxe' },
  { name: 'Pressa, Markera - 3 v 5', description: 'Träna på att förhindra och rädda avslut genom att aktivt pressa och markera motståndare.', video_url: 'https://www.innebandy.se/ovningsbanken/pressa-markera-3-v-5' },
  { name: 'Raka marklyft', description: 'Tränar i första hand styrkan i lårens baksida och i sätesmusklerna.', video_url: 'https://www.innebandy.se/ovningsbanken/raka-marklyft' },
  { name: 'Reflexen', description: 'Lek som innehåller tävlingsmoment!', video_url: 'https://www.innebandy.se/ovningsbanken/reflexen' },
  { name: 'Skivstångsrodd', description: 'Tränar i första hand styrkan i ryggens övre muskler, biceps och axlarna.', video_url: 'https://www.innebandy.se/ovningsbanken/skivstangsrodd' },
  { name: 'Skjuta - Målen i mitten', description: 'Träna på att hitta avslutsmöjligheter samt lära sig försvara mot just avsluten.', video_url: 'https://www.innebandy.se/ovningsbanken/skjuta-malen-i-mitten' },
  { name: 'Snurr med boll - rockringar', description: 'Grundteknik när det gäller att snurra med bollen med både forehand och backhand.', video_url: 'https://www.innebandy.se/ovningsbanken/snurr-med-boll-rockringar' },
  { name: 'Snurr med boll grundteknik', description: 'Grundteknik när det gäller att snurra med bollen med både forehand och backhand.', video_url: 'https://www.innebandy.se/ovningsbanken/snurr-med-boll-grundteknik' },
  { name: 'Spelavstånd 3 v 2', description: 'Övningen syftar till att lära sig hitta ytor för att ge bollhållaren ett passningsalternativ.', video_url: 'https://www.innebandy.se/ovningsbanken/spelavstand-3-v-2' },
  { name: 'Spelbarhet - 2 v 2 + 2', description: 'Spelövning som syftar till att träna på speluppbyggnad samt etablerat anfall.', video_url: 'https://www.innebandy.se/ovningsbanken/spelbarhet-2-v-2-plus-2' },
  { name: 'Spelbarhet - centervändningen', description: 'Att jobba med att flytta bollen från sida till sida för att skapa möjligheter att ta sig förbi motståndare.', video_url: 'https://www.innebandy.se/ovningsbanken/spelbarhet-centervandningen' },
  { name: 'Spelbarhet - innebandydoppboll', description: 'Att kunna implementera tanken kring att passa bollen och hitta en ny yta för att kunna få tillbaka bollen.', video_url: 'https://www.innebandy.se/ovningsbanken/spelbarhet-innebandydoppboll' },
  { name: 'Speldjup - jokerpoint', description: 'Syftar till att behålla bollen inom laget och så småningom anfalla och göra mål.', video_url: 'https://www.innebandy.se/ovningsbanken/speldjup-jokerpoint' },
  { name: 'Speldjup - spelövning 8 Zonerna', description: 'Ge bollhållaren passningsalternativ framåt, bakåt och diagonalt. Utnyttja obalans.', video_url: 'https://www.innebandy.se/ovningsbanken/speldjup-spelovning-8-zonerna' },
  { name: 'Spelövning - Anfall A', description: 'Öva speluppbyggnad och offensiva principer. Komma till farliga ytor för bästa möjliga avslutsläge.', video_url: 'https://www.innebandy.se/ovningsbanken/spelovning-anfall-a' },
  { name: 'Spelövning - Anfall B', description: 'Öva speluppbyggnad och offensiva principer. Komma till farliga ytor för bästa möjliga avslutsläge.', video_url: 'https://www.innebandy.se/ovningsbanken/spelovning-anfall-b' },
  { name: 'Spelövning - Anfall C', description: 'Öva speluppbyggnad och offensiva principer. Komma till farliga ytor för bästa möjliga avslutsläge.', video_url: 'https://www.innebandy.se/ovningsbanken/spelovning-anfall-c' },
  { name: 'Spelövning - Avslut 1A', description: 'Komma till avslut och göra mål! Öva avslut.', video_url: 'https://www.innebandy.se/ovningsbanken/spelovning-avslut-1a' },
  { name: 'Spelövning - Avslut 1B', description: 'Komma till avslut och göra mål! Öva avslut.', video_url: 'https://www.innebandy.se/ovningsbanken/spelovning-avslut-1b' },
  { name: 'Spelövning - Avslut 1C', description: 'Öva avslut. Goda kunskaper om avslut är viktiga.', video_url: 'https://www.innebandy.se/ovningsbanken/spelovning-avslut-1c' },
  { name: 'Spelövning - Avslut 2A', description: 'Syftar till att komma till avslut och göra mål samt förhindra avslut och rädda mål.', video_url: 'https://www.innebandy.se/ovningsbanken/spelovning-avslut-2a' },
  { name: 'Spelövning - Avslut 2B', description: 'Öva på att komma till avslut respektive förhindra avslut och rädda mål.', video_url: 'https://www.innebandy.se/ovningsbanken/spelovning-avslut-2b' },
  { name: 'Spelövning - Avslut 2C', description: 'Öva på att komma till avslut respektive förhindra avslut och rädda mål.', video_url: 'https://www.innebandy.se/ovningsbanken/spelovning-avslut-2c' },
  { name: 'Spelövning - Passa - Spanska kvadraten', description: 'Hålla bollen inom laget genom passningsspel och rörelse utan bollen.', video_url: 'https://www.innebandy.se/ovningsbanken/spelovning-passa-spanska-kvadraten' },
  { name: 'Spelövning - Ytterzonen', description: 'Spelövning som syftar till att träna beteenden kopplat till etablerat anfall och omställningar.', video_url: 'https://www.innebandy.se/ovningsbanken/spelovning-ytterzonen' },
  { name: 'Split squat', description: 'Tränar styrkan i benens muskler och ökar förmågan att utveckla kraft.', video_url: 'https://www.innebandy.se/ovningsbanken/split-squat' },
  { name: 'Step up', description: 'Tränar styrkan i benens muskler och ökar förmågan att utveckla kraft.', video_url: 'https://www.innebandy.se/ovningsbanken/step-up' },
  { name: 'Teknikbana', description: 'Jobba med teknik i olika former som en del av er ordinarie träning.', video_url: 'https://www.innebandy.se/ovningsbanken/teknikbana' },
  { name: 'The glider', description: 'Tränar i första hand excentrisk styrka i lårens baksida. Förebygger skador.', video_url: 'https://www.innebandy.se/ovningsbanken/the-glider' },
  { name: 'Tjuva koner', description: 'Syftar till att på ett lekfullt och tävlingsinriktat sätt jobba med att öka din uthållighet.', video_url: 'https://www.innebandy.se/ovningsbanken/tjuva-koner' },
  { name: 'Utmana, finta, dribbla - alla mot alla', description: 'Träna på att passera en motståndare med boll under kontroll.', video_url: 'https://www.innebandy.se/ovningsbanken/utmana-finta-dribbla-alla-mot-alla' },
  { name: 'Utmana, finta, dribbla - Trillingmatchen', description: 'Träna på att slå sin motståndare 1 mot 1 med boll och göra mål.', video_url: 'https://www.innebandy.se/ovningsbanken/utmana-finta-dribbla-trillingmatchen' },
  { name: 'Utmana, finta, dribbla - Utmaningen', description: 'Genom smålagsspel 3-3 träna på att äga bollen inom sitt lag.', video_url: 'https://www.innebandy.se/ovningsbanken/utmana-finta-dribbla-utmaningen' },
  { name: 'Vickningar', description: 'Grundteknik när det gäller att flytta bollen fram och tillbaka på sin forehandsida.', video_url: 'https://www.innebandy.se/ovningsbanken/vickningar' },
  { name: 'Vända - Jaktlek', description: 'Ta sig bort från motståndaren och hitta lediga spelytor.', video_url: 'https://www.innebandy.se/ovningsbanken/vanda-jaktlek' },
  { name: 'Vända - vägg till vägg', description: 'Att kunna röra sig i alla olika riktningar med olika hastigheter och god bollkontroll.', video_url: 'https://www.innebandy.se/ovningsbanken/vanda-vagg-till-vagg' },
  { name: 'Vända - Vändningen', description: 'Förbättra bollbehandling och jobba med vändningar och byta riktning.', video_url: 'https://www.innebandy.se/ovningsbanken/vanda-vandningen' },
  { name: 'Växlingar', description: 'Grundteknik när det gäller att flytta bollen från sida till sida. Forehand till backhand.', video_url: 'https://www.innebandy.se/ovningsbanken/vaxlingar' },
  { name: 'Walkout i plankposition', description: 'Tränar i första hand bålens muskulatur och förmågan att ha god bålkontroll.', video_url: 'https://www.innebandy.se/ovningsbanken/walkout-i-plankposition' },
  { name: 'Woodchoppers', description: 'Tränar i första hand bålens muskulatur och de muskler som är aktiva vid rotationer.', video_url: 'https://www.innebandy.se/ovningsbanken/woodchoppers' },
];

export const DEFAULT_DRILLS: DefaultDrill[] = RAW_DRILLS.map(d => ({
  ...d,
  group: deriveGroup(d.name),
}));

export const DRILL_GROUPS = [...new Set(DEFAULT_DRILLS.map(d => d.group))].sort();
