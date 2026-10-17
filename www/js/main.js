/**
 * Application Bootstrap & State Controller
 * Wires storage, services, UI components, tab navigation, and live test harness
 */
import { db } from './storage/db.js';
import { seedDatabaseIfEmpty, SEED_CURRENT_USER_ID } from './storage/seed.js';
import { StreakEngine } from './services/streak-engine.js';
import { WatchSyncService } from './services/watch-sync.js';
import { XpAchievementsEngine } from './services/xp-achievements.js';
import { getLocalDateKey } from './services/date-utils.js';
import { cloudSync } from './services/cloud-sync.js';

import { CircleSwitcherComponent } from './ui/circle-switcher.js';
import { FeedViewComponent } from './ui/feed-view.js';
import { LogModalComponent } from './ui/log-modal.js';
import { WatchViewComponent } from './ui/watch-view.js';
import { RanksViewComponent } from './ui/ranks-view.js';
import { SettingsModalComponent } from './ui/settings-modal.js';

// Unit Test Suites
import { runDbTests } from './tests/db.test.js';
import { runDateUtilsTests } from './tests/date-utils.test.js';
import { runPhotoValidatorTests } from './tests/photo-validator.test.js';
import { runWatchSyncTests } from './tests/watch-sync.test.js';
import { runStreakEngineTests } from './tests/streak-engine.test.js';
import { runXpAchievementsTests } from './tests/xp-achievements.test.js';
import { runUiTests } from './tests/ui.test.js';

class SweatCircleApp {
  constructor() {
    this.currentUserId = SEED_CURRENT_USER_ID;
    this.activeCircleId = null;
    this.activeTab = 'feed';
    this.circles = [];
    this.profiles = [];
    this.logs = [];
    this.latestTelemetry = null;
    this.progression = { xp: 0, level: 1, badges: [] };

    this.viewport = document.getElementById('app-viewport');
    this.modalContainer = document.getElementById('modal-container');
    this.headerContainer = document.getElementById('circle-header-container');

    this.circleSwitcher = new CircleSwitcherComponent({
      container: this.headerContainer,
      onCircleChange: (circleId) => this.switchCircle(circleId),
      onMemberSwitch: (userId) => this.switchUser(userId),
      onNewCircle: () => this.promptNewCircle()
    });

    this.feedView = new FeedViewComponent({
      container: this.viewport,
      onNudgeMember: (userId) => this.nudgeMember(userId),
      onOpenLogModal: () => this.logModal.show({ latestTelemetry: this.latestTelemetry })
    });

    this.watchView = new WatchViewComponent({
      container: this.viewport,
      onSyncWearable: (provider) => this.syncWearable(provider)
    });

    this.ranksView = new RanksViewComponent({
      container: this.viewport
    });

    this.logModal = new LogModalComponent({
      container: this.modalContainer,
      onSubmitLog: (logPayload) => this.handleLogSubmit(logPayload),
      onClose: () => {}
    });

    this.settingsModal = new SettingsModalComponent({
      container: this.modalContainer,
      onClose: () => {},
      onDataPurged: () => this.init()
    });
  }

  async init() {
    await db.init();
    await seedDatabaseIfEmpty(db);
    await this.loadState();

    // Check query params for ?test=1
    const params = new URLSearchParams(window.location.search);
    if (params.get('test') === '1') {
      await this.runAllUnitTests();
    }

    this.attachGlobalEvents();
    this.render();
  }

  async loadState() {
    this.profiles = await db.getAll('profiles');
    this.circles = await db.getAll('circles');
    this.logs = await db.getAll('logs');

    // Fetch cloud logs if online sync configured
    if (cloudSync.isOnlineSyncConfigured && this.activeCircleId) {
      const cloudLogs = await cloudSync.fetchCircleLogs(this.activeCircleId);
      for (const cl of cloudLogs) {
        if (!this.logs.some(l => l.id === cl.id)) {
          const formatted = {
            id: cl.id,
            userId: cl.user_id,
            type: cl.type,
            photoUrl: cl.photo_url,
            caption: cl.caption,
            telemetry: cl.telemetry,
            dateKey: cl.date_key,
            createdAt: cl.created_at
          };
          await db.put('logs', formatted);
          this.logs.unshift(formatted);
        }
      }
    }
    
    const myProgression = await db.get('progression', this.currentUserId);
    this.progression = myProgression || { userId: this.currentUserId, xp: 0, level: 1, badges: [] };

    if (!this.activeCircleId && this.circles.length > 0) {
      this.activeCircleId = this.circles[0].id;
    }

    // Load today's telemetry if available
    const today = getLocalDateKey();
    const storedStats = await db.get('watchStats', `${this.currentUserId}_${today}`);
    if (storedStats) {
      this.latestTelemetry = storedStats;
    } else {
      // Sync default wearable on startup
      const me = this.profiles.find(p => p.id === this.currentUserId);
      this.latestTelemetry = await WatchSyncService.syncHealthData(me?.primaryWearable || 'Apple Watch');
      await db.put('watchStats', { id: `${this.currentUserId}_${today}`, userId: this.currentUserId, ...this.latestTelemetry });
    }
  }

