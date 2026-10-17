/**
 * XP, Levels, and Badges Engine
 * 1. Base log XP: +100 XP
 * 2. Dual-Log bonus (workout + meal logged on same day): +50 XP
 * 3. Overcompletion bonus (logging extra days beyond weekly target): +200 XP per bonus day
 * 4. Level progression: 250 XP per level
 */

export const BADGES_CATALOG = [
  { id: 'first_sweat', name: 'First Sweat', emoji: '💧', desc: 'Log your very first workout or meal photo' },
  { id: 'wearable_synced', name: 'Synced Up', emoji: '⌚', desc: 'Sync health data from your watch or band' },
  { id: 'dual_fuel', name: 'Dual Fuel', emoji: '⚡', desc: 'Log both a workout AND a healthy meal on the same day' },
  { id: 'overachiever', name: 'Overachiever', emoji: '🔥', desc: 'Surpass your circle weekly target (+1 bonus day)' },
  { id: 'carry_the_boats', name: 'Carry the Boats', emoji: '🛶', desc: 'Overcomplete by +2 or more bonus days in a week' },
  { id: 'circle_pioneer', name: 'Circle Pioneer', emoji: '🛡️', desc: 'Maintain a cooperative team streak with your group' }
];

export class XpAchievementsEngine {
  /**
   * Computes user level from total XP
   * Level 1: 0-249, Level 2: 250-499, Level 3: 500-749, etc.
   */
  static calculateLevel(totalXp) {
    const level = Math.floor(totalXp / 250) + 1;
    const currentLevelBase = (level - 1) * 250;
    const nextLevelTarget = level * 250;
    const progressInLevel = totalXp - currentLevelBase;
    const percentToNext = Math.round((progressInLevel / 250) * 100);

    return {
      level,
      totalXp,
      progressInLevel,
      percentToNext,
      nextLevelTarget
    };
  }

  /**
   * Calculates XP earned for a check-in event
   */
  static calculateLogReward({ isWorkout = true, hadPriorLogToday = false, isOvercompletionDay = false }) {
    let earnedXp = 100; // Base daily log XP
    const reasons = ['Daily Check-in (+100 XP)'];

    if (hadPriorLogToday) {
      earnedXp += 50; // Dual-log bonus (both workout + meal logged today)
      reasons.push('Dual Fuel Bonus (+50 XP)');
    }

    if (isOvercompletionDay) {
      earnedXp += 200; // Overcompletion 2x bonus!
      reasons.push('Weekly Overcompletion Bonus (+200 XP)');
    }

    return { earnedXp, reasons };
  }

  /**
   * Evaluates which badges are unlocked given current state
   */
  static evaluateBadges({ allLogs = [], userCircles = [], totalXp = 0, hasSyncedWatch = false }) {
    const unlocked = new Set();

    if (allLogs.length > 0) unlocked.add('first_sweat');
    if (hasSyncedWatch) unlocked.add('wearable_synced');

    // Check for dual fuel (same date has both workout and meal)
    const logsByDate = {};
    for (const log of allLogs) {
      logsByDate[log.dateKey] = logsByDate[log.dateKey] || new Set();
      logsByDate[log.dateKey].add(log.type);
    }
    const hasDualFuel = Object.values(logsByDate).some(types => types.has('workout') && types.has('meal'));
    if (hasDualFuel) unlocked.add('dual_fuel');

    // Check for overachiever & carry the boats in any circle
    for (const circle of userCircles) {
      const me = circle.members.find(m => m.id === 'user_me');
      if (me) {
        const uniqueDays = new Set(allLogs.map(l => l.dateKey)).size;
        const target = me.weeklyTargetDays || 3;
        const bonus = Math.max(0, uniqueDays - target);
        if (bonus >= 1) unlocked.add('overachiever');
        if (bonus >= 2) unlocked.add('carry_the_boats');
      }
      if (circle.weeklyStreak > 0) unlocked.add('circle_pioneer');
    }

    return Array.from(unlocked);
  }
}
