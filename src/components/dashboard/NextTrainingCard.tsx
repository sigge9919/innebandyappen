import { Calendar, Clock, Users, ArrowRight } from 'lucide-react';
import { TrainingSession } from '@/types';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface NextTrainingCardProps {
  session: TrainingSession;
  playerCount: number;
}

export function NextTrainingCard({ session, playerCount }: NextTrainingCardProps) {
  return (
    <div className="stat-card animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Next Training</h3>
        <span className="status-badge bg-accent/10 text-accent">Scheduled</span>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-xl font-bold text-foreground">{session.theme}</p>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-muted-foreground text-sm">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {format(new Date(session.date), 'EEE, MMM d')}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {session.duration} min
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              {playerCount} players
            </span>
          </div>
        </div>

        {/* Training sections preview */}
        <div className="flex gap-1">
          {session.sections.map((section, index) => (
            <div
              key={index}
              className="flex-1 h-2 rounded-full bg-primary/20 first:rounded-l-full last:rounded-r-full"
              style={{
                flex: section.duration,
                backgroundColor: index === 0 ? 'hsl(var(--muted))' : 
                               index === 1 ? 'hsl(var(--primary))' :
                               index === 2 ? 'hsl(var(--accent))' : 'hsl(var(--muted))'
              }}
              title={`${section.type}: ${section.duration}min`}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Warm-up</span>
          <span>Main</span>
          <span>Game</span>
          <span>Cool</span>
        </div>

        <Link to="/training">
          <Button variant="outline" size="sm" className="w-full group">
            View Training Plan
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
