// localStorage persistence utilities
import { Player, Game, TrainingSession, Play, Drill, IndividualDevelopmentPlan, TestResult } from '@/types';
import { mockPlayers, mockGames, mockTrainingSessions, mockDrills, mockPlays } from '@/data/mockData';

const STORAGE_KEYS = {
  players: 'coachOS_players',
  games: 'coachOS_games',
  trainingSessions: 'coachOS_trainingSessions',
  drills: 'coachOS_drills',
  plays: 'coachOS_plays',
  idps: 'coachOS_idps',
  testResults: 'coachOS_testResults',
  weeklyFocus: 'coachOS_weeklyFocus',
  coachNotes: 'coachOS_coachNotes',
  initialized: 'coachOS_initialized',
} as const;

// Mock IDPs and Test Results
const mockIDPs: IndividualDevelopmentPlan[] = mockPlayers.slice(0, 3).map(player => ({
  playerId: player.id,
  focusAreas: ['Defensive positioning', 'Passing accuracy'],
  shortTermGoals: ['Improve stick work', 'Better communication'],
  coachNotes: 'Showing good progress in recent sessions',
  lastUpdated: '2026-01-20',
}));

const mockTestResults: TestResult[] = [
  { id: '1', playerId: '1', testType: 'Fitness', testName: 'Sprint Test', date: '2026-01-15', result: '4.2s', previousResult: '4.5s', trend: 'up' },
  { id: '2', playerId: '1', testType: 'Skill', testName: 'Shooting Accuracy', date: '2026-01-15', result: '85%', previousResult: '82%', trend: 'up' },
  { id: '3', playerId: '2', testType: 'Fitness', testName: 'Endurance Test', date: '2026-01-14', result: '12min', previousResult: '12min', trend: 'same' },
  { id: '4', playerId: '3', testType: 'Skill', testName: 'Passing Test', date: '2026-01-14', result: '72%', previousResult: '78%', trend: 'down' },
];

// Initialize storage with mock data if not already done
export function initializeStorage(): void {
  if (localStorage.getItem(STORAGE_KEYS.initialized)) {
    return;
  }

  localStorage.setItem(STORAGE_KEYS.players, JSON.stringify(mockPlayers));
  localStorage.setItem(STORAGE_KEYS.games, JSON.stringify(mockGames));
  localStorage.setItem(STORAGE_KEYS.trainingSessions, JSON.stringify(mockTrainingSessions));
  localStorage.setItem(STORAGE_KEYS.drills, JSON.stringify(mockDrills));
  localStorage.setItem(STORAGE_KEYS.plays, JSON.stringify(mockPlays));
  localStorage.setItem(STORAGE_KEYS.idps, JSON.stringify(mockIDPs));
  localStorage.setItem(STORAGE_KEYS.testResults, JSON.stringify(mockTestResults));
  localStorage.setItem(STORAGE_KEYS.weeklyFocus, 'Transition Speed & Special Teams');
  localStorage.setItem(STORAGE_KEYS.coachNotes, "Great energy in practice this week. Keep pushing on the defensive details before Saturday's game.");
  localStorage.setItem(STORAGE_KEYS.initialized, 'true');
}

// Generic get/set helpers
function getItem<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// Players
export function getPlayers(): Player[] {
  return getItem<Player[]>(STORAGE_KEYS.players, []);
}

export function savePlayers(players: Player[]): void {
  setItem(STORAGE_KEYS.players, players);
}

export function addPlayer(player: Player): void {
  const players = getPlayers();
  players.push(player);
  savePlayers(players);
}

export function updatePlayer(id: string, updates: Partial<Player>): void {
  const players = getPlayers();
  const index = players.findIndex(p => p.id === id);
  if (index !== -1) {
    players[index] = { ...players[index], ...updates };
    savePlayers(players);
  }
}

export function deletePlayer(id: string): void {
  const players = getPlayers().filter(p => p.id !== id);
  savePlayers(players);
}

// Games
export function getGames(): Game[] {
  return getItem<Game[]>(STORAGE_KEYS.games, []);
}

export function saveGames(games: Game[]): void {
  setItem(STORAGE_KEYS.games, games);
}

export function addGame(game: Game): void {
  const games = getGames();
  games.push(game);
  saveGames(games);
}

export function updateGame(id: string, updates: Partial<Game>): void {
  const games = getGames();
  const index = games.findIndex(g => g.id === id);
  if (index !== -1) {
    games[index] = { ...games[index], ...updates };
    saveGames(games);
  }
}

export function deleteGame(id: string): void {
  const games = getGames().filter(g => g.id !== id);
  saveGames(games);
}

// Training Sessions
export function getTrainingSessions(): TrainingSession[] {
  return getItem<TrainingSession[]>(STORAGE_KEYS.trainingSessions, []);
}

