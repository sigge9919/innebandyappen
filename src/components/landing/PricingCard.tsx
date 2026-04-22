import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface PricingCardProps {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
  badge?: string;
}

export function PricingCard({ name, price, period, description, features, cta, highlighted, badge }: PricingCardProps) {
  return (
    <Card
      className={cn(
        'relative bg-sidebar-accent/40 border-sidebar-border',
        highlighted && 'border-primary glow-cyan'
      )}
    >
      {badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold tracking-wider uppercase">
          {badge}
        </div>
      )}
      <CardContent className="p-6 flex flex-col h-full">
        <h3 className="text-lg font-semibold text-sidebar-foreground">{name}</h3>
        <p className="text-sm text-sidebar-foreground/60 mt-1 mb-5">{description}</p>
        <div className="mb-6">
          <span className="text-4xl font-bold text-sidebar-foreground tracking-tight">{price}</span>
          {period && <span className="text-sm text-sidebar-foreground/60 ml-1">{period}</span>}
        </div>
        <ul className="space-y-3 mb-6 flex-1">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm text-sidebar-foreground/80">
              <Check className="text-primary mt-0.5 shrink-0" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
        <Link to="/login">
          <Button
            className={cn(
              'w-full',
              highlighted
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-sidebar-accent text-sidebar-foreground hover:bg-sidebar-accent/70 border border-sidebar-border'
            )}
          >
            {cta}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}