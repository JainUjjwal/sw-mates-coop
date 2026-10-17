/**
 * SweatCam Log Modal Component
 * Handles Workout/Meal selection, same-day photo validation, test old-photo simulation toggle, and posting
 */
import { PhotoValidator } from '../services/photo-validator.js';
import { getLocalDateKey } from '../services/date-utils.js';

export class LogModalComponent {
  constructor({ container, onSubmitLog, onClose }) {
    this.container = container;
    this.onSubmitLog = onSubmitLog;
    this.onClose = onClose;
    this.selectedFile = null;
    this.selectedDataUrl = null;
    this.logType = 'workout';
    this.simulateOldPhoto = false;
  }

  show({ latestTelemetry }) {
    this.selectedFile = null;
    this.selectedDataUrl = null;
    this.logType = 'workout';
    this.simulateOldPhoto = false;
    this.render({ latestTelemetry });
    this.container.classList.remove('hidden');
  }

  hide() {
    this.container.classList.add('hidden');
    this.container.innerHTML = '';
  }

  render({ latestTelemetry }) {
    this.container.innerHTML = `
      <div class="w-full sm:max-w-[400px] bg-slate-900 border border-slate-700 rounded-t-3xl sm:rounded-3xl p-5 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
        <div class="flex justify-between items-center pb-2 border-b border-slate-800">
          <div>
            <h3 class="font-extrabold text-base text-white">📸 SweatCam Proof</h3>
            <p class="text-[11px] text-slate-400">Must be taken TODAY to count toward weekly streak</p>
          </div>
          <button id="modal-close-btn" class="w-7 h-7 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center font-bold text-sm hover:text-white">✕</button>
        </div>

        <!-- Activity Type Selector -->
        <div class="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs font-bold">
          <button id="btn-type-workout" class="py-2 rounded-xl transition ${this.logType === 'workout' ? 'bg-orange-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}">
            🏋️ Workout
          </button>
          <button id="btn-type-meal" class="py-2 rounded-xl transition ${this.logType === 'meal' ? 'bg-orange-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}">
            🥗 Healthy Meal
          </button>
        </div>

        <!-- Photo Capture / Preview Box -->
        <div id="photo-dropzone" class="relative w-full aspect-square rounded-2xl border-2 border-dashed ${this.selectedDataUrl ? 'border-orange-500' : 'border-slate-700'} bg-slate-950 flex flex-col items-center justify-center overflow-hidden cursor-pointer group">
          ${this.selectedDataUrl ? `
            <img src="${this.selectedDataUrl}" alt="Selected Proof" class="w-full h-full object-cover">
            
            ${latestTelemetry ? `
              <div class="absolute bottom-2.5 inset-x-2.5 p-2 rounded-xl sweatcam-stamp-badge border border-white/10 flex justify-between items-center text-white text-[11px]">
                <div class="flex items-center space-x-1.5">
                  <span>⌚</span>
                  <span class="font-bold">${latestTelemetry.provider}</span>
                </div>
                <span class="font-extrabold text-orange-400">${latestTelemetry.activeKcal} kcal · ${latestTelemetry.workoutMins}m · ${latestTelemetry.steps} steps</span>
              </div>
            ` : ''}

            <button id="btn-retake-photo" class="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs font-bold border border-slate-700">
              Retake
            </button>
          ` : `
            <span class="text-3xl mb-1 group-hover:scale-110 transition">📷</span>
            <span class="text-xs font-bold text-slate-300">Take or Select Photo</span>
            <span class="text-[10px] text-slate-500 mt-0.5">Single front/back camera</span>
          `}
          <input type="file" id="camera-file-input" accept="image/*" class="hidden">
        </div>

        <!-- Same-Day Verification Status Alert -->
        <div id="validation-status-box" class="hidden text-xs p-3 rounded-2xl"></div>

        <!-- Test Toggle: Simulate Old Photo (to demonstrate strict same-day rejection) -->
        <div class="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center text-xs">
          <div>
            <p class="font-bold text-slate-300">Simulate Yesterday's Photo</p>
            <p class="text-[10px] text-slate-500">Test harness: verify older photos are ignored</p>
          </div>
          <input type="checkbox" id="toggle-simulate-old" class="w-4 h-4 rounded text-orange-500 accent-orange-500 cursor-pointer" ${this.simulateOldPhoto ? 'checked' : ''}>
        </div>

        <!-- Optional Caption -->
        <input type="text" id="log-caption-input" placeholder="Add a quick note or workout tag..." class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500">

        <!-- Broadcast Notice -->
        <p class="text-[10px] text-center text-slate-400">
          ✨ <strong>Log Once:</strong> This post automatically updates your weekly streak across all your circles.
        </p>

        <!-- Submit Button -->
        <button id="btn-submit-post" class="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black text-sm rounded-xl shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed">
          Post Verified Proof (+100 XP)
        </button>
      </div>
    `;

    this.attachEvents(latestTelemetry);
  }

