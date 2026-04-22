import { Link } from "react-router-dom";
import { ArrowRight, Target, Play, Share2, FolderOpen, Users, BarChart3, Check } from "lucide-react";
import { TacticsBoardRenderer } from "@/components/playbook/TacticsBoardRenderer";

const features = [
  { icon: Target, title: "Taktikbräda", desc: "Placera ut spelare, rita rörelsemönster och bygg upp komplexa formationer med drag-och-släpp-enkelhet." },
  { icon: Play, title: "Animerade spelrörelser", desc: "Spela upp taktiska animationer i realtid och låt spelarna visualisera exakt hur situationen ska utspelas." },
  { icon: Share2, title: "Dela med laget", desc: "Exportera taktikbilder och videor direkt till WhatsApp, Slack eller e-post med ett tryck." },
  { icon: FolderOpen, title: "Taktikbibliotek", desc: "Spara och organisera obegränsat med set-plays, powerplay-uppställningar och defensiva formationer." },
  { icon: Users, title: "Samarbete", desc: "Flera tränare kan redigera och kommentera taktiker i realtid – perfekt för stora tränarstaber." },
  { icon: BarChart3, title: "Matchanalys", desc: "Koppla taktiker till faktiska matchdata och se vilka formationer ger bäst resultat." },
];

const steps = [
  { n: 1, title: "Skapa din bräda", desc: "Välj bland innebandy-specifika planer – halvplan, helplan, powerplay-upplägg och fler." },
  { n: 2, title: "Placera och animera", desc: "Dra spelare till position, rita rörelsepiler och lägg till instruktioner." },
  { n: 3, title: "Dela med laget", desc: "En länk eller bild direkt till lagets chatt. Spelarna ser det på mobilen." },
];

