import { Drill } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Video, Star } from 'lucide-react';

interface DrillCardProps {
  drill: Drill;
  onClick?: () => void;
  onToggleFavorite?: (drillId: string, isFavorite: boolean) => void;
}

export function DrillCard({ drill, onClick, onToggleFavorite }: DrillCardProps) {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite?.(drill.id, !drill.isFavorite);
  };

  return (
    <div
      onClick={onClick}
      className="stat-card cursor-pointer hover:shadow-md transition-all duration-200 overflow-hidden relative"
    >
      {/* Favorite button */}
      <button
        onClick={handleFavoriteClick}
        className="absolute top-3 right-3 z-10 p-1 rounded-full hover:bg-muted/80 transition-colors"
        aria-label={drill.isFavorite ? 'Ta bort favorit' : 'Lägg till som favorit'}
      >
        <Star
          className={`h-5 w-5 transition-colors ${
            drill.isFavorite
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-muted-foreground/40 hover:text-muted-foreground'
          }`}
        />
      </button>

      {drill.thumbnailUrl && (
        <div className="-mx-4 -mt-4 mb-3">
          <img
            src={drill.thumbnailUrl}
            alt={drill.name}
            className="w-full h-32 object-cover"
            loading="lazy"
          />
        </div>
      )}

      <div className="flex items-center justify-between mb-3 pr-6">
        <div className="flex flex-wrap gap-1.5">
          {drill.categories.slice(0, 2).map(cat => (
            <Badge key={cat} variant="secondary">{cat}</Badge>
          ))}
        </div>
        {(drill.videoUrl || drill.directVideoUrl) && <Video className="h-4 w-4 text-muted-foreground" />}
      </div>

      <h3 className="text-lg font-semibold text-foreground mb-3 pr-6">{drill.name}</h3>

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
