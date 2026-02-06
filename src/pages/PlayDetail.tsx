import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { usePlays } from '@/hooks/useLocalStorage';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { 
  ArrowLeft, 
  Save, 
  Trash2, 
  Plus, 
  X, 
  Upload, 
  Film,
  Image as ImageIcon,
  CheckCircle,
  Edit2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Play, PlayMedia } from '@/types';
import { TacticsLayoutSelector } from '@/components/playbook/TacticsLayoutSelector';
import { PlayMediaGallery } from '@/components/playbook/PlayMediaGallery';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export default function PlayDetail() {
  const { playId } = useParams<{ playId: string }>();
  const navigate = useNavigate();
  const { plays, updatePlay, deletePlay, addPlay } = usePlays();
  
  const isNew = playId === 'new';
  const existingPlay = plays.find(p => p.id === playId);
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'System' as Play['category'],
    keyPoints: [''],
    tags: '',
    linkedLayoutIds: [] as string[],
    mediaFiles: [] as PlayMedia[],
  });
  
  const [hasChanges, setHasChanges] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(isNew);

  useEffect(() => {
    if (existingPlay) {
      setFormData({
        name: existingPlay.name,
        category: existingPlay.category,
        keyPoints: existingPlay.keyPoints.length > 0 ? existingPlay.keyPoints : [''],
        tags: existingPlay.tags.join(', '),
        linkedLayoutIds: existingPlay.linkedLayoutIds || [],
        mediaFiles: existingPlay.mediaFiles || [],
      });
    }
  }, [existingPlay]);

  const handleSave = () => {
    const play: Play = {
      id: isNew ? crypto.randomUUID() : playId!,
      name: formData.name,
      category: formData.category,
      keyPoints: formData.keyPoints.filter(kp => kp.trim() !== ''),
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t !== ''),
      linkedLayoutIds: formData.linkedLayoutIds,
      mediaFiles: formData.mediaFiles,
    };
    
    if (isNew) {
      addPlay(play);
      navigate(`/playbook/${play.id}`);
    } else {
      updatePlay(playId!, play);
    }
    setHasChanges(false);
  };

  const handleDelete = () => {
    if (playId && !isNew) {
      deletePlay(playId);
      navigate('/playbook');
    }
  };

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    setHasChanges(true);
  };

  const addKeyPoint = () => {
    updateFormData({ keyPoints: [...formData.keyPoints, ''] });
  };

  const removeKeyPoint = (index: number) => {
    updateFormData({ keyPoints: formData.keyPoints.filter((_, i) => i !== index) });
  };

  const updateKeyPoint = (index: number, value: string) => {
    updateFormData({ 
      keyPoints: formData.keyPoints.map((kp, i) => i === index ? value : kp) 
    });
  };

  const handleLayoutSelect = (layoutId: string) => {
    if (formData.linkedLayoutIds.includes(layoutId)) {
      updateFormData({ 
        linkedLayoutIds: formData.linkedLayoutIds.filter(id => id !== layoutId) 
      });
    } else {
      updateFormData({ 
        linkedLayoutIds: [...formData.linkedLayoutIds, layoutId] 
      });
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
        updateFormData({ mediaFiles: [...formData.mediaFiles, media] });
      };
      reader.readAsDataURL(file);
    });
    
    event.target.value = '';
  };

  const removeMedia = (mediaId: string) => {
    updateFormData({ 
      mediaFiles: formData.mediaFiles.filter(m => m.id !== mediaId) 
    });
  };

  const parsedTags = formData.tags.split(',').map(t => t.trim()).filter(t => t);
  const parsedKeyPoints = formData.keyPoints.filter(kp => kp.trim() !== '');

  if (!isNew && !existingPlay) {
    return (
      <AppLayout>
        <div className="page-container">
          <p className="text-muted-foreground">Play not found</p>
          <Button variant="outline" onClick={() => navigate('/playbook')}>
            Back to Playbook
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <Dialog open={true} onOpenChange={() => navigate('/playbook')}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        {/* Compact Header */}
        <div className="sticky top-0 z-10 bg-background border-b p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/playbook')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Input
              value={formData.name}
              onChange={(e) => updateFormData({ name: e.target.value })}
              placeholder="Play name"
              className="text-xl font-bold border-none bg-transparent p-0 h-auto focus-visible:ring-0 flex-1"
            />
            <div className="flex gap-2">
              {!isNew && (
                <Button variant="ghost" size="icon" onClick={handleDelete} className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              <Button size="sm" onClick={handleSave} disabled={!formData.name.trim()}>
                <Save className="h-4 w-4 mr-1" />
                {hasChanges ? 'Save' : 'Saved'}
                {!hasChanges && <CheckCircle className="h-3 w-3 ml-1" />}
              </Button>
            </div>
          </div>
          
          {/* Compact Meta Section */}
          <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <Select
                value={formData.category}
                onValueChange={(value) => updateFormData({ category: value as Play['category'] })}
              >
                <SelectTrigger className="w-auto h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="System">System</SelectItem>
                  <SelectItem value="Set Play">Set Play</SelectItem>
                  <SelectItem value="Special Teams">Special Teams</SelectItem>
                </SelectContent>
              </Select>
              
              {parsedTags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
              ))}
              
              {parsedKeyPoints.length > 0 && !detailsOpen && (
                <span className="text-xs text-muted-foreground">
                  • {parsedKeyPoints.length} key point{parsedKeyPoints.length > 1 ? 's' : ''}
                </span>
              )}
              
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs ml-auto">
                  <Edit2 className="h-3 w-3 mr-1" />
                  {detailsOpen ? 'Collapse' : 'Edit Details'}
                  {detailsOpen ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
                </Button>
              </CollapsibleTrigger>
            </div>
            
            <CollapsibleContent className="mt-3 space-y-3">
              {/* Tags Input */}
              <div>
                <Input
                  value={formData.tags}
                  onChange={(e) => updateFormData({ tags: e.target.value })}
                  placeholder="Tags (comma-separated): PP, 5v4, Defense"
                  className="text-sm h-8"
                />
              </div>
              
              {/* Key Points */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-medium">Key Points</span>
                  <Button type="button" variant="ghost" size="sm" className="h-6 px-2" onClick={addKeyPoint}>
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                </div>
                {formData.keyPoints.map((point, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <span className="text-primary font-bold text-sm">•</span>
                    <Input
                      value={point}
                      onChange={(e) => updateKeyPoint(index, e.target.value)}
                      placeholder={`Key point ${index + 1}`}
                      className="flex-1 h-8 text-sm"
                    />
                    {formData.keyPoints.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => removeKeyPoint(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Main Content - Tactics & Media */}
        <div className="p-4 space-y-6">
          {/* Tactics Board Layouts */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Film className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm">Tactics Board Layouts</h3>
            </div>
            <TacticsLayoutSelector
              selectedIds={formData.linkedLayoutIds}
              onSelect={handleLayoutSelect}
            />
          </div>

          {/* Media Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-sm">Photos & Videos</h3>
              </div>
              <div>
                <input
                  type="file"
                  id="media-upload"
                  className="hidden"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleMediaUpload}
                />
                <label htmlFor="media-upload">
                  <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
                    <span>
                      <Upload className="h-3 w-3 mr-1" />
                      Upload
                    </span>
                  </Button>
                </label>
              </div>
            </div>
            <PlayMediaGallery
              media={formData.mediaFiles}
              onRemove={removeMedia}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
