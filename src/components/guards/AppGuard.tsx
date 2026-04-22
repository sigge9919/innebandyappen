import { useAuth } from '@/contexts/AuthContext';
import { useTeam } from '@/contexts/TeamContext';
import Login from '@/pages/Login';
import Landing from '@/pages/Landing';
import TeamSetup from '@/pages/TeamSetup';
import PlayerPortal from '@/pages/PlayerPortal';
import { useLocation, Navigate } from 'react-router-dom';
import { usePermissions, routeToSection } from '@/hooks/usePermissions';

export function AppGuard({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { activeTeam, activeRole, loading: teamLoading } = useTeam();
  const { canView, loading: permLoading } = usePermissions();
  const location = useLocation();

  if (authLoading || (user && teamLoading) || (user && activeTeam && permLoading)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center animate-pulse">
          <span className="text-primary-foreground font-bold text-xl">C</span>
        </div>
      </div>
    );
  }

  if (!user) {
    // Show landing page on root for unauthenticated visitors; Login on all other paths
    if (location.pathname === '/') return <Landing />;
    return <Login />;
  }
  if (!activeTeam && location.pathname !== '/team-setup') return <TeamSetup />;

  // Players get their own portal — they can't access coach pages
  if (activeRole === 'player' && location.pathname !== '/player-portal') {
    return <PlayerPortal />;
  }

  // Check section-level permissions for non-head-coach roles
  if (activeRole && activeRole !== 'head_coach') {
    const section = routeToSection(location.pathname);
    if (section && !canView(section)) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}
