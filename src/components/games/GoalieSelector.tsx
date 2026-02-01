import { Player } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface GoalieSelectorProps {
  goalies: Player[];
  selectedGoalieId?: string;
  onSelectGoalie: (goalieId: string | undefined) => void;
  label?: string;
  compact?: boolean;
}

const NONE_VALUE = '_none';

export function GoalieSelector({
  goalies,
  selectedGoalieId,
  onSelectGoalie,
  label = 'Goalie',
  compact = false,
}: GoalieSelectorProps) {
  const selectedGoalie = goalies.find(g => g.id === selectedGoalieId);

  if (goalies.length === 0) {
    return (
      <div className="text-sm text-muted-foreground italic">
        No goalkeepers in squad
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">{label}:</span>
        <Select
          value={selectedGoalieId || NONE_VALUE}
          onValueChange={(value) => onSelectGoalie(value === NONE_VALUE ? undefined : value)}
        >
          <SelectTrigger className="w-[140px] h-8 text-xs">
            <SelectValue placeholder="Select goalie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE_VALUE}>Not selected</SelectItem>
            {goalies.map(goalie => (
              <SelectItem key={goalie.id} value={goalie.id}>
                #{goalie.jerseyNumber} {goalie.name.split(' ')[0]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-sm">{label}</span>
        {selectedGoalie && (
          <Badge variant="secondary" className="text-xs">
            #{selectedGoalie.jerseyNumber} {selectedGoalie.name}
          </Badge>
        )}
      </div>
      <div className="flex gap-2 flex-wrap">
        {goalies.map(goalie => (
          <Button
            key={goalie.id}
            variant={selectedGoalieId === goalie.id ? 'default' : 'outline'}
            size="sm"
            className={cn(
              'h-10 px-4',
              selectedGoalieId === goalie.id && 'ring-2 ring-primary ring-offset-2'
            )}
            onClick={() => onSelectGoalie(goalie.id)}
          >
            <span className="font-bold mr-1">#{goalie.jerseyNumber}</span>
            {goalie.name.split(' ')[0]}
          </Button>
        ))}
      </div>
    </div>
  );
}
