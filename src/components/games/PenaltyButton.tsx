import { Team } from '@/types/game';
import { Button } from '@/components/ui/button';
import { AlertOctagon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PenaltyButtonProps {
  team: Team;
  teamName: string;
  onRecordPenalty: (team: Team) => void;
}

export function PenaltyButton({ team, teamName, onRecordPenalty }: PenaltyButtonProps) {
  return (
    <Button
      variant="outline"
      className={cn(
        'w-full p-4 h-auto flex flex-col items-center gap-2 transition-all active:scale-95',
        'border-2 border-amber-500 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20',
        'dark:text-amber-400 dark:border-amber-400'
      )}
      onClick={() => onRecordPenalty(team)}
    >
      <AlertOctagon className="h-6 w-6" />
      <span className="font-semibold text-sm">2 min utvisning</span>
      <span className="text-xs opacity-75">{teamName}</span>
    </Button>
  );
}
