// Season statistics aggregation utilities
import { EnhancedGame, GameSituation, TeamStats, PlayerGameStats } from '@/types/game';
import { calculateTeamStats, calculatePlayerStatsFromEvents, CalculatedPlayerStats } from './gameStorage';
import { Player } from '@/types';

export interface AggregatedPlayerStats {
  playerId: string;
  playerName: string;
  jerseyNumber: number;
  position: string;
  gamesPlayed: number;
  goals: number;
  assists: number;
  points: number;
  shotsOnGoal: number;
  shotsOffGoal: number;
  shotsBlocked: number;
  totalShots: number;
  shotOnGoalPct: number; // SOG / Total shots
  shotBlockedPct: number; // Blocked / Total shots
  defensiveBlocks: number;
  penaltyMinutes: number;
  plusMinus5v5: number;
}

export interface AggregatedTeamStats {
  team: 'home' | 'opponent';
  gamesPlayed: number;
  goals: number;
  shotsOnGoal: number;
  shotsOffGoal: number;
  shotsBlocked: number;
  totalShots: number;
  shotOnGoalPct: number;
  shotBlockedPct: number;
}

export interface SituationStats {
  situation: GameSituation;
  home: AggregatedTeamStats;
  opponent: AggregatedTeamStats;
  opportunities?: number;
}

// Get finished games, optionally limited to last N
export function getFinishedGames(games: EnhancedGame[], lastN?: number): EnhancedGame[] {
  const finished = games
    .filter(g => g.status === 'Finished')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  return lastN ? finished.slice(0, lastN) : finished;
}

// Aggregate player stats across multiple games
export function aggregatePlayerStats(
  games: EnhancedGame[],
  players: Player[]
): AggregatedPlayerStats[] {
  const statsMap = new Map<string, AggregatedPlayerStats>();
  
  // Initialize for all players
  players.forEach(player => {
    statsMap.set(player.id, {
      playerId: player.id,
      playerName: player.name,
      jerseyNumber: player.jerseyNumber,
      position: player.positions?.join('/') || 'Unknown',
      gamesPlayed: 0,
      goals: 0,
      assists: 0,
      points: 0,
      shotsOnGoal: 0,
      shotsOffGoal: 0,
      shotsBlocked: 0,
      totalShots: 0,
      shotOnGoalPct: 0,
      shotBlockedPct: 0,
      defensiveBlocks: 0,
      penaltyMinutes: 0,
      plusMinus5v5: 0,
    });
  });
  
  // Aggregate from each game
  games.forEach(game => {
    const playerStats = calculatePlayerStatsFromEvents(
      game.events,
      game.penalties || [],
      game.lines,
      game.squadPlayerIds
    );
    
    // Get manual player stats from game
    const manualStats = game.playerStats || [];
    
    playerStats.forEach(ps => {
      const existing = statsMap.get(ps.playerId);
      if (existing) {
        // Check if player was in squad for this game
        if (game.squadPlayerIds.includes(ps.playerId)) {
          existing.gamesPlayed += 1;
        }
        
        existing.goals += ps.goals;
        existing.assists += ps.assists;
        existing.plusMinus5v5 += ps.plusMinus5v5;
        existing.penaltyMinutes += ps.penaltyMinutes;
        existing.defensiveBlocks += ps.shotsBlocked;
        
        // Get manual shot stats
        const manual = manualStats.find(m => m.playerId === ps.playerId);
        if (manual) {
          existing.shotsOnGoal += manual.shotsOnGoal;
          existing.shotsOffGoal += manual.shotsOffGoal;
          existing.shotsBlocked += manual.shotsBlocked;
        }
      }
    });
  });
  
  // Calculate percentages and totals
  statsMap.forEach(stat => {
    stat.points = stat.goals + stat.assists;
    stat.totalShots = stat.shotsOnGoal + stat.shotsOffGoal + stat.shotsBlocked;
    stat.shotOnGoalPct = stat.totalShots > 0 ? (stat.shotsOnGoal / stat.totalShots) * 100 : 0;
    stat.shotBlockedPct = stat.totalShots > 0 ? (stat.shotsBlocked / stat.totalShots) * 100 : 0;
  });
  
  // Filter to players who played at least one game and sort by points
  return Array.from(statsMap.values())
    .filter(s => s.gamesPlayed > 0)
    .sort((a, b) => b.points - a.points || b.goals - a.goals);
}

