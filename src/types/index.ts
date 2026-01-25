// Player types
export interface Player {
  id: string;
  name: string;
  position: 'Forward' | 'Defender' | 'Goalkeeper';
  stickSide: 'Left' | 'Right';
  jerseyNumber: number;
  status: 'Active' | 'Injured';
  notes: string;
  focusFlag: boolean;
}

// Game types
export interface Game {
  id: string;
  date: string;
  opponent: string;
  location: 'Home' | 'Away';
  status: 'Upcoming' | 'Played';
  ourScore?: number;
  opponentScore?: number;
  notes?: {
    whatWorked: string;
    whatDidnt: string;
    focusNextWeek: string;
  };
}

export interface PlayerGameStats {
  playerId: string;
  gameId: string;
  goals: number;
  assists: number;
  shots: number;
  plusMinus: number;
  penalties: number;
}

// Training types
export interface TrainingSession {
  id: string;
  date: string;
  theme: string;
  duration: number; // minutes
  playerIds: string[];
  sections: TrainingSection[];
}

export interface TrainingSection {
  type: 'Warm-up' | 'Main drills' | 'Game-like drills' | 'Cool-down';
  duration: number;
  drillIds: string[];
}

export interface Drill {
  id: string;
  name: string;
  description: string;
  categories: string[];
  videoUrl?: string;
}

// Playbook types
export interface Play {
  id: string;
  name: string;
  category: 'System' | 'Set Play' | 'Special Teams';
  diagramUrl?: string;
  keyPoints: string[];
  videoUrl?: string;
  tags: string[];
}

// Development types
export interface IndividualDevelopmentPlan {
  playerId: string;
  focusAreas: string[];
  shortTermGoals: string[];
  coachNotes: string;
  lastUpdated: string;
}

export interface TestResult {
  id: string;
  playerId: string;
  testType: 'Fitness' | 'Skill';
  testName: string;
  date: string;
  result: string;
  previousResult?: string;
  trend: 'up' | 'down' | 'same';
}

// Coach types
export type CoachRole = 'Head Coach' | 'Assistant Coach' | 'Stats Coach' | 'Viewer';

export interface Coach {
  id: string;
  email: string;
  name: string;
  role: CoachRole;
}

export interface Team {
  id: string;
  name: string;
  coaches: Coach[];
  players: Player[];
}
