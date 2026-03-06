import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { NextGameCard } from '@/components/dashboard/NextGameCard';
import { LastGameCard } from '@/components/dashboard/LastGameCard';
import { NextTrainingCard } from '@/components/dashboard/NextTrainingCard';
import { PlayerAlerts } from '@/components/dashboard/PlayerAlerts';
import { WeeklyFocusCard } from '@/components/dashboard/WeeklyFocusCard';
import { StatCard } from '@/components/dashboard/StatCard';
import { RPEAlertsCard } from '@/components/dashboard/RPEAlertsCard';
import { TeamRPECard } from '@/components/dashboard/TeamRPECard';
import { usePlayers, useTrainingSessions, useWeeklyFocus, useCoachNotes, useRPERatings } from '@/hooks/useLocalStorage';
import { useEnhancedGames } from '@/hooks/useEnhancedGames';

export default function Dashboard() {
  const navigate = useNavigate();
  const { players } = usePlayers();
  const { games } = useEnhancedGames();
  const { sessions } = useTrainingSessions();
  const { focus, saveFocus } = useWeeklyFocus();
  const { notes, saveNotes } = useCoachNotes();
  const { ratings: allRPERatings } = useRPERatings();

  const upcomingGame = games.find(g => g.status === 'Not Started');
  const lastPlayedGame = games
    .filter(g => g.status === 'Finished')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  const nextTraining = sessions[0];
  
  const activePlayers = players.filter(p => p.status === 'Active').length;
  const finishedGames = games.filter(g => g.status === 'Finished');
  const gamesPlayed = finishedGames.length;
  const gamesWon = finishedGames.filter(g => g.ourScore > g.opponentScore).length;

  return (
    <AppLayout>
      <div className="page-container">
        <div className="section-header">
          <h1 className="section-title">Dashboard</h1>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border mb-6 border border-border">
          <div onClick={() => navigate('/team')} className="cursor-pointer">
            <StatCard title="Active Players" value={activePlayers} subtitle={`of ${players.length}`} />
          </div>
          <div onClick={() => navigate('/games')} className="cursor-pointer">
            <StatCard title="Games Played" value={gamesPlayed} subtitle="this season" />
          </div>
          <div onClick={() => navigate('/games')} className="cursor-pointer">
            <StatCard
              title="Win Rate"
              value={gamesPlayed > 0 ? `${Math.round((gamesWon / gamesPlayed) * 100)}%` : 'N/A'}
              subtitle={`${gamesWon}W ${gamesPlayed - gamesWon}L`}
              variant="success"
            />
          </div>
          <div onClick={() => navigate('/training')} className="cursor-pointer">
            <StatCard title="Sessions" value={sessions.length} subtitle="scheduled" />
          </div>
        </div>

        {/* Content grid */}
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="space-y-4">
            {upcomingGame && <NextGameCard game={upcomingGame} />}
            {lastPlayedGame && <LastGameCard game={lastPlayedGame} />}
          </div>

          <div className="space-y-4">
            {nextTraining && (
              <NextTrainingCard
                session={nextTraining}
                playerCount={nextTraining.playerIds.length}
              />
            )}
            <WeeklyFocusCard 
              focus={focus} 
              notes={notes}
              onFocusChange={saveFocus}
              onNotesChange={saveNotes}
            />
          </div>

          <div className="space-y-4">
            <TeamRPECard ratings={allRPERatings} players={players} />
            <RPEAlertsCard
              ratings={allRPERatings}
              players={players}
              onPlayerClick={(player) => navigate(`/team/${player.id}`)}
            />
            <PlayerAlerts players={players} onPlayerClick={(player) => navigate(`/team/${player.id}`)} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
