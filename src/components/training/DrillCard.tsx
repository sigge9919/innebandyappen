import { Drill } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Video } from 'lucide-react';

interface DrillCardProps {
  drill: Drill;
  onClick?: () => void;
}

export function DrillCard({ drill, onClick }: DrillCardProps) {
  return (
    <div
      onClick={onClick}
      className="stat-card cursor-pointer hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex flex-wrap gap-1.5">
          {drill.categories.slice(0, 2).map(cat => (
            <Badge key={cat} variant="secondary">{cat}</Badge>
          ))}
        </div>
        {drill.videoUrl && <Video className="h-4 w-4 text-muted-foreground" />}
      </div>

      <h3 className="text-lg font-semibold text-foreground mb-3">{drill.name}</h3>

      <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
        {drill.description}
      </p>

      {drill.categories.length > 2 && (
        <div className="flex flex-wrap gap-1.5">
          {drill.categories.slice(2).map(cat => (
            <span
              key={cat}
              className="px-2 py-0.5 rounded-full bg-muted text-xs font-medium text-muted-foreground"
            >
              {cat}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
