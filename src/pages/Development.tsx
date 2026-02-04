import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { usePlayers, useIDPs, useTestResults } from '@/hooks/useLocalStorage';
import { IDPFormDialog } from '@/components/forms/IDPFormDialog';
import { TestResultFormDialog } from '@/components/forms/TestResultFormDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, TrendingUp, TrendingDown, Minus, ChevronRight, ClipboardList, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Player, IndividualDevelopmentPlan, TestResult } from '@/types';

const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'same' }) => {
  if (trend === 'up') return <TrendingUp className="h-4 w-4 text-success" />;
  if (trend === 'down') return <TrendingDown className="h-4 w-4 text-destructive" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
};

export default function Development() {
  const navigate = useNavigate();
  const { players } = usePlayers();
  const { idps, addIDP, updateIDP } = useIDPs();
  const { tests, addTest, updateTest, deleteTest } = useTestResults();

  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [selectedIDP, setSelectedIDP] = useState<IndividualDevelopmentPlan | null>(null);
  const [idpDialogOpen, setIdpDialogOpen] = useState(false);

  const [selectedTest, setSelectedTest] = useState<TestResult | null>(null);
  const [testDialogOpen, setTestDialogOpen] = useState(false);

  const handlePlayerClick = (player: Player) => {
    navigate(`/team/${player.id}`);
  };

  const handleSaveIDP = (idp: IndividualDevelopmentPlan) => {
    const existingIDP = idps.find(i => i.playerId === idp.playerId);
    if (existingIDP) {
      updateIDP(idp.playerId, idp);
    } else {
      addIDP(idp);
    }
  };

  const handleAddTest = () => {
    setSelectedTest(null);
    setTestDialogOpen(true);
  };

  const handleTestClick = (test: TestResult) => {
    setSelectedTest(test);
    setTestDialogOpen(true);
  };

  const handleSaveTest = (test: TestResult) => {
    if (selectedTest) {
      updateTest(test.id, test);
    } else {
      addTest(test);
    }
  };

  // Get players with their IDPs
  const playersWithIDPs = players.slice(0, 6).map(player => ({
    player,
    idp: idps.find(idp => idp.playerId === player.id)
  }));

  return (
    <AppLayout>
      <div className="page-container">
        {/* Header */}
        <div className="section-header">
          <div>
            <h1 className="section-title">Development</h1>
            <p className="text-muted-foreground mt-1">Track player growth</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Individual Development Plans */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Development Plans</h2>
              </div>
            </div>

            <div className="space-y-4">
              {playersWithIDPs.map(({ player, idp }) => (
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

                  {idp ? (
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase mb-1.5">Focus Areas</p>
                        <div className="flex flex-wrap gap-1.5">
                          {idp.focusAreas.map(area => (
                            <Badge key={area} variant="secondary" className="text-xs">
                              {area}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase mb-1.5">Goals</p>
                        <ul className="space-y-1">
                          {idp.shortTermGoals.slice(0, 2).map((goal, i) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                              {goal}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <p className="text-xs text-muted-foreground mt-4">
                        Updated: {new Date(idp.lastUpdated).toLocaleDateString()}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Click to create development plan</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Testing Tracker */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Recent Tests</h2>
              </div>
              <Button variant="outline" size="sm" onClick={handleAddTest}>
                <Plus className="h-4 w-4 mr-2" />
                Add Test
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
                          <Badge variant="outline" className="text-xs">
                            {test.testType}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {player?.name} • {new Date(test.date).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="text-right flex items-center gap-3">
                        <div>
                          <p className="font-bold text-foreground">{test.result}</p>
                          {test.previousResult && (
                            <p className="text-xs text-muted-foreground">
                              prev: {test.previousResult}
                            </p>
                          )}
                        </div>
                        <TrendIcon trend={test.trend} />
                      </div>
                    </div>
                  );
                }) : (
                  <div className="text-center py-8">
                    <ClipboardList className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No test results yet</p>
                    <Button variant="outline" size="sm" className="mt-3" onClick={handleAddTest}>
                      Add first test
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
      />

      <TestResultFormDialog
        open={testDialogOpen}
        onOpenChange={setTestDialogOpen}
        test={selectedTest}
        players={players}
        onSave={handleSaveTest}
        onDelete={deleteTest}
      />
    </AppLayout>
  );
}
