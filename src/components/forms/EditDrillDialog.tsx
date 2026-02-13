import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X, Film, Image as ImageIcon, Upload } from 'lucide-react';
import { Drill, PlayMedia } from '@/types';
import { TacticsLayoutSelector } from '@/components/playbook/TacticsLayoutSelector';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface EditDrillDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  drill?: Drill | null;
  onSave: (drill: Drill) => void;
}

export function EditDrillDialog({ open, onOpenChange, drill, onSave }: EditDrillDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categories: '',
    videoUrl: '',
    linkedLayoutIds: [] as string[],
    mediaFiles: [] as PlayMedia[],
  });

  useEffect(() => {
    if (drill) {
      setFormData({
        name: drill.name,
        description: drill.description,
        categories: drill.categories.join(', '),
        videoUrl: drill.videoUrl || '',
        linkedLayoutIds: drill.linkedLayoutIds || [],
        mediaFiles: drill.mediaFiles || [],
      });
    } else {
      setFormData({
        name: '',
        description: '',
        categories: '',
        videoUrl: '',
        linkedLayoutIds: [],
        mediaFiles: [],
      });
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
      linkedLayoutIds: formData.linkedLayoutIds,
      mediaFiles: formData.mediaFiles,
    };
    onSave(newDrill);
    onOpenChange(false);
  };

  const handleLayoutSelect = (layoutId: string) => {
    if (formData.linkedLayoutIds.includes(layoutId)) {
      setFormData(prev => ({
        ...prev,
        linkedLayoutIds: prev.linkedLayoutIds.filter(id => id !== layoutId)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        linkedLayoutIds: [...prev.linkedLayoutIds, layoutId]
      }));
    }
  };

  const handleMediaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        const media: PlayMedia = {
          id: crypto.randomUUID(),
          type: file.type.startsWith('video/') ? 'video' : 'image',
          url,
          name: file.name,
        };
        setFormData(prev => ({
          ...prev,
          mediaFiles: [...prev.mediaFiles, media]
        }));
      };
      reader.readAsDataURL(file);
    });
    
    event.target.value = '';
  };

  const removeMedia = (mediaId: string) => {
    setFormData(prev => ({
      ...prev,
      mediaFiles: prev.mediaFiles.filter(m => m.id !== mediaId)
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
          <DialogTitle>{drill ? 'Edit Drill' : 'Add Drill'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-6 px-6 pb-6 pr-4">
              {/* Basic Info */}
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="drill-name">Name</Label>
                  <Input
                    id="drill-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Drill name"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="drill-description">Description</Label>
                  <Textarea
                    id="drill-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the drill..."
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="drill-categories">Categories (comma-separated)</Label>
                    <Input
                      id="drill-categories"
                      value={formData.categories}
                      onChange={(e) => setFormData({ ...formData, categories: e.target.value })}
                      placeholder="Tactics, Skills, Conditioning"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="drill-videoUrl">Video URL (optional)</Label>
                    <Input
                      id="drill-videoUrl"
                      value={formData.videoUrl}
                      onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>

              {/* Content Tabs */}
              <Tabs defaultValue="tactics" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="tactics" className="gap-2">
                    <Film className="h-4 w-4" />
                    Tactics ({formData.linkedLayoutIds.length})
                  </TabsTrigger>
                  <TabsTrigger value="media" className="gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Media ({formData.mediaFiles.length})
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="tactics" className="mt-4">
                  <TacticsLayoutSelector
                    selectedIds={formData.linkedLayoutIds}
                    onSelect={handleLayoutSelect}
                  />
                </TabsContent>
                
                <TabsContent value="media" className="mt-4">
                  <div className="space-y-4">
                    <div>
                      <input
                        type="file"
                        id="drill-media-upload"
                        className="hidden"
                        accept="image/*,video/*"
                        multiple
                        onChange={handleMediaUpload}
                      />
                      <label htmlFor="drill-media-upload">
                        <Button variant="outline" size="sm" asChild>
                          <span>
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Photos/Videos
                          </span>
                        </Button>
                      </label>
                    </div>
                    
                    {formData.mediaFiles.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                        <ImageIcon className="h-10 w-10 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No media uploaded</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {formData.mediaFiles.map(item => (
                          <div key={item.id} className="relative group aspect-video rounded overflow-hidden border">
                            {item.type === 'video' ? (
                              <video src={item.url} className="w-full h-full object-cover" />
                            ) : (
                              <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                            )}
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100"
                              onClick={() => removeMedia(item.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t shrink-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {drill ? 'Save Changes' : 'Add Drill'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
