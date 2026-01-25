import { AppLayout } from '@/components/layout/AppLayout';
import { NextGameCard } from '@/components/dashboard/NextGameCard';
import { LastGameCard } from '@/components/dashboard/LastGameCard';
import { NextTrainingCard } from '@/components/dashboard/NextTrainingCard';
import { PlayerAlerts } from '@/components/dashboard/PlayerAlerts';
import { WeeklyFocusCard } from '@/components/dashboard/WeeklyFocusCard';
import { StatCard } from '@/components/dashboard/StatCard';
import { mockPlayers, mockGames, mockTrainingSessions, weeklyFocus, coachNotes } from '@/data/mockData';
import { Users, Trophy, Calendar as CalendarIcon } from 'lucide-react';

export default function Dashboard() {
  const upcomingGame = mockGames.find(g => g.status === 'Upcoming');
  const lastPlayedGame = mockGames.filter(g => g.status === 'Played')[0];
  const nextTraining = mockTrainingSessions[0];
  
  const activePlayers = mockPlayers.filter(p => p.status === 'Active').length;
  const gamesPlayed = mockGames.filter(g => g.status === 'Played').length;
  const gamesWon = mockGames.filter(g => g.status === 'Played' && (g.ourScore ?? 0) > (g.opponentScore ?? 0)).length;

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

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Active Players"
            value={activePlayers}
            subtitle={`of ${mockPlayers.length} total`}
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
            value={mockTrainingSessions.length}
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
            <WeeklyFocusCard focus={weeklyFocus} notes={coachNotes} />
          </div>

          {/* Right Column - Alerts */}
          <div className="space-y-6">
            <PlayerAlerts players={mockPlayers} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