const tiers = [
  {
    name: "Pro",
    tagline: "För seriösa lag",
    price: "---",
    suffix: "kr / mån",
    features: ["Obegränsade taktiker", "Animationer", "Lagets delning", "Prioriterad support"],
    cta: "Köp Pro",
    highlight: true,
  },
  {
    name: "Klubb",
    tagline: "För hela klubben",
    price: "---",
    suffix: "kr / mån",
    features: ["Allt i Pro", "Obegränsade lag", "Admin-panel", "Matchanalys"],
    cta: "Kontakta oss",
    highlight: false,
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-[hsl(215,40%,8%)] text-[hsl(210,15%,92%)] font-sans overflow-x-hidden">
      {/* NAV */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[hsl(215,40%,8%)]/80 border-b border-[hsl(190,100%,50%)]/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/landing" className="flex items-center gap-2">
            <img src="/logo.png" alt="Floorball Tactix" className="h-9 w-auto" />
          </Link>
          <nav className="hidden md:flex items-center gap-10 text-xs font-bold tracking-[0.2em] uppercase text-[hsl(210,15%,75%)]">
            <a href="#funktioner" className="hover:text-[hsl(190,100%,55%)] transition-colors">Funktioner</a>
            <a href="#sa-funkar-det" className="hover:text-[hsl(190,100%,55%)] transition-colors">Taktik</a>
            <a href="#prissattning" className="hover:text-[hsl(190,100%,55%)] transition-colors">Prissättning</a>
            <a href="#kontakt" className="hover:text-[hsl(190,100%,55%)] transition-colors">Om oss</a>
          </nav>
          <Link
            to="/"
            className="px-5 py-2.5 bg-[hsl(190,100%,50%)] text-[hsl(215,40%,8%)] font-bold text-xs tracking-[0.15em] uppercase rounded-md shadow-[0_0_20px_hsl(190,100%,50%,0.4)] hover:shadow-[0_0_30px_hsl(190,100%,50%,0.6)] transition-shadow"
          >
            Kom igång
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section
        className="relative px-6 pt-20 pb-24"
        style={{
          backgroundImage: `linear-gradient(hsl(190,100%,50%,0.06) 1px, transparent 1px), linear-gradient(90deg, hsl(190,100%,50%,0.06) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      >
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[hsl(190,100%,50%)]/40 text-[hsl(190,100%,55%)] text-[11px] font-bold tracking-[0.2em] uppercase mb-10">
            <span className="w-1.5 h-1.5 rounded-full bg-[hsl(190,100%,55%)] shadow-[0_0_8px_hsl(190,100%,55%)]" />
            Digital taktikplattform för innebandy
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.05] mb-8">
            <span className="block text-white">Träna smartare</span>
            <span className="block text-[hsl(190,100%,55%)] [text-shadow:0_0_40px_hsl(190,100%,55%,0.5)]">
              VINN MER
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg text-[hsl(210,15%,70%)] leading-relaxed mb-12">
            Planera träningar, animera spelrörelser och dela taktik med hela laget — allt i ett intuitivt digitalt verktyg.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/"
              className="w-full sm:w-auto px-8 py-4 bg-[hsl(190,100%,50%)] text-[hsl(215,40%,8%)] font-bold text-sm tracking-[0.2em] uppercase rounded-md shadow-[0_0_30px_hsl(190,100%,50%,0.5)] hover:shadow-[0_0_45px_hsl(190,100%,50%,0.7)] transition-shadow"
            >
              Logga in
            </Link>
            <a
              href="#sa-funkar-det"
              className="w-full sm:w-auto px-8 py-4 border border-[hsl(190,100%,50%)]/30 text-[hsl(210,15%,90%)] font-bold text-sm tracking-[0.2em] uppercase rounded-md hover:border-[hsl(190,100%,50%)]/70 transition-colors flex items-center justify-center gap-2"
            >
              Se demo <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Tactic board mock */}
          <div className="mt-20 mx-auto max-w-4xl rounded-2xl border border-[hsl(190,100%,50%)]/20 bg-[hsl(215,45%,6%)]/60 p-4 shadow-[0_0_60px_hsl(190,100%,50%,0.15)]">
            <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-[hsl(190,100%,55%)] mb-3 text-left">
              Innebandyplan · Dra spelare för att flytta
            </div>
            <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-[hsl(215,45%,5%)] border border-[hsl(190,100%,50%)]/15 p-3">
              {/* Rink playing surface with rounded corners */}
              <div className="absolute inset-3 rounded-[40px] border-[3px] border-[hsl(190,100%,50%)]/40 bg-[hsl(215,45%,8%)]">
                {/* center line */}
                <div className="absolute inset-y-0 left-1/2 w-[2px] bg-[hsl(190,100%,55%)]/70" />
                {/* center circle */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border-2 border-[hsl(190,100%,55%)]/70" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[hsl(190,100%,55%)]" />
                {/* Left crease + goal */}
                <div className="absolute top-1/2 left-[6%] -translate-y-1/2 w-[10%] h-[55%] border-2 border-[hsl(190,100%,55%)]/70" />
                <div className="absolute top-1/2 left-[9%] -translate-y-1/2 w-[4%] h-[28%] border-2 border-[hsl(190,100%,55%)]/70" />
                {/* Right crease + goal */}
                <div className="absolute top-1/2 right-[6%] -translate-y-1/2 w-[10%] h-[55%] border-2 border-[hsl(190,100%,55%)]/70" />
                <div className="absolute top-1/2 right-[9%] -translate-y-1/2 w-[4%] h-[28%] border-2 border-[hsl(190,100%,55%)]/70" />
                {/* Corner markers */}
                {[
                  { top: "8%", left: "5%" },
                  { top: "8%", right: "5%" },
                  { bottom: "8%", left: "5%" },
                  { bottom: "8%", right: "5%" },
                ].map((pos, i) => (
                  <div key={i} className="absolute w-3 h-3" style={pos as React.CSSProperties}>
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-[hsl(190,100%,55%)]/70" />
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[hsl(190,100%,55%)]/70" />
                  </div>
                ))}
              </div>
              {/* our players (cyan) */}
              {[
                { n: 2, top: "20%", left: "38%" },
                { n: 4, top: "38%", left: "44%" },
                { n: 6, top: "50%", left: "48%" },
                { n: 5, top: "62%", left: "44%" },
                { n: 3, top: "78%", left: "38%" },
              ].map((p) => (
                <div
                  key={p.n}
                  className="absolute -translate-x-1/2 -translate-y-1/2 w-7 h-7 md:w-9 md:h-9 rounded-full bg-[hsl(190,100%,55%)] text-[hsl(215,40%,8%)] text-xs font-bold flex items-center justify-center shadow-[0_0_15px_hsl(190,100%,55%,0.7)]"
                  style={{ top: p.top, left: p.left }}
                >
                  {p.n}
                </div>
              ))}
              {/* opponents (red) */}
              {[
                { n: 8, top: "28%", left: "62%" },
                { n: 7, top: "50%", left: "58%" },
                { n: 9, top: "70%", left: "62%" },
              ].map((p) => (
                <div
                  key={p.n}
                  className="absolute -translate-x-1/2 -translate-y-1/2 w-7 h-7 md:w-9 md:h-9 rounded-full bg-[hsl(355,80%,60%)] text-white text-xs font-bold flex items-center justify-center shadow-[0_0_12px_hsl(355,80%,60%,0.6)]"
                  style={{ top: p.top, left: p.left }}
                >
                  {p.n}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="funktioner" className="px-6 py-24 border-t border-[hsl(190,100%,50%)]/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-[11px] font-bold tracking-[0.25em] uppercase text-[hsl(190,100%,55%)] mb-3">Plattformen</div>
            <h2 className="text-4xl md:text-5xl font-black text-white">Allt du behöver som tränare</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="group rounded-xl bg-[hsl(215,45%,11%)] border border-[hsl(190,100%,50%)]/10 p-7 hover:border-[hsl(190,100%,50%)]/40 hover:bg-[hsl(215,45%,13%)] transition-all"
                >
                  <div className="w-11 h-11 rounded-lg bg-[hsl(190,100%,50%)]/10 border border-[hsl(190,100%,50%)]/30 flex items-center justify-center mb-5 group-hover:bg-[hsl(190,100%,50%)]/20 transition-colors">
                    <Icon className="w-5 h-5 text-[hsl(190,100%,55%)]" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-[hsl(210,15%,65%)] leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="sa-funkar-det" className="px-6 py-24 border-t border-[hsl(190,100%,50%)]/10">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="text-[11px] font-bold tracking-[0.25em] uppercase text-[hsl(190,100%,55%)] mb-3">Så funkar det</div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-12 leading-tight">Från idé till matchvinnande taktik</h2>

            <div className="space-y-8">
              {steps.map((s) => (
                <div key={s.n} className="flex gap-5">
                  <div className="shrink-0 w-12 h-12 rounded-full border-2 border-[hsl(190,100%,55%)] text-[hsl(190,100%,55%)] font-bold flex items-center justify-center shadow-[0_0_15px_hsl(190,100%,55%,0.3)]">
                    {s.n}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1.5">{s.title}</h3>
                    <p className="text-sm text-[hsl(210,15%,65%)] leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[hsl(190,100%,50%)]/20 bg-[hsl(215,45%,9%)] p-6 shadow-[0_0_50px_hsl(190,100%,50%,0.1)]">
            <div className="aspect-[16/10] rounded-lg bg-[hsl(215,45%,5%)] border border-[hsl(190,100%,50%)]/15 relative overflow-hidden mb-5 p-3">
              <div className="absolute inset-3 rounded-[32px] border-2 border-[hsl(190,100%,50%)]/40 bg-[hsl(215,45%,8%)]">
                <div className="absolute inset-y-0 left-1/2 w-px bg-[hsl(190,100%,55%)]/70" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full border border-[hsl(190,100%,55%)]/70" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[hsl(190,100%,55%)]" />
                <div className="absolute top-1/2 left-[6%] -translate-y-1/2 w-[10%] h-[55%] border border-[hsl(190,100%,55%)]/70" />
                <div className="absolute top-1/2 right-[6%] -translate-y-1/2 w-[10%] h-[55%] border border-[hsl(190,100%,55%)]/70" />
              </div>
              {[
                { n: 1, top: "30%", left: "44%" },
                { n: 3, top: "42%", left: "50%" },
                { n: 5, top: "55%", left: "54%" },
                { n: 4, top: "62%", left: "48%" },
                { n: 2, top: "72%", left: "42%" },
              ].map((p) => (
                <div
                  key={p.n}
                  className="absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[hsl(190,100%,55%)] text-[hsl(215,40%,8%)] text-[10px] font-bold flex items-center justify-center shadow-[0_0_10px_hsl(190,100%,55%,0.6)]"
                  style={{ top: p.top, left: p.left }}
                >
                  {p.n}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1.5 text-xs font-semibold rounded-md bg-[hsl(190,100%,50%)]/15 text-[hsl(190,100%,60%)] border border-[hsl(190,100%,50%)]/40">Powerplay</span>
              <span className="px-3 py-1.5 text-xs font-semibold rounded-md bg-white/5 text-[hsl(210,15%,75%)] border border-white/10">5 mot 5</span>
              <span className="px-3 py-1.5 text-xs font-semibold rounded-md bg-white/5 text-[hsl(210,15%,75%)] border border-white/10">Breakout</span>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="prissattning" className="px-6 py-24 border-t border-[hsl(190,100%,50%)]/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-[11px] font-bold tracking-[0.25em] uppercase text-[hsl(190,100%,55%)] mb-3">Prissättning</div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Enkelt. Transparent.</h2>
            <p className="text-[hsl(210,15%,65%)]">Börja gratis, uppgradera när du är redo.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {tiers.map((t) => (
              <div
                key={t.name}
                className={`relative rounded-2xl p-8 flex flex-col ${
                  t.highlight
                    ? "bg-[hsl(215,45%,11%)] border-2 border-[hsl(190,100%,50%)] shadow-[0_0_40px_hsl(190,100%,50%,0.25)]"
                    : "bg-[hsl(215,45%,11%)] border border-[hsl(190,100%,50%)]/10"
                }`}
              >
                {t.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[hsl(190,100%,50%)] text-[hsl(215,40%,8%)] text-[10px] font-black tracking-[0.2em] uppercase">
                    Populärast
                  </div>
                )}
                <h3 className="text-2xl font-bold text-white text-center mb-1">{t.name}</h3>
                <p className="text-sm text-[hsl(210,15%,65%)] text-center mb-8">{t.tagline}</p>
                <div className="text-center mb-8">
                  <span className={`text-6xl font-black ${t.highlight ? "text-[hsl(190,100%,55%)]" : "text-white"}`}>{t.price}</span>
                  <span className="text-sm text-[hsl(210,15%,60%)] ml-1">{t.suffix}</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {t.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-3 text-sm text-[hsl(210,15%,80%)] pb-3 border-b border-white/5">
                      <Check className="w-4 h-4 text-[hsl(190,100%,55%)] shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/"
                  className={`w-full py-3.5 rounded-md text-xs font-bold tracking-[0.2em] uppercase text-center transition-all ${
                    t.highlight
                      ? "bg-[hsl(190,100%,50%)] text-[hsl(215,40%,8%)] shadow-[0_0_20px_hsl(190,100%,50%,0.4)] hover:shadow-[0_0_30px_hsl(190,100%,50%,0.6)]"
                      : "border border-[hsl(190,100%,50%)]/30 text-[hsl(210,15%,90%)] hover:border-[hsl(190,100%,50%)]/70"
                  }`}
                >
                  {t.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="kontakt" className="px-6 py-28 border-t border-[hsl(190,100%,50%)]/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(190,100%,50%,0.15),transparent_60%)]" />
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-block px-4 py-2 rounded-md border border-[hsl(190,100%,50%)]/30 text-[hsl(190,100%,55%)] text-[10px] font-bold tracking-[0.25em] uppercase mb-10">
            Kontakta oss
          </div>
          <h2 className="text-5xl md:text-6xl font-black mb-10 leading-tight">
            <span className="block text-white">Redo att ta</span>
            <span className="block text-[hsl(190,100%,55%)] [text-shadow:0_0_30px_hsl(190,100%,55%,0.5)]">nästa steg?</span>
          </h2>
          <Link
            to="/"
            className="inline-block px-10 py-5 bg-[hsl(190,100%,50%)] text-[hsl(215,40%,8%)] font-black text-sm tracking-[0.25em] uppercase rounded-md shadow-[0_0_40px_hsl(190,100%,50%,0.6)] hover:shadow-[0_0_60px_hsl(190,100%,50%,0.8)] transition-shadow"
          >
            Skapa konto
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-6 py-10 border-t border-[hsl(190,100%,50%)]/10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Floorball Tactix" className="h-8 w-auto" />
          </div>
          <p className="text-xs text-[hsl(210,15%,55%)]">© 2026 Floorball Tactix. Alla rättigheter förbehållna.</p>
          <div className="flex items-center gap-6 text-xs text-[hsl(210,15%,65%)]">
            <a href="#" className="hover:text-[hsl(190,100%,55%)] transition-colors">Integritetspolicy</a>
            <a href="#" className="hover:text-[hsl(190,100%,55%)] transition-colors">Villkor</a>
            <a href="#" className="hover:text-[hsl(190,100%,55%)] transition-colors">Kontakt</a>
          </div>
        </div>
      </footer>
    </div>
  );
}