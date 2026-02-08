import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, Film, Image as ImageIcon, Upload } from 'lucide-react';
import { Play, PlayMedia } from '@/types';
import { TacticsLayoutSelector } from './TacticsLayoutSelector';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
interface EditPlayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  play?: Play | null;
  onSave: (play: Play) => void;
}

export function EditPlayDialog({ open, onOpenChange, play, onSave }: EditPlayDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'System' as Play['category'],
    keyPoints: [''],
    tags: '',
    linkedLayoutIds: [] as string[],
    mediaFiles: [] as PlayMedia[],
  });

  useEffect(() => {
    if (play) {
      setFormData({
        name: play.name,
        category: play.category,
        keyPoints: play.keyPoints.length > 0 ? play.keyPoints : [''],
        tags: play.tags.join(', '),
        linkedLayoutIds: play.linkedLayoutIds || [],
        mediaFiles: play.mediaFiles || [],
      });
    } else {
      setFormData({
        name: '',
        category: 'System',
        keyPoints: [''],
        tags: '',
        linkedLayoutIds: [],
        mediaFiles: [],
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
      linkedLayoutIds: formData.linkedLayoutIds,
      mediaFiles: formData.mediaFiles,
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
          <DialogTitle>{play ? 'Edit Play' : 'Add Play'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-6 px-6 pb-6 pr-4">
              {/* Basic Info */}
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Play name"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value as Play['category'] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="System">System</SelectItem>
                        <SelectItem value="Set Play">Set Play</SelectItem>
                        <SelectItem value="Special Teams">Special Teams</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="tags">Tags</Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="PP, 5v4, Defense"
                    />
                  </div>
                </div>

                {/* Key Points */}
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label>Key Points</Label>
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
                          placeholder={`Key point ${index + 1}`}
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
                        id="media-upload-dialog"
                        className="hidden"
                        accept="image/*,video/*"
                        multiple
                        onChange={handleMediaUpload}
                      />
                      <label htmlFor="media-upload-dialog">
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
              {play ? 'Save Changes' : 'Add Play'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
