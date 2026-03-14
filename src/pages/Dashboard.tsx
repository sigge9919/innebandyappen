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
import { usePlayers, useTrainingSessions, useWeeklyFocus, useCoachNotes, useRPERatings } from '@/hooks/useLocalStorage';
import { useEnhancedGames } from '@/hooks/useEnhancedGames';

export default function Dashboard() {
  const navigate = useNavigate();
  const { seasons, selectedSeasonId, setSelectedSeasonId, selectedSeason } = useTeam();
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
          <div>
            <h1 className="section-title">Översikt</h1>
            {selectedSeason && <p className="text-muted-foreground text-sm mt-0.5">{selectedSeason.name}</p>}
          </div>
          <SeasonSelector seasons={seasons} selectedSeasonId={selectedSeasonId} onSeasonChange={setSelectedSeasonId} />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border mb-6 border border-border">
          <div onClick={() => navigate('/team')} className="cursor-pointer">
            <StatCard title="Aktiva spelare" value={activePlayers} subtitle={`av ${players.length}`} />
          </div>
          <div onClick={() => navigate('/games')} className="cursor-pointer">
            <StatCard title="Spelade matcher" value={gamesPlayed} subtitle="denna säsong" />
          </div>
          <div onClick={() => navigate('/games')} className="cursor-pointer">
            <StatCard
              title="Vinstprocent"
              value={gamesPlayed > 0 ? `${Math.round((gamesWon / gamesPlayed) * 100)}%` : 'N/A'}
              subtitle={`${gamesWon}V ${gamesPlayed - gamesWon}F`}
              variant="success"
            />
          </div>
          <div onClick={() => navigate('/training')} className="cursor-pointer">
            <StatCard title="Träningar" value={sessions.length} subtitle="planerade" />
          </div>
        </div>

        {/* Priority row */}
        <div className="grid lg:grid-cols-4 gap-4 mb-4">
          {nextTraining && (
            <NextTrainingCard
              session={nextTraining}
              playerCount={nextTraining.playerIds.length}
            />
          )}
          {upcomingGame && <NextGameCard game={upcomingGame} />}
          <WeeklyFocusCard 
            focus={focus} 
            notes={notes}
            onFocusChange={saveFocus}
            onNotesChange={saveNotes}
          />
          <TeamRPECard ratings={allRPERatings} players={players} />
        </div>

        {/* Secondary row */}
        <div className="grid lg:grid-cols-3 gap-4">
          {lastPlayedGame && <LastGameCard game={lastPlayedGame} />}
          <RPEAlertsCard
            ratings={allRPERatings}
            players={players}
            onPlayerClick={(player) => navigate(`/team/${player.id}`)}
          />
          <PlayerAlerts players={players} onPlayerClick={(player) => navigate(`/team/${player.id}`)} />
        </div>
      </div>
    </AppLayout>
  );
}
