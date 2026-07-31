import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, CreditCard } from 'lucide-react';
import { openWebsite } from '@/lib/platform';

interface OpenWebsiteNoticeProps {
  path?: string;
}

export function OpenWebsiteNotice({ path = '' }: OpenWebsiteNoticeProps) {
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="section-header">
        <div>
          <h1 className="section-title">Prenumeration</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" />
            Hanteras på webbplatsen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Betalning och prenumerationshantering sker via vår webbplats.
          </p>
          <Button onClick={() => openWebsite(path)} className="gap-2">
            <ExternalLink className="h-4 w-4" />
            Öppna floorballtactix.com
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default OpenWebsiteNotice;