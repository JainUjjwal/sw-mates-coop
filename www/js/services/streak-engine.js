/**
 * Streak & Multi-Circle Progress Engine
 * 1. Log once, fan out progress to all circles the user belongs to.
 * 2. Weekly team streak requires EVERY member to hit their committed target.
 * 3. Overcompletion (e.g., 5/3 days) rewards +2 bonus days, 2x XP, without masking teammate misses.
 */
import { getWeekStartKey } from './date-utils.js';

export class StreakEngine {
  /**
   * Computes a single member's weekly contribution for a given circle
   */
  static computeMemberWeeklyContribution(member, allLogs, referenceDate = new Date()) {
    const weekStartKey = getWeekStartKey(referenceDate);

    // Count unique calendar days logged this week (either workout or meal)
    const uniqueDays = new Set(
      allLogs
        .filter(l => l.userId === member.id && l.dateKey >= weekStartKey)
        .map(l => l.dateKey)
    ).size;

    const targetDays = member.weeklyTargetDays || 3;
    const bonusDays = Math.max(0, uniqueDays - targetDays);
    const metTarget = uniqueDays >= targetDays;

    return {
      userId: member.id,
      daysLogged: uniqueDays,
      targetDays,
      metTarget,
      bonusDays, // e.g. 5 - 3 = 2
      isOvercompleted: bonusDays > 0,
      completionRate: Math.min(100, Math.round((uniqueDays / targetDays) * 100))
    };
  }

  /**
   * Evaluates whole-circle weekly streak status & wager safety
   */
  static evaluateCircleWeeklyStatus(circle, allLogs, referenceDate = new Date()) {
    const memberProgress = circle.members.map(member =>
      this.computeMemberWeeklyContribution(member, allLogs, referenceDate)
    );

    // The circle's weekly streak is safe ONLY if every member hit their target!
    const allMembersMetTarget = memberProgress.every(m => m.metTarget);
    const atRiskMembers = memberProgress.filter(m => !m.metTarget);
    const overachievers = memberProgress.filter(m => m.isOvercompleted);

    const totalDaysLogged = memberProgress.reduce((sum, m) => sum + m.daysLogged, 0);
    const totalTargetDays = memberProgress.reduce((sum, m) => sum + m.targetDays, 0);
    const totalBonusDays = memberProgress.reduce((sum, m) => sum + m.bonusDays, 0);

    return {
      circleId: circle.id,
      circleName: circle.name,
      inviteCode: circle.inviteCode || circle.id.slice(-6).toUpperCase(),
      weeklyStreak: circle.weeklyStreak,
      allMembersMetTarget,
      memberProgress,
      atRiskMembers,
      overachievers,
      totalDaysLogged,
      totalTargetDays,
      totalBonusDays,
      wagerPenaltyAppliesTo: atRiskMembers.map(m => m.userId),
      wagerDescription: circle.wager
    };
  }

  /**
   * Fans out a user's single photo log across all circles they belong to
   */
  static getAffectedCirclesForUser(circles, userId) {
    return circles.filter(c => c.members.some(m => m.id === userId));
  }
}
