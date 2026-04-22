import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

const links = [
  { href: '#funktioner', label: 'Funktioner' },
  { href: '#sa-funkar-det', label: 'Så funkar det' },
  { href: '#prissattning', label: 'Prissättning' },
];

export function LandingNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-sidebar-border bg-sidebar-background/80 backdrop-blur supports-[backdrop-filter]:bg-sidebar-background/60">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 lg:px-6 h-16">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="Floorball Tactix" className="h-9 w-auto" />
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-sidebar-foreground/80 hover:text-sidebar-foreground transition-colors">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          <Link to="/login">
            <Button variant="ghost" className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground">
              Logga in
            </Button>
          </Link>
          <Link to="/login">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan">
              Kom igång
            </Button>
          </Link>
        </div>

        <div className="lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-sidebar-foreground">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-sidebar-background border-sidebar-border">
              <div className="flex flex-col gap-6 mt-8">
                {links.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="text-base text-sidebar-foreground/80 hover:text-sidebar-foreground"
                  >
                    {l.label}
                  </a>
                ))}
                <div className="flex flex-col gap-2 pt-4 border-t border-sidebar-border">
                  <Link to="/login" onClick={() => setOpen(false)}>
                    <Button variant="outline" className="w-full">Logga in</Button>
                  </Link>
                  <Link to="/login" onClick={() => setOpen(false)}>
                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">Kom igång</Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}