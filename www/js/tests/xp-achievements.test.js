import { TestRunner, assert, assertEqual } from './test-runner.js';
import { XpAchievementsEngine, BADGES_CATALOG } from '../services/xp-achievements.js';

export async function runXpAchievementsTests() {
  const runner = new TestRunner('XP & Achievements Unit Tests');

  runner.test('calculateLevel determines accurate level and progress percentage', () => {
    // 650 XP -> Level 3 (500 base, 150/250 = 60%)
    const lvl = XpAchievementsEngine.calculateLevel(650);
    assertEqual(lvl.level, 3);
    assertEqual(lvl.progressInLevel, 150);
    assertEqual(lvl.percentToNext, 60);
  });

  runner.test('calculateLogReward awards extra XP for Dual-Log and Overcompletion', () => {
    // Regular log
    const base = XpAchievementsEngine.calculateLogReward({ isWorkout: true });
    assertEqual(base.earnedXp, 100);

    // Overcompletion day (+200 XP bonus)
    const overkill = XpAchievementsEngine.calculateLogReward({ isWorkout: true, isOvercompletionDay: true });
    assertEqual(overkill.earnedXp, 300);

    // Dual-log bonus (+50 XP)
    const dual = XpAchievementsEngine.calculateLogReward({ isWorkout: false, hadPriorLogToday: true });
    assertEqual(dual.earnedXp, 150);
  });

  runner.test('evaluateBadges unlocks Overachiever badge on target exceed', () => {
    const mockLogs = [
      { dateKey: '2026-10-12', type: 'workout' },
      { dateKey: '2026-10-13', type: 'workout' },
      { dateKey: '2026-10-14', type: 'workout' },
      { dateKey: '2026-10-15', type: 'meal' } // 4 days on a 3-day target
    ];
    const userCircles = [{
      id: 'c1',
      weeklyStreak: 2,
      members: [{ id: 'user_me', weeklyTargetDays: 3 }]
    }];

    const badges = XpAchievementsEngine.evaluateBadges({
      allLogs: mockLogs,
      userCircles,
      totalXp: 400,
      hasSyncedWatch: true
    });

    assert(badges.includes('first_sweat'), 'Has first_sweat');
    assert(badges.includes('wearable_synced'), 'Has wearable_synced');
    assert(badges.includes('overachiever'), 'Has overachiever');
  });

  return runner.run();
}
