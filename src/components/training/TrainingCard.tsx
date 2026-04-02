import { TrainingSession } from '@/types';
import { format } from 'date-fns';
import { Calendar, Clock, Users, Activity, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TrainingCardProps {
  session: TrainingSession;
  playerNames?: string[];
  avgRPE?: number | null;
  rpeCount?: number;
  onClick?: () => void;
}

function getRPEColor(rating: number) {
  if (rating <= 1) return 'text-green-500';
  if (rating <= 3) return 'text-yellow-500';
  if (rating <= 4) return 'text-orange-500';
  return 'text-red-500';
}

export function TrainingCard({ session, playerNames, avgRPE, rpeCount, onClick }: TrainingCardProps) {
  const isPersonal = session.isPersonal;

  return (
    <div
      onClick={onClick}
      className="stat-card cursor-pointer hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Badge variant={isPersonal ? 'outline' : 'secondary'}>
            {isPersonal ? 'Personligt' : session.theme}
          </Badge>
          {isPersonal && (
            <User className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </div>
        <div className="flex items-center gap-3">
          {avgRPE != null && (
            <div className="flex items-center gap-1">
              <Activity className="h-3.5 w-3.5 text-muted-foreground" />
              <span className={`text-sm font-bold ${getRPEColor(avgRPE)}`}>{avgRPE.toFixed(1)}</span>
              {rpeCount != null && rpeCount > 0 && (
                <span className="text-[10px] text-muted-foreground">({rpeCount})</span>
              )}
            </div>
          )}
          {session.rpeRating != null && isPersonal && (
            <div className="flex items-center gap-1">
              <Activity className="h-3.5 w-3.5 text-muted-foreground" />
              <span className={`text-sm font-bold ${getRPEColor(session.rpeRating)}`}>{session.rpeRating}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            {session.duration} min
          </div>
        </div>
      </div>

      {isPersonal && session.theme && session.theme !== 'Personlig träning' && (
        <p className="text-sm text-foreground mb-2 line-clamp-2">{session.theme}</p>
      )}

      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
        <span className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4" />
          {format(new Date(session.date), 'EEEE, MMMM d')}
        </span>
        {!isPersonal && (
          <span className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            {session.playerIds.length} spelare
          </span>
        )}
      </div>

      {/* Section breakdown - only for team sessions */}
      {!isPersonal && session.sections.length > 0 && (
        <div className="space-y-2">
          {session.sections.map((section, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full" style={{
                backgroundColor: index === 0 ? 'hsl(var(--muted-foreground))' : 
                               index === 1 ? 'hsl(var(--primary))' :
                               index === 2 ? 'hsl(var(--accent))' : 'hsl(var(--muted-foreground))'
              }} />
              <span className="text-sm text-muted-foreground flex-1">{section.type}</span>
              <span className="text-sm font-medium text-foreground">{section.duration} min</span>
            </div>
          ))}
        </div>
      )}

      {session.teams && session.teams.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
            <Users className="h-3 w-3" />
            Lag
          </div>
          <div className="flex gap-2">
            {session.teams.map((team, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {team.name}: {team.playerIds.length}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
