// Cloud-backed game storage utilities
// Pure calculation functions remain unchanged, storage functions use Supabase
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
import { supabase } from '@/integrations/supabase/client';

// DB row to EnhancedGame
export function dbToEnhancedGame(row: any): EnhancedGame {
  return {
    id: row.id,
    date: row.date,
    opponent: row.opponent,
    location: row.location ?? 'Home',
    status: row.status ?? 'Not Started',
    ourScore: row.our_score ?? 0,
    opponentScore: row.opponent_score ?? 0,
    squadPlayerIds: row.squad_player_ids ?? [],
    lines: row.lines ?? [],
    startingGoalieId: row.starting_goalie_id,
    currentPeriod: row.current_period ?? '1',
    currentSituation: row.current_situation ?? '5v5',
    activeLineId: row.active_line_id,
    activeGoalieId: row.active_goalie_id,
    events: row.events ?? [],
    penalties: row.penalties ?? [],
    playerStats: row.player_stats ?? [],
    notes: row.notes,
    mediaFiles: row.media_files ?? [],
  };
}

export function enhancedGameToDb(g: EnhancedGame, teamId: string) {
  return {
    id: g.id,
    team_id: teamId,
    date: g.date,
    opponent: g.opponent,
    location: g.location,
    status: g.status,
    our_score: g.ourScore,
    opponent_score: g.opponentScore,
    squad_player_ids: g.squadPlayerIds,
    lines: g.lines as any,
    starting_goalie_id: g.startingGoalieId,
    current_period: g.currentPeriod,
    current_situation: g.currentSituation,
    active_line_id: g.activeLineId,
    active_goalie_id: g.activeGoalieId,
    events: g.events as any,
    penalties: g.penalties as any,
    player_stats: g.playerStats as any,
    notes: g.notes as any,
    media_files: (g.mediaFiles ?? []) as any,
  };
}

export function enhancedGameUpdatesToDb(u: Partial<EnhancedGame>) {
  const r: any = {};
  if (u.date !== undefined) r.date = u.date;
  if (u.opponent !== undefined) r.opponent = u.opponent;
  if (u.location !== undefined) r.location = u.location;
  if (u.status !== undefined) r.status = u.status;
  if (u.ourScore !== undefined) r.our_score = u.ourScore;
  if (u.opponentScore !== undefined) r.opponent_score = u.opponentScore;
  if (u.squadPlayerIds !== undefined) r.squad_player_ids = u.squadPlayerIds;
  if (u.lines !== undefined) r.lines = u.lines;
  if (u.startingGoalieId !== undefined) r.starting_goalie_id = u.startingGoalieId;
  if (u.currentPeriod !== undefined) r.current_period = u.currentPeriod;
  if (u.currentSituation !== undefined) r.current_situation = u.currentSituation;
  if (u.activeLineId !== undefined) r.active_line_id = u.activeLineId;
  if (u.activeGoalieId !== undefined) r.active_goalie_id = u.activeGoalieId;
  if (u.events !== undefined) r.events = u.events;
  if (u.penalties !== undefined) r.penalties = u.penalties;
  if (u.playerStats !== undefined) r.player_stats = u.playerStats;
  if (u.notes !== undefined) r.notes = u.notes;
  if (u.mediaFiles !== undefined) r.media_files = u.mediaFiles;
  return r;
}

// ===== Pure calculation functions (unchanged) =====

export function calculateTeamStats(
  events: GameEvent[], team: Team, period?: Period, situation?: GameSituation
): TeamStats {
  let filteredEvents = events.filter(e => e.team === team && e.type !== 'penalty');
  if (period) filteredEvents = filteredEvents.filter(e => e.period === period);
  if (situation) filteredEvents = filteredEvents.filter(e => e.situation === situation);
  return {
    shotsOnGoal: filteredEvents.filter(e => e.type === 'shot_on_goal' || e.type === 'goal').length,
    shotsOffGoal: filteredEvents.filter(e => e.type === 'shot_off_goal').length,
    shotsBlocked: filteredEvents.filter(e => e.type === 'shot_blocked').length,
    goals: filteredEvents.filter(e => e.type === 'goal').length,
  };
}

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

export function calculateLineStatsByPeriod(events: GameEvent[], lines: GameLine[], period: Period): LineStats[] {
  return calculateLineStats(events.filter(e => e.period === period), lines);
}

