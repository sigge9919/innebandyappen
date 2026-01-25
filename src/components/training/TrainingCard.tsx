import { TrainingSession } from '@/types';
import { format } from 'date-fns';
import { Calendar, Clock, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TrainingCardProps {
  session: TrainingSession;
  playerNames: string[];
  onClick?: () => void;
}

export function TrainingCard({ session, playerNames, onClick }: TrainingCardProps) {
  return (
    <div
      onClick={onClick}
      className="stat-card cursor-pointer hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-3">
        <Badge variant="secondary">{session.theme}</Badge>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          {session.duration} min
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
        <span className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4" />
          {format(new Date(session.date), 'EEEE, MMMM d')}
        </span>
        <span className="flex items-center gap-1.5">
          <Users className="h-4 w-4" />
          {session.playerIds.length} players
        </span>
      </div>

      {/* Section breakdown */}
      <div className="space-y-2">
        {session.sections.map((section, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full" style={{
              backgroundColor: index === 0 ? 'hsl(var(--muted-foreground))' : 
                             index === 1 ? 'hsl(var(--primary))' :
                             index === 2 ? 'hsl(var(--accent))' : 'hsl(var(--muted-foreground))'
            }} />
            <span className="text-sm text-muted-foreground flex-1">{section.type}</span>
            <span className="text-sm font-medium text-foreground">{section.duration}min</span>
          </div>
        ))}
      </div>
    </div>
  );
}
