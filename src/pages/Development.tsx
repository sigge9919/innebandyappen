import { AppLayout } from '@/components/layout/AppLayout';
import { mockPlayers } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, TrendingUp, TrendingDown, Minus, ChevronRight, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock development data
const mockIDPs = mockPlayers.slice(0, 3).map(player => ({
  playerId: player.id,
  focusAreas: ['Defensive positioning', 'Passing accuracy'],
  shortTermGoals: ['Improve stick work', 'Better communication'],
  coachNotes: 'Showing good progress in recent sessions',
  lastUpdated: '2026-01-20',
}));

const mockTests = [
  { id: '1', playerId: '1', testType: 'Fitness' as const, testName: 'Sprint Test', date: '2026-01-15', result: '4.2s', previousResult: '4.5s', trend: 'up' as const },
  { id: '2', playerId: '1', testType: 'Skill' as const, testName: 'Shooting Accuracy', date: '2026-01-15', result: '85%', previousResult: '82%', trend: 'up' as const },
  { id: '3', playerId: '2', testType: 'Fitness' as const, testName: 'Endurance Test', date: '2026-01-14', result: '12min', previousResult: '12min', trend: 'same' as const },
  { id: '4', playerId: '3', testType: 'Skill' as const, testName: 'Passing Test', date: '2026-01-14', result: '72%', previousResult: '78%', trend: 'down' as const },
];

const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'same' }) => {
  if (trend === 'up') return <TrendingUp className="h-4 w-4 text-success" />;
  if (trend === 'down') return <TrendingDown className="h-4 w-4 text-destructive" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
};

export default function Development() {
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
              <Button variant="outline" size="sm">View All</Button>
            </div>

            <div className="space-y-4">
              {mockIDPs.map(idp => {
                const player = mockPlayers.find(p => p.id === idp.playerId);
                if (!player) return null;

                return (
                  <div key={idp.playerId} className="stat-card hover:shadow-md transition-all cursor-pointer">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">
                          {player.jerseyNumber}
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{player.name}</h3>
                          <p className="text-xs text-muted-foreground">{player.position}</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>

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
                          {idp.shortTermGoals.map((goal, i) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                              {goal}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground mt-4">
                      Updated: {new Date(idp.lastUpdated).toLocaleDateString()}
                    </p>
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
                <h2 className="text-lg font-semibold text-foreground">Recent Tests</h2>
              </div>
              <Button variant="outline" size="sm">Add Test</Button>
            </div>

            <div className="stat-card">
              <div className="space-y-0">
                {mockTests.map((test, index) => {
                  const player = mockPlayers.find(p => p.id === test.playerId);
                  
                  return (
                    <div
                      key={test.id}
                      className={cn(
                        'flex items-center gap-4 py-4',
                        index !== mockTests.length - 1 && 'border-b border-border'
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
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
