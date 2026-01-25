import { Play } from '@/types';
import { Badge } from '@/components/ui/badge';
import { FileText, Video } from 'lucide-react';

interface PlayCardProps {
  play: Play;
  onClick?: () => void;
}

export function PlayCard({ play, onClick }: PlayCardProps) {
  return (
    <div
      onClick={onClick}
      className="stat-card cursor-pointer hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-3">
        <Badge variant="secondary">{play.category}</Badge>
        <div className="flex items-center gap-2">
          {play.diagramUrl && <FileText className="h-4 w-4 text-muted-foreground" />}
          {play.videoUrl && <Video className="h-4 w-4 text-muted-foreground" />}
        </div>
      </div>

      <h3 className="text-lg font-semibold text-foreground mb-3">{play.name}</h3>

      <div className="space-y-2 mb-4">
        <p className="text-xs font-medium text-muted-foreground uppercase">Key Points</p>
        <ul className="space-y-1">
          {play.keyPoints.slice(0, 3).map((point, index) => (
            <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              {point}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {play.tags.map(tag => (
          <span
            key={tag}
            className="px-2 py-0.5 rounded-full bg-muted text-xs font-medium text-muted-foreground"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
