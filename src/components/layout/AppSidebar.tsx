import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Trophy,
  BarChart3,
  Calendar,
  BookOpen,
  TrendingUp,
  PenTool,
  Menu,
  Settings,
  LogOut,
  ChevronDown,
  Check,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { useTeam, Team } from '@/contexts/TeamContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/team', icon: Users, label: 'Team' },
  { to: '/games', icon: Trophy, label: 'Games' },
  { to: '/stats', icon: BarChart3, label: 'Stats' },
  { to: '/training', icon: Calendar, label: 'Training' },
  { to: '/playbook', icon: BookOpen, label: 'Playbook' },
  { to: '/development', icon: TrendingUp, label: 'Development' },
  { to: '/tactics', icon: PenTool, label: 'Tactics Board' },
  { to: '/settings', icon: Settings, label: 'Team Settings' },
];

function NavItem({ to, icon: Icon, label, onClick }: { to: string; icon: React.ElementType; label: string; onClick?: () => void }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={cn(
        'nav-item',
        isActive && 'nav-item-active'
      )}
    >
      <Icon className="h-5 w-5" />
      <span className="font-medium">{label}</span>
    </NavLink>
  );
}

function TeamSwitcher() {
  const { teams, activeTeam, setActiveTeam } = useTeam();
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-sidebar-accent transition-colors group">
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center shrink-0">
            <span className="text-sidebar-primary-foreground font-bold text-sm">
              {activeTeam?.name?.[0]?.toUpperCase() ?? 'C'}
            </span>
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-sm font-semibold text-sidebar-foreground truncate">
              {activeTeam?.name ?? 'No team'}
            </p>
            <p className="text-xs text-sidebar-foreground/50">Switch team</p>
          </div>
          <ChevronDown className="h-4 w-4 text-sidebar-foreground/50 shrink-0 group-hover:text-sidebar-foreground transition-colors" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="bottom"
        align="start"
        className="w-56 bg-popover border border-border shadow-lg z-[200]"
      >
        {teams.map((team: Team) => (
          <DropdownMenuItem
            key={team.id}
            onClick={() => setActiveTeam(team)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="w-6 h-6 rounded bg-sidebar-primary flex items-center justify-center shrink-0">
              <span className="text-sidebar-primary-foreground font-bold text-xs">
                {team.name[0]?.toUpperCase()}
              </span>
            </div>
            <span className="flex-1 truncate">{team.name}</span>
            {activeTeam?.id === team.id && (
              <Check className="h-4 w-4 text-primary shrink-0" />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => navigate('/team-setup')}
          className="flex items-center gap-2 cursor-pointer text-muted-foreground"
        >
          <Plus className="h-4 w-4" />
          <span>Create new team</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { activeTeam } = useTeam();
  const { signOut } = useAuth();

  const SidebarContent = ({ onItemClick }: { onItemClick?: () => void }) => (
    <div className="flex flex-col h-full bg-sidebar">
      {/* Logo + Team Switcher */}
      <div className="p-4 border-b border-sidebar-border space-y-3">
        <div className="flex items-center gap-2 px-2">
          <div className="w-7 h-7 rounded-lg bg-sidebar-primary flex items-center justify-center shrink-0">
            <span className="text-sidebar-primary-foreground font-bold text-xs">C</span>
          </div>
          <h1 className="text-base font-bold text-sidebar-foreground">Coach OS</h1>
        </div>
        <TeamSwitcher />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavItem key={item.to} {...item} onClick={onItemClick} />
        ))}
      </nav>

      {/* Sign out */}
      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={signOut}
          className="nav-item w-full text-sidebar-foreground/50 hover:text-sidebar-foreground"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-sidebar-border bg-sidebar">
        <SidebarContent />
      </aside>

      {/* Mobile Header & Sidebar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-sidebar border-b border-sidebar-border">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-sidebar-primary flex items-center justify-center">
              <span className="text-sidebar-primary-foreground font-bold text-xs">C</span>
            </div>
            <span className="font-bold text-sidebar-foreground text-sm">
              {activeTeam?.name ?? 'Coach OS'}
            </span>
          </div>
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-sidebar-foreground">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 bg-sidebar border-sidebar-border">
              <SidebarContent onItemClick={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </>
  );
}
