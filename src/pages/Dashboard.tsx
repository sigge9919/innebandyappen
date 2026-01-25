import { AppLayout } from '@/components/layout/AppLayout';
import { NextGameCard } from '@/components/dashboard/NextGameCard';
import { LastGameCard } from '@/components/dashboard/LastGameCard';
import { NextTrainingCard } from '@/components/dashboard/NextTrainingCard';
import { PlayerAlerts } from '@/components/dashboard/PlayerAlerts';
import { WeeklyFocusCard } from '@/components/dashboard/WeeklyFocusCard';
import { StatCard } from '@/components/dashboard/StatCard';
import { usePlayers, useGames, useTrainingSessions, useWeeklyFocus, useCoachNotes } from '@/hooks/useLocalStorage';
import { useAuth } from '@/contexts/AuthContext';
import { Users, Trophy, Calendar as CalendarIcon } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const { players } = usePlayers();
  const { games } = useGames();
  const { sessions } = useTrainingSessions();
  const { focus } = useWeeklyFocus();
  const { notes } = useCoachNotes();

  const upcomingGame = games.find(g => g.status === 'Upcoming');
  const lastPlayedGame = games.filter(g => g.status === 'Played')[0];
  const nextTraining = sessions[0];
  
  const activePlayers = players.filter(p => p.status === 'Active').length;
  const gamesPlayed = games.filter(g => g.status === 'Played').length;
  const gamesWon = games.filter(g => g.status === 'Played' && (g.ourScore ?? 0) > (g.opponentScore ?? 0)).length;

  return (
    <AppLayout>
      <div className="page-container">
        {/* Header */}
        <div className="section-header">
          <div>
            <h1 className="section-title">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome back, {user?.name || 'Coach'}</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Active Players"
            value={activePlayers}
            subtitle={`of ${players.length} total`}
            icon={Users}
          />
          <StatCard
            title="Games Played"
            value={gamesPlayed}
            subtitle="this season"
            icon={Trophy}
          />
          <StatCard
            title="Win Rate"
            value={gamesPlayed > 0 ? `${Math.round((gamesWon / gamesPlayed) * 100)}%` : 'N/A'}
            subtitle={`${gamesWon} wins`}
            variant="success"
          />
          <StatCard
            title="Sessions"
            value={sessions.length}
            subtitle="upcoming"
            icon={CalendarIcon}
          />
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
            <WeeklyFocusCard focus={focus} notes={notes} />
          </div>

          {/* Right Column - Alerts */}
          <div className="space-y-6">
            <PlayerAlerts players={players} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
