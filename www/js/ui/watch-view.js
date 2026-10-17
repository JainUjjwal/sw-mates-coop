/**
 * Wearables & Health View Component
 * Syncs with Apple Watch (HealthKit), Pixel Watch (Health Connect), Garmin, and WHOOP
 */
import { SUPPORTED_WEARABLES } from '../services/watch-sync.js';

export class WatchViewComponent {
  constructor({ container, onSyncWearable }) {
    this.container = container;
    this.onSyncWearable = onSyncWearable;
  }

  render({ activeWearable, currentTelemetry }) {
    this.container.innerHTML = `
      <section class="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-base font-extrabold text-white">⌚ Wearables & Health Sync</h2>
            <p class="text-xs text-slate-400">HealthKit & Health Connect Hub</p>
          </div>
          <span class="px-2 py-0.5 text-[10px] bg-emerald-500/20 text-emerald-400 font-bold rounded-full border border-emerald-500/30">
            Active Hub
          </span>
        </div>

        <p class="text-xs text-slate-300 leading-relaxed">
          Select your primary tracker. Data is read directly from your phone's native health database (Apple HealthKit on iOS, Google Health Connect on Android) with 100% on-device privacy ($0 cost).
        </p>

        <!-- Wearable Provider Grid -->
        <div class="grid grid-cols-2 gap-2 pt-1">
          ${SUPPORTED_WEARABLES.map(provider => {
            const isSelected = provider === activeWearable;
            const emojis = { 'Apple Watch': '🍏', 'Pixel Watch': '🔵', 'Garmin': '🔺', 'WHOOP': '⚫' };

            return `
              <button class="btn-select-wearable p-3 rounded-2xl border text-left transition flex flex-col justify-between ${isSelected ? 'bg-orange-500/15 border-orange-500 text-white shadow-md' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'}" data-provider="${provider}">
                <div class="flex justify-between items-start">
                  <span class="text-xl">${emojis[provider] || '⌚'}</span>
                  ${isSelected ? '<span class="text-xs text-orange-400 font-bold">✓ Connected</span>' : ''}
                </div>
                <div class="mt-2">
                  <p class="text-xs font-black ${isSelected ? 'text-white' : 'text-slate-300'}">${provider}</p>
                  <p class="text-[10px] text-slate-500">Native Health Hub</p>
                </div>
              </button>
            `;
          }).join('')}
        </div>

        <!-- Live Health Metrics Rings / Cards -->
        ${currentTelemetry ? `
          <div class="mt-4 p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div class="flex justify-between items-center border-b border-slate-800/80 pb-2">
              <span class="text-xs font-bold text-slate-300">Today's Synced Telemetry</span>
              <span class="text-[11px] text-orange-400 font-semibold">${currentTelemetry.provider}</span>
            </div>

            <div class="grid grid-cols-2 gap-3 text-center">
              <div class="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span class="text-lg font-black text-rose-400">${currentTelemetry.activeKcal}</span>
                <p class="text-[10px] text-slate-400 font-semibold">Active Calories (kcal)</p>
              </div>
              <div class="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span class="text-lg font-black text-amber-400">${currentTelemetry.workoutMins}m</span>
                <p class="text-[10px] text-slate-400 font-semibold">Workout Duration</p>
              </div>
              <div class="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span class="text-lg font-black text-emerald-400">${currentTelemetry.steps.toLocaleString()}</span>
                <p class="text-[10px] text-slate-400 font-semibold">Daily Steps</p>
              </div>
              <div class="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span class="text-lg font-black text-sky-400">${currentTelemetry.avgHeartRate}</span>
                <p class="text-[10px] text-slate-400 font-semibold">Avg Heart Rate (BPM)</p>
              </div>
            </div>

            <button id="btn-sync-now" class="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center space-x-1.5 border border-slate-700">
              <span>🔄 Refresh Health Sync</span>
            </button>
          </div>
        ` : ''}
      </section>
    `;

    this.container.querySelectorAll('.btn-select-wearable').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const provider = e.currentTarget.getAttribute('data-provider');
        this.onSyncWearable(provider);
      });
    });

    const syncNowBtn = this.container.querySelector('#btn-sync-now');
    syncNowBtn?.addEventListener('click', () => {
      this.onSyncWearable(activeWearable);
    });
  }
}