export function calculateSpecialTeamsStats(
  events: GameEvent[], penalties: PenaltyEvent[], team: Team
): { powerPlay: SpecialTeamsStats; boxPlay: SpecialTeamsStats } {
  const ppEvents = events.filter(e => e.situation === '5v4');
  const ppOpportunities = penalties.filter(p => p.team === 'opponent').length;
  const powerPlay: SpecialTeamsStats = {
    situation: '5v4',
    goalsFor: ppEvents.filter(e => e.type === 'goal' && e.team === 'home').length,
    goalsAgainst: ppEvents.filter(e => e.type === 'goal' && e.team === 'opponent').length,
    shotsOnGoal: ppEvents.filter(e => (e.type === 'shot_on_goal' || e.type === 'goal') && e.team === 'home').length,
    shotsOffGoal: ppEvents.filter(e => e.type === 'shot_off_goal' && e.team === 'home').length,
    shotsBlocked: ppEvents.filter(e => e.type === 'shot_blocked' && e.team === 'home').length,
    opportunities: ppOpportunities,
  };

  const bpEvents = events.filter(e => e.situation === '4v5');
  const bpOpportunities = penalties.filter(p => p.team === 'home').length;
  const boxPlay: SpecialTeamsStats = {
    situation: '4v5',
    goalsFor: bpEvents.filter(e => e.type === 'goal' && e.team === 'home').length,
    goalsAgainst: bpEvents.filter(e => e.type === 'goal' && e.team === 'opponent').length,
    shotsOnGoal: bpEvents.filter(e => (e.type === 'shot_on_goal' || e.type === 'goal') && e.team === 'home').length,
    shotsOffGoal: bpEvents.filter(e => e.type === 'shot_off_goal' && e.team === 'home').length,
    shotsBlocked: bpEvents.filter(e => e.type === 'shot_blocked' && e.team === 'home').length,
    opportunities: bpOpportunities,
  };
  return { powerPlay, boxPlay };
}

export interface CalculatedPlayerStats {
  playerId: string;
  goals: number;
  assists: number;
  shotsOnGoal: number;
  shotsOffGoal: number;
  shotsBlocked: number;
  penaltyMinutes: number;
  plusMinus5v5: number;
}

export function calculatePlayerStatsFromEvents(
  events: GameEvent[], penalties: PenaltyEvent[], lines: GameLine[], squadPlayerIds: string[]
): CalculatedPlayerStats[] {
  const statsMap = new Map<string, CalculatedPlayerStats>();
  squadPlayerIds.forEach(playerId => {
    statsMap.set(playerId, { playerId, goals: 0, assists: 0, shotsOnGoal: 0, shotsOffGoal: 0, shotsBlocked: 0, penaltyMinutes: 0, plusMinus5v5: 0 });
  });

  events.filter(e => e.type === 'goal' && e.team === 'home').forEach(event => {
    if (event.playerId && statsMap.has(event.playerId)) {
      statsMap.get(event.playerId)!.goals += 1;
    }
    event.assistPlayerIds?.forEach(id => { if (statsMap.has(id)) statsMap.get(id)!.assists += 1; });
  });

  events.filter(e => e.type === 'shot_blocked' && e.team === 'opponent').forEach(event => {
    if (event.blockedByPlayerId && statsMap.has(event.blockedByPlayerId)) statsMap.get(event.blockedByPlayerId)!.shotsBlocked += 1;
  });

  penalties.filter(p => p.team === 'home').forEach(penalty => {
    if (penalty.playerId && statsMap.has(penalty.playerId)) statsMap.get(penalty.playerId)!.penaltyMinutes += penalty.duration;
  });

  events.filter(e => e.type === 'goal' && e.situation === '5v5').forEach(event => {
    if (!event.lineId) return;
    const delta = event.team === 'home' ? 1 : -1;
    // Use snapshotted on-ice players if available, otherwise fall back to current line roster
    const playerIds = event.onIcePlayerIds || lines.find(l => l.id === event.lineId)?.playerIds || [];
    playerIds.forEach(id => { if (statsMap.has(id)) statsMap.get(id)!.plusMinus5v5 += delta; });
  });

  return Array.from(statsMap.values());
}

// ===== Deprecated localStorage wrappers (for backward compat during migration) =====
// These are now no-ops or delegate to in-memory game objects in useEnhancedGames

export function getEnhancedGames(): EnhancedGame[] { return []; }
export function saveEnhancedGames(_games: EnhancedGame[]): void {}
export function getEnhancedGame(_id: string): EnhancedGame | undefined { return undefined; }
export function addEnhancedGame(_game: EnhancedGame): void {}
export function updateEnhancedGame(_id: string, _updates: Partial<EnhancedGame>): void {}
export function deleteEnhancedGame(_id: string): void {}

export function addGameEvent(gameId: string, event: Omit<GameEvent, 'id' | 'gameId' | 'timestamp'>): string | undefined {
  return undefined;
}

export function addPenaltyEvent(gameId: string, penalty: Omit<PenaltyEvent, 'id' | 'gameId' | 'timestamp'>): void {}
export function undoLastEvent(gameId: string): GameEvent | undefined { return undefined; }

export function updatePlayerStats(gameId: string, playerId: string, field: keyof Omit<PlayerGameStats, 'playerId'>, value: number): void {}
export function assignBlockedShot(gameId: string, eventId: string, playerId: string): void {}
export function updateGoalDetails(gameId: string, eventId: string, scorerId?: string, assistPlayerIds?: string[]): void {}
export function assignPenaltyPlayer(gameId: string, penaltyId: string, playerId: string): void {}
export function updatePeriodTeamStats(gameId: string, team: Team, period: Period, statType: keyof TeamStats, newValue: number): void {}
