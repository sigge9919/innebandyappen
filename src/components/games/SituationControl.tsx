import { GameSituation, getSituationLabel } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Users, AlertTriangle } from 'lucide-react';

interface SituationControlProps {
  currentSituation: GameSituation;
  onChangeSituation: (situation: GameSituation) => void;
}

const SITUATIONS: { value: GameSituation; label: string; shortLabel: string; variant: 'default' | 'success' | 'destructive' | 'secondary' }[] = [
  { value: '5v5', label: 'Even Strength', shortLabel: '5v5', variant: 'default' },
  { value: '5v4', label: 'Power Play', shortLabel: '5v4', variant: 'success' },
  { value: '4v5', label: 'Box Play', shortLabel: '4v5', variant: 'destructive' },
  { value: '6v5', label: 'ENG Attack', shortLabel: '6v5', variant: 'secondary' },
  { value: '5v6', label: 'ENG Defense', shortLabel: '5v6', variant: 'secondary' },
];

export function SituationControl({
  currentSituation,
  onChangeSituation,
}: SituationControlProps) {
  const currentSituationInfo = SITUATIONS.find(s => s.value === currentSituation);

  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <span className="font-semibold">Situation</span>
        </div>
        <Badge 
          variant={currentSituation === '5v4' ? 'default' : currentSituation === '4v5' ? 'destructive' : 'secondary'}
          className="text-sm"
        >
          {currentSituationInfo?.label}
        </Badge>
      </div>
      
      <div className="grid grid-cols-5 gap-2">
        {SITUATIONS.map(situation => (
          <Button
            key={situation.value}
            variant={currentSituation === situation.value ? 'default' : 'outline'}
            size="sm"
            className={cn(
              'flex-1 text-sm font-semibold',
              currentSituation === situation.value && situation.variant === 'success' && 'bg-success hover:bg-success/90 text-success-foreground',
              currentSituation === situation.value && situation.variant === 'destructive' && 'bg-destructive hover:bg-destructive/90'
            )}
            onClick={() => onChangeSituation(situation.value)}
          >
            {situation.shortLabel}
          </Button>
        ))}
      </div>
      
      {(currentSituation === '5v4' || currentSituation === '4v5') && (
        <div className={cn(
          'mt-3 p-2 rounded-lg flex items-center gap-2 text-sm',
          currentSituation === '5v4' && 'bg-success/10 text-success',
          currentSituation === '4v5' && 'bg-destructive/10 text-destructive'
        )}>
          <AlertTriangle className="h-4 w-4" />
          <span>
            {currentSituation === '5v4' ? 'Power Play Active - We have advantage' : 'Box Play Active - We are shorthanded'}
          </span>
        </div>
      )}
    </div>
  );
}
