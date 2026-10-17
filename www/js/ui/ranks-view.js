/**
 * Ranks, XP, and Achievements View Component
 * Displays level progression curve, XP breakdown (including Overkill bonus XP), and badges
 */
import { BADGES_CATALOG } from '../services/xp-achievements.js';

export class RanksViewComponent {
  constructor({ container }) {
    this.container = container;
  }

  render({ levelData, unlockedBadges, circleStatus }) {
    this.container.innerHTML = `
      <!-- User Level & XP Progression Card -->
      <section class="p-5 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700 shadow-xl space-y-4">
        <div class="flex justify-between items-center">
          <div>
            <span class="text-xs font-bold text-orange-400 uppercase tracking-wider">Level Progression</span>
            <h2 class="text-2xl font-black text-white">Level ${levelData.level} Achiever</h2>
          </div>
          <div class="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-2xl font-black text-orange-400 shadow-inner">
            ${levelData.level}
          </div>
        </div>

        <!-- Level Progress Bar -->
        <div class="space-y-1.5">
          <div class="flex justify-between text-xs font-semibold text-slate-300">
            <span>${levelData.totalXp} Total XP</span>
            <span>${levelData.percentToNext}% to Level ${levelData.level + 1}</span>
          </div>
          <div class="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div class="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-500" style="width: ${levelData.percentToNext}%"></div>
          </div>
          <p class="text-[10px] text-slate-400 text-right">${levelData.nextLevelTarget - levelData.totalXp} XP needed for next tier</p>
        </div>

        <!-- Overcompletion XP Reward Callout -->
        <div class="p-3 rounded-2xl bg-slate-950/80 border border-orange-500/30 flex items-center justify-between text-xs">
          <div>
            <p class="font-bold text-white flex items-center space-x-1">
              <span>🔥 Overcompletion Multiplier</span>
            </p>
            <p class="text-[11px] text-slate-400 mt-0.5">+200 Bonus XP per extra day beyond weekly target</p>
          </div>
          <span class="px-2.5 py-1 bg-orange-500/20 text-orange-400 font-extrabold rounded-lg text-xs border border-orange-500/40">
            2x XP
          </span>
        </div>
      </section>

      <!-- Achievement Badges Grid -->
      <section class="space-y-3 pt-1">
        <div class="flex justify-between items-center px-1">
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400">Achievements & Badges</h3>
          <span class="text-xs text-orange-400 font-bold">${unlockedBadges.length} / ${BADGES_CATALOG.length} Unlocked</span>
        </div>

        <div class="grid grid-cols-2 gap-2.5">
          ${BADGES_CATALOG.map(badge => {
            const isUnlocked = unlockedBadges.includes(badge.id);

            return `
              <div class="p-3 rounded-2xl border transition ${isUnlocked ? 'bg-slate-900 border-slate-700 shadow-sm' : 'bg-slate-950/60 border-slate-800/80 opacity-50'}">
                <div class="flex items-center space-x-2">
                  <span class="text-2xl">${badge.emoji}</span>
                  <div>
                    <p class="text-xs font-bold ${isUnlocked ? 'text-white' : 'text-slate-400'}">${badge.name}</p>
                    <span class="text-[9px] font-semibold px-1.5 py-0.2 rounded ${isUnlocked ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}">
                      ${isUnlocked ? 'Unlocked' : 'Locked'}
                    </span>
                  </div>
                </div>
                <p class="text-[10px] text-slate-400 mt-2 leading-tight">${badge.desc}</p>
              </div>
            `;
          }).join('')}
        </div>
      </section>
    `;
  }
}
