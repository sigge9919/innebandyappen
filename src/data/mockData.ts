import { Player, Game, TrainingSession, Drill, Play } from '@/types';

export const mockPlayers: Player[] = [
  {
    id: '1',
    name: 'Erik Lindström',
    position: 'Forward',
    stickSide: 'Right',
    jerseyNumber: 7,
    status: 'Active',
    notes: 'Great speed, needs work on defensive positioning',
    focusFlag: true,
  },
  {
    id: '2',
    name: 'Oscar Nilsson',
    position: 'Forward',
    stickSide: 'Left',
    jerseyNumber: 11,
    status: 'Active',
    notes: 'Strong shooter, team captain',
    focusFlag: false,
  },
  {
    id: '3',
    name: 'Marcus Svensson',
    position: 'Defender',
    stickSide: 'Right',
    jerseyNumber: 4,
    status: 'Injured',
    notes: 'Ankle sprain - expected back in 2 weeks',
    focusFlag: false,
  },
  {
    id: '4',
    name: 'Johan Andersson',
    position: 'Goalkeeper',
    stickSide: 'Left',
    jerseyNumber: 1,
    status: 'Active',
    notes: 'Excellent reflexes, work on communication',
    focusFlag: false,
  },
  {
    id: '5',
    name: 'Viktor Holm',
    position: 'Defender',
    stickSide: 'Left',
    jerseyNumber: 21,
    status: 'Active',
    notes: 'Physical player, good in 1v1 situations',
    focusFlag: true,
  },
];

export const mockGames: Game[] = [
  {
    id: '1',
    date: '2026-02-01',
    opponent: 'Storvreta IBK',
    location: 'Home',
    status: 'Upcoming',
  },
  {
    id: '2',
    date: '2026-01-20',
    opponent: 'Falun IBK',
    location: 'Away',
    status: 'Played',
    ourScore: 5,
    opponentScore: 3,
    notes: {
      whatWorked: 'Transition game was excellent, quick breakouts led to 3 goals',
      whatDidnt: 'Powerplay struggled in first period, need more movement',
      focusNextWeek: 'Focus on special teams, particularly PP entries',
    },
  },
  {
    id: '3',
    date: '2026-01-15',
    opponent: 'Pixbo Wallenstam',
    location: 'Home',
    status: 'Played',
    ourScore: 2,
    opponentScore: 4,
    notes: {
      whatWorked: 'Defensive structure was solid for most of the game',
      whatDidnt: 'Third period collapse, gave up 3 goals in 5 minutes',
      focusNextWeek: 'Game management when protecting lead',
    },
  },
];

export const mockTrainingSessions: TrainingSession[] = [
  {
    id: '1',
    date: '2026-01-27',
    theme: 'Transitions',
    duration: 90,
    playerIds: ['1', '2', '4', '5'],
    sections: [
      { type: 'Warm-up', duration: 15, drillIds: ['1'] },
      { type: 'Main drills', duration: 40, drillIds: ['2', '3'] },
      { type: 'Game-like drills', duration: 25, drillIds: ['4'] },
      { type: 'Cool-down', duration: 10, drillIds: ['5'] },
    ],
  },
  {
    id: '2',
    date: '2026-01-30',
    theme: 'Defensive Positioning',
    duration: 75,
    playerIds: ['1', '2', '3', '4', '5'],
    sections: [
      { type: 'Warm-up', duration: 10, drillIds: ['1'] },
      { type: 'Main drills', duration: 35, drillIds: ['6', '7'] },
      { type: 'Game-like drills', duration: 20, drillIds: ['8'] },
      { type: 'Cool-down', duration: 10, drillIds: ['5'] },
    ],
  },
];

export const mockDrills: Drill[] = [
  {
    id: '1',
    name: 'Dynamic Stretching Circuit',
    description: 'Full body warm-up with dynamic movements',
    categories: ['Conditioning', 'Warm-up'],
  },
  {
    id: '2',
    name: '2v1 Breakout Drill',
    description: 'Practice quick transitions from defense to attack',
    categories: ['Tactics', 'Transitions'],
  },
  {
    id: '3',
    name: '3v2 Rush',
    description: 'Odd-man rush scenarios with focus on decision making',
    categories: ['Tactics', 'Skills'],
  },
  {
    id: '4',
    name: 'Full Ice Scrimmage',
    description: 'Game-like conditions with coach feedback',
    categories: ['Game Simulation'],
  },
  {
    id: '5',
    name: 'Static Stretching',
    description: 'Cool-down routine focusing on major muscle groups',
    categories: ['Recovery', 'Cool-down'],
  },
];

export const mockPlays: Play[] = [
  {
    id: '1',
    name: 'Box Powerplay',
    category: 'Special Teams',
    keyPoints: ['High slot control', 'Quick ball movement', 'One-timer option'],
    tags: ['PP', '5v4'],
  },
  {
    id: '2',
    name: 'Diamond Press',
    category: 'System',
    keyPoints: ['High pressure', 'Force to weak side', 'Quick recovery'],
    tags: ['Defense', 'Press', '5v5'],
  },
  {
    id: '3',
    name: 'Corner Breakout',
    category: 'Set Play',
    keyPoints: ['D-to-D option', 'Wall support', 'Quick outlet'],
    tags: ['5v5', 'Transition'],
  },
];

export const weeklyFocus = "Transition Speed & Special Teams";

export const coachNotes = "Great energy in practice this week. Keep pushing on the defensive details before Saturday's game.";