  attachGlobalEvents() {
    // Navigation Tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const targetTab = e.currentTarget.getAttribute('data-tab');
        this.switchTab(targetTab);
      });
    });

    // Center SweatCam Log Button
    const snapBtn = document.getElementById('btn-open-log-modal');
    snapBtn?.addEventListener('click', () => {
      this.logModal.show({ latestTelemetry: this.latestTelemetry });
    });

    // Join / New Circle button
    const newCircleBtn = document.getElementById('btn-new-circle');
    newCircleBtn?.addEventListener('click', () => {
      this.promptNewCircle();
    });

    // In-App Unit Test Harness Button
    const testBtn = document.getElementById('btn-run-tests');
    testBtn?.addEventListener('click', () => {
      this.runAllUnitTests();
    });

    // Settings Modal Button
    const settingsBtn = document.getElementById('btn-open-settings');
    settingsBtn?.addEventListener('click', () => {
      this.settingsModal.show();
    });
  }

  switchTab(tabName) {
    this.activeTab = tabName;

    // Update active tab styles
    document.querySelectorAll('.nav-tab').forEach(tab => {
      const isTarget = tab.getAttribute('data-tab') === tabName;
      if (isTarget) {
        tab.className = 'nav-tab flex flex-col items-center text-orange-500 transition';
      } else {
        tab.className = 'nav-tab flex flex-col items-center text-slate-400 hover:text-slate-200 transition';
      }
    });

    this.render();
  }

  switchCircle(circleId) {
    this.activeCircleId = circleId;
    this.render();
  }

  async switchUser(userId) {
    this.currentUserId = userId;
    await this.loadState();
    this.render();
  }

  async syncWearable(provider) {
    const today = getLocalDateKey();
    this.latestTelemetry = await WatchSyncService.syncHealthData(provider, today);
    await db.put('watchStats', {
      id: `${this.currentUserId}_${today}`,
      userId: this.currentUserId,
      ...this.latestTelemetry
    });

    // Award watch synced badge if not already
    const myProgression = await db.get('progression', this.currentUserId) || { userId: this.currentUserId, xp: 0, level: 1, badges: [] };
    if (!myProgression.badges.includes('wearable_synced')) {
      myProgression.badges.push('wearable_synced');
      await db.put('progression', myProgression);
      this.progression = myProgression;
    }

    this.render();
  }

  async handleLogSubmit({ type, photoUrl, caption, telemetry, dateKey }) {
    const logId = `log_${Date.now()}`;
    const newLog = {
      id: logId,
      userId: this.currentUserId,
      type,
      photoUrl,
      caption,
      telemetry,
      dateKey,
      createdAt: new Date().toISOString()
    };

    // 1. Save log to IndexedDB (stored once for this user)
    await db.put('logs', newLog);
    this.logs.unshift(newLog);

    // 1b. Mirror to Supabase cloud if configured ($0/month cross-device sync)
    cloudSync.syncLog({
      id: logId,
      circle_id: this.activeCircleId,
      user_id: this.currentUserId,
      type,
      photo_url: photoUrl,
      caption,
      telemetry,
      date_key: dateKey
    }).catch(err => console.warn('Background cloud sync:', err));

    // 2. Compute XP & Overcompletion rewards
    const activeCircle = this.circles.find(c => c.id === this.activeCircleId) || this.circles[0];
    const memberProgress = StreakEngine.computeMemberWeeklyContribution(
      activeCircle.members.find(m => m.id === this.currentUserId) || { id: this.currentUserId, weeklyTargetDays: 3 },
      this.logs
    );

    const hadPriorLogToday = this.logs.some(l => l.id !== logId && l.userId === this.currentUserId && l.dateKey === dateKey);
    const { earnedXp, reasons } = XpAchievementsEngine.calculateLogReward({
      isWorkout: type === 'workout',
      hadPriorLogToday,
      isOvercompletionDay: memberProgress.isOvercompleted
    });

    // 3. Update Progression & Badges
    const currentXp = (this.progression.xp || 0) + earnedXp;
    const levelInfo = XpAchievementsEngine.calculateLevel(currentXp);
    const updatedBadges = XpAchievementsEngine.evaluateBadges({
      allLogs: this.logs.filter(l => l.userId === this.currentUserId),
      userCircles: this.circles,
      totalXp: currentXp,
      hasSyncedWatch: Boolean(this.latestTelemetry)
    });

    this.progression = {
      userId: this.currentUserId,
      xp: currentXp,
      level: levelInfo.level,
      badges: updatedBadges
    };
    await db.put('progression', this.progression);

    // 4. Render updated UI across active circle
    this.render();
    alert(`🎉 Verified Proof Logged!\n\nEarned: +${earnedXp} XP\n${reasons.join('\n')}\n\nBroadcasted to all your circles!`);
  }

  nudgeMember(userId) {
    const target = this.profiles.find(p => p.id === userId);
    const name = target ? target.name.split(' ')[0] : 'Teammate';
    alert(`⚡ Nudge Sent!\n\nYou called out ${name} to hit their workout today so the squad doesn't owe the wager!`);
  }

  async promptNewCircle() {
    const choice = prompt('Select an action:\n\n1: Create a New Circle\n2: Join with an Invite Code\n\nEnter 1 or 2:', '1');

    if (choice === '2') {
      const code = prompt('Enter the 6-character Invite Code (e.g., IRON44):');
      if (!code) return;

      const trimmedCode = code.trim().toUpperCase();
      const targetCircle = this.circles.find(c => (c.inviteCode || '').toUpperCase() === trimmedCode || c.id.toUpperCase().endsWith(trimmedCode));

      if (targetCircle) {
        if (!targetCircle.members.some(m => m.id === this.currentUserId)) {
          const targetDays = parseInt(prompt(`You are joining "${targetCircle.name}"!\nEnter your weekly day target (e.g. 3 or 4):`, '3'), 10) || 3;
          targetCircle.members.push({ id: this.currentUserId, weeklyTargetDays: targetDays });
          await db.put('circles', targetCircle);
          alert(`🎉 Success! You joined "${targetCircle.name}". Your logs will now automatically sync with this group.`);
        } else {
          alert(`You are already a member of "${targetCircle.name}".`);
        }
        this.activeCircleId = targetCircle.id;
        this.render();
      } else {
        alert(`❌ Invalid invite code "${code}". Please check with your circle host.`);
      }
      return;
    }

    if (choice !== '1') return;

    const name = prompt('Enter New Circle Name (e.g., "Run Club"):');
    if (!name) return;

    const emoji = prompt('Choose an Emoji for this Circle:', '⚡') || '⚡';
    const wager = prompt('What is the Weekly Wager for this circle?', 'Loser buys coffee') || 'Loser buys coffee';
    const targetDays = parseInt(prompt('Your weekly day target for this circle (e.g. 3 or 4):', '3'), 10) || 3;
    const inviteCode = (name.replace(/[^A-Za-z]/g, '').slice(0, 4).toUpperCase() || 'SQUAD') + Math.floor(10 + Math.random() * 90);

    const newCircle = {
      id: `circle_${Date.now()}`,
      name,
      inviteCode,
      emoji,
      category: 'Custom Circle',
      wager,
      weeklyStreak: 0,
      members: [
        { id: this.currentUserId, weeklyTargetDays: targetDays }
      ]
    };

    await db.put('circles', newCircle);
    this.circles.push(newCircle);
    this.activeCircleId = newCircle.id;
    this.render();
    alert(`🎉 Circle Created!\n\nYour Circle Invite Code is: ${inviteCode}\nShare this code with your friends so they can join!`);
  }

  render() {
    this.circleSwitcher.render({
      circles: this.circles,
      activeCircleId: this.activeCircleId,
      profiles: this.profiles,
      currentUserId: this.currentUserId
    });

    const activeCircle = this.circles.find(c => c.id === this.activeCircleId) || this.circles[0];
    const circleStatus = StreakEngine.evaluateCircleWeeklyStatus(activeCircle, this.logs);

    if (this.activeTab === 'feed') {
      // Filter feed to posts from members belonging to this active circle (preserving privacy)
      const memberIds = new Set(activeCircle.members.map(m => m.id));
      const circleLogs = this.logs.filter(l => memberIds.has(l.userId));

      this.feedView.render({
        circleStatus,
        members: activeCircle.members,
        profiles: this.profiles,
        logs: circleLogs,
        currentUserId: this.currentUserId
      });
    } else if (this.activeTab === 'watch') {
      const me = this.profiles.find(p => p.id === this.currentUserId);
      this.watchView.render({
        activeWearable: this.latestTelemetry?.provider || me?.primaryWearable || 'Apple Watch',
        currentTelemetry: this.latestTelemetry
      });
    } else if (this.activeTab === 'ranks') {
      const levelData = XpAchievementsEngine.calculateLevel(this.progression.xp || 0);
      this.ranksView.render({
        levelData,
        unlockedBadges: this.progression.badges || [],
        circleStatus
      });
    }
  }

  async runAllUnitTests() {
    const suites = [
      await runDbTests(),
      await runDateUtilsTests(),
      await runPhotoValidatorTests(),
      await runWatchSyncTests(),
      await runStreakEngineTests(),
      await runXpAchievementsTests(),
      await runUiTests()
    ];

    let totalTests = 0;
    let totalPassed = 0;
    let totalFailed = 0;
    let reportHtml = '';

    for (const suite of suites) {
      totalTests += suite.total;
      totalPassed += suite.passed;
      totalFailed += suite.failed;

      reportHtml += `
        <div class="mb-3 border-b border-slate-800 pb-2">
          <h4 class="font-bold text-xs text-white flex justify-between">
            <span>${suite.suite}</span>
            <span class="${suite.failed === 0 ? 'text-emerald-400' : 'text-rose-400'}">${suite.passed}/${suite.total} Pass</span>
          </h4>
          <div class="mt-1 space-y-1">
            ${suite.results.map(r => `
              <div class="flex justify-between items-center text-[10px]">
                <span class="${r.status === 'pass' ? 'text-slate-300' : 'text-rose-400 font-bold'}">
                  ${r.status === 'pass' ? '✓' : '✗'} ${r.description}
                </span>
                <span class="text-slate-500 font-mono">${r.duration}ms</span>
              </div>
              ${r.error ? `<div class="text-[9px] text-rose-400 pl-3 font-mono">${r.error}</div>` : ''}
            `).join('')}
          </div>
        </div>
      `;
    }

    this.modalContainer.innerHTML = `
      <div class="w-full sm:max-w-[420px] bg-slate-900 border border-slate-700 rounded-3xl p-5 space-y-3 max-h-[85vh] overflow-y-auto shadow-2xl">
        <div class="flex justify-between items-center pb-2 border-b border-slate-800">
          <div>
            <h3 class="font-black text-sm text-white">🧪 Unit Test Verification</h3>
            <p class="text-[11px] text-slate-400">${totalPassed}/${totalTests} Tests Passing</p>
          </div>
          <button id="close-test-modal-btn" class="w-7 h-7 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center font-bold text-sm hover:text-white">✕</button>
        </div>

        <div class="p-3 rounded-2xl ${totalFailed === 0 ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/40' : 'bg-rose-950/40 text-rose-300 border border-rose-500/40'} text-xs font-bold">
          ${totalFailed === 0 ? '✅ All 7 Unit Test Suites Passed 100%!' : `❌ ${totalFailed} tests failed.`}
        </div>

        <div class="pt-1">
          ${reportHtml}
        </div>
      </div>
    `;

    this.modalContainer.classList.remove('hidden');
    document.getElementById('close-test-modal-btn')?.addEventListener('click', () => {
      this.modalContainer.classList.add('hidden');
    });
  }
}

// Start App on DOM Ready
window.addEventListener('DOMContentLoaded', () => {
  const app = new SweatCircleApp();
  app.init();
});
