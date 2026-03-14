import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play } from '@/types';
import { Plus, X } from 'lucide-react';
import { usePlayCategories } from '@/hooks/useLocalStorage';

interface PlayFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  play?: Play | null;
  onSave: (play: Play) => void;
  onDelete?: (id: string) => void;
}

export function PlayFormDialog({ open, onOpenChange, play, onSave, onDelete }: PlayFormDialogProps) {
  const { categories } = usePlayCategories();
  const [formData, setFormData] = useState({
    name: '',
    category: categories[0] || 'System',
    keyPoints: [''],
    tags: '',
    diagramUrl: '',
    videoUrl: '',
  });

  useEffect(() => {
    if (play) {
      setFormData({
        name: play.name,
        category: play.category,
        keyPoints: play.keyPoints.length > 0 ? play.keyPoints : [''],
        tags: play.tags.join(', '),
        diagramUrl: play.diagramUrl || '',
        videoUrl: play.videoUrl || '',
      });
    } else {
      setFormData({
        name: '',
        category: categories[0] || 'System',
        keyPoints: [''],
        tags: '',
        diagramUrl: '',
        videoUrl: '',
      });
    }
  }, [play, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPlay: Play = {
      id: play?.id || crypto.randomUUID(),
      name: formData.name,
      category: formData.category,
      keyPoints: formData.keyPoints.filter(kp => kp.trim() !== ''),
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t !== ''),
      diagramUrl: formData.diagramUrl || undefined,
      videoUrl: formData.videoUrl || undefined,
    };
    onSave(newPlay);
    onOpenChange(false);
  };

  const addKeyPoint = () => {
    setFormData(prev => ({ ...prev, keyPoints: [...prev.keyPoints, ''] }));
  };

  const removeKeyPoint = (index: number) => {
    setFormData(prev => ({
      ...prev,
      keyPoints: prev.keyPoints.filter((_, i) => i !== index)
    }));
  };

  const updateKeyPoint = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      keyPoints: prev.keyPoints.map((kp, i) => i === index ? value : kp)
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{play ? 'Redigera spel' : 'Lägg till spel'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Namn</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Spelnamn"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Kategori</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label>Nyckelpunkter</Label>
                <Button type="button" variant="ghost" size="sm" onClick={addKeyPoint}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {formData.keyPoints.map((point, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={point}
                      onChange={(e) => updateKeyPoint(index, e.target.value)}
                      placeholder={`Nyckelpunkt ${index + 1}`}
                    />
                    {formData.keyPoints.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeKeyPoint(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="tags">Taggar (kommaseparerade)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="PP, 5v4, Försvar"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="diagramUrl">Diagram-URL (valfritt)</Label>
              <Input
                id="diagramUrl"
                value={formData.diagramUrl}
                onChange={(e) => setFormData({ ...formData, diagramUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="videoUrl">Video-URL (valfritt)</Label>
              <Input
                id="videoUrl"
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            {play && onDelete && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  onDelete(play.id);
                  onOpenChange(false);
                }}
              >
                Ta bort
              </Button>
            )}
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Avbryt
            </Button>
            <Button type="submit">
              {play ? 'Spara ändringar' : 'Lägg till spel'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