export function saveTrainingSessions(sessions: TrainingSession[]): void {
  setItem(STORAGE_KEYS.trainingSessions, sessions);
}

export function addTrainingSession(session: TrainingSession): void {
  const sessions = getTrainingSessions();
  sessions.push(session);
  saveTrainingSessions(sessions);
}

export function updateTrainingSession(id: string, updates: Partial<TrainingSession>): void {
  const sessions = getTrainingSessions();
  const index = sessions.findIndex(s => s.id === id);
  if (index !== -1) {
    sessions[index] = { ...sessions[index], ...updates };
    saveTrainingSessions(sessions);
  }
}

export function deleteTrainingSession(id: string): void {
  const sessions = getTrainingSessions().filter(s => s.id !== id);
  saveTrainingSessions(sessions);
}

// Drills
export function getDrills(): Drill[] {
  return getItem<Drill[]>(STORAGE_KEYS.drills, []);
}

export function saveDrills(drills: Drill[]): void {
  setItem(STORAGE_KEYS.drills, drills);
}

export function addDrill(drill: Drill): void {
  const drills = getDrills();
  drills.push(drill);
  saveDrills(drills);
}

export function updateDrill(id: string, updates: Partial<Drill>): void {
  const drills = getDrills();
  const index = drills.findIndex(d => d.id === id);
  if (index !== -1) {
    drills[index] = { ...drills[index], ...updates };
    saveDrills(drills);
  }
}

export function deleteDrill(id: string): void {
  const drills = getDrills().filter(d => d.id !== id);
  saveDrills(drills);
}

// Plays
export function getPlays(): Play[] {
  return getItem<Play[]>(STORAGE_KEYS.plays, []);
}

export function savePlays(plays: Play[]): void {
  setItem(STORAGE_KEYS.plays, plays);
}

export function addPlay(play: Play): void {
  const plays = getPlays();
  plays.push(play);
  savePlays(plays);
}

export function updatePlay(id: string, updates: Partial<Play>): void {
  const plays = getPlays();
  const index = plays.findIndex(p => p.id === id);
  if (index !== -1) {
    plays[index] = { ...plays[index], ...updates };
    savePlays(plays);
  }
}

export function deletePlay(id: string): void {
  const plays = getPlays().filter(p => p.id !== id);
  savePlays(plays);
}

// IDPs
export function getIDPs(): IndividualDevelopmentPlan[] {
  return getItem<IndividualDevelopmentPlan[]>(STORAGE_KEYS.idps, []);
}

export function saveIDPs(idps: IndividualDevelopmentPlan[]): void {
  setItem(STORAGE_KEYS.idps, idps);
}

export function addIDP(idp: IndividualDevelopmentPlan): void {
  const idps = getIDPs();
  idps.push(idp);
  saveIDPs(idps);
}

export function updateIDP(playerId: string, updates: Partial<IndividualDevelopmentPlan>): void {
  const idps = getIDPs();
  const index = idps.findIndex(i => i.playerId === playerId);
  if (index !== -1) {
    idps[index] = { ...idps[index], ...updates, lastUpdated: new Date().toISOString().split('T')[0] };
    saveIDPs(idps);
  }
}

export function deleteIDP(playerId: string): void {
  const idps = getIDPs().filter(i => i.playerId !== playerId);
  saveIDPs(idps);
}

// Test Results
export function getTestResults(): TestResult[] {
  return getItem<TestResult[]>(STORAGE_KEYS.testResults, []);
}

export function saveTestResults(tests: TestResult[]): void {
  setItem(STORAGE_KEYS.testResults, tests);
}

export function addTestResult(test: TestResult): void {
  const tests = getTestResults();
  tests.push(test);
  saveTestResults(tests);
}

export function updateTestResult(id: string, updates: Partial<TestResult>): void {
  const tests = getTestResults();
  const index = tests.findIndex(t => t.id === id);
  if (index !== -1) {
    tests[index] = { ...tests[index], ...updates };
    saveTestResults(tests);
  }
}

export function deleteTestResult(id: string): void {
  const tests = getTestResults().filter(t => t.id !== id);
  saveTestResults(tests);
}

// Weekly Focus & Coach Notes
export function getWeeklyFocus(): string {
  return localStorage.getItem(STORAGE_KEYS.weeklyFocus) || '';
}

export function saveWeeklyFocus(focus: string): void {
  localStorage.setItem(STORAGE_KEYS.weeklyFocus, focus);
}

export function getCoachNotes(): string {
  return localStorage.getItem(STORAGE_KEYS.coachNotes) || '';
}

export function saveCoachNotes(notes: string): void {
  localStorage.setItem(STORAGE_KEYS.coachNotes, notes);
}

// Reset to mock data
export function resetToMockData(): void {
  localStorage.removeItem(STORAGE_KEYS.initialized);
  initializeStorage();
}
