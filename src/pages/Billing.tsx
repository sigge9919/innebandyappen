import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTeam } from '@/contexts/TeamContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Users } from 'lucide-react';
import { getEdgeFunctionErrorMessage } from '@/lib/edgeFunctionError';

const STATUS_LABELS: Record<string, string> = {
  active: 'Aktiv',
  trialing: 'Provperiod',
  past_due: 'Förfallen betalning',
  canceled: 'Avslutad',
  incomplete: 'Ofullständig',
  inactive: 'Ingen prenumeration',
};

const INCLUDED_PLAYERS = 25;

export default function Billing() {
  const { activeTeam, activeRole } = useTeam();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isHeadCoach = activeRole === 'head_coach';

  const [status, setStatus] = useState<string>('inactive');
  const [maxPlayers, setMaxPlayers] = useState<number>(INCLUDED_PLAYERS);
  const [extraPlayers, setExtraPlayers] = useState<string>('0');
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const [savingQty, setSavingQty] = useState(false);

  const load = useCallback(async () => {
    if (!activeTeam) return;
    setLoading(true);
    const { data } = await supabase
      .from('teams')
      .select('subscription_status, max_players, extra_players')
      .eq('id', activeTeam.id)
      .maybeSingle();
    if (data) {
      setStatus(data.subscription_status ?? 'inactive');
      setMaxPlayers(data.max_players ?? INCLUDED_PLAYERS);
      setExtraPlayers(String(data.extra_players ?? 0));
    }
    setLoading(false);
  }, [activeTeam]);

  useEffect(() => {
    load();
  }, [load]);

  const hasSubscription = status !== 'inactive' && status !== 'canceled';

  const openPortal = async () => {
    if (!activeTeam) return;
    setPortalLoading(true);
    const { data, error } = await supabase.functions.invoke('create-portal-session', {
      body: { team_id: activeTeam.id },
    });
    setPortalLoading(false);
    if (error || !data?.url) {
      toast({
        title: 'Kunde inte öppna prenumerationsportalen',
        description: error ? await getEdgeFunctionErrorMessage(error) : 'Försök igen om en stund.',
        variant: 'destructive',
      });
      return;
    }
    window.location.href = data.url as string;
  };

  const saveQuantity = async () => {
    if (!activeTeam) return;
    const qty = parseInt(extraPlayers, 10);
    if (Number.isNaN(qty) || qty < 0) {
      toast({ title: 'Ange ett giltigt antal', variant: 'destructive' });
      return;
    }
    setSavingQty(true);
    const { error } = await supabase.functions.invoke('update-player-quantity', {
      body: { team_id: activeTeam.id, extra_players: qty },
    });
    setSavingQty(false);
    if (error) {
      toast({
        title: 'Kunde inte uppdatera antalet spelare',
        description: await getEdgeFunctionErrorMessage(error),
        variant: 'destructive',
      });
      return;
    }
    toast({ title: 'Antal spelare uppdaterat' });
    load();
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-2xl">
        <div className="section-header">
          <div>
            <h1 className="section-title">Prenumeration</h1>
            <p className="text-sm text-muted-foreground">{activeTeam?.name}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <p className="text-sm text-muted-foreground">Laddar…</p>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Prenumerationsstatus</span>
                  <Badge variant={hasSubscription ? 'default' : 'secondary'}>
                    {STATUS_LABELS[status] ?? status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Max antal spelare</span>
                  <span className="font-semibold">{maxPlayers}</span>
                </div>

                {isHeadCoach && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {hasSubscription ? (
                      <Button onClick={openPortal} disabled={portalLoading}>
                        {portalLoading ? 'Öppnar…' : 'Hantera prenumeration'}
                      </Button>
                    ) : (
                      <Button onClick={() => navigate('/pricing')}>Se priser</Button>
                    )}
                  </div>
                )}
                {!isHeadCoach && (
                  <p className="text-xs text-muted-foreground pt-2">
                    Endast huvudtränaren kan hantera prenumerationen.
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {isHeadCoach && hasSubscription && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Extra spelare
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {INCLUDED_PLAYERS} spelare ingår. Extra spelare kostar 15 kr/spelare/mån. Ange totalt antal
                extra spelare.
              </p>
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Label htmlFor="extra-players">Antal extra spelare</Label>
                  <Input
                    id="extra-players"
                    type="number"
                    min={0}
                    value={extraPlayers}
                    onChange={(e) => setExtraPlayers(e.target.value)}
                  />
                </div>
                <Button onClick={saveQuantity} disabled={savingQty}>
                  {savingQty ? 'Sparar…' : 'Spara'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}