import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useTeam } from '@/contexts/TeamContext';
import { SeasonSelector } from '@/components/SeasonSelector';
import { NextGameCard } from '@/components/dashboard/NextGameCard';
import { LastGameCard } from '@/components/dashboard/LastGameCard';
import { NextTrainingCard } from '@/components/dashboard/NextTrainingCard';
import { PlayerAlerts } from '@/components/dashboard/PlayerAlerts';
import { WeeklyFocusCard } from '@/components/dashboard/WeeklyFocusCard';
import { StatCard } from '@/components/dashboard/StatCard';
import { RPEAlertsCard } from '@/components/dashboard/RPEAlertsCard';
import { TeamRPECard } from '@/components/dashboard/TeamRPECard';
import { Users, Trophy, Target, Calendar, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardCustomizer } from '@/components/dashboard/DashboardCustomizer';
import { useDashboardLayout, DashboardCardId } from '@/hooks/useDashboardLayout';
import { usePlayers, useTrainingSessions, useWeeklyFocus, useCoachNotes, useRPERatings } from '@/hooks/useLocalStorage';
import { useEnhancedGames } from '@/hooks/useEnhancedGames';

export default function Dashboard() {
  const navigate = useNavigate();
  const { seasons, selectedSeasonId, setSelectedSeasonId, selectedSeason, activeTeam, activeRole } = useTeam();
  const { players } = usePlayers();
  const { games } = useEnhancedGames();
  const { sessions } = useTrainingSessions();
  const { focus, saveFocus } = useWeeklyFocus();
  const { notes, saveNotes } = useCoachNotes();
  const { ratings: allRPERatings } = useRPERatings();
  const { layout, save, resetToRoleDefault } = useDashboardLayout(activeTeam?.id ?? null, activeRole);
  const [customizerOpen, setCustomizerOpen] = useState(false);

  const upcomingGame = games.find(g => g.status === 'Not Started');
  const lastPlayedGame = games
    .filter(g => g.status === 'Finished')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  const nextTraining = sessions[0];
  
  const activePlayers = players.filter(p => p.status === 'Active').length;
  const finishedGames = games.filter(g => g.status === 'Finished');
  const gamesPlayed = finishedGames.length;
  const gamesWon = finishedGames.filter(g => g.ourScore > g.opponentScore).length;

  const renderCard = (id: DashboardCardId) => {
    switch (id) {
      case 'stats':
        return (
          <div key="stats" className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div onClick={() => navigate('/team')} className="cursor-pointer">
              <StatCard title="Aktiva spelare" value={activePlayers} subtitle={`av ${players.length}`} icon={Users} />
            </div>
            <div onClick={() => navigate('/games')} className="cursor-pointer">
              <StatCard title="Spelade matcher" value={gamesPlayed} subtitle="denna säsong" icon={Trophy} />
            </div>
            <div onClick={() => navigate('/games')} className="cursor-pointer">
              <StatCard
                title="Vinstprocent"
                value={gamesPlayed > 0 ? `${Math.round((gamesWon / gamesPlayed) * 100)}%` : 'N/A'}
                subtitle={`${gamesWon}V ${gamesPlayed - gamesWon}F`}
                variant="success"
                icon={Target}
              />
            </div>
            <div onClick={() => navigate('/training')} className="cursor-pointer">
              <StatCard title="Träningar" value={sessions.length} subtitle="planerade" icon={Calendar} />
            </div>
          </div>
        );
      case 'next-training':
        return nextTraining ? (
          <NextTrainingCard key="next-training" session={nextTraining} playerCount={nextTraining.playerIds.length} />
        ) : null;
      case 'next-game':
        return upcomingGame ? <NextGameCard key="next-game" game={upcomingGame} /> : null;
      case 'weekly-focus':
        return (
          <WeeklyFocusCard
            key="weekly-focus"
            focus={focus}
            notes={notes}
            onFocusChange={saveFocus}
            onNotesChange={saveNotes}
          />
        );
      case 'team-rpe':
        return <TeamRPECard key="team-rpe" ratings={allRPERatings} players={players} />;
      case 'last-game':
        return lastPlayedGame ? <LastGameCard key="last-game" game={lastPlayedGame} /> : null;
      case 'rpe-alerts':
        return (
          <RPEAlertsCard
            key="rpe-alerts"
            ratings={allRPERatings}
            players={players}
            onPlayerClick={(player) => navigate(`/team/${player.id}`)}
          />
        );
      case 'player-alerts':
        return <PlayerAlerts key="player-alerts" players={players} onPlayerClick={(player) => navigate(`/team/${player.id}`)} />;
      default:
        return null;
    }
  };

  return (
    <AppLayout>
      <div className="page-container">
        <div className="mb-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="section-title">Översikt</h1>
              {selectedSeason && <p className="text-muted-foreground text-sm mt-0.5">{selectedSeason.name}</p>}
            </div>
            <Button variant="outline" size="sm" onClick={() => setCustomizerOpen(true)}>
              <Settings2 className="h-3.5 w-3.5 mr-1.5" />
              Anpassa
            </Button>
          </div>
          <div className="flex items-center gap-2 flex-wrap mt-3">
            <SeasonSelector seasons={seasons} selectedSeasonId={selectedSeasonId} onSeasonChange={setSelectedSeasonId} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {layout
            .filter(c => c.visible)
            .map(c => {
              const node = renderCard(c.id);
              if (!node) return null;
              const fullWidth = c.id === 'stats';
              return (
                <div key={c.id} className={fullWidth ? 'lg:col-span-2' : ''}>
                  {node}
                </div>
              );
            })}
        </div>
      </div>

      <DashboardCustomizer
        open={customizerOpen}
        onOpenChange={setCustomizerOpen}
        layout={layout}
        onSave={save}
        onReset={resetToRoleDefault}
      />
    </AppLayout>
  );
}
