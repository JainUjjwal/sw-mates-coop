import { TestRunner, assert, assertEqual } from './test-runner.js';
import { StreakEngine } from '../services/streak-engine.js';

export async function runStreakEngineTests() {
  const runner = new TestRunner('Streak Engine & Overcompletion Unit Tests');

  const mockLogs = [
    { id: '1', userId: 'user_me', dateKey: '2026-10-12', type: 'workout' },
    { id: '2', userId: 'user_me', dateKey: '2026-10-13', type: 'meal' },
    { id: '3', userId: 'user_me', dateKey: '2026-10-14', type: 'workout' },
    { id: '4', userId: 'user_me', dateKey: '2026-10-15', type: 'workout' },
    { id: '5', userId: 'user_me', dateKey: '2026-10-16', type: 'meal' }, // 5 unique days
    { id: '6', userId: 'user_sam', dateKey: '2026-10-12', type: 'workout' },
    { id: '7', userId: 'user_sam', dateKey: '2026-10-13', type: 'workout' } // 2 unique days
  ];

  runner.test('computeMemberWeeklyContribution calculates overcompletion accurately', () => {
    // Target is 3, logged is 5 -> 5/3, bonusDays = 2, isOvercompleted = true
    const member = { id: 'user_me', weeklyTargetDays: 3 };
    const result = StreakEngine.computeMemberWeeklyContribution(member, mockLogs, new Date('2026-10-16'));

    assertEqual(result.daysLogged, 5);
    assertEqual(result.targetDays, 3);
    assertEqual(result.metTarget, true);
    assertEqual(result.bonusDays, 2);
    assertEqual(result.isOvercompleted, true);
  });

  runner.test('Circle weekly streak requires ALL members to hit target', () => {
    const circle = {
      id: 'c1',
      name: 'Iron Squad',
      weeklyStreak: 3,
      wager: 'Loser buys smoothies',
      members: [
        { id: 'user_me', weeklyTargetDays: 3 }, // 5 logged -> Met
        { id: 'user_sam', weeklyTargetDays: 3 }  // 2 logged -> Missed!
      ]
    };

    const status = StreakEngine.evaluateCircleWeeklyStatus(circle, mockLogs, new Date('2026-10-16'));

    assertEqual(status.allMembersMetTarget, false, 'Circle streak fails if any member missed');
    assertEqual(status.atRiskMembers.length, 1);
    assertEqual(status.atRiskMembers[0].userId, 'user_sam');
    assertEqual(status.wagerPenaltyAppliesTo[0], 'user_sam');
    assertEqual(status.overachievers[0].userId, 'user_me');
  });

  runner.test('getAffectedCirclesForUser fans out single log across all joined circles', () => {
    const circles = [
      { id: 'c1', members: [{ id: 'user_me' }, { id: 'user_sam' }] },
      { id: 'c2', members: [{ id: 'user_me' }, { id: 'user_taylor' }] },
      { id: 'c3', members: [{ id: 'user_sam' }, { id: 'user_jordan' }] }
    ];

    const affected = StreakEngine.getAffectedCirclesForUser(circles, 'user_me');
    assertEqual(affected.length, 2, 'user_me is in c1 and c2');
    assertEqual(affected[0].id, 'c1');
    assertEqual(affected[1].id, 'c2');
  });

  return runner.run();
}
