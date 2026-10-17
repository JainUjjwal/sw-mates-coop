/**
 * Circle Feed View Component
 * Renders weekly streak flame, wager card, member contribution progress bars, and photo feed
 */
import { formatFriendlyDate } from '../services/date-utils.js';

export class FeedViewComponent {
  constructor({ container, onNudgeMember, onOpenLogModal }) {
    this.container = container;
    this.onNudgeMember = onNudgeMember;
    this.onOpenLogModal = onOpenLogModal;
  }

  render({ circleStatus, members, profiles, logs, currentUserId }) {
    const isWagerAtRisk = !circleStatus.allMembersMetTarget;

    this.container.innerHTML = `
      <!-- Weekly Streak & Team Status Banner -->
      <section class="p-4 rounded-3xl bg-gradient-to-br from-slate-800/80 to-slate-900 border border-slate-700 shadow-lg space-y-3">
        <div class="flex justify-between items-center">
          <div>
            <span class="text-xs font-semibold uppercase tracking-wider text-orange-400">Cooperative Goal</span>
            <h2 class="text-xl font-black text-white flex items-center space-x-2">
              <span>Weekly Streak</span>
              <span class="px-2 py-0.5 text-xs bg-orange-500/20 text-orange-400 border border-orange-500/40 rounded-full font-bold">
                🔥 ${circleStatus.weeklyStreak} Weeks
              </span>
            </h2>
          </div>
          <div class="text-right">
            <span class="text-2xl font-black ${isWagerAtRisk ? 'text-amber-400' : 'text-emerald-400'}">
              ${circleStatus.totalDaysLogged}/${circleStatus.totalTargetDays}
            </span>
            <p class="text-[11px] text-slate-400">Squad Target Days</p>
          </div>
        </div>

        <!-- Weekly Wager Card -->
        <div class="p-3 rounded-2xl ${isWagerAtRisk ? 'bg-amber-950/40 border border-amber-600/40' : 'bg-emerald-950/30 border border-emerald-600/30'} flex items-start space-x-2.5">
          <span class="text-xl">🤝</span>
          <div class="text-xs">
            <p class="font-bold text-slate-200">Weekly Stakes / Wager</p>
            <p class="text-slate-300 mt-0.5">${circleStatus.wagerDescription}</p>
            ${isWagerAtRisk ? `
              <p class="mt-1 font-semibold text-amber-400">
                ⚠️ At risk: ${circleStatus.atRiskMembers.map(m => {
                  const p = profiles.find(pr => pr.id === m.userId);
                  return p ? p.name.split(' ')[0] : m.userId;
                }).join(', ')} behind pace!
              </p>
            ` : `
              <p class="mt-1 font-semibold text-emerald-400">✅ All members currently on track!</p>
            `}
          </div>
        </div>
      </section>

      <!-- Member Weekly Contribution Cards (with Overcompletion glow & Nudge) -->
      <section class="space-y-2.5">
        <div class="flex justify-between items-center px-1">
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400">Member Weekly Contribution</h3>
          <span class="text-[11px] text-slate-500">Target per week</span>
        </div>

        ${circleStatus.memberProgress.map(progress => {
          const profile = profiles.find(p => p.id === progress.userId) || { name: 'Teammate', avatar: '' };
          const isMe = progress.userId === currentUserId;
          const isOverkill = progress.isOvercompleted;
          const isBehind = !progress.metTarget;

          return `
            <div class="p-3 rounded-2xl bg-slate-900 border ${isOverkill ? 'border-orange-500/70 overkill-glow' : 'border-slate-800'} flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <img src="${profile.avatar}" alt="${profile.name}" class="w-10 h-10 rounded-full object-cover border ${isOverkill ? 'border-orange-500' : 'border-slate-700'}">
                <div>
                  <div class="flex items-center space-x-1.5">
                    <span class="text-sm font-bold text-white">${profile.name}</span>
                    ${isMe ? '<span class="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded font-semibold">You</span>' : ''}
                  </div>
                  <p class="text-xs text-slate-400 mt-0.5">
                    <span class="font-extrabold ${isOverkill ? 'text-orange-400' : 'text-slate-200'}">
                      ${progress.daysLogged}/${progress.targetDays} Days
                    </span>
                    ${isOverkill ? `
                      <span class="ml-1 text-[11px] font-bold text-orange-400 bg-orange-500/20 px-1.5 py-0.5 rounded-full">
                        🔥 +${progress.bonusDays} Bonus (+${progress.bonusDays * 200} XP)
                      </span>
                    ` : ''}
                  </p>
                </div>
              </div>

              <div>
                ${isBehind && !isMe ? `
                  <button class="btn-nudge px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 text-xs font-bold rounded-xl transition" data-user-id="${progress.userId}">
                    ⚡ Nudge
                  </button>
                ` : isOverkill ? `
                  <span class="text-xs font-black text-orange-400 flex items-center space-x-1">
                    <span>MVP</span>
                  </span>
                ` : `
                  <span class="text-xs text-emerald-400 font-bold">
                    ${progress.metTarget ? '✅ Done' : '🏃 In Progress'}
                  </span>
                `}
              </div>
            </div>
          `;
        }).join('')}
      </section>

      <!-- Circle Activity / Photo Feed -->
      <section class="space-y-3 pt-2">
        <div class="flex justify-between items-center px-1">
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400">Recent Proof Feed</h3>
          <span class="text-xs text-slate-500">${logs.length} Posts</span>
        </div>

        ${logs.length === 0 ? `
          <div class="p-8 text-center bg-slate-900/60 rounded-3xl border border-dashed border-slate-800 space-y-3">
            <span class="text-4xl">📸</span>
            <p class="text-sm text-slate-400 font-medium">No photos logged yet this week.</p>
            <button id="btn-feed-snap-empty" class="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition">
              Snap Today's Workout or Meal
            </button>
          </div>
        ` : logs.map(log => {
          const author = profiles.find(p => p.id === log.userId) || { name: 'Member', avatar: '' };
          const telemetry = log.telemetry || null;

          return `
            <div class="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-md">
              <div class="p-3 flex items-center justify-between border-b border-slate-800/80">
                <div class="flex items-center space-x-2.5">
                  <img src="${author.avatar}" alt="${author.name}" class="w-8 h-8 rounded-full object-cover">
                  <div>
                    <p class="text-xs font-bold text-white">${author.name}</p>
                    <p class="text-[11px] text-slate-400">${formatFriendlyDate(log.dateKey)} · ${log.type === 'workout' ? '🏋️ Workout' : '🥗 Meal'}</p>
                  </div>
                </div>
                <div class="flex items-center space-x-1.5">
                  <span class="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
                    ✓ Verified
                  </span>
                  <button class="btn-report-post text-slate-500 hover:text-rose-400 p-1 text-xs" data-log-id="${log.id}" title="Report or Block">
                    🚩
                  </button>
                </div>
              </div>

              <!-- Photo with SweatCam Health Overlay Stamp -->
              <div class="relative w-full aspect-square bg-slate-950">
                <img src="${log.photoUrl}" alt="Proof" class="w-full h-full object-cover">
                
                ${telemetry ? `
                  <div class="absolute bottom-3 inset-x-3 p-2.5 rounded-2xl sweatcam-stamp-badge border border-white/10 flex justify-between items-center text-white text-xs">
                    <div class="flex items-center space-x-1.5">
                      <span class="text-base">⌚</span>
                      <div>
                        <p class="font-extrabold leading-none">${telemetry.provider}</p>
                        <p class="text-[10px] text-slate-300 leading-none mt-0.5">${telemetry.activeKcal} kcal · ${telemetry.workoutMins}m</p>
                      </div>
                    </div>
                    <div class="text-right">
                      <span class="font-black text-orange-400 text-sm leading-none">${telemetry.steps.toLocaleString()}</span>
                      <p class="text-[10px] text-slate-300 leading-none mt-0.5">steps · ${telemetry.avgHeartRate} bpm</p>
                    </div>
                  </div>
                ` : ''}
              </div>

              ${log.caption ? `
                <div class="p-3 text-xs text-slate-300">
                  <span class="font-bold text-white">${author.name.split(' ')[0]}:</span> ${log.caption}
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}
      </section>
    `;

    // Event handlers
    const emptySnapBtn = this.container.querySelector('#btn-feed-snap-empty');
    if (emptySnapBtn) {
      emptySnapBtn.addEventListener('click', () => this.onOpenLogModal());
    }

    this.container.querySelectorAll('.btn-nudge').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const userId = e.currentTarget.getAttribute('data-user-id');
        this.onNudgeMember(userId);
      });
    });

    this.container.querySelectorAll('.btn-report-post').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const logId = e.currentTarget.getAttribute('data-log-id');
        const action = confirm('Safety & Moderation:\n\nDo you want to report this post for inappropriate content and hide it from your feed?');
        if (action) {
          const card = e.currentTarget.closest('.rounded-3xl');
          if (card) {
            card.innerHTML = '<div class="p-4 text-center text-xs text-slate-500 bg-slate-950/80 rounded-2xl">🚩 Post reported and hidden from your feed.</div>';
          }
        }
      });
    });
  }
}
