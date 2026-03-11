import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useDrills } from '@/hooks/useLocalStorage';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ArrowLeft, 
  Edit2, 
  Trash2,
  Film,
  Image as ImageIcon,
  Layout,
  Video,
  Loader2
} from 'lucide-react';
import { Drill } from '@/types';
import { EditDrillDialog } from '@/components/forms/EditDrillDialog';
import { TacticsBoardPreview } from '@/components/playbook/TacticsBoardPreview';
import { PlayMediaGallery } from '@/components/playbook/PlayMediaGallery';
import { supabase } from '@/integrations/supabase/client';

export default function DrillDetail() {
  const { drillId } = useParams<{ drillId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const backPath = (location.state as any)?.from || '/training';
  const { drills, updateDrill, deleteDrill, addDrill } = useDrills();
  
  const isNew = drillId === 'new';
  const existingDrill = drills.find(d => d.id === drillId);
  
  const [editDialogOpen, setEditDialogOpen] = useState(isNew);
  const [fetchingMedia, setFetchingMedia] = useState(false);
  const [localDrill, setLocalDrill] = useState<Drill | null>(null);

  useEffect(() => {
    if (isNew) {
      setEditDialogOpen(true);
    }
  }, [isNew]);

  // Sync localDrill with existingDrill
  useEffect(() => {
    if (existingDrill) {
      setLocalDrill(existingDrill);
    }
  }, [existingDrill]);

  // On-demand media scraping for Övningsbanken drills
  useEffect(() => {
    const drill = localDrill;
    if (!drill || isNew || fetchingMedia) return;
    if (drill.mediaFetched) return;
    if (!drill.videoUrl?.includes('innebandy.se')) return;

    const fetchMedia = async () => {
      setFetchingMedia(true);
      try {
        const { data, error } = await supabase.functions.invoke('scrape-drill-media', {
          body: { url: drill.videoUrl },
        });
        
        const updates: Partial<Drill> = {
          mediaFetched: true,
          directVideoUrl: data?.videoSrc || undefined,
          thumbnailUrl: data?.thumbnailSrc || undefined,
        };
        
        await updateDrill(drill.id, updates);
        setLocalDrill(prev => prev ? { ...prev, ...updates } : prev);
      } catch (err) {
        console.error('Failed to fetch drill media:', err);
      } finally {
        setFetchingMedia(false);
      }
    };

    fetchMedia();
  }, [localDrill?.id, localDrill?.mediaFetched, isNew]);

  const handleSave = (drill: Drill) => {
    if (isNew) {
      addDrill(drill);
      navigate(`/training/drill/${drill.id}`, { replace: true });
    } else {
      updateDrill(drillId!, drill);
    }
  };

  const handleDelete = () => {
    if (drillId && !isNew) {
      deleteDrill(drillId);
      navigate('/training');
    }
  };

  const handleDialogClose = (open: boolean) => {
    setEditDialogOpen(open);
    if (!open && isNew) {
      navigate(backPath);
    }
  };

  if (!isNew && !existingDrill) {
    return (
      <AppLayout>
        <div className="page-container">
          <p className="text-muted-foreground">Drill not found</p>
          <Button variant="outline" onClick={() => navigate(backPath)}>
            Back to Training
          </Button>
        </div>
      </AppLayout>
    );
  }

  const drill = localDrill || existingDrill;
  const hasContent = (drill?.linkedLayoutIds?.length || 0) > 0 || (drill?.mediaFiles?.length || 0) > 0;
  const hasScrapedMedia = !!drill?.directVideoUrl || !!drill?.thumbnailUrl;

  return (
    <AppLayout>
      <div className="page-container">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(backPath)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{drill?.name || 'New Drill'}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {drill?.categories?.map(cat => (
                <Badge key={cat} variant="secondary">{cat}</Badge>
              ))}
              {drill?.videoUrl && (
                <Badge variant="outline" className="gap-1">
                  <Video className="h-3 w-3" />
                  Video
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditDialogOpen(true)}>
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </Button>
            {!isNew && (
              <Button variant="ghost" size="icon" onClick={handleDelete} className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Description */}
        {drill?.description && (
          <div className="mb-6">
            <p className="text-muted-foreground">{drill.description}</p>
          </div>
        )}

        {/* Scraped Media (video/image from Övningsbanken) */}
        {fetchingMedia && (
          <div className="mb-6 flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Hämtar media...</span>
          </div>
        )}

        {drill?.directVideoUrl && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Video className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Video</h2>
            </div>
            <video
              src={drill.directVideoUrl}
              controls
              playsInline
              className="w-full max-w-2xl rounded-lg border bg-black"
            />
          </div>
        )}

        {drill?.thumbnailUrl && !drill?.directVideoUrl && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <ImageIcon className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Bild</h2>
            </div>
            <img
              src={drill.thumbnailUrl}
              alt={drill.name}
              className="w-full max-w-2xl rounded-lg border"
            />
          </div>
        )}

        {/* Video URL fallback (non-innebandy or no scraped media) */}
        {drill?.videoUrl && !drill?.directVideoUrl && !fetchingMedia && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Video className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Video</h2>
            </div>
            <a 
              href={drill.videoUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary underline text-sm"
            >
              {drill.videoUrl}
            </a>
          </div>
        )}

        {/* Tactics Board Layouts */}
        {drill?.linkedLayoutIds && drill.linkedLayoutIds.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Film className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Tactics Board Layouts</h2>
            </div>
            <div className="grid gap-4 grid-cols-1">
              {drill.linkedLayoutIds.map(layoutId => (
                <TacticsBoardPreview key={layoutId} layoutId={layoutId} />
              ))}
            </div>
          </div>
        )}

        {/* Media Gallery */}
        {drill?.mediaFiles && drill.mediaFiles.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <ImageIcon className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Photos & Videos</h2>
            </div>
            <PlayMediaGallery media={drill.mediaFiles} readOnly />
          </div>
        )}

        {/* Empty State */}
        {!hasContent && !hasScrapedMedia && !drill?.description && !drill?.videoUrl && !isNew && !fetchingMedia && (
          <Card>
            <CardContent className="py-12 text-center">
              <Layout className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-30" />
              <p className="text-muted-foreground mb-4">
                No content added yet
              </p>
              <Button onClick={() => setEditDialogOpen(true)}>
                <Edit2 className="h-4 w-4 mr-2" />
                Add Content
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Dialog */}
      <EditDrillDialog
        open={editDialogOpen}
        onOpenChange={handleDialogClose}
        drill={drill}
        onSave={handleSave}
      />
    </AppLayout>
  );
}
