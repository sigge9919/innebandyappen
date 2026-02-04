import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { usePlayers, useIDPs, useTestResults } from '@/hooks/useLocalStorage';
import { useEnhancedGames } from '@/hooks/useEnhancedGames';
import { PlayerFormDialog } from '@/components/forms/PlayerFormDialog';
import { TestResultFormDialog } from '@/components/forms/TestResultFormDialog';
import { PlayerStatsSection } from '@/components/team/PlayerStatsSection';
import { PlayerTestResults } from '@/components/team/PlayerTestResults';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Edit, Target, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TestResult } from '@/types';

export default function PlayerDetail() {
  const { playerId } = useParams<{ playerId: string }>();
  const navigate = useNavigate();
  
  const { players, updatePlayer, deletePlayer, isLoading: playersLoading } = usePlayers();
  const { games } = useEnhancedGames();
  const { idps } = useIDPs();
  const { tests, addTest, updateTest, deleteTest } = useTestResults();
  
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<TestResult | null>(null);
  
  const player = players.find(p => p.id === playerId);
  const playerIDP = idps.find(idp => idp.playerId === playerId);
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
  
  const handleSaveTest = (test: TestResult) => {
    if (selectedTest) {
      updateTest(test.id, test);
    } else {
      addTest(test);
    }
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
          <Button variant="outline" onClick={() => setEditDialogOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Player
          </Button>
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
        
        {/* Development / IDP */}
        {playerIDP && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="h-5 w-5 text-primary" />
                Development Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {playerIDP.focusAreas.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase mb-2">Focus Areas</p>
                  <div className="flex flex-wrap gap-2">
                    {playerIDP.focusAreas.map(area => (
                      <Badge key={area} variant="secondary">{area}</Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {playerIDP.shortTermGoals.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase mb-2">Goals</p>
                  <ul className="space-y-1">
                    {playerIDP.shortTermGoals.map((goal, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {goal}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {playerIDP.coachNotes && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase mb-2">Coach Notes</p>
                  <p className="text-sm text-muted-foreground">{playerIDP.coachNotes}</p>
                </div>
              )}
              
              <p className="text-xs text-muted-foreground pt-2 border-t border-border">
                Last updated: {new Date(playerIDP.lastUpdated).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
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
      </div>
      
      <PlayerFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        player={player}
        onSave={handleSavePlayer}
        onDelete={handleDeletePlayer}
      />
      
      <TestResultFormDialog
        open={testDialogOpen}
        onOpenChange={setTestDialogOpen}
        test={selectedTest}
        players={[player]}
        onSave={handleSaveTest}
        onDelete={deleteTest}
        defaultPlayerId={player.id}
      />
    </AppLayout>
  );
}
