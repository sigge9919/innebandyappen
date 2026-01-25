import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { TrainingCard } from '@/components/training/TrainingCard';
import { TrainingFormDialog } from '@/components/forms/TrainingFormDialog';
import { DrillFormDialog } from '@/components/forms/DrillFormDialog';
import { useTrainingSessions, usePlayers, useDrills } from '@/hooks/useLocalStorage';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, Dumbbell } from 'lucide-react';
import { TrainingSession, Drill } from '@/types';

export default function Training() {
  const { sessions, addSession, updateSession, deleteSession } = useTrainingSessions();
  const { players } = usePlayers();
  const { drills, addDrill, updateDrill, deleteDrill } = useDrills();
  
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<TrainingSession | null>(null);
  
  const [drillDialogOpen, setDrillDialogOpen] = useState(false);
  const [selectedDrill, setSelectedDrill] = useState<Drill | null>(null);

  const getPlayerNames = (playerIds: string[]) => {
    return playerIds.map(id => {
      const player = players.find(p => p.id === id);
      return player?.name ?? '';
    });
  };

  const handleSessionClick = (session: TrainingSession) => {
    setSelectedSession(session);
    setSessionDialogOpen(true);
  };

  const handleAddSession = () => {
    setSelectedSession(null);
    setSessionDialogOpen(true);
  };

  const handleSaveSession = (session: TrainingSession) => {
    if (selectedSession) {
      updateSession(session.id, session);
    } else {
      addSession(session);
    }
  };

  const handleDrillClick = (drill: Drill) => {
    setSelectedDrill(drill);
    setDrillDialogOpen(true);
  };

  const handleAddDrill = () => {
    setSelectedDrill(null);
    setDrillDialogOpen(true);
  };

  const handleSaveDrill = (drill: Drill) => {
    if (selectedDrill) {
      updateDrill(drill.id, drill);
    } else {
      addDrill(drill);
    }
  };

  return (
    <AppLayout>
      <div className="page-container">
        {/* Header */}
        <div className="section-header">
          <div>
            <h1 className="section-title">Training</h1>
            <p className="text-muted-foreground mt-1">
              {sessions.length} sessions planned
            </p>
          </div>
          <Button className="gap-2" onClick={handleAddSession}>
            <Plus className="h-4 w-4" />
            Create Session
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Sessions */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Upcoming Sessions</h2>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              {sessions.map(session => (
                <div
                  key={session.id}
                  onClick={() => handleSessionClick(session)}
                  className="cursor-pointer"
                >
                  <TrainingCard
                    session={session}
                    playerNames={getPlayerNames(session.playerIds)}
                  />
                </div>
              ))}
            </div>

            {sessions.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">No sessions planned</p>
                <Button variant="outline" className="mt-4" onClick={handleAddSession}>
                  Create your first session
                </Button>
              </div>
            )}
          </div>

          {/* Drill Library */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Drill Library</h2>
              </div>
              <Button variant="ghost" size="sm" onClick={handleAddDrill}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3">
              {drills.map(drill => (
                <div
                  key={drill.id}
                  onClick={() => handleDrillClick(drill)}
                  className="stat-card p-4 cursor-pointer hover:shadow-md transition-all"
                >
                  <h3 className="font-medium text-foreground mb-1">{drill.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {drill.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {drill.categories.map(cat => (
                      <Badge key={cat} variant="secondary" className="text-xs">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <TrainingFormDialog
        open={sessionDialogOpen}
        onOpenChange={setSessionDialogOpen}
        session={selectedSession}
        players={players}
        drills={drills}
        onSave={handleSaveSession}
        onDelete={deleteSession}
      />

      <DrillFormDialog
        open={drillDialogOpen}
        onOpenChange={setDrillDialogOpen}
        drill={selectedDrill}
        onSave={handleSaveDrill}
        onDelete={deleteDrill}
      />
    </AppLayout>
  );
}
