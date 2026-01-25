import { Target, MessageSquare } from 'lucide-react';

interface WeeklyFocusCardProps {
  focus: string;
  notes: string;
}

export function WeeklyFocusCard({ focus, notes }: WeeklyFocusCardProps) {
  return (
    <div className="stat-card animate-slide-up bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Weekly Focus</h3>
          </div>
          <p className="text-xl font-bold text-foreground">{focus}</p>
        </div>

        <div className="border-t border-border/50 pt-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <h4 className="text-sm font-medium text-muted-foreground">Coach Notes</h4>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{notes}</p>
        </div>
      </div>
    </div>
  );
}
