/**
 * Settings & Account Deletion Modal Component
 * Required for Apple App Store Review (Guideline 5.1.1(v) - Account Deletion)
 */
import { db } from '../storage/db.js';

export class SettingsModalComponent {
  constructor({ container, onClose, onDataPurged }) {
    this.container = container;
    this.onClose = onClose;
    this.onDataPurged = onDataPurged;
  }

  show() {
    this.render();
    this.container.classList.remove('hidden');
  }

  hide() {
    this.container.classList.add('hidden');
    this.container.innerHTML = '';
  }

  render() {
    this.container.innerHTML = `
      <div class="w-full sm:max-w-[400px] bg-slate-900 border border-slate-700 rounded-t-3xl sm:rounded-3xl p-5 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
        <div class="flex justify-between items-center pb-2 border-b border-slate-800">
          <div>
            <h3 class="font-extrabold text-base text-white">⚙️ Settings & Privacy</h3>
            <p class="text-[11px] text-slate-400">Account management & store disclosures</p>
          </div>
          <button id="settings-close-btn" class="w-7 h-7 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center font-bold text-sm hover:text-white">✕</button>
        </div>

        <!-- Privacy & Legal Links -->
        <div class="space-y-2">
          <a href="privacy.html" target="_blank" class="block p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 flex justify-between items-center transition">
            <span>📄 Privacy Policy & Terms</span>
            <span class="text-slate-500">↗</span>
          </a>
          <div class="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1">
            <p class="font-bold text-white">Health Data Privacy</p>
            <p class="text-[11px] text-slate-400 leading-relaxed">
              SweatCircle reads HealthKit and Google Health Connect metrics strictly for streak verification. Your health telemetry is never sold or used for advertising.
            </p>
          </div>
        </div>

        <!-- Account & Data Wipe (Apple Guideline 5.1.1(v)) -->
        <div class="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-2">
          <h4 class="text-xs font-black text-rose-400 uppercase tracking-wider">Account Deletion</h4>
          <p class="text-[11px] text-slate-300 leading-relaxed">
            Per Apple and Google Play data privacy requirements, you can permanently delete your account, friend circles, workout logs, and on-device health data at any time.
          </p>
          <button id="btn-purge-account" class="w-full py-2.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-bold transition">
            Delete My Account & All Stored Data
          </button>
        </div>
      </div>
    `;

    this.container.querySelector('#settings-close-btn')?.addEventListener('click', () => {
      this.hide();
      this.onClose();
    });

    this.container.querySelector('#btn-purge-account')?.addEventListener('click', async () => {
      const confirmed = confirm(
        '⚠️ Permanent Account Deletion\n\nAre you sure you want to delete your profile, leave all circles, and permanently delete all your logs and telemetry?\n\nThis action cannot be undone.'
      );
      if (confirmed) {
        await db.clear('profiles');
        await db.clear('circles');
        await db.clear('logs');
        await db.clear('watchStats');
        await db.clear('progression');
        alert('Your account and all stored data have been permanently deleted.');
        this.hide();
        this.onDataPurged();
      }
    });
  }
}
