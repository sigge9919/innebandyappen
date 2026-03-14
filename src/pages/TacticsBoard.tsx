import { useSearchParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { TacticsBoardCanvas } from '@/components/tactics/TacticsBoardCanvas';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function TacticsBoard() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const layoutId = searchParams.get('layout');
  const from = searchParams.get('from');

  return (
    <AppLayout>
      <div className="page-container">
        <div className="section-header">
          <div className="flex items-center gap-3">
            {from && (
              <Button variant="ghost" size="icon" onClick={() => navigate(from)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <div>
              <h1 className="section-title">Taktiktavla</h1>
              <p className="text-muted-foreground mt-1">
                Planera formationer, spelsystem och strategier
              </p>
            </div>
          </div>
        </div>

        <TacticsBoardCanvas initialLayoutId={layoutId || undefined} />
      </div>
    </AppLayout>
  );
}