// Aggregate team stats across multiple games
export function aggregateTeamStats(
  games: EnhancedGame[],
  team: 'home' | 'opponent',
  situation?: GameSituation
): AggregatedTeamStats {
  let totalGoals = 0;
  let totalSOG = 0;
  let totalSOff = 0;
  let totalBlocked = 0;
  
  games.forEach(game => {
    const stats = calculateTeamStats(game.events, team, undefined, situation);
    totalGoals += stats.goals;
    totalSOG += stats.shotsOnGoal;
    totalSOff += stats.shotsOffGoal;
    totalBlocked += stats.shotsBlocked;
  });
  
  const totalShots = totalSOG + totalSOff + totalBlocked;
  
  return {
    team,
    gamesPlayed: games.length,
    goals: totalGoals,
    shotsOnGoal: totalSOG,
    shotsOffGoal: totalSOff,
    shotsBlocked: totalBlocked,
    totalShots,
    shotOnGoalPct: totalShots > 0 ? (totalSOG / totalShots) * 100 : 0,
    shotBlockedPct: totalShots > 0 ? (totalBlocked / totalShots) * 100 : 0,
  };
}

// Get stats for all situations
export function getAllSituationStats(games: EnhancedGame[]): SituationStats[] {
  const situations: GameSituation[] = ['5v5', '5v4', '4v5', '6v5', '5v6'];
  
  return situations.map(situation => {
    const home = aggregateTeamStats(games, 'home', situation);
    const opponent = aggregateTeamStats(games, 'opponent', situation);
    
    // Count opportunities for special teams
    let opportunities = 0;
    if (situation === '5v4') {
      games.forEach(g => {
        opportunities += (g.penalties || []).filter(p => p.team === 'opponent').length;
      });
    } else if (situation === '4v5') {
      games.forEach(g => {
        opportunities += (g.penalties || []).filter(p => p.team === 'home').length;
      });
    }
    
    return {
      situation,
      home,
      opponent,
      opportunities: ['5v4', '4v5'].includes(situation) ? opportunities : undefined,
    };
  });
}

// Aggregate goalie stats across games
export interface AggregatedGoalieStats {
  playerId: string;
  playerName: string;
  jerseyNumber: number;
  gamesPlayed: number;
  goalsAgainst: number;
  shotsAgainst: number;
  savePercentage: number;
}

export function aggregateGoalieStats(
  games: EnhancedGame[],
  goalies: Player[]
): AggregatedGoalieStats[] {
  const statsMap = new Map<string, AggregatedGoalieStats>();
  
  goalies.forEach(goalie => {
    statsMap.set(goalie.id, {
      playerId: goalie.id,
      playerName: goalie.name,
      jerseyNumber: goalie.jerseyNumber,
      gamesPlayed: 0,
      goalsAgainst: 0,
      shotsAgainst: 0,
      savePercentage: 0,
    });
  });
  
  games.forEach(game => {
    // Count the starting goalie and any active goalie
    const goalieIds = new Set<string>();
    if (game.startingGoalieId) goalieIds.add(game.startingGoalieId);
    if (game.activeGoalieId) goalieIds.add(game.activeGoalieId);
    
    // For simplicity, attribute all stats to the starting goalie
    // (A more advanced system would track goalie changes mid-game)
    const goalieId = game.startingGoalieId;
    if (goalieId && statsMap.has(goalieId)) {
      const stats = statsMap.get(goalieId)!;
      stats.gamesPlayed += 1;
      
      // Calculate opponent shots and goals from events
      const oppStats = calculateTeamStats(game.events, 'opponent');
      stats.goalsAgainst += oppStats.goals;
      stats.shotsAgainst += oppStats.shotsOnGoal;
    }
  });
  
  // Calculate save percentage
  statsMap.forEach(stat => {
    if (stat.shotsAgainst > 0) {
      const saves = stat.shotsAgainst - stat.goalsAgainst;
      stat.savePercentage = (saves / stat.shotsAgainst) * 100;
    }
  });
  
  return Array.from(statsMap.values())
    .filter(s => s.gamesPlayed > 0)
    .sort((a, b) => b.savePercentage - a.savePercentage);
}
