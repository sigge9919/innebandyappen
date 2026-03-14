import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Season } from '@/hooks/useSeasons';

interface SeasonSelectorProps {
  seasons: Season[];
  selectedSeasonId: string | null;
  onSeasonChange: (seasonId: string) => void;
}

export function SeasonSelector({ seasons, selectedSeasonId, onSeasonChange }: SeasonSelectorProps) {
  if (seasons.length <= 1) return null;

  return (
    <Select value={selectedSeasonId ?? ''} onValueChange={onSeasonChange}>
      <SelectTrigger className="w-[180px] h-9 text-sm">
        <SelectValue placeholder="Välj säsong" />
      </SelectTrigger>
      <SelectContent>
        {seasons.map(s => (
          <SelectItem key={s.id} value={s.id}>
            <span className="flex items-center gap-2">
              {s.name}
              {s.isActive && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Aktiv</Badge>
              )}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
