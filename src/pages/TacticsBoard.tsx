import { AppLayout } from '@/components/layout/AppLayout';
import { TacticsBoardCanvas } from '@/components/tactics/TacticsBoardCanvas';

export default function TacticsBoard() {
  return (
    <AppLayout>
      <div className="page-container">
        <div className="section-header">
          <div>
            <h1 className="section-title">Tactics Board</h1>
            <p className="text-muted-foreground mt-1">
              Plan formations, plays, and strategies
            </p>
          </div>
        </div>

        <TacticsBoardCanvas />
      </div>
    </AppLayout>
  );
}
