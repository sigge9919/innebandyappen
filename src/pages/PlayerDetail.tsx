import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { usePlayers, useIDPs, useTestResults, useRPERatings, usePersonalTrainings, useTrainingSessions } from '@/hooks/useLocalStorage';
import { useEnhancedGames } from '@/hooks/useEnhancedGames';
import { useTeam } from '@/contexts/TeamContext';
import { PlayerFormDialog } from '@/components/forms/PlayerFormDialog';
import { IDPFormDialog } from '@/components/forms/IDPFormDialog';
import { TestResultFormDialog } from '@/components/forms/TestResultFormDialog';
import { PlayerStatsSection } from '@/components/team/PlayerStatsSection';
import { PlayerTestResults } from '@/components/team/PlayerTestResults';
import { PlayerTestTrends } from '@/components/team/PlayerTestTrends';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Edit, Target, AlertTriangle, Plus, CalendarDays, AlertCircle, CheckCircle2, Mail, Activity, Dumbbell, Calendar, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TestResult, IndividualDevelopmentPlan } from '@/types';
import { getIDPStatus, getIDPStatusVariant } from '@/lib/idpUtils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PlayerRPETrends } from '@/components/team/PlayerRPETrends';

export default function PlayerDetail() {
  const { playerId } = useParams<{ playerId: string }>();
  const navigate = useNavigate();
  
  const { players, updatePlayer, deletePlayer, isLoading: playersLoading } = usePlayers();
  const { games } = useEnhancedGames();
  const { idps, addIDP, updateIDP, deleteIDP } = useIDPs();
  const { tests, addTest, updateTest, deleteTest } = useTestResults();
  const { activeTeam, inviteCoach } = useTeam();
  const { toast } = useToast();
  
  const player = players.find(p => p.id === playerId);
  const { ratings } = useRPERatings(playerId);
  const { trainings: personalTrainings } = usePersonalTrainings(playerId);
  
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<TestResult | null>(null);
  const [idpDialogOpen, setIdpDialogOpen] = useState(false);
  const [selectedIDP, setSelectedIDP] = useState<IndividualDevelopmentPlan | null>(null);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  
  const playerIDPs = idps.filter(idp => idp.playerId === playerId);
  const playerTests = tests.filter(t => t.playerId === playerId);
  
  if (playersLoading) {
    return (
      <AppLayout>
        <div className="page-container">
          <Skeleton className="h-10 w-32 mb-6" />
          <Skeleton className="h-32 w-full mb-6" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AppLayout>
    );
  }
  
  if (!player) {
    return (
      <AppLayout>
        <div className="page-container">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="text-center py-12">
            <p className="text-muted-foreground">Player not found</p>
          </div>
        </div>
      </AppLayout>
    );
  }
  
  const handleSavePlayer = (updatedPlayer: typeof player) => {
    updatePlayer(player.id, updatedPlayer);
  };
  
  const handleDeletePlayer = (id: string) => {
    deletePlayer(id);
    navigate('/team');
  };
  
  const handleAddTest = () => {
    setSelectedTest(null);
    setTestDialogOpen(true);
  };
  
  const handleTestClick = (test: TestResult) => {
    setSelectedTest(test);
    setTestDialogOpen(true);
  };
  
  const handleSaveTest = (tests: TestResult[]) => {
    if (selectedTest && tests.length === 1) {
      updateTest(tests[0].id, tests[0]);
    } else {
      tests.forEach(addTest);
    }
  };

  const handleSaveIDP = (idp: IndividualDevelopmentPlan) => {
    const existing = idps.find(i => i.id === idp.id);
    if (existing) {
      updateIDP(idp.id, idp);
    } else {
      addIDP(idp);
    }
  };

  const handleDeleteIDP = (id: string) => {
    deleteIDP(id);
  };

  const handleAddPlan = () => {
    setSelectedIDP(null);
    setIdpDialogOpen(true);
  };

  const handleEditPlan = (idp: IndividualDevelopmentPlan) => {
    setSelectedIDP(idp);
    setIdpDialogOpen(true);
  };

  const handleToggleComplete = (idp: IndividualDevelopmentPlan) => {
    updateIDP(idp.id, { ...idp, completed: !idp.completed });
  };

  // Sort: active/overdue first, completed last
  const sortedIDPs = [...playerIDPs].sort((a, b) => {
    const aCompleted = a.completed ? 1 : 0;
    const bCompleted = b.completed ? 1 : 0;
    return aCompleted - bCompleted;
  });

  const handleInvitePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTeam || !player) return;
    setInviteLoading(true);
    try {
      // Save invite email on the player record
      await supabase.from('players').update({ invite_email: inviteEmail.toLowerCase() }).eq('id', player.id);
      // Create a team_member entry with player role
      const { error } = await inviteCoach(inviteEmail, 'player');
      if (error) throw error;
      toast({ title: 'Invite sent', description: `${inviteEmail} can now sign up and access their player portal.` });
      setInviteDialogOpen(false);
      setInviteEmail('');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setInviteLoading(false);
    }
  };

  const getRPEColor = (rating: number) => {
    if (rating <= 3) return 'text-green-500';
    if (rating <= 6) return 'text-yellow-500';
    if (rating <= 8) return 'text-orange-500';
    return 'text-red-500';
  };
  
  return (
    <AppLayout>
      <div className="page-container">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex gap-2">
            {!player.userId && (
              <Button variant="outline" onClick={() => setInviteDialogOpen(true)}>
                <Mail className="h-4 w-4 mr-2" />
                {player.inviteEmail ? 'Invited' : 'Invite Player'}
              </Button>
            )}
            {player.userId && (
              <Badge variant="secondary" className="flex items-center gap-1 px-3">
                <CheckCircle2 className="h-3 w-3" />
                Has Login
              </Badge>
            )}
            <Button variant="outline" onClick={() => setEditDialogOpen(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Player
            </Button>
          </div>
        </div>
        
        {/* Player Header Card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
                {player.jerseyNumber}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-foreground">{player.name}</h1>
                  <Badge 
                    variant={player.status === 'Active' ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {player.status === 'Injured' && <AlertTriangle className="h-3 w-3 mr-1" />}
                    {player.status}
                  </Badge>
                  {player.focusFlag && (
                    <Badge variant="secondary" className="text-xs">
                      <Target className="h-3 w-3 mr-1" />
                      Focus
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground">
                  {player.positions?.join(' / ') || (player as any).position || 'Forward'} • {player.stickSide} stick
                </p>
              </div>
            </div>
            {player.notes && (
              <p className="text-sm text-muted-foreground mt-4 pt-4 border-t border-border">
                {player.notes}
              </p>
            )}
          </CardContent>
        </Card>
        
        {/* Season Statistics */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Season Statistics</h2>
          <PlayerStatsSection player={player} games={games} />
        </div>
        
        {/* Development Plans */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Development Plans
            </h2>
            <Button variant="outline" size="sm" onClick={handleAddPlan}>
              <Plus className="h-4 w-4 mr-1" /> Add Plan
            </Button>
          </div>

          {sortedIDPs.length > 0 ? (
            <div className="space-y-4">
              {sortedIDPs.map(idp => {
                const status = getIDPStatus(idp);
                return (
                  <Card
                    key={idp.id}
                    className={cn(
                      "cursor-pointer hover:shadow-md transition-shadow",
                      status === 'Completed' && "opacity-60"
                    )}
                    onClick={() => handleEditPlan(idp)}
                  >
                    <CardContent className="pt-6 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <p className={cn("font-semibold text-foreground", status === 'Completed' && "line-through")}>{idp.goal}</p>
                          <Badge variant={getIDPStatusVariant(status)} className="text-xs shrink-0">
                            {status === 'Overdue' && <AlertCircle className="h-3 w-3 mr-1" />}
                            {status === 'Completed' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                            {status}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-7 shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleComplete(idp);
                          }}
                        >
                          {status === 'Completed' ? 'Reactivate' : 'Complete'}
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {new Date(idp.startDate).toLocaleDateString()} — {idp.endDate ? new Date(idp.endDate).toLocaleDateString() : 'Ongoing'}
                      </div>
                      {idp.focusAreas.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {idp.focusAreas.map(area => (
                            <Badge key={area} variant="secondary" className="text-xs">{area}</Badge>
                          ))}
                        </div>
                      )}
                      {idp.shortTermGoals.length > 0 && (
                        <ul className="space-y-1">
                          {idp.shortTermGoals.map((goal, i) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                              {goal}
                            </li>
                          ))}
                        </ul>
                      )}
                      {idp.coachNotes && (
                        <p className="text-sm text-muted-foreground border-t border-border pt-2">{idp.coachNotes}</p>
                      )}
                      <p className="text-xs text-muted-foreground">Updated: {new Date(idp.lastUpdated).toLocaleDateString()}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No development plans yet
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Test Trends */}
        {playerTests.length >= 2 && (
          <div className="mb-6">
            <PlayerTestTrends tests={playerTests} />
          </div>
        )}

        {/* Test Results */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Test Results</h2>
            <Button variant="outline" size="sm" onClick={handleAddTest}>
              Add Test
            </Button>
          </div>
          <PlayerTestResults 
            tests={playerTests} 
            onTestClick={handleTestClick}
          />
        </div>

        {/* RPE Trend Chart */}
        {ratings.length >= 2 && (
          <div className="mb-6">
            <PlayerRPETrends
              ratings={ratings}
              sessions={sessions.map(s => ({ id: s.id, theme: s.theme, date: s.date }))}
              games={games.map(g => ({ id: g.id, opponent: g.opponent, date: g.date }))}
            />
          </div>
        )}

        {/* RPE History */}
        {ratings.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              RPE Ratings
            </h2>
            <div className="space-y-2">
              {[...ratings].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 10).map(r => (
                <div key={r.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <p className="text-sm font-medium capitalize">{r.sessionType}</p>
                    <p className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-lg font-bold ${getRPEColor(r.rating)}`}>{r.rating}/10</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Personal Trainings */}
        {personalTrainings.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-primary" />
              Personal Trainings
            </h2>
            <div className="space-y-2">
              {personalTrainings.map(t => (
                <div key={t.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{t.description || 'Personal Training'}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{t.date}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{t.duration} min</span>
                    </div>
                  </div>
                  <span className={`text-lg font-bold ${getRPEColor(t.rpeRating)}`}>{t.rpeRating}/10</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <PlayerFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        player={player}
        onSave={handleSavePlayer}
        onDelete={handleDeletePlayer}
      />

      <IDPFormDialog
        open={idpDialogOpen}
        onOpenChange={setIdpDialogOpen}
        idp={selectedIDP}
        player={player}
        onSave={handleSaveIDP}
        onDelete={handleDeleteIDP}
      />
      
      <TestResultFormDialog
        open={testDialogOpen}
        onOpenChange={setTestDialogOpen}
        test={selectedTest}
        players={[player]}
        allTests={tests}
        onSave={handleSaveTest}
        onDelete={deleteTest}
        defaultPlayerId={player.id}
      />

      {/* Invite Player Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite {player.name} to the app</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleInvitePlayer} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="invite-email">Player's email address</Label>
              <Input
                id="invite-email"
                type="email"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                placeholder="player@email.com"
                required
              />
              <p className="text-xs text-muted-foreground">
                The player can sign up with this email to access their personal portal with stats, RPE tracking, and personal training log.
              </p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setInviteDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={inviteLoading}>
                {inviteLoading ? 'Sending...' : 'Send Invite'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
