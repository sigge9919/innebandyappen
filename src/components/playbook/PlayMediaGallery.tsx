import { X, Play, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlayMedia } from '@/types';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface PlayMediaGalleryProps {
  media: PlayMedia[];
  onRemove?: (mediaId: string) => void;
  readOnly?: boolean;
}

export function PlayMediaGallery({ media, onRemove, readOnly = false }: PlayMediaGalleryProps) {
  if (media.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-muted rounded-lg">
        <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
        <p>Ingen media uppladdad</p>
        <p className="text-sm mt-1">Ladda upp foton eller videor för att dokumentera detta spel</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1">
      {media.map(item => (
        <div key={item.id} className="relative group rounded-lg overflow-hidden border bg-muted">
          <AspectRatio ratio={16 / 9}>
            {item.type === 'video' ? (
              <video
                src={item.url}
                className="w-full h-full object-cover"
                controls
              />
            ) : (
              <img
                src={item.url}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            )}
          </AspectRatio>
          
          {!readOnly && onRemove && (
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onRemove(item.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
            <div className="flex items-center gap-2 text-white">
              {item.type === 'video' ? (
                <Play className="h-4 w-4" />
              ) : (
                <ImageIcon className="h-4 w-4" />
              )}
              <span className="text-sm truncate">{item.name}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
