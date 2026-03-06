import { useAuth } from '@/contexts/AuthContext';
import { useTeam } from '@/contexts/TeamContext';
import Login from '@/pages/Login';
import TeamSetup from '@/pages/TeamSetup';
import PlayerPortal from '@/pages/PlayerPortal';
import { useLocation } from 'react-router-dom';

export function AppGuard({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { activeTeam, activeRole, loading: teamLoading } = useTeam();
  const location = useLocation();

  if (authLoading || (user && teamLoading)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center animate-pulse">
          <span className="text-primary-foreground font-bold text-xl">C</span>
        </div>
      </div>
    );
  }

  if (!user) return <Login />;
  if (!activeTeam && location.pathname !== '/team-setup') return <TeamSetup />;

  // Players get their own portal — they can't access coach pages
  if (activeRole === 'player' && location.pathname !== '/player-portal') {
    return <PlayerPortal />;
  }

  return <>{children}</>;
}
