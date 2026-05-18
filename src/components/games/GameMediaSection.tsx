import { Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlayMediaGallery } from '@/components/playbook/PlayMediaGallery';
import { GameMedia } from '@/types/game';
import { toast } from '@/hooks/use-toast';

interface GameMediaSectionProps {
  media: GameMedia[];
  onAdd: (media: GameMedia) => void;
  onRemove: (mediaId: string) => void;
}

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

export function GameMediaSection({ media, onAdd, onRemove }: GameMediaSectionProps) {
  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: 'Filen är för stor',
          description: `${file.name} överstiger 25 MB och kan inte laddas upp.`,
          variant: 'destructive',
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        onAdd({
          id: crypto.randomUUID(),
          type: file.type.startsWith('video/') ? 'video' : 'image',
          url,
          name: file.name,
        });
      };
      reader.readAsDataURL(file);
    });

    event.target.value = '';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ImageIcon className="h-4 w-4" />
          <span>{media.length} fil{media.length === 1 ? '' : 'er'}</span>
        </div>
        <input
          type="file"
          id="game-media-upload"
          className="hidden"
          accept="image/*,video/*"
          multiple
          onChange={handleUpload}
        />
        <label htmlFor="game-media-upload">
          <Button variant="outline" size="sm" asChild>
            <span>
              <Upload className="h-4 w-4 mr-2" />
              Ladda upp foton/videor
            </span>
          </Button>
        </label>
      </div>

      <PlayMediaGallery media={media} onRemove={onRemove} />
    </div>
  );
}