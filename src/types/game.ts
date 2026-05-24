// Game-specific types for live tracking

export type GameStatus = 'Not Started' | 'Live' | 'Finished';
export type Period = '1' | '2' | '3' | 'OT';
export type LineType = '5v5' | 'PP' | 'PK' | '6v5' | '5v6';
export type EventType = 'goal' | 'shot_on_goal' | 'shot_off_goal' | 'shot_blocked' | 'penalty';
export type Team = 'home' | 'opponent';
export type GameSituation = '5v5' | '5v4' | '4v5' | '6v5' | '5v6' | 'PS';

export interface GameMedia {
  id: string;
  type: 'image' | 'video';
  url: string;
  name: string;
}

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
  situation: GameSituation; // Game situation when event occurred
  lineId?: string; // Only for home team
  playerId?: string; // For player-level attribution (goal scorer, penalty taker)
  blockedByPlayerId?: string; // For blocked shot attribution
  assistPlayerIds?: string[]; // For goal assists (0-2 players)
  onIcePlayerIds?: string[]; // Snapshot of players on ice when event occurred
  goalieId?: string; // Snapshot of active goalie when event occurred
  timestamp: number;
}

export interface PenaltyEvent {
  id: string;
  gameId: string;
  team: Team;
  period: Period;
  playerId?: string; // Player who took the penalty
  duration: number; // In minutes (2 for now)
  timestamp: number;
  endTimestamp?: number; // When penalty ends (optional for tracking)
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
  assists: number; // NEW
  shotsOnGoal: number;
  shotsOffGoal: number;
  shotsBlocked: number; // Shots this player took that got blocked by opponent
  defensiveBlocks: number; // Opponent shots this player blocked
  penalties: number; // Number of 2-min penalties (NEW)
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

export interface SpecialTeamsStats {
  situation: '5v4' | '4v5';
  goalsFor: number;
  goalsAgainst: number;
  shotsOnGoal: number;
  shotsOffGoal: number;
  shotsBlocked: number;
  opportunities: number; // Number of power plays or box plays
}

export interface EnhancedGame {
  id: string;
  date: string;
  opponent: string;
  location: 'Home' | 'Away';
  status: GameStatus;
  ourScore: number;
  opponentScore: number;
  
  // Tags/categories for filtering (e.g. "Serie", "Cup", "Träningsmatch")
  categories?: string[];

  // Pre-game setup
  squadPlayerIds: string[];
  lines: GameLine[];
  startingGoalieId?: string; // Starting goalie
  
  // Live tracking
  currentPeriod: Period;
  currentSituation: GameSituation;
  activeLineId?: string;
  activeGoalieId?: string; // Current goalie (can change during game)
  events: GameEvent[];
  penalties: PenaltyEvent[];
  
  // Player stats (post-game editable)
  playerStats?: PlayerGameStats[];
  
  // Post-game notes
  notes?: {
    whatWorked: string;
    whatDidnt: string;
    focusNextWeek: string;
  };

  // Post-game media (photos/videos)
  mediaFiles?: GameMedia[];
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
    categories: [],
    squadPlayerIds: [],
    lines: createDefaultLines(),
    startingGoalieId: undefined,
    currentPeriod: '1',
    currentSituation: '5v5',
    activeLineId: undefined,
    activeGoalieId: undefined,
    events: [],
    penalties: [],
    playerStats: [],
  };
}

// Create empty player stats
export function createEmptyPlayerStats(playerId: string): PlayerGameStats {
  return {
    playerId,
    goals: 0,
    assists: 0,
    shotsOnGoal: 0,
    shotsOffGoal: 0,
    shotsBlocked: 0,
    defensiveBlocks: 0,
    penalties: 0,
  };
}

// Get situation label for display
export function getSituationLabel(situation: GameSituation): string {
  const labels: Record<GameSituation, string> = {
    '5v5': 'Even Strength',
    '5v4': 'Power Play',
    '4v5': 'Box Play',
    '6v5': '6v5 (ENG)',
    '5v6': '5v6 (ENG)',
    'PS': 'Penalty Shot',
  };
  return labels[situation];
}
