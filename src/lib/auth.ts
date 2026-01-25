// Simple localStorage-based authentication
// NOTE: This is for demo purposes only - not secure for production

import { Coach, CoachRole } from '@/types';

const AUTH_KEYS = {
  currentUser: 'coachOS_currentUser',
  coaches: 'coachOS_coaches',
} as const;

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: CoachRole;
}

// Demo accounts - in a real app these would be in a database
const DEMO_COACHES: Coach[] = [
  { id: '1', email: 'head@team.com', name: 'Head Coach', role: 'Head Coach' },
  { id: '2', email: 'assistant@team.com', name: 'Assistant Coach', role: 'Assistant Coach' },
  { id: '3', email: 'stats@team.com', name: 'Stats Coach', role: 'Stats Coach' },
  { id: '4', email: 'viewer@team.com', name: 'Team Viewer', role: 'Viewer' },
];

// Initialize demo coaches if not present
function initializeCoaches(): void {
  if (!localStorage.getItem(AUTH_KEYS.coaches)) {
    localStorage.setItem(AUTH_KEYS.coaches, JSON.stringify(DEMO_COACHES));
  }
}

export function getCoaches(): Coach[] {
  initializeCoaches();
  try {
    const coaches = localStorage.getItem(AUTH_KEYS.coaches);
    return coaches ? JSON.parse(coaches) : DEMO_COACHES;
  } catch {
    return DEMO_COACHES;
  }
}

export function getCurrentUser(): AuthUser | null {
  try {
    const user = localStorage.getItem(AUTH_KEYS.currentUser);
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

export function login(email: string, password: string): { success: boolean; user?: AuthUser; error?: string } {
  const coaches = getCoaches();
  const coach = coaches.find(c => c.email.toLowerCase() === email.toLowerCase());
  
  if (!coach) {
    return { success: false, error: 'No account found with this email' };
  }
  
  // For demo: password is "coach123" for all accounts
  if (password !== 'coach123') {
    return { success: false, error: 'Invalid password' };
  }
  
  const user: AuthUser = {
    id: coach.id,
    email: coach.email,
    name: coach.name,
    role: coach.role,
  };
  
  localStorage.setItem(AUTH_KEYS.currentUser, JSON.stringify(user));
  return { success: true, user };
}

export function logout(): void {
  localStorage.removeItem(AUTH_KEYS.currentUser);
}

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

// Permission helpers based on role
export function canEdit(user: AuthUser | null): boolean {
  if (!user) return false;
  return ['Head Coach', 'Assistant Coach', 'Stats Coach'].includes(user.role);
}

export function canEditTraining(user: AuthUser | null): boolean {
  if (!user) return false;
  return ['Head Coach', 'Assistant Coach'].includes(user.role);
}

export function canEditStats(user: AuthUser | null): boolean {
  if (!user) return false;
  return ['Head Coach', 'Stats Coach'].includes(user.role);
}

export function hasFullAccess(user: AuthUser | null): boolean {
  if (!user) return false;
  return user.role === 'Head Coach';
}
