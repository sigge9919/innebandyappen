import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTeam } from '@/contexts/TeamContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Check, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';

const PLANS = {
  month: { label: 'Månad', price: '149 kr', suffix: '/mån', priceId: 'price_1TReftA08PKlI3sL2YFBm2Sr' },
  year: { label: 'År', price: '999 kr', suffix: '/år', priceId: 'price_1TReftA08PKlI3sLzrWwtVtP' },
} as const;

type Interval = keyof typeof PLANS;

const FEATURES = [
  '25 spelare ingår (fler kan läggas till för 15 kr/spelare/mån)',
  'Matcher, live-rapportering och statistik',
  'Träningsplanering och övningsbank',
  'Taktiktavla och spelbok',
  'Spelarportal med RPE-uppföljning',
];

export default function Pricing() {
  const { activeTeam } = useTeam();
  const { toast } = useToast();
  const [interval, setInterval] = useState<Interval>('month');
  const [loading, setLoading] = useState(false);

  const plan = PLANS[interval];

  const handleCheckout = async () => {
    if (!activeTeam) return;
    setLoading(true);
    const { data, error } = await supabase.functions.invoke('create-checkout', {
      body: { team_id: activeTeam.id, price_id: plan.priceId },
    });
    setLoading(false);
    if (error || !data?.url) {
      toast({
        title: 'Kunde inte starta betalning',
        description: error?.message ?? 'Försök igen om en stund.',
        variant: 'destructive',
      });
      return;
    }
    window.location.href = data.url as string;
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-2xl">
        <div className="section-header">
          <div>
            <h1 className="section-title">Prenumeration</h1>
            <p className="text-sm text-muted-foreground">Lagprenumeration för {activeTeam?.name ?? 'ditt lag'}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              Lagprenumeration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="inline-flex p-1 bg-muted rounded-md">
              {(Object.keys(PLANS) as Interval[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setInterval(key)}
                  className={cn(
                    'px-4 py-1.5 text-sm rounded-sm transition-colors',
                    interval === key
                      ? 'bg-primary text-primary-foreground font-medium'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {PLANS[key].label}
                </button>
              ))}
            </div>

            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-primary">{plan.price}</span>
              <span className="text-muted-foreground mb-1">{plan.suffix}</span>
              {interval === 'year' && <Badge className="mb-2">Bästa pris</Badge>}
            </div>

            <ul className="space-y-2">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <Button onClick={handleCheckout} disabled={loading || !activeTeam} className="w-full">
              {loading ? 'Öppnar kassan…' : 'Köp'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}