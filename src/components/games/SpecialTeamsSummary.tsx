import { SpecialTeamsStats, getTotalShots } from '@/types/game';
import { Badge } from '@/components/ui/badge';
import { Zap, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpecialTeamsSummaryProps {
  powerPlay: SpecialTeamsStats;
  boxPlay: SpecialTeamsStats;
}

export function SpecialTeamsSummary({ powerPlay, boxPlay }: SpecialTeamsSummaryProps) {
  const ppEfficiency = powerPlay.opportunities > 0 
    ? ((powerPlay.goalsFor / powerPlay.opportunities) * 100).toFixed(1) 
    : '0.0';
  
  const bpEfficiency = boxPlay.opportunities > 0 
    ? (((boxPlay.opportunities - boxPlay.goalsAgainst) / boxPlay.opportunities) * 100).toFixed(1)
    : '100.0';

  const hasAnySpecialTeams = powerPlay.opportunities > 0 || boxPlay.opportunities > 0;

  if (!hasAnySpecialTeams) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Zap className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>Inga specialteam-situationer registrerade</p>
      </div>
    );
  }

  return (
    <div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Power Play (5v4) */}
        <div className={cn(
          'p-4 rounded-lg border-2',
          powerPlay.goalsFor > 0 ? 'border-success bg-success/5' : 'border-border'
        )}>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-5 w-5 text-success" />
            <h4 className="font-semibold">Powerplay (5v4)</h4>
            <Badge variant="secondary" className="ml-auto">
              {powerPlay.opportunities} PP
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">PP-mål</span>
              <span className="font-semibold text-lg text-success">{powerPlay.goalsFor}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Mål emot i numerärt underläge</span>
              <span className="font-semibold text-destructive">{powerPlay.goalsAgainst}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Shots on Goal</span>
              <span className="font-medium">{powerPlay.shotsOnGoal}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Shots</span>
              <span className="font-medium">
                {powerPlay.shotsOnGoal + powerPlay.shotsOffGoal + powerPlay.shotsBlocked}
              </span>
            </div>
            <div className="pt-2 border-t border-border">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">PP Efficiency</span>
                <span className={cn(
                  'text-xl font-bold',
                  parseFloat(ppEfficiency) >= 20 ? 'text-success' : 'text-foreground'
                )}>
                  {ppEfficiency}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Box Play (4v5) */}
        <div className={cn(
          'p-4 rounded-lg border-2',
          boxPlay.goalsAgainst === 0 && boxPlay.opportunities > 0 ? 'border-success bg-success/5' : 'border-border'
        )}>
          <div className="flex items-center gap-2 mb-3">
            <Shield className="h-5 w-5 text-primary" />
            <h4 className="font-semibold">Box Play (4v5)</h4>
            <Badge variant="secondary" className="ml-auto">
              {boxPlay.opportunities} PK
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Goals Against (PP)</span>
              <span className="font-semibold text-lg text-destructive">{boxPlay.goalsAgainst}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Shorthanded Goals For</span>
              <span className="font-semibold text-success">{boxPlay.goalsFor}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Shots on Goal</span>
              <span className="font-medium">{boxPlay.shotsOnGoal}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Shots</span>
              <span className="font-medium">
                {boxPlay.shotsOnGoal + boxPlay.shotsOffGoal + boxPlay.shotsBlocked}
              </span>
            </div>
            <div className="pt-2 border-t border-border">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">PK Efficiency</span>
                <span className={cn(
                  'text-xl font-bold',
                  parseFloat(bpEfficiency) >= 80 ? 'text-success' : 'text-foreground'
                )}>
                  {bpEfficiency}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
