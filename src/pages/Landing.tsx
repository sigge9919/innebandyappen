import { Link } from 'react-router-dom';
import { ArrowRight, Layout, Play, Share2, BookOpen, Users, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LandingNav } from '@/components/landing/LandingNav';
import { HeroBoard } from '@/components/landing/HeroBoard';
import { FeatureCard } from '@/components/landing/FeatureCard';
import { PricingCard } from '@/components/landing/PricingCard';

const features = [
  { icon: Layout, title: 'Taktikbräda', description: 'Rita upp formationer och spelmönster på en interaktiv innebandyplan.' },
  { icon: Play, title: 'Animerade spelrörelser', description: 'Bygg animerade sekvenser så att spelarna ser exakt hur ett spel ska genomföras.' },
  { icon: Share2, title: 'Dela med laget', description: 'Skicka taktiker direkt till spelare och assisterande tränare.' },
  { icon: BookOpen, title: 'Taktikbibliotek', description: 'Spara och organisera alla lagets spelmönster i ett strukturerat bibliotek.' },
  { icon: Users, title: 'Samarbete', description: 'Flera tränare kan arbeta tillsammans i samma lag med rollbaserad åtkomst.' },
  { icon: BarChart3, title: 'Matchanalys', description: 'Logga matcher live och få statistik på spelare, kedjor och specialteam.' },
];

const steps = [
  { n: '1', title: 'Skapa ditt lag', text: 'Lägg upp spelare, kedjor och säsong på några minuter.' },
  { n: '2', title: 'Bygg din taktik', text: 'Använd taktikbrädan för att rita formationer och spelrörelser.' },
  { n: '3', title: 'Vinn fler matcher', text: 'Logga matcher live, analysera statistik och utveckla laget.' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-sidebar-background text-sidebar-foreground">
      <LandingNav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-cyan opacity-60" />
        <div className="absolute inset-x-0 top-0 h-[500px] bg-gradient-to-b from-primary/10 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 lg:px-6 pt-16 pb-20 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full border border-primary/40 bg-primary/10 text-primary text-xs font-semibold tracking-widest uppercase">
            Digital taktikplattform för innebandy
          </span>
          <h1 className="mt-6 text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            Träna smartare
            <span className="block text-primary text-glow-cyan">VINN MER</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-base md:text-lg text-sidebar-foreground/70">
            Allt-i-ett-plattformen för innebandytränare. Bygg taktiker, planera träningar, logga matcher och utveckla ditt lag.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/login">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan w-full sm:w-auto">
                Prova gratis <ArrowRight />
              </Button>
            </Link>
            <a href="#funktioner">
              <Button size="lg" variant="outline" className="border-sidebar-border bg-transparent text-sidebar-foreground hover:bg-sidebar-accent w-full sm:w-auto">
                Se demo
              </Button>
            </a>
          </div>

          <div className="mt-16">
            <HeroBoard />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="funktioner" className="relative py-20 border-t border-sidebar-border">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="text-center mb-12">
            <span className="text-primary text-xs font-semibold tracking-widest uppercase">Plattformen</span>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight">Allt du behöver som tränare</h2>
            <p className="mt-3 text-sidebar-foreground/70 max-w-2xl mx-auto">
              Verktyg byggda för innebandyns verklighet — från taktikplanering till live matchanalys.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="sa-funkar-det" className="relative py-20 border-t border-sidebar-border bg-sidebar-accent/20">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-primary text-xs font-semibold tracking-widest uppercase">Så funkar det</span>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight">Kom igång på minuter</h2>
            <div className="mt-8 space-y-6">
              {steps.map((s) => (
                <div key={s.n} className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold glow-cyan">
                    {s.n}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-sidebar-foreground">{s.title}</h3>
                    <p className="mt-1 text-sm text-sidebar-foreground/70">{s.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <HeroBoard />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="prissattning" className="relative py-20 border-t border-sidebar-border">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="text-center mb-12">
            <span className="text-primary text-xs font-semibold tracking-widest uppercase">Prissättning</span>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight">Välj det som passar ditt lag</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <PricingCard
              name="Gratis"
              price="0 kr"
              description="Perfekt för att komma igång"
              features={['1 lag', 'Upp till 15 spelare', 'Grundläggande taktikbräda', 'Matchlogg']}
              cta="Kom igång"
            />
            <PricingCard
              name="Pro"
              price="149 kr"
              period="/mån"
              description="För seriösa tränare"
              features={['1 lag', 'Obegränsat antal spelare', 'Animerade taktiker', 'Fullständig statistik', 'Träningsplanering', 'Spelarutveckling (IDP)']}
              cta="Starta Pro"
              highlighted
              badge="Populärast"
            />
            <PricingCard
              name="Klubb"
              price="499 kr"
              period="/mån"
              description="För hela klubben"
              features={['Obegränsat antal lag', 'Allt i Pro', 'Klubbadministration', 'Delat taktikbibliotek', 'Prioriterad support']}
              cta="Kontakta oss"
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-24 border-t border-sidebar-border">
        <div className="absolute inset-0 bg-grid-cyan opacity-40" />
        <div className="relative max-w-3xl mx-auto px-4 lg:px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Redo att ta <span className="text-primary text-glow-cyan">nästa steg?</span>
          </h2>
          <p className="mt-4 text-sidebar-foreground/70">
            Skapa ditt konto idag och börja bygga vinnande taktiker.
          </p>
          <div className="mt-8">
            <Link to="/login">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan">
                Skapa konto gratis <ArrowRight />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-sidebar-border py-10">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Floorball Tactix" className="h-8 w-auto" />
          </div>
          <p className="text-xs text-sidebar-foreground/50">
            © {new Date().getFullYear()} Floorball Tactix. Alla rättigheter reserverade.
          </p>
          <div className="flex items-center gap-6 text-xs text-sidebar-foreground/60">
            <a href="#" className="hover:text-sidebar-foreground">Integritetspolicy</a>
            <a href="#" className="hover:text-sidebar-foreground">Villkor</a>
            <a href="#" className="hover:text-sidebar-foreground">Kontakt</a>
          </div>
        </div>
      </footer>
    </div>
  );
}