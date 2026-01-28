// Game-specific storage utilities
import { EnhancedGame, GameEvent, GameLine, Period, Team, EventType, createEmptyTeamStats, TeamStats, LineStats, PeriodStats } from '@/types/game';

const STORAGE_KEY = 'coachOS_enhancedGames';

// Get all enhanced games
export function getEnhancedGames(): EnhancedGame[] {
  try {
    const item = localStorage.getItem(STORAGE_KEY);
    return item ? JSON.parse(item) : [];
  } catch {
    return [];
  }
}

// Save all enhanced games
export function saveEnhancedGames(games: EnhancedGame[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
}

// Get a single game by ID
export function getEnhancedGame(id: string): EnhancedGame | undefined {
  return getEnhancedGames().find(g => g.id === id);
}

// Add a new game
export function addEnhancedGame(game: EnhancedGame): void {
  const games = getEnhancedGames();
  games.push(game);
  saveEnhancedGames(games);
}

// Update a game
export function updateEnhancedGame(id: string, updates: Partial<EnhancedGame>): void {
  const games = getEnhancedGames();
  const index = games.findIndex(g => g.id === id);
  if (index !== -1) {
    games[index] = { ...games[index], ...updates };
    saveEnhancedGames(games);
  }
}

// Delete a game
export function deleteEnhancedGame(id: string): void {
  const games = getEnhancedGames().filter(g => g.id !== id);
  saveEnhancedGames(games);
}

// Add an event to a game
export function addGameEvent(gameId: string, event: Omit<GameEvent, 'id' | 'gameId' | 'timestamp'>): void {
  const games = getEnhancedGames();
  const index = games.findIndex(g => g.id === gameId);
  if (index !== -1) {
    const newEvent: GameEvent = {
      ...event,
      id: crypto.randomUUID(),
      gameId,
      timestamp: Date.now(),
    };
    games[index].events.push(newEvent);
    
    // Update scores if it's a goal
    if (event.type === 'goal') {
      if (event.team === 'home') {
        games[index].ourScore += 1;
      } else {
        games[index].opponentScore += 1;
      }
    }
    
    saveEnhancedGames(games);
  }
}

// Remove last event (simple undo)
export function undoLastEvent(gameId: string): GameEvent | undefined {
  const games = getEnhancedGames();
  const index = games.findIndex(g => g.id === gameId);
  if (index !== -1 && games[index].events.length > 0) {
    const removedEvent = games[index].events.pop();
    
    // Revert score if it was a goal
    if (removedEvent && removedEvent.type === 'goal') {
      if (removedEvent.team === 'home') {
        games[index].ourScore = Math.max(0, games[index].ourScore - 1);
      } else {
        games[index].opponentScore = Math.max(0, games[index].opponentScore - 1);
      }
    }
    
    saveEnhancedGames(games);
    return removedEvent;
  }
  return undefined;
}

// Calculate stats for a specific period or all periods
export function calculateTeamStats(events: GameEvent[], team: Team, period?: Period): TeamStats {
  const filteredEvents = period 
    ? events.filter(e => e.team === team && e.period === period)
    : events.filter(e => e.team === team);
  
  return {
    shotsOnGoal: filteredEvents.filter(e => e.type === 'shot_on_goal' || e.type === 'goal').length,
    shotsOffGoal: filteredEvents.filter(e => e.type === 'shot_off_goal').length,
    shotsBlocked: filteredEvents.filter(e => e.type === 'shot_blocked').length,
    goals: filteredEvents.filter(e => e.type === 'goal').length,
  };
}

// Calculate period-by-period stats
export function calculatePeriodStats(events: GameEvent[]): PeriodStats[] {
  const periods: Period[] = ['1', '2', '3', 'OT'];
  return periods.map(period => ({
    period,
    home: calculateTeamStats(events, 'home', period),
    opponent: calculateTeamStats(events, 'opponent', period),
  })).filter(ps => 
    ps.home.goals > 0 || ps.opponent.goals > 0 || 
    ps.home.shotsOnGoal > 0 || ps.opponent.shotsOnGoal > 0
  );
}

// Calculate line stats
export function calculateLineStats(events: GameEvent[], lines: GameLine[]): LineStats[] {
  return lines.map(line => {
    const goalsFor = events.filter(e => e.type === 'goal' && e.team === 'home' && e.lineId === line.id).length;
    const goalsAgainst = events.filter(e => e.type === 'goal' && e.team === 'opponent' && e.lineId === line.id).length;
    
    return {
      lineId: line.id,
      lineName: line.name,
      goalsFor,
      goalsAgainst,
      plusMinus: goalsFor - goalsAgainst,
    };
  }).filter(ls => ls.goalsFor > 0 || ls.goalsAgainst > 0 || ls.plusMinus !== 0);
}

// Calculate line stats per period
export function calculateLineStatsByPeriod(events: GameEvent[], lines: GameLine[], period: Period): LineStats[] {
  const periodEvents = events.filter(e => e.period === period);
  return calculateLineStats(periodEvents, lines);
}
