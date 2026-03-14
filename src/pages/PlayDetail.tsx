import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { usePlays } from '@/hooks/useLocalStorage';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ArrowLeft, 
  Edit2, 
  Trash2,
  Film,
  Image as ImageIcon,
  Layout
} from 'lucide-react';
import { Play } from '@/types';
import { EditPlayDialog } from '@/components/playbook/EditPlayDialog';
import { TacticsBoardPreview } from '@/components/playbook/TacticsBoardPreview';
import { PlayMediaGallery } from '@/components/playbook/PlayMediaGallery';

export default function PlayDetail() {
  const { playId } = useParams<{ playId: string }>();
  const navigate = useNavigate();
  const { plays, updatePlay, deletePlay, addPlay } = usePlays();
  
  const isNew = playId === 'new';
  const existingPlay = plays.find(p => p.id === playId);
  
  const [editDialogOpen, setEditDialogOpen] = useState(isNew);

  useEffect(() => {
    if (isNew) {
      setEditDialogOpen(true);
    }
  }, [isNew]);

  const handleSave = (play: Play) => {
    if (isNew) {
      addPlay(play);
      navigate(`/playbook/${play.id}`, { replace: true });
    } else {
      updatePlay(playId!, play);
    }
  };

  const handleDelete = () => {
    if (playId && !isNew) {
      deletePlay(playId);
      navigate('/playbook');
    }
  };

  const handleDialogClose = (open: boolean) => {
    setEditDialogOpen(open);
    if (!open && isNew) {
      navigate('/playbook');
    }
  };

  if (!isNew && !existingPlay) {
    return (
      <AppLayout>
        <div className="page-container">
          <p className="text-muted-foreground">Spelsystemet hittades inte</p>
          <Button variant="outline" onClick={() => navigate('/playbook')}>
            Tillbaka till spelboken
          </Button>
        </div>
      </AppLayout>
    );
  }

  const play = existingPlay;
  const hasContent = (play?.linkedLayoutIds?.length || 0) > 0 || (play?.mediaFiles?.length || 0) > 0;

  return (
    <AppLayout>
      <div className="page-container">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/playbook')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{play?.name || 'Nytt spelsystem'}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge variant="outline">{play?.category || 'System'}</Badge>
              {play?.tags?.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
              ))}
              {play?.keyPoints?.map((point, index) => (
                <Badge key={`kp-${index}`} variant="default" className="text-xs">{point}</Badge>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditDialogOpen(true)}>
              <Edit2 className="h-4 w-4 mr-2" />
              Redigera
            </Button>
            {!isNew && (
              <Button variant="ghost" size="icon" onClick={handleDelete} className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Tactics Board Layouts */}
        {play?.linkedLayoutIds && play.linkedLayoutIds.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Film className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Taktiktavlor</h2>
            </div>
            <div className="grid gap-4 grid-cols-1">
              {play.linkedLayoutIds.map(layoutId => (
                <TacticsBoardPreview key={layoutId} layoutId={layoutId} />
              ))}
            </div>
          </div>
        )}

        {/* Media Gallery */}
        {play?.mediaFiles && play.mediaFiles.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <ImageIcon className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Foton & videor</h2>
            </div>
            <PlayMediaGallery media={play.mediaFiles} readOnly />
          </div>
        )}

        {/* Empty State */}
        {!hasContent && !isNew && (
          <Card>
            <CardContent className="py-12 text-center">
              <Layout className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-30" />
              <p className="text-muted-foreground mb-4">
                Inga taktiktavlor eller media tillagda ännu
              </p>
              <Button onClick={() => setEditDialogOpen(true)}>
                <Edit2 className="h-4 w-4 mr-2" />
                Lägg till innehåll
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Dialog */}
      <EditPlayDialog
        open={editDialogOpen}
        onOpenChange={handleDialogClose}
        play={play}
        onSave={handleSave}
      />
    </AppLayout>
  );
}
