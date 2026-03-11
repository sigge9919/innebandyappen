// Player types
export type PlayerPosition = 'Forward' | 'Center' | 'Defender' | 'Goalkeeper';

export interface Player {
  id: string;
  name: string;
  positions: PlayerPosition[];
  stickSide: 'Left' | 'Right';
  jerseyNumber: number;
  status: 'Active' | 'Injured';
  notes: string;
  focusFlag: boolean;
  userId?: string;
  inviteEmail?: string;
}

// RPE & Personal Training types
export interface PlayerRPERating {
  id: string;
  playerId: string;
  teamId: string;
  sessionType: 'game' | 'training';
  sessionId: string;
  rating: number;
  createdAt: string;
}

export interface PersonalTraining {
  id: string;
  playerId: string;
  teamId: string;
  date: string;
  description: string;
  duration: number;
  rpeRating: number;
  createdAt: string;
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
  teams?: TrainingTeam[];
}

export interface TrainingTeam {
  name: string;
  playerIds: string[];
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
  linkedLayoutIds?: string[];
  mediaFiles?: PlayMedia[];
  directVideoUrl?: string;
  thumbnailUrl?: string;
  mediaFetched?: boolean;
  isFavorite?: boolean;
}

// Playbook types
export const DEFAULT_PLAY_CATEGORIES = ['System', 'Set Play', 'Special Teams'] as const;

export interface Play {
  id: string;
  name: string;
  category: string;
  diagramUrl?: string;
  keyPoints: string[];
  videoUrl?: string;
  tags: string[];
  linkedLayoutIds?: string[]; // IDs of saved tactics board layouts
  mediaFiles?: PlayMedia[];
}

export interface PlayMedia {
  id: string;
  type: 'image' | 'video';
  url: string;
  name: string;
}

// Development types
export interface IndividualDevelopmentPlan {
  id: string;
  playerId: string;
  goal: string;
  startDate: string;
  endDate: string;
  focusAreas: string[];
  shortTermGoals: string[];
  coachNotes: string;
  completed?: boolean;
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


export interface Team {
  id: string;
  name: string;
  players: Player[];
}
