import { useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EnhancedGame } from '@/types/game';
import { calculateTeamStats } from '@/lib/gameStorage';
import { TrendChart, TrendSeries } from './TrendChart';
import { TrendSparkline } from './TrendSparkline';

interface TeamTrendsProps {
  games: EnhancedGame[];
}

const OUR = 'hsl(var(--primary))';
const OPP = 'hsl(var(--chart-opponent))';
const ACCENT = 'hsl(var(--success))';
const DANGER = 'hsl(var(--destructive))';

export function TeamTrends({ games }: TeamTrendsProps) {
  const trendData = useMemo(() => {
    return [...games]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(game => {
        const home = calculateTeamStats(game.events, 'home');
        const opp = calculateTeamStats(game.events, 'opponent');
        const homePP = calculateTeamStats(game.events, 'home', undefined, '5v4');
        const homePK = calculateTeamStats(game.events, 'home', undefined, '4v5');
        const oppPK = calculateTeamStats(game.events, 'opponent', undefined, '4v5');

        const homeTotalShots = home.shotsOnGoal + home.shotsOffGoal + home.shotsBlocked;
        const oppTotalShots = opp.shotsOnGoal + opp.shotsOffGoal + opp.shotsBlocked;

        const penalties = game.penalties || [];
        const ppOpportunities = penalties.filter(p => p.team === 'opponent').length;
        const pkOpportunities = penalties.filter(p => p.team === 'home').length;
        const pkGoalsAgainst = oppPK.goals;

        return {
          label: game.opponent,
          ourGoals: game.ourScore,
          oppGoals: game.opponentScore,
          ourSog: home.shotsOnGoal,
          oppSog: opp.shotsOnGoal,
          ourShotsOff: home.shotsOffGoal,
          oppShotsOff: opp.shotsOffGoal,
          ourBlk: home.shotsBlocked,
          oppBlk: opp.shotsBlocked,
          ourDef: opp.shotsBlocked,
          oppDef: home.shotsBlocked,
          ourTotalShots: homeTotalShots,
          oppTotalShots: oppTotalShots,
          ourSogPct: homeTotalShots > 0 ? Math.round((home.shotsOnGoal / homeTotalShots) * 100) : 0,
          oppSogPct: oppTotalShots > 0 ? Math.round((opp.shotsOnGoal / oppTotalShots) * 100) : 0,
          ourBlkPct: homeTotalShots > 0 ? Math.round((home.shotsBlocked / homeTotalShots) * 100) : 0,
          oppBlkPct: oppTotalShots > 0 ? Math.round((opp.shotsBlocked / oppTotalShots) * 100) : 0,
          ppGoals: homePP.goals,
          ppSog: homePP.shotsOnGoal,
          ppPct: ppOpportunities > 0 ? Math.round((homePP.goals / ppOpportunities) * 100) : 0,
          pkGoals: pkGoalsAgainst,
          pkSog: homePK.shotsOnGoal,
          pkPct: pkOpportunities > 0 ? Math.round(((pkOpportunities - pkGoalsAgainst) / pkOpportunities) * 100) : 0,
        };
      });
  }, [games]);

  if (trendData.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        Inga avslutade matcher att visa trender för
      </p>
    );
  }

  const ourSeries = (key: string, label: string): TrendSeries => ({ key, label, color: OUR });
  const oppSeries = (key: string, label: string): TrendSeries => ({ key, label, color: OPP });
  const accentSeries = (key: string, label: string): TrendSeries => ({ key, label, color: ACCENT });
  const dangerSeries = (key: string, label: string): TrendSeries => ({ key, label, color: DANGER });

  const sparkValues = (k: keyof typeof trendData[number]) => trendData.map(d => Number(d[k]) || 0);

  return (
    <div className="space-y-6">
      {/* Sparkline overview */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Översikt</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <TrendSparkline label="Mål" values={sparkValues('ourGoals')} />
          <TrendSparkline label="SOG" values={sparkValues('ourSog')} />
          <TrendSparkline label="SOG %" values={sparkValues('ourSogPct')} suffix="%" />
          <TrendSparkline label="Totala skott" values={sparkValues('ourTotalShots')} />
          <TrendSparkline label="Mål emot" values={sparkValues('oppGoals')} invertTrend />
          <TrendSparkline label="Blockerade" values={sparkValues('ourBlk')} />
          <TrendSparkline label="PP %" values={sparkValues('ppPct')} suffix="%" />
          <TrendSparkline label="PK %" values={sparkValues('pkPct')} suffix="%" />
        </div>
      </div>

      {/* Tabs with grouped charts */}
      <Tabs defaultValue="offensive" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="offensive">Offensiv</TabsTrigger>
          <TabsTrigger value="defensive">Defensiv</TabsTrigger>
          <TabsTrigger value="special">Special teams</TabsTrigger>
        </TabsList>

        <TabsContent value="offensive" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <TrendChart
              title="Mål"
              data={trendData}
              xKey="label"
              series={[ourSeries('ourGoals', 'Våra mål'), oppSeries('oppGoals', 'Mot.')]}
            />
            <TrendChart
              title="Skott på mål"
              data={trendData}
              xKey="label"
              series={[ourSeries('ourSog', 'Våra SOG'), oppSeries('oppSog', 'Mot. SOG')]}
            />
            <TrendChart
              title="SOG %"
              data={trendData}
              xKey="label"
              series={[ourSeries('ourSogPct', 'Vår SOG %'), oppSeries('oppSogPct', 'Mot. SOG %')]}
              domain={[0, 100]}
            />
            <TrendChart
              title="Totala skott"
              data={trendData}
              xKey="label"
              series={[ourSeries('ourTotalShots', 'Våra'), oppSeries('oppTotalShots', 'Mot.')]}
            />
            <TrendChart
              title="Skott utanför"
              data={trendData}
              xKey="label"
              series={[ourSeries('ourShotsOff', 'Våra'), oppSeries('oppShotsOff', 'Mot.')]}
            />
          </div>
        </TabsContent>

        <TabsContent value="defensive" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <TrendChart
              title="Blockerade skott"
              data={trendData}
              xKey="label"
              series={[ourSeries('ourBlk', 'Våra'), oppSeries('oppBlk', 'Mot.')]}
            />
            <TrendChart
              title="BLK %"
              data={trendData}
              xKey="label"
              series={[ourSeries('ourBlkPct', 'Vår'), oppSeries('oppBlkPct', 'Mot.')]}
              domain={[0, 100]}
            />
            <TrendChart
              title="Defensiva blockeringar"
              data={trendData}
              xKey="label"
              series={[ourSeries('ourDef', 'Våra'), oppSeries('oppDef', 'Mot.')]}
            />
            <TrendChart
              title="Mål emot"
              data={trendData}
              xKey="label"
              series={[oppSeries('oppGoals', 'Mål emot')]}
              invertTrend
            />
          </div>
        </TabsContent>

        <TabsContent value="special" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <TrendChart
              title="Power Play %"
              data={trendData}
              xKey="label"
              series={[accentSeries('ppPct', 'PP %')]}
              domain={[0, 100]}
            />
            <TrendChart
              title="PP-mål"
              data={trendData}
              xKey="label"
              series={[accentSeries('ppGoals', 'PP-mål')]}
            />
            <TrendChart
              title="PP SOG"
              data={trendData}
              xKey="label"
              series={[accentSeries('ppSog', 'PP SOG')]}
            />
            <TrendChart
              title="Box Play %"
              data={trendData}
              xKey="label"
              series={[accentSeries('pkPct', 'PK %')]}
              domain={[0, 100]}
            />
            <TrendChart
              title="PK-mål emot"
              data={trendData}
              xKey="label"
              series={[dangerSeries('pkGoals', 'PK-mål emot')]}
              invertTrend
            />
            <TrendChart
              title="PK SOG"
              data={trendData}
              xKey="label"
              series={[accentSeries('pkSog', 'PK SOG')]}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
