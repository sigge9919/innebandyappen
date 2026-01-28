// Game-specific types for live tracking

export type GameStatus = 'Not Started' | 'Live' | 'Finished';
export type Period = '1' | '2' | '3' | 'OT';
export type LineType = '5v5' | 'PP' | 'PK' | '6v5' | '5v6';
export type EventType = 'goal' | 'shot_on_goal' | 'shot_off_goal' | 'shot_blocked';
export type Team = 'home' | 'opponent';

export interface GameLine {
  id: string;
  name: string;
  type: LineType;
  playerIds: string[];
}

export interface GameEvent {
  id: string;
  gameId: string;
  type: EventType;
  team: Team;
  period: Period;
  lineId?: string; // Only for home team
  playerId?: string; // For player-level attribution
  blockedByPlayerId?: string; // For blocked shot attribution
  timestamp: number;
}

export interface TeamStats {
  shotsOnGoal: number;
  shotsOffGoal: number;
  shotsBlocked: number;
  goals: number;
}

export interface PlayerGameStats {
  playerId: string;
  goals: number;
  shotsOnGoal: number;
  shotsOffGoal: number;
  shotsBlocked: number; // Shots this player blocked (defensive)
}

export interface PeriodStats {
  period: Period;
  home: TeamStats;
  opponent: TeamStats;
}

export interface LineStats {
  lineId: string;
  lineName: string;
  goalsFor: number;
  goalsAgainst: number;
  plusMinus: number;
}

export interface LineStatsByPeriod extends LineStats {
  periodBreakdown: {
    period: Period;
    goalsFor: number;
    goalsAgainst: number;
    plusMinus: number;
  }[];
}

export interface EnhancedGame {
  id: string;
  date: string;
  opponent: string;
  location: 'Home' | 'Away';
  status: GameStatus;
  ourScore: number;
  opponentScore: number;
  
  // Pre-game setup
  squadPlayerIds: string[];
  lines: GameLine[];
  
  // Live tracking
  currentPeriod: Period;
  activeLineId?: string;
  events: GameEvent[];
  
  // Player stats (post-game editable)
  playerStats?: PlayerGameStats[];
  
  // Post-game notes
  notes?: {
    whatWorked: string;
    whatDidnt: string;
    focusNextWeek: string;
  };
}

// Helper to create empty team stats
export function createEmptyTeamStats(): TeamStats {
  return {
    shotsOnGoal: 0,
    shotsOffGoal: 0,
    shotsBlocked: 0,
    goals: 0,
  };
}

// Calculate total shots (derived, not editable)
export function getTotalShots(stats: TeamStats): number {
  return stats.shotsOnGoal + stats.shotsOffGoal + stats.shotsBlocked;
}

// Default lines template
export function createDefaultLines(): GameLine[] {
  return [
    { id: 'line-1', name: 'Line 1', type: '5v5', playerIds: [] },
    { id: 'line-2', name: 'Line 2', type: '5v5', playerIds: [] },
    { id: 'line-3', name: 'Line 3', type: '5v5', playerIds: [] },
    { id: 'pp-1', name: 'PP1', type: 'PP', playerIds: [] },
    { id: 'pp-2', name: 'PP2', type: 'PP', playerIds: [] },
    { id: 'pk-1', name: 'PK1', type: 'PK', playerIds: [] },
    { id: 'pk-2', name: 'PK2', type: 'PK', playerIds: [] },
    { id: '6v5', name: '6v5', type: '6v5', playerIds: [] },
    { id: '5v6', name: '5v6', type: '5v6', playerIds: [] },
  ];
}

// Create a new enhanced game
export function createEnhancedGame(opponent: string, date: string, location: 'Home' | 'Away'): EnhancedGame {
  return {
    id: crypto.randomUUID(),
    date,
    opponent,
    location,
    status: 'Not Started',
    ourScore: 0,
    opponentScore: 0,
    squadPlayerIds: [],
    lines: createDefaultLines(),
    currentPeriod: '1',
    events: [],
    playerStats: [],
  };
}

// Create empty player stats
export function createEmptyPlayerStats(playerId: string): PlayerGameStats {
  return {
    playerId,
    goals: 0,
    shotsOnGoal: 0,
    shotsOffGoal: 0,
    shotsBlocked: 0,
  };
}