  attachEvents(latestTelemetry) {
    const closeBtn = this.container.querySelector('#modal-close-btn');
    closeBtn?.addEventListener('click', () => {
      this.hide();
      this.onClose();
    });

    const btnWorkout = this.container.querySelector('#btn-type-workout');
    const btnMeal = this.container.querySelector('#btn-type-meal');
    btnWorkout?.addEventListener('click', () => {
      this.logType = 'workout';
      this.render({ latestTelemetry });
    });
    btnMeal?.addEventListener('click', () => {
      this.logType = 'meal';
      this.render({ latestTelemetry });
    });

    const dropzone = this.container.querySelector('#photo-dropzone');
    const fileInput = this.container.querySelector('#camera-file-input');
    dropzone?.addEventListener('click', (e) => {
      if (e.target.id !== 'btn-retake-photo') {
        fileInput?.click();
      }
    });

    const toggleOld = this.container.querySelector('#toggle-simulate-old');
    toggleOld?.addEventListener('change', (e) => {
      this.simulateOldPhoto = e.target.checked;
      if (this.selectedFile) {
        this.runValidation();
      }
    });

    fileInput?.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      this.selectedFile = file;
      this.selectedDataUrl = await PhotoValidator.fileToDataUrl(file);
      this.render({ latestTelemetry });
      this.runValidation();
    });

    const retakeBtn = this.container.querySelector('#btn-retake-photo');
    retakeBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.selectedFile = null;
      this.selectedDataUrl = null;
      this.render({ latestTelemetry });
    });

    const submitBtn = this.container.querySelector('#btn-submit-post');
    submitBtn?.addEventListener('click', () => {
      if (!this.selectedDataUrl) return;

      const caption = this.container.querySelector('#log-caption-input')?.value || '';
      this.onSubmitLog({
        type: this.logType,
        photoUrl: this.selectedDataUrl,
        caption,
        telemetry: latestTelemetry,
        dateKey: getLocalDateKey()
      });
      this.hide();
    });
  }

  async runValidation() {
    const statusBox = this.container.querySelector('#validation-status-box');
    const submitBtn = this.container.querySelector('#btn-submit-post');
    if (!statusBox || !this.selectedFile) return;

    statusBox.classList.remove('hidden');

    // If test harness toggle is checked, simulate photo is from yesterday
    let validation;
    if (this.simulateOldPhoto) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      validation = await PhotoValidator.validatePhoto(this.selectedFile, '2020-01-01'); // Force mismatch
    } else {
      validation = await PhotoValidator.validatePhoto(this.selectedFile);
    }

    if (validation.valid) {
      statusBox.className = 'text-xs p-3 rounded-2xl bg-emerald-950/40 text-emerald-300 border border-emerald-500/40';
      statusBox.innerHTML = `✓ <strong>Photo Verified:</strong> Captured today (${validation.today}). Eligible for streak!`;
      submitBtn.removeAttribute('disabled');
    } else {
      statusBox.className = 'text-xs p-3 rounded-2xl bg-rose-950/40 text-rose-300 border border-rose-500/40';
      statusBox.innerHTML = `✕ <strong>Older Photo Rejected:</strong> ${validation.reason}. You must post a photo from today.`;
      submitBtn.setAttribute('disabled', 'true');
    }
  }
}
