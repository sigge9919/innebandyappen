import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { usePlays } from '@/hooks/useLocalStorage';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, 
  Save, 
  Trash2, 
  Plus, 
  X, 
  Upload, 
  Film,
  Image as ImageIcon,
  Video,
  CheckCircle
} from 'lucide-react';
import { Play, PlayMedia } from '@/types';
import { TacticsLayoutSelector } from '@/components/playbook/TacticsLayoutSelector';
import { PlayMediaGallery } from '@/components/playbook/PlayMediaGallery';

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
    <AppLayout>
      <div className="page-container">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/playbook')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <Input
              value={formData.name}
              onChange={(e) => updateFormData({ name: e.target.value })}
              placeholder="Play name"
              className="text-2xl font-bold border-none bg-transparent p-0 h-auto focus-visible:ring-0"
            />
          </div>
          <div className="flex gap-2">
            {!isNew && (
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
            <Button onClick={handleSave} disabled={!formData.name.trim()}>
              <Save className="h-4 w-4 mr-2" />
              {hasChanges ? 'Save Changes' : 'Saved'}
              {!hasChanges && <CheckCircle className="h-4 w-4 ml-2" />}
            </Button>
          </div>
        </div>

        {/* Category & Tags Section */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-start">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => updateFormData({ category: value as Play['category'] })}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="System">System</SelectItem>
                    <SelectItem value="Set Play">Set Play</SelectItem>
                    <SelectItem value="Special Teams">Special Teams</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 min-w-[200px] space-y-2">
                <Label>Tags (comma-separated)</Label>
                <Input
                  value={formData.tags}
                  onChange={(e) => updateFormData({ tags: e.target.value })}
                  placeholder="PP, 5v4, Defense, Breakout"
                />
              </div>
            </div>
            
            {formData.tags && (
              <div className="flex flex-wrap gap-2 mt-4">
                {formData.tags.split(',').map(t => t.trim()).filter(t => t).map(tag => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Key Points Section */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Key Points</CardTitle>
              <Button variant="ghost" size="sm" onClick={addKeyPoint}>
                <Plus className="h-4 w-4 mr-1" />
                Add Point
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {formData.keyPoints.map((point, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <span className="text-primary font-bold mt-2.5">•</span>
                  <Textarea
                    value={point}
                    onChange={(e) => updateKeyPoint(index, e.target.value)}
                    placeholder={`Key point ${index + 1}`}
                    className="min-h-[60px] flex-1"
                  />
                  {formData.keyPoints.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeKeyPoint(index)}
                      className="mt-1"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tactics Board Layouts Section */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Film className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Tactics Board Layouts</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <TacticsLayoutSelector
              selectedIds={formData.linkedLayoutIds}
              onSelect={handleLayoutSelect}
            />
          </CardContent>
        </Card>

        {/* Media Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Photos & Videos</CardTitle>
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
                  <Button variant="outline" size="sm" asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </span>
                  </Button>
                </label>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <PlayMediaGallery
              media={formData.mediaFiles}
              onRemove={removeMedia}
            />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
