import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTeam } from '@/contexts/TeamContext';
import { usePlayers, useRPERatings, usePersonalTrainings, useTrainingSessions } from '@/hooks/useLocalStorage';
import { useEnhancedGames } from '@/hooks/useEnhancedGames';
import { AppLayout } from '@/components/layout/AppLayout';
import { PlayerStatsSection } from '@/components/team/PlayerStatsSection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Activity, Dumbbell, TrendingUp, Calendar, Clock, Plus, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { PersonalTraining } from '@/types';
import { useToast } from '@/hooks/use-toast';

export default function PlayerPortal() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { activeTeam } = useTeam();
  const { players, isLoading: playersLoading } = usePlayers();
  const { games } = useEnhancedGames();
  const { sessions } = useTrainingSessions();

  const myPlayer = players.find(p => p.userId === user?.id);
  const { ratings, addRating } = useRPERatings(myPlayer?.id);
  const { trainings, addTraining, deleteTraining } = usePersonalTrainings(myPlayer?.id);

  // RPE prompt state
  const [pendingSessions, setPendingSessions] = useState<{ type: 'game' | 'training'; id: string; label: string }[]>([]);
  const [currentRPE, setCurrentRPE] = useState(5);
  const [rpeDialogOpen, setRpeDialogOpen] = useState(false);
  const [currentPending, setCurrentPending] = useState<{ type: 'game' | 'training'; id: string; label: string } | null>(null);

  // Personal training form
  const [ptDialogOpen, setPtDialogOpen] = useState(false);
  const [ptForm, setPtForm] = useState({ date: format(new Date(), 'yyyy-MM-dd'), description: '', duration: 60, rpeRating: 5 });

  // Calculate pending RPE ratings on load
  useEffect(() => {
    if (!myPlayer || !ratings) return;

    const ratedSessionIds = new Set(ratings.map(r => `${r.sessionType}-${r.sessionId}`));
    const pending: { type: 'game' | 'training'; id: string; label: string }[] = [];

    // Check games this player attended (Finished games)
    games.forEach(game => {
      if (game.status === 'Finished' && game.squadPlayerIds?.includes(myPlayer.id)) {
        const key = `game-${game.id}`;
        if (!ratedSessionIds.has(key)) {
          pending.push({ type: 'game', id: game.id, label: `Game vs ${game.opponent} (${game.date})` });
        }
      }
    });

    // Check training sessions this player attended
    sessions.forEach(session => {
      if (session.playerIds.includes(myPlayer.id)) {
        const key = `training-${session.id}`;
        if (!ratedSessionIds.has(key)) {
          pending.push({ type: 'training', id: session.id, label: `Training: ${session.theme} (${session.date})` });
        }
      }
    });

    setPendingSessions(pending);

    // Auto-open first pending
    if (pending.length > 0 && !rpeDialogOpen) {
      setCurrentPending(pending[0]);
      setCurrentRPE(5);
      setRpeDialogOpen(true);
    }
  }, [myPlayer, ratings, games, sessions]);

  const handleSubmitRPE = async () => {
    if (!currentPending || !myPlayer) return;
    try {
      await addRating({
        playerId: myPlayer.id,
        teamId: activeTeam!.id,
        sessionType: currentPending.type,
        sessionId: currentPending.id,
        rating: currentRPE,
      });
      
      const remaining = pendingSessions.filter(p => !(p.type === currentPending.type && p.id === currentPending.id));
      setPendingSessions(remaining);
      
      if (remaining.length > 0) {
        setCurrentPending(remaining[0]);
        setCurrentRPE(5);
      } else {
        setRpeDialogOpen(false);
        setCurrentPending(null);
      }
    } catch {
      toast({ title: 'Kunde inte spara RPE-betyg', variant: 'destructive' });
    }
  };

  const handleSkipRPE = () => {
    const remaining = pendingSessions.filter(p => !(p.type === currentPending?.type && p.id === currentPending?.id));
    setPendingSessions(remaining);
    if (remaining.length > 0) {
      setCurrentPending(remaining[0]);
      setCurrentRPE(5);
    } else {
      setRpeDialogOpen(false);
      setCurrentPending(null);
    }
  };

  const handleAddPersonalTraining = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myPlayer) return;
    try {
      await addTraining({
        playerId: myPlayer.id,
        teamId: activeTeam!.id,
        date: ptForm.date,
        description: ptForm.description,
        duration: ptForm.duration,
        rpeRating: ptForm.rpeRating,
      });
      toast({ title: 'Personlig träning sparad!' });
      setPtDialogOpen(false);
      setPtForm({ date: format(new Date(), 'yyyy-MM-dd'), description: '', duration: 60, rpeRating: 5 });
    } catch {
      toast({ title: 'Kunde inte spara träning', variant: 'destructive' });
    }
  };

  const getRPEColor = (rating: number) => {
    if (rating <= 3) return 'text-green-500';
    if (rating <= 6) return 'text-yellow-500';
    if (rating <= 8) return 'text-orange-500';
    return 'text-red-500';
  };

  if (playersLoading) {
    return (
      <AppLayout>
        <div className="page-container">
          <Skeleton className="h-10 w-48 mb-6" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AppLayout>
    );
  }

  if (!myPlayer) {
    return (
      <AppLayout>
        <div className="page-container text-center py-12">
          <p className="text-muted-foreground">Din spelarprofil har inte kopplats ännu. Kontakta din tränare.</p>
        </div>
      </AppLayout>
    );
  }

  // Recent RPE data
  const recentRatings = [...ratings].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 10);
  const avgRPE = ratings.length > 0 ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1) : '—';

  return (
    <AppLayout>
      <div className="page-container max-w-3xl mx-auto">
        {/* Player Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-xl bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
            {myPlayer.jerseyNumber}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{myPlayer.name}</h1>
            <p className="text-muted-foreground">
              {myPlayer.positions?.join(' / ')} • {myPlayer.stickSide} stick
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 grid-cols-3 mb-6">
          <Card>
            <CardContent className="pt-4 text-center">
              <Activity className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="text-2xl font-bold">{avgRPE}</p>
               <p className="text-xs text-muted-foreground">Snitt RPE</p>
             </CardContent>
           </Card>
           <Card>
             <CardContent className="pt-4 text-center">
               <TrendingUp className="h-5 w-5 text-primary mx-auto mb-1" />
               <p className="text-2xl font-bold">{ratings.length}</p>
               <p className="text-xs text-muted-foreground">Bedömda pass</p>
             </CardContent>
           </Card>
           <Card>
             <CardContent className="pt-4 text-center">
               <Dumbbell className="h-5 w-5 text-primary mx-auto mb-1" />
               <p className="text-2xl font-bold">{trainings.length}</p>
               <p className="text-xs text-muted-foreground">Egna pass</p>
            </CardContent>
          </Card>
        </div>

        {/* Season Stats */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Min säsongsstatistik</h2>
          <PlayerStatsSection player={myPlayer} games={games} />
        </div>

        {/* RPE History */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            RPE-historik
          </h2>
          {recentRatings.length > 0 ? (
            <div className="space-y-2">
              {recentRatings.map(r => {
                 const sessionLabel = r.sessionType === 'game'
                   ? (() => { const g = games.find(g => g.id === r.sessionId); return g ? `Match vs ${g.opponent}` : 'Match'; })()
                   : (() => { const s = sessions.find(s => s.id === r.sessionId); return s ? `Träning: ${s.theme}` : 'Träning'; })();
                return (
                  <div key={r.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{sessionLabel}</p>
                      <p className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-bold ${getRPEColor(r.rating)}`}>{r.rating}</span>
                      <span className="text-xs text-muted-foreground">/10</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Inga RPE-betyg ännu</p>
          )}
        </div>

        {/* Personal Trainings */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-primary" />
              Personliga träningar
           </h2>
             <Button size="sm" className="gap-1" onClick={() => setPtDialogOpen(true)}>
               <Plus className="h-4 w-4" />
               Lägg till pass
            </Button>
          </div>

          {trainings.length > 0 ? (
            <div className="space-y-2">
              {trainings.map(t => (
                <div key={t.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{t.description || 'Personlig träning'}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{t.date}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{t.duration} min</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <span className={`text-lg font-bold ${getRPEColor(t.rpeRating)}`}>{t.rpeRating}</span>
                      <p className="text-[10px] text-muted-foreground">RPE</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteTraining(t.id)}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Inga personliga träningar loggade ännu
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* RPE Prompt Dialog */}
      <Dialog open={rpeDialogOpen} onOpenChange={setRpeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Hur trött känner du dig?</DialogTitle>
          </DialogHeader>
          {currentPending && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{currentPending.label}</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">1 = Pigg</span>
                  <span className={`text-3xl font-bold ${getRPEColor(currentRPE)}`}>{currentRPE}</span>
                  <span className="text-sm text-muted-foreground">10 = Utmattad</span>
                </div>
                <Slider
                  value={[currentRPE]}
                  onValueChange={([v]) => setCurrentRPE(v)}
                  min={1}
                  max={10}
                  step={1}
                />
              </div>
              {pendingSessions.length > 1 && (
                <p className="text-xs text-muted-foreground">{pendingSessions.length - 1} till att bedöma</p>
              )}
            </div>
          )}
          <DialogFooter className="gap-2">
             <Button variant="ghost" onClick={handleSkipRPE}>Hoppa över</Button>
             <Button onClick={handleSubmitRPE}>Skicka</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Personal Training Dialog */}
      <Dialog open={ptDialogOpen} onOpenChange={setPtDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Logga personlig träning</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddPersonalTraining} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="pt-date">Datum</Label>
              <Input id="pt-date" type="date" value={ptForm.date} onChange={e => setPtForm(p => ({ ...p, date: e.target.value }))} required />
            </div>
            <div className="grid gap-2">
               <Label htmlFor="pt-desc">Beskrivning</Label>
               <Textarea id="pt-desc" value={ptForm.description} onChange={e => setPtForm(p => ({ ...p, description: e.target.value }))} placeholder="Vad tränade du på?" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pt-dur">Längd (minuter)</Label>
              <Input id="pt-dur" type="number" min="5" max="300" value={ptForm.duration} onChange={e => setPtForm(p => ({ ...p, duration: parseInt(e.target.value) || 60 }))} />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label>Hur trött känner du dig? (RPE)</Label>
                <span className={`text-xl font-bold ${getRPEColor(ptForm.rpeRating)}`}>{ptForm.rpeRating}</span>
              </div>
              <Slider
                value={[ptForm.rpeRating]}
                onValueChange={([v]) => setPtForm(p => ({ ...p, rpeRating: v }))}
                min={1}
                max={10}
                step={1}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                 <span>1 = Pigg</span>
                 <span>10 = Utmattad</span>
              </div>
            </div>
            <DialogFooter>
               <Button type="button" variant="outline" onClick={() => setPtDialogOpen(false)}>Avbryt</Button>
               <Button type="submit">Spara</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
