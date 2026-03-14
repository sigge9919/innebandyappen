import { useState } from 'react';
import { Period, TeamStats, getTotalShots, Team } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface PostGameTeamStatsProps {
  homeTeamName: string;
  opponentName: string;
  getHomeStats: (period?: Period) => TeamStats;
  getOpponentStats: (period?: Period) => TeamStats;
  homeScore: number;
  opponentScore: number;
  onUpdateStats: (team: Team, period: Period, stats: Partial<TeamStats>) => void;
}

const PERIODS: { value: Period | 'total'; label: string }[] = [
  { value: '1', label: 'P1' },
  { value: '2', label: 'P2' },
  { value: '3', label: 'P3' },
  { value: 'OT', label: 'OT' },
  { value: 'total', label: 'Total' },
];

export function PostGameTeamStats({
  homeTeamName,
  opponentName,
  getHomeStats,
  getOpponentStats,
  homeScore,
  opponentScore,
  onUpdateStats,
}: PostGameTeamStatsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<Period | 'total'>('total');

  const homeStats = selectedPeriod === 'total' ? getHomeStats() : getHomeStats(selectedPeriod);
  const opponentStats = selectedPeriod === 'total' ? getOpponentStats() : getOpponentStats(selectedPeriod);

  const handleStatChange = (team: Team, field: keyof TeamStats, value: number) => {
    if (selectedPeriod === 'total') return; // Can't edit totals directly
    onUpdateStats(team, selectedPeriod, { [field]: value });
  };

  const isEditable = selectedPeriod !== 'total';

  return (
    <div>
      <div className="flex items-center justify-end mb-4">
        <div className="text-2xl font-bold">
          <span className={cn(homeScore > opponentScore && "text-success")}>
            {homeScore}
          </span>
          <span className="text-muted-foreground mx-2">-</span>
          <span className={cn(opponentScore > homeScore && "text-destructive")}>
            {opponentScore}
          </span>
        </div>
      </div>

      {/* Period Tabs */}
      <Tabs value={selectedPeriod} onValueChange={(v) => setSelectedPeriod(v as Period | 'total')}>
        <TabsList className="grid grid-cols-5 w-full mb-4">
          {PERIODS.map(period => (
            <TabsTrigger key={period.value} value={period.value}>
              {period.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedPeriod} className="mt-0">
          {!isEditable && (
            <p className="text-sm text-muted-foreground mb-3 text-center">
              Välj en period för att redigera statistik
            </p>
          )}

          {/* Stats Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-2 px-3 text-left font-medium text-muted-foreground">Statistik</th>
                  <th className="py-2 px-3 text-center font-medium">{homeTeamName}</th>
                  <th className="py-2 px-3 text-center font-medium">{opponentName}</th>
                </tr>
              </thead>
              <tbody>
                <StatEditRow
                  label="Mål"
                  homeValue={homeStats.goals}
                  opponentValue={opponentStats.goals}
                  editable={isEditable}
                  onHomeChange={(v) => handleStatChange('home', 'goals', v)}
                  onOpponentChange={(v) => handleStatChange('opponent', 'goals', v)}
                  highlight
                />
                <StatEditRow
                  label="Skott på mål"
                  homeValue={homeStats.shotsOnGoal}
                  opponentValue={opponentStats.shotsOnGoal}
                  editable={isEditable}
                  onHomeChange={(v) => handleStatChange('home', 'shotsOnGoal', v)}
                  onOpponentChange={(v) => handleStatChange('opponent', 'shotsOnGoal', v)}
                />
                <StatEditRow
                  label="Skott utanför"
                  homeValue={homeStats.shotsOffGoal}
                  opponentValue={opponentStats.shotsOffGoal}
                  editable={isEditable}
                  onHomeChange={(v) => handleStatChange('home', 'shotsOffGoal', v)}
                  onOpponentChange={(v) => handleStatChange('opponent', 'shotsOffGoal', v)}
                />
                <StatEditRow
                  label="Shots Blocked"
                  homeValue={homeStats.shotsBlocked}
                  opponentValue={opponentStats.shotsBlocked}
                  editable={isEditable}
                  onHomeChange={(v) => handleStatChange('home', 'shotsBlocked', v)}
                  onOpponentChange={(v) => handleStatChange('opponent', 'shotsBlocked', v)}
                />
                <tr className="border-t border-border bg-muted/30">
                  <td className="py-2 px-3 font-semibold">Total Shots</td>
                  <td className="py-2 px-3 text-center font-semibold">{getTotalShots(homeStats)}</td>
                  <td className="py-2 px-3 text-center font-semibold">{getTotalShots(opponentStats)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatEditRow({
  label,
  homeValue,
  opponentValue,
  editable,
  onHomeChange,
  onOpponentChange,
  highlight = false,
}: {
  label: string;
  homeValue: number;
  opponentValue: number;
  editable: boolean;
  onHomeChange: (value: number) => void;
  onOpponentChange: (value: number) => void;
  highlight?: boolean;
}) {
  return (
    <tr className="border-b border-border">
      <td className={cn("py-2 px-3", highlight && "font-medium")}>{label}</td>
      <td className="py-2 px-3">
        {editable ? (
          <Input
            type="number"
            min={0}
            value={homeValue}
            onChange={(e) => onHomeChange(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-16 mx-auto text-center h-8"
          />
        ) : (
          <div className={cn("text-center", highlight && "font-semibold")}>{homeValue}</div>
        )}
      </td>
      <td className="py-2 px-3">
        {editable ? (
          <Input
            type="number"
            min={0}
            value={opponentValue}
            onChange={(e) => onOpponentChange(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-16 mx-auto text-center h-8"
          />
        ) : (
          <div className={cn("text-center", highlight && "font-semibold")}>{opponentValue}</div>
        )}
      </td>
    </tr>
  );
}
