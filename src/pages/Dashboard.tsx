import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { NextGameCard } from '@/components/dashboard/NextGameCard';
import { LastGameCard } from '@/components/dashboard/LastGameCard';
import { NextTrainingCard } from '@/components/dashboard/NextTrainingCard';
import { PlayerAlerts } from '@/components/dashboard/PlayerAlerts';
import { WeeklyFocusCard } from '@/components/dashboard/WeeklyFocusCard';
import { StatCard } from '@/components/dashboard/StatCard';
import { usePlayers, useTrainingSessions, useWeeklyFocus, useCoachNotes } from '@/hooks/useLocalStorage';
import { useEnhancedGames } from '@/hooks/useEnhancedGames';
import { Users, Trophy, Calendar as CalendarIcon } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { players } = usePlayers();
  const { games } = useEnhancedGames();
  const { sessions } = useTrainingSessions();
  const { focus, saveFocus } = useWeeklyFocus();
  const { notes, saveNotes } = useCoachNotes();

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
        {/* Header */}
        <div className="section-header">
          <div>
            <h1 className="section-title">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome back, Coach</p>
          </div>
        </div>

        {/* Quick Stats - Clickable */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div onClick={() => navigate('/team')} className="cursor-pointer">
            <StatCard
              title="Active Players"
              value={activePlayers}
              subtitle={`of ${players.length} total`}
              icon={Users}
            />
          </div>
          <div onClick={() => navigate('/games')} className="cursor-pointer">
            <StatCard
              title="Games Played"
              value={gamesPlayed}
              subtitle="this season"
              icon={Trophy}
            />
          </div>
          <div onClick={() => navigate('/games')} className="cursor-pointer">
            <StatCard
              title="Win Rate"
              value={gamesPlayed > 0 ? `${Math.round((gamesWon / gamesPlayed) * 100)}%` : 'N/A'}
              subtitle={`${gamesWon} wins`}
              variant="success"
            />
          </div>
          <div onClick={() => navigate('/training')} className="cursor-pointer">
            <StatCard
              title="Sessions"
              value={sessions.length}
              subtitle="upcoming"
              icon={CalendarIcon}
            />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Games */}
          <div className="space-y-6">
            {upcomingGame && <NextGameCard game={upcomingGame} />}
            {lastPlayedGame && <LastGameCard game={lastPlayedGame} />}
          </div>

          {/* Middle Column - Training & Focus */}
          <div className="space-y-6">
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

          {/* Right Column - Alerts */}
          <div className="space-y-6">
            <PlayerAlerts players={players} onPlayerClick={(player) => navigate(`/team/${player.id}`)} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
