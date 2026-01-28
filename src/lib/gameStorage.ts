// Game-specific storage utilities
import { 
  EnhancedGame, 
  GameEvent, 
  GameLine, 
  Period, 
  Team, 
  EventType, 
  createEmptyTeamStats, 
  TeamStats, 
  LineStats, 
  PeriodStats, 
  PlayerGameStats, 
  createEmptyPlayerStats,
  GameSituation,
  PenaltyEvent,
  SpecialTeamsStats 
} from '@/types/game';

const STORAGE_KEY = 'coachOS_enhancedGames';

// Get all enhanced games
export function getEnhancedGames(): EnhancedGame[] {
  try {
    const item = localStorage.getItem(STORAGE_KEY);
    const games = item ? JSON.parse(item) : [];
    // Migration: add new fields if missing
    return games.map((g: EnhancedGame) => ({
      ...g,
      currentSituation: g.currentSituation || '5v5',
      penalties: g.penalties || [],
    }));
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
  const game = getEnhancedGames().find(g => g.id === id);
  if (game) {
    // Ensure new fields exist
    game.currentSituation = game.currentSituation || '5v5';
    game.penalties = game.penalties || [];
    // Ensure events have situation field
    game.events = game.events.map(e => ({
      ...e,
      situation: e.situation || '5v5',
    }));
  }
  return game;
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
export function addGameEvent(
  gameId: string, 
  event: Omit<GameEvent, 'id' | 'gameId' | 'timestamp'>
): void {
  const games = getEnhancedGames();
  const index = games.findIndex(g => g.id === gameId);
  if (index !== -1) {
    const newEvent: GameEvent = {
      ...event,
      id: crypto.randomUUID(),
      gameId,
      timestamp: Date.now(),
      situation: event.situation || games[index].currentSituation || '5v5',
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

// Add a penalty event
export function addPenaltyEvent(
  gameId: string,
  penalty: Omit<PenaltyEvent, 'id' | 'gameId' | 'timestamp'>
): void {
  const games = getEnhancedGames();
  const index = games.findIndex(g => g.id === gameId);
  if (index !== -1) {
    const newPenalty: PenaltyEvent = {
      ...penalty,
      id: crypto.randomUUID(),
      gameId,
      timestamp: Date.now(),
    };
    if (!games[index].penalties) {
      games[index].penalties = [];
    }
    games[index].penalties.push(newPenalty);
    
    // Auto-switch situation based on penalty
    if (penalty.team === 'home') {
      games[index].currentSituation = '4v5'; // We're shorthanded
    } else {
      games[index].currentSituation = '5v4'; // We have power play
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
export function calculateTeamStats(
  events: GameEvent[], 
  team: Team, 
  period?: Period,
  situation?: GameSituation
): TeamStats {
  let filteredEvents = events.filter(e => e.team === team && e.type !== 'penalty');
  
  if (period) {
    filteredEvents = filteredEvents.filter(e => e.period === period);
  }
  
  if (situation) {
    filteredEvents = filteredEvents.filter(e => e.situation === situation);
  }
  
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

// Calculate line stats (FIXED - includes special teams)
export function calculateLineStats(events: GameEvent[], lines: GameLine[]): LineStats[] {
  return lines.map(line => {
    // Goals scored while this line was on ice
    const goalsFor = events.filter(e => 
      e.type === 'goal' && 
      e.team === 'home' && 
      e.lineId === line.id
    ).length;
    
    // Goals conceded while this line was on ice
    const goalsAgainst = events.filter(e => 
      e.type === 'goal' && 
      e.team === 'opponent' && 
      e.lineId === line.id
    ).length;
    
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
export function calculateLineStatsByPeriod(
  events: GameEvent[], 
  lines: GameLine[], 
  period: Period
): LineStats[] {
  const periodEvents = events.filter(e => e.period === period);
  return calculateLineStats(periodEvents, lines);
}

// Calculate special teams stats
export function calculateSpecialTeamsStats(
  events: GameEvent[],
  penalties: PenaltyEvent[],
  team: Team
): { powerPlay: SpecialTeamsStats; boxPlay: SpecialTeamsStats } {
  // Power Play (5v4) - we have advantage
  const ppSituation: GameSituation = '5v4';
  const ppEvents = events.filter(e => e.situation === ppSituation);
  const ppOpportunities = penalties.filter(p => p.team === 'opponent').length;
  
  const powerPlay: SpecialTeamsStats = {
    situation: '5v4',
    goalsFor: ppEvents.filter(e => e.type === 'goal' && e.team === 'home').length,
    goalsAgainst: ppEvents.filter(e => e.type === 'goal' && e.team === 'opponent').length,
    shotsOnGoal: ppEvents.filter(e => 
      (e.type === 'shot_on_goal' || e.type === 'goal') && e.team === 'home'
    ).length,
    shotsOffGoal: ppEvents.filter(e => e.type === 'shot_off_goal' && e.team === 'home').length,
    shotsBlocked: ppEvents.filter(e => e.type === 'shot_blocked' && e.team === 'home').length,
    opportunities: ppOpportunities,
  };
  
  // Box Play (4v5) - we're shorthanded
  const bpSituation: GameSituation = '4v5';
  const bpEvents = events.filter(e => e.situation === bpSituation);
  const bpOpportunities = penalties.filter(p => p.team === 'home').length;
  
  const boxPlay: SpecialTeamsStats = {
    situation: '4v5',
    goalsFor: bpEvents.filter(e => e.type === 'goal' && e.team === 'home').length,
    goalsAgainst: bpEvents.filter(e => e.type === 'goal' && e.team === 'opponent').length,
    shotsOnGoal: bpEvents.filter(e => 
      (e.type === 'shot_on_goal' || e.type === 'goal') && e.team === 'home'
    ).length,
    shotsOffGoal: bpEvents.filter(e => e.type === 'shot_off_goal' && e.team === 'home').length,
    shotsBlocked: bpEvents.filter(e => e.type === 'shot_blocked' && e.team === 'home').length,
    opportunities: bpOpportunities,
  };
  
  return { powerPlay, boxPlay };
}

// Update player stats
export function updatePlayerStats(
  gameId: string, 
  playerId: string, 
  field: keyof Omit<PlayerGameStats, 'playerId'>, 
  value: number
): void {
  const games = getEnhancedGames();
  const index = games.findIndex(g => g.id === gameId);
  if (index !== -1) {
    const game = games[index];
    if (!game.playerStats) {
      game.playerStats = [];
    }
    
    const playerStatIndex = game.playerStats.findIndex(ps => ps.playerId === playerId);
    if (playerStatIndex !== -1) {
      game.playerStats[playerStatIndex][field] = value;
    } else {
      const newStats = createEmptyPlayerStats(playerId);
      newStats[field] = value;
      game.playerStats.push(newStats);
    }
    
    saveEnhancedGames(games);
  }
}

// Assign blocked shot to player
export function assignBlockedShot(gameId: string, eventId: string, playerId: string): void {
  const games = getEnhancedGames();
  const index = games.findIndex(g => g.id === gameId);
  if (index !== -1) {
    const eventIndex = games[index].events.findIndex(e => e.id === eventId);
    if (eventIndex !== -1) {
      games[index].events[eventIndex].blockedByPlayerId = playerId;
      saveEnhancedGames(games);
    }
  }
}

// Update goal details (scorer and assists)
export function updateGoalDetails(
  gameId: string, 
  eventId: string, 
  scorerId?: string, 
  assistPlayerIds?: string[]
): void {
  const games = getEnhancedGames();
  const index = games.findIndex(g => g.id === gameId);
  if (index !== -1) {
    const eventIndex = games[index].events.findIndex(e => e.id === eventId);
    if (eventIndex !== -1) {
      if (scorerId !== undefined) {
        games[index].events[eventIndex].playerId = scorerId;
      }
      if (assistPlayerIds !== undefined) {
        games[index].events[eventIndex].assistPlayerIds = assistPlayerIds.slice(0, 2);
      }
      saveEnhancedGames(games);
    }
  }
}

// Assign penalty to player
export function assignPenaltyPlayer(gameId: string, penaltyId: string, playerId: string): void {
  const games = getEnhancedGames();
  const index = games.findIndex(g => g.id === gameId);
  if (index !== -1) {
    const penaltyIndex = games[index].penalties?.findIndex(p => p.id === penaltyId);
    if (penaltyIndex !== undefined && penaltyIndex !== -1) {
      games[index].penalties[penaltyIndex].playerId = playerId;
      saveEnhancedGames(games);
    }
  }
}

// Update team stats for a specific period (post-game editing)
export function updatePeriodTeamStats(
  gameId: string, 
  team: Team, 
  period: Period, 
  statType: keyof TeamStats, 
  newValue: number
): void {
  const games = getEnhancedGames();
  const index = games.findIndex(g => g.id === gameId);
  if (index === -1) return;
  
  const game = games[index];
  const currentStats = calculateTeamStats(game.events, team, period);
  const currentValue = currentStats[statType];
  const diff = newValue - currentValue;
  
  if (diff === 0) return;
  
  // Map stat type to event type
  const eventTypeMap: Record<keyof TeamStats, EventType> = {
    goals: 'goal',
    shotsOnGoal: 'shot_on_goal',
    shotsOffGoal: 'shot_off_goal',
    shotsBlocked: 'shot_blocked',
  };
  
  const eventType = eventTypeMap[statType];
  
  if (diff > 0) {
    // Add events
    for (let i = 0; i < diff; i++) {
      const newEvent: GameEvent = {
        id: crypto.randomUUID(),
        gameId,
        type: eventType,
        team,
        period,
        situation: '5v5', // Default to 5v5 for manually added events
        timestamp: Date.now(),
      };
      game.events.push(newEvent);
      
      // Update score for goals
      if (eventType === 'goal') {
        if (team === 'home') {
          game.ourScore += 1;
        } else {
          game.opponentScore += 1;
        }
      }
    }
  } else {
    // Remove events
    const eventsToRemove = game.events
      .filter(e => e.type === eventType && e.team === team && e.period === period)
      .slice(0, Math.abs(diff));
    
    for (const event of eventsToRemove) {
      const eventIdx = game.events.findIndex(e => e.id === event.id);
      if (eventIdx !== -1) {
        game.events.splice(eventIdx, 1);
        
        // Update score for goals
        if (eventType === 'goal') {
          if (team === 'home') {
            game.ourScore = Math.max(0, game.ourScore - 1);
          } else {
            game.opponentScore = Math.max(0, game.opponentScore - 1);
          }
        }
      }
    }
  }
  
  saveEnhancedGames(games);
}
