import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Drill } from '@/types';

interface DrillFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  drill?: Drill | null;
  onSave: (drill: Drill) => void;
  onDelete?: (id: string) => void;
}

export function DrillFormDialog({ open, onOpenChange, drill, onSave, onDelete }: DrillFormDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categories: '',
    videoUrl: '',
  });

  useEffect(() => {
    if (drill) {
      setFormData({
        name: drill.name,
        description: drill.description,
        categories: drill.categories.join(', '),
        videoUrl: drill.videoUrl || '',
      });
    } else {
      setFormData({ name: '', description: '', categories: '', videoUrl: '' });
    }
  }, [drill, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newDrill: Drill = {
      id: drill?.id || crypto.randomUUID(),
      name: formData.name,
      description: formData.description,
      categories: formData.categories.split(',').map(c => c.trim()).filter(c => c !== ''),
      videoUrl: formData.videoUrl || undefined,
    };
    onSave(newDrill);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{drill ? 'Redigera övning' : 'Lägg till övning'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Namn</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Övningens namn"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Beskrivning</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Beskriv övningen..."
                rows={3}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="categories">Kategorier (kommaseparerade)</Label>
              <Input
                id="categories"
                value={formData.categories}
                onChange={(e) => setFormData({ ...formData, categories: e.target.value })}
                placeholder="Taktik, Teknik, Kondition"
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
            {drill && onDelete && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => { onDelete(drill.id); onOpenChange(false); }}
              >
                Ta bort
              </Button>
            )}
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Avbryt
            </Button>
            <Button type="submit">
              {drill ? 'Spara ändringar' : 'Lägg till övning'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
