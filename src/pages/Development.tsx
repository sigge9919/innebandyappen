import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { usePlayers, useIDPs, useTestResults } from '@/hooks/useLocalStorage';
import { IDPFormDialog } from '@/components/forms/IDPFormDialog';
import { TestResultFormDialog } from '@/components/forms/TestResultFormDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, TrendingUp, TrendingDown, Minus, ChevronRight, ClipboardList, Plus, CalendarDays, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Player, IndividualDevelopmentPlan, TestResult } from '@/types';
import { getIDPStatus, getIDPStatusVariant, isIDPActive } from '@/lib/idpUtils';

type PlayerFilter = 'with-plan' | 'without-plan';

const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'same' }) => {
  if (trend === 'up') return <TrendingUp className="h-4 w-4 text-success" />;
  if (trend === 'down') return <TrendingDown className="h-4 w-4 text-destructive" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
};

const STATUS_LABELS: Record<string, string> = {
  'Active': 'Aktiv',
  'Overdue': 'Försenad',
  'Completed': 'Klar',
  'Upcoming': 'Kommande',
};

export default function Development() {
  const navigate = useNavigate();
  const { players } = usePlayers();
  const { idps, addIDP, updateIDP, deleteIDP } = useIDPs();
  const { tests, addTest, updateTest, deleteTest } = useTestResults();

  const [playerFilter, setPlayerFilter] = useState<PlayerFilter>('with-plan');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [selectedIDP, setSelectedIDP] = useState<IndividualDevelopmentPlan | null>(null);
  const [idpDialogOpen, setIdpDialogOpen] = useState(false);

  const [selectedTest, setSelectedTest] = useState<TestResult | null>(null);
  const [testDialogOpen, setTestDialogOpen] = useState(false);

  const activeIdps = idps.filter(isIDPActive);

  const playersWithActivePlan = players.filter(p => activeIdps.some(idp => idp.playerId === p.id));
  const playersWithoutActivePlan = players.filter(p => !activeIdps.some(idp => idp.playerId === p.id));
  const filteredPlayers = playerFilter === 'with-plan' ? playersWithActivePlan : playersWithoutActivePlan;

  const handlePlayerClick = (player: Player) => {
    navigate(`/team/${player.id}`);
  };

  const handleCreatePlan = (player: Player, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPlayer(player);
    setSelectedIDP(null);
    setIdpDialogOpen(true);
  };

  const handleEditPlan = (player: Player, idp: IndividualDevelopmentPlan, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPlayer(player);
    setSelectedIDP(idp);
    setIdpDialogOpen(true);
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

  const handleMarkComplete = (idp: IndividualDevelopmentPlan, e: React.MouseEvent) => {
    e.stopPropagation();
    updateIDP(idp.id, { ...idp, completed: true });
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

  return (
    <AppLayout>
      <div className="page-container">
        <div className="section-header">
          <div>
            <h1 className="section-title">Utveckling</h1>
            <p className="text-muted-foreground mt-1">Följ spelarnas utveckling</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Individual Development Plans */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Aktiva planer</h2>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant={playerFilter === 'with-plan' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPlayerFilter('with-plan')}
              >
                Med plan ({playersWithActivePlan.length})
              </Button>
              <Button
                variant={playerFilter === 'without-plan' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPlayerFilter('without-plan')}
              >
                Utan plan ({playersWithoutActivePlan.length})
              </Button>
            </div>

            <div className="space-y-4">
              {filteredPlayers.length === 0 && (
                <div className="stat-card text-center py-8">
                  <p className="text-sm text-muted-foreground">
                    {playerFilter === 'with-plan'
                      ? 'Inga spelare har en aktiv utvecklingsplan'
                      : 'Alla spelare har en aktiv utvecklingsplan'}
                  </p>
                </div>
              )}

              {filteredPlayers.map(player => {
                const playerActiveIdps = activeIdps.filter(idp => idp.playerId === player.id);

                return (
                  <div
                    key={player.id}
                    onClick={() => handlePlayerClick(player)}
                    className="stat-card hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">
                          {player.jerseyNumber}
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{player.name}</h3>
                          <p className="text-xs text-muted-foreground">{player.positions?.join(' / ') || 'Forward'}</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>

                    {playerActiveIdps.length > 0 ? (
                      <div className="space-y-3">
                        {playerActiveIdps.map(idp => {
                          const status = getIDPStatus(idp);
                          return (
                            <div key={idp.id} className="border border-border rounded-lg p-3 space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <p className="font-medium text-foreground text-sm truncate">{idp.goal}</p>
                                  <Badge variant={getIDPStatusVariant(status)} className="text-xs shrink-0">
                                    {status === 'Overdue' && <AlertCircle className="h-3 w-3 mr-1" />}
                                    {STATUS_LABELS[status] || status}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => handleMarkComplete(idp, e)}
                                    className="text-xs h-7"
                                  >
                                    Klar
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => handleEditPlan(player, idp, e)}
                                    className="text-xs h-7"
                                  >
                                    Redigera
                                  </Button>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <CalendarDays className="h-3.5 w-3.5" />
                                {new Date(idp.startDate).toLocaleDateString('sv-SE')} — {idp.endDate ? new Date(idp.endDate).toLocaleDateString('sv-SE') : 'Pågående'}
                              </div>
                              {idp.focusAreas.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                  {idp.focusAreas.map(area => (
                                    <Badge key={area} variant="secondary" className="text-xs">{area}</Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={(e) => handleCreatePlan(player, e)}
                        >
                          <Plus className="h-4 w-4 mr-1" /> Lägg till plan
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={(e) => handleCreatePlan(player, e)}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Skapa utvecklingsplan
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Testing Tracker */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Senaste tester</h2>
              </div>
              <Button variant="outline" size="sm" onClick={handleAddTest}>
                <Plus className="h-4 w-4 mr-2" />
                Lägg till test
              </Button>
            </div>

            <div className="stat-card">
              <div className="space-y-0">
                {tests.length > 0 ? tests.map((test, index) => {
                  const player = players.find(p => p.id === test.playerId);
                  
                  return (
                    <div
                      key={test.id}
                      onClick={() => handleTestClick(test)}
                      className={cn(
                        'flex items-center gap-4 py-4 cursor-pointer hover:bg-muted/50 -mx-4 px-4 transition-colors',
                        index !== tests.length - 1 && 'border-b border-border'
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground">{test.testName}</p>
                          <Badge variant="outline" className="text-xs">{test.testType}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {player?.name} • {new Date(test.date).toLocaleDateString('sv-SE')}
                        </p>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        <div>
                          <p className="font-bold text-foreground">{test.result}</p>
                          {test.previousResult && (
                            <p className="text-xs text-muted-foreground">föreg: {test.previousResult}</p>
                          )}
                        </div>
                        <TrendIcon trend={test.trend} />
                      </div>
                    </div>
                  );
                }) : (
                  <div className="text-center py-8">
                    <ClipboardList className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Inga testresultat ännu</p>
                    <Button variant="outline" size="sm" className="mt-3" onClick={handleAddTest}>
                      Lägg till första testet
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <IDPFormDialog
        open={idpDialogOpen}
        onOpenChange={setIdpDialogOpen}
        idp={selectedIDP}
        player={selectedPlayer}
        onSave={handleSaveIDP}
        onDelete={handleDeleteIDP}
      />

      <TestResultFormDialog
        open={testDialogOpen}
        onOpenChange={setTestDialogOpen}
        test={selectedTest}
        players={players}
        allTests={tests}
        onSave={handleSaveTest}
        onDelete={deleteTest}
      />
    </AppLayout>
  );
}
