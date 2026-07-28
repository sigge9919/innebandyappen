import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function BillingCancel() {
  const navigate = useNavigate();
  return (
    <AppLayout>
      <div className="max-w-lg">
        <Card>
          <CardContent className="pt-6 flex flex-col items-center text-center gap-4">
            <XCircle className="h-12 w-12 text-muted-foreground" />
            <div>
              <h1 className="text-xl font-semibold">Betalningen avbröts</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Ingen betalning har genomförts. Du kan starta om när du vill.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate('/billing')}>Till prenumeration</Button>
              <Button onClick={() => navigate('/pricing')}>Se priser</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}