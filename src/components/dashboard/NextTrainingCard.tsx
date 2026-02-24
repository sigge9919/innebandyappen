import { TrainingSession } from '@/types';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

interface NextTrainingCardProps {
  session: TrainingSession;
  playerCount: number;
}

export function NextTrainingCard({ session, playerCount }: NextTrainingCardProps) {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="metric-label">Next Training</h3>
        <span className="status-badge bg-warning/10 text-warning border-warning/20">Scheduled</span>
      </div>

      <p className="text-base font-semibold text-foreground">{session.theme}</p>
      <p className="text-xs text-muted-foreground mt-1">
        {format(new Date(session.date), 'EEE, MMM d')} &middot; {session.duration} min &middot; {playerCount} players
      </p>

      {/* Section bar */}
      <div className="flex gap-px mt-3">
        {session.sections.map((section, index) => (
          <div
            key={index}
            className="h-1.5 bg-muted"
            style={{
              flex: section.duration,
              backgroundColor: index === 1 ? 'hsl(var(--primary))' :
                             index === 2 ? 'hsl(var(--warning))' : undefined
            }}
            title={`${section.type}: ${section.duration}min`}
          />
        ))}
      </div>

      <Link to="/training" className="block mt-3 text-xs font-medium text-primary hover:underline">
        View training plan
      </Link>
    </div>
  );
}
