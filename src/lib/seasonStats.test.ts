import { describe, it, expect } from 'vitest';
import { getFinishedGames, aggregatePlayerStats, aggregateTeamStats, aggregateGoalieStats } from './seasonStats';
import { EnhancedGame, GameEvent } from '@/types/game';
import { Player } from '@/types';

function makePlayer(overrides: Partial<Player>): Player {
  return {
    id: 'p1',
    name: 'Test Player',
    positions: ['Forward'],
    stickSide: 'Left',
    jerseyNumber: 9,
    status: 'Active',
    notes: '',
    focusFlag: false,
    ...overrides,
  };
}

function makeGame(overrides: Partial<EnhancedGame>): EnhancedGame {
  return {
    id: crypto.randomUUID(),
    date: '2026-01-01',
    opponent: 'Rivals IBK',
    location: 'Home',
    status: 'Finished',
    ourScore: 0,
    opponentScore: 0,
    squadPlayerIds: [],
    lines: [],
    currentPeriod: '1',
    currentSituation: '5v5',
    events: [],
    penalties: [],
    playerStats: [],
    ...overrides,
  };
}

function makeEvent(overrides: Partial<GameEvent>): GameEvent {
  return {
    id: crypto.randomUUID(),
    gameId: 'game-1',
    type: 'goal',
    team: 'home',
    period: '1',
    situation: '5v5',
    timestamp: Date.now(),
    ...overrides,
  };
}

describe('getFinishedGames', () => {
  it('excludes games that are not finished and sorts newest first', () => {
    const games = [
      makeGame({ id: 'a', date: '2026-01-01', status: 'Finished' }),
      makeGame({ id: 'b', date: '2026-03-01', status: 'Finished' }),
      makeGame({ id: 'c', date: '2026-02-01', status: 'Not Started' }),
    ];
    expect(getFinishedGames(games).map(g => g.id)).toEqual(['b', 'a']);
  });

  it('limits to the last N games when requested', () => {
    const games = [
      makeGame({ id: 'a', date: '2026-01-01' }),
      makeGame({ id: 'b', date: '2026-02-01' }),
      makeGame({ id: 'c', date: '2026-03-01' }),
    ];
    expect(getFinishedGames(games, 2).map(g => g.id)).toEqual(['c', 'b']);
  });
});

describe('aggregatePlayerStats', () => {
  it('only counts games a player was actually in the squad for', () => {
    const players = [makePlayer({ id: 'p1' })];
    const games = [
      makeGame({
        squadPlayerIds: ['p1'],
        events: [makeEvent({ type: 'goal', team: 'home', playerId: 'p1' })],
      }),
      makeGame({
        squadPlayerIds: [], // p1 was not selected for this game
        events: [makeEvent({ type: 'goal', team: 'home', playerId: 'p1' })],
      }),
    ];
    const stats = aggregatePlayerStats(games, players);
    expect(stats).toHaveLength(1);
    expect(stats[0].gamesPlayed).toBe(1);
    expect(stats[0].goals).toBe(1);
  });

  it('excludes players who never played a game', () => {
    const players = [makePlayer({ id: 'p1' }), makePlayer({ id: 'benched', name: 'Benched' })];
    const games = [makeGame({ squadPlayerIds: ['p1'], events: [] })];
    const stats = aggregatePlayerStats(games, players);
    expect(stats.map(s => s.playerId)).toEqual(['p1']);
  });

  it('combines event-derived stats with manually entered shot stats', () => {
    const players = [makePlayer({ id: 'p1' })];
    const games = [
      makeGame({
        squadPlayerIds: ['p1'],
        events: [makeEvent({ type: 'goal', team: 'home', playerId: 'p1' })],
        playerStats: [
          { playerId: 'p1', goals: 0, assists: 0, shotsOnGoal: 3, shotsOffGoal: 1, shotsBlocked: 0, defensiveBlocks: 0, penalties: 0 },
        ],
      }),
    ];
    const stats = aggregatePlayerStats(games, players);
    expect(stats[0].shotsOnGoal).toBe(3);
    expect(stats[0].totalShots).toBe(4);
    expect(stats[0].shotOnGoalPct).toBeCloseTo(75);
  });

  it('sorts by points then goals, descending', () => {
    const players = [makePlayer({ id: 'p1' }), makePlayer({ id: 'p2' })];
    const games = [
      makeGame({
        squadPlayerIds: ['p1', 'p2'],
        events: [
          makeEvent({ type: 'goal', team: 'home', playerId: 'p1' }),
          makeEvent({ type: 'goal', team: 'home', playerId: 'p2', assistPlayerIds: [] }),
          makeEvent({ type: 'goal', team: 'home', playerId: 'p2' }),
        ],
      }),
    ];
    const stats = aggregatePlayerStats(games, players);
    expect(stats.map(s => s.playerId)).toEqual(['p2', 'p1']);
  });
});

describe('aggregateTeamStats', () => {
  it('sums goals and shots across games and derives percentages', () => {
    const games = [
      makeGame({ events: [makeEvent({ type: 'goal', team: 'home' }), makeEvent({ type: 'shot_off_goal', team: 'home' })] }),
      makeGame({ events: [makeEvent({ type: 'shot_on_goal', team: 'home' })] }),
    ];
    const stats = aggregateTeamStats(games, 'home');
    expect(stats.gamesPlayed).toBe(2);
    expect(stats.goals).toBe(1);
    expect(stats.shotsOnGoal).toBe(2); // goal counts as SOG + explicit shot_on_goal
    expect(stats.totalShots).toBe(3);
    expect(stats.shotOnGoalPct).toBeCloseTo((2 / 3) * 100);
  });

  it('returns zeroed percentages when there are no shots', () => {
    const stats = aggregateTeamStats([makeGame({})], 'home');
    expect(stats.shotOnGoalPct).toBe(0);
    expect(stats.shotBlockedPct).toBe(0);
  });
});

describe('aggregateGoalieStats', () => {
  it('computes save percentage from opponent shots faced', () => {
    const goalies = [makePlayer({ id: 'g1', name: 'Goalie', positions: ['Goalkeeper'] })];
    const games = [
      makeGame({
        startingGoalieId: 'g1',
        events: [
          makeEvent({ type: 'shot_on_goal', team: 'opponent', goalieId: 'g1' }),
          makeEvent({ type: 'shot_on_goal', team: 'opponent', goalieId: 'g1' }),
          makeEvent({ type: 'goal', team: 'opponent', goalieId: 'g1' }),
          makeEvent({ type: 'shot_on_goal', team: 'home' }), // our own shots don't count against the goalie
        ],
      }),
    ];
    const stats = aggregateGoalieStats(games, goalies);
    expect(stats[0].shotsAgainst).toBe(3);
    expect(stats[0].goalsAgainst).toBe(1);
    expect(stats[0].savePercentage).toBeCloseTo((2 / 3) * 100);
  });

  it('excludes goalies who never appeared in a game', () => {
    const goalies = [makePlayer({ id: 'g1' }), makePlayer({ id: 'g2', name: 'Bench Goalie' })];
    const games = [makeGame({ startingGoalieId: 'g1', events: [] })];
    expect(aggregateGoalieStats(games, goalies).map(s => s.playerId)).toEqual(['g1']);
  });
});
