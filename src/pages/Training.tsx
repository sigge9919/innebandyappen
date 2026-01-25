import { AppLayout } from '@/components/layout/AppLayout';
import { TrainingCard } from '@/components/training/TrainingCard';
import { useTrainingSessions, usePlayers, useDrills } from '@/hooks/useLocalStorage';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, Dumbbell } from 'lucide-react';

export default function Training() {
  const { sessions } = useTrainingSessions();
  const { players } = usePlayers();
  const { drills } = useDrills();

  const getPlayerNames = (playerIds: string[]) => {
    return playerIds.map(id => {
      const player = players.find(p => p.id === id);
      return player?.name ?? '';
    });
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
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Session
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
                <TrainingCard
                  key={session.id}
                  session={session}
                  playerNames={getPlayerNames(session.playerIds)}
                />
              ))}
            </div>
          </div>

          {/* Drill Library */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Drill Library</h2>
              </div>
              <Button variant="ghost" size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3">
              {drills.map(drill => (
                <div
                  key={drill.id}
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
    </AppLayout>
  );
}
