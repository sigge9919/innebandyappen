import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function BillingSuccess() {
  const navigate = useNavigate();
  return (
    <AppLayout>
      <div className="max-w-lg">
        <Card>
          <CardContent className="pt-6 flex flex-col items-center text-center gap-4">
            <CheckCircle2 className="h-12 w-12 text-primary" />
            <div>
              <h1 className="text-xl font-semibold">Tack för din betalning!</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Prenumerationen aktiveras inom några sekunder. Uppdatera sidan om statusen inte syns direkt.
              </p>
            </div>
            <Button onClick={() => navigate('/billing')}>Till prenumeration</Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}