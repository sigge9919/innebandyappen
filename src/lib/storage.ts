// localStorage persistence utilities
import { Player, Game, TrainingSession, Play, Drill } from '@/types';
import { mockPlayers, mockGames, mockTrainingSessions, mockDrills, mockPlays } from '@/data/mockData';

const STORAGE_KEYS = {
  players: 'coachOS_players',
  games: 'coachOS_games',
  trainingSessions: 'coachOS_trainingSessions',
  drills: 'coachOS_drills',
  plays: 'coachOS_plays',
  weeklyFocus: 'coachOS_weeklyFocus',
  coachNotes: 'coachOS_coachNotes',
  initialized: 'coachOS_initialized',
} as const;

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
