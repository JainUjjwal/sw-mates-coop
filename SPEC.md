# Spec: SweatCircle — Cooperative Partner & Multi-Group Fitness Tracker

## Objective
Build a mobile-first, zero-cost, CapacitorJS-ready web application inspired by Sweatmates that helps friends and family maintain cooperative **Weekly Fitness Streaks** across **multiple isolated friend circles** while logging only once.
- **Log Once, Broadcast to All Circles**: Users upload a workout or meal photo (and sync watch stats) at the **User level** once per activity. Every circle the user belongs to automatically receives that day's log and watch stats—friends in Circle A ("Iron Squad") never see members of Circle B ("Family Fit"), and the user never has to double-post.
- **Weekly Team Streaks + Individual Weekly Contribution & Overcompletion**:
  - **No Individual Daily Streaks**: Streaks are strictly **Weekly Circle Streaks** (Sweatmates model).
  - **Per-Member Weekly Target & Contribution**: Each member in a circle commits to a personal weekly target (e.g., `3 days/week`) that contributes to keeping the Circle's Weekly Streak alive and avoiding the weekly wager penalty.
  - **Overcompletion Bonus (Extra XP & Overachiever Rewards)**: If a user commits to `3 days/week` and logs `5 days/week` (e.g., `5/3 days` — `+2 Bonus Days`), the circle UI highlights their overcompletion (`5/3 🔥 +2 Overkill`) and awards **2x Bonus XP (+200 XP) per extra day** plus special Overcompletion Badges ("Carry the Boats", "Overachiever").
- **Same-Day Photo Verification**: Workout and meal photos must be captured or created **today** (checked via EXIF `DateTimeOriginal` and `File.lastModified`). Older photos are rejected.
- **Wearable & Health Sync (HealthKit / Health Connect Exclusive)**:
  - All health and wearable metrics come **strictly and exclusively** from the device's native health hubs: **Apple HealthKit** (iOS) and **Google Health Connect** (Android).
  - Apple Watch, Pixel Watch, Garmin bands/watches, and WHOOP straps write into HealthKit / Health Connect; the app reads standardized metrics: **Active Calories (kcal)**, **Workout Duration (mins)**, **Steps**, and **Average/Max Heart Rate (BPM)** with device source attribution (`Apple Watch`, `Pixel Watch`, `Garmin`, `WHOOP`).
  - No direct proprietary third-party cloud OAuth or proprietary APIs (no WHOOP developer API, no Garmin Health API). Clean, zero-cost, 100% on-device.
  - Interactive browser preview fallback allows simulating HealthKit / Health Connect sync during development.
- **Progression**: XP, levels, and achievement badges reward logging workouts/meals, hitting weekly targets, and overcompleting weekly goals.

## Tech Stack & iOS/Android Publishing Architecture
- **Publishable CapacitorJS Structure (`www/` webDir + `capacitor.config.json` + `package.json`)**:
  - Runs zero-build in the browser directly from `www/index.html` using native ES6 modules and Tailwind CSS CDN.
  - Wraps directly into Xcode (`ios/`) and Android Studio (`android/`) via CapacitorJS (`npx cap add ios && npx cap add android`) when publishing to the Apple App Store and Google Play Store.
  - Pre-configured with `@capacitor/core`, `@capacitor/camera`, `@capacitor/preferences`, and `@perfood/capacitor-healthkit` / `capacitor-health-connect`, plus native iOS safe-area insets.
  - **Storage**: 100% on-device `IndexedDB` (`$0/month` server cost) with a Share Code export/import snapshot utility.
  - **Python Runtime Verified**: Verified `Python 3.13.5` is installed locally (`python --version`).

## Commands
```powershell
# Verified local Python 3.13.5 HTTP server (zero Node required)
python -m http.server 8080 --directory c:\Users\razze\dev\sweatmates-coop\www

# Run automated self-check assertions in browser
# Open http://localhost:8080/?test=1
```

## Project Structure (Modular, Domain-Separated ES6 Architecture)
Every file is focused on a single responsibility (kept well under 150–200 lines) with clean ES6 imports/exports so code reviews and feature additions stay fast and isolated:

```text
c:\Users\razze\dev\sweatmates-coop\
├── SPEC.md                              → This specification document
├── package.json                         → CapacitorJS dependencies & store build scripts
├── capacitor.config.json                → Capacitor native app ID, appName, and webDir ("www")
└── www\                                 → Publishable web asset bundle
    ├── index.html                       → Mobile UI chassis shell (safe-area aware, loads js/main.js)
    ├── styles\
    │   └── mobile-chassis.css           → Native safe-area insets, scrollbars, and animations
    └── js\
        ├── main.js                      → App bootstrap, tab router, and event wiring
        ├── storage\
        │   ├── db.js                    → Generic IndexedDB CRUD wrapper
        │   └── seed.js                  → Default user profiles, isolated friend circles, wagers, & sample logs
        ├── services\
        │   ├── date-utils.js            → Local YYYY-MM-DD keys, start-of-week math, EXIF parser
        │   ├── photo-validator.js       → Capacitor Camera bridge & same-day photo verification gate
        │   ├── watch-sync.js            → Apple Watch (HealthKit) & Pixel Watch (Google Fit) bridge + simulator
        │   ├── streak-engine.js         → Weekly circle streak math, per-member contribution, overcompletion bonus
        │   └── xp-achievements.js       → XP calculation, level progression curve, & achievement unlock rules
        ├── ui\
        │   ├── circle-switcher.js       → Top bar multi-circle selector, active member switcher, & new circle modal
        │   ├── feed-view.js             → Weekly team streak banner, wager card, member contribution bars, photo feed
        │   ├── log-modal.js             → Workout/Meal camera capture, same-day badge, & old-photo test toggle
        │   ├── watch-view.js            → Apple Watch & Pixel Watch connection cards and live telemetry rings
        │   └── ranks-view.js            → Level progress bar, XP breakdown (including Overkill XP), & badge grid
        └── tests\
            ├── test-runner.js           → Lightweight zero-dependency assertion & suite runner
            ├── db.test.js               → Unit tests for storage/db.js & storage/seed.js
            ├── date-utils.test.js       → Unit tests for services/date-utils.js
            ├── photo-validator.test.js  → Unit tests for services/photo-validator.js (same-day gate)
            ├── watch-sync.test.js       → Unit tests for services/watch-sync.js (Apple & Pixel Watch)
            ├── streak-engine.test.js    → Unit tests for services/streak-engine.js (weekly target, overcompletion, multi-circle fan-out)
            ├── xp-achievements.test.js  → Unit tests for services/xp-achievements.js (XP, levels, badges)
            └── ui.test.js               → Unit tests for UI component rendering & DOM state
```

## Code Style & Module Contract Example
Each service module exports pure, testable functions imported by the UI and its dedicated `.test.js` unit test file:
```javascript
// www/js/services/streak-engine.js
import { getWeekStartKey } from './date-utils.js';

export function computeMemberWeeklyContribution(member, allLogs, referenceDate = new Date()) {
  const weekStartKey = getWeekStartKey(referenceDate);
  const uniqueDays = new Set(
    allLogs
      .filter(l => l.userId === member.id && l.dateKey >= weekStartKey)
      .map(l => l.dateKey)
  ).size;
  const targetDays = member.weeklyTargetDays || 3;
  const bonusDays = Math.max(0, uniqueDays - targetDays);
  return {
    ...member,
    daysLogged: uniqueDays,
    targetDays,
    metTarget: uniqueDays >= targetDays,
    bonusDays,
    overcompletionXp: bonusDays * 200
  };
}
```

## Testing Strategy (Per-File Unit Tests)
- Every module has its own dedicated unit test file inside `www/js/tests/` executed by `test-runner.js` (auto-run via `?test=1` or the in-app **Run Unit Tests** panel):
  1. `db.test.js`: Verifies IndexedDB store initialization, CRUD operations, and multi-circle seed integrity.
  2. `date-utils.test.js`: Verifies local `YYYY-MM-DD` formatting, Monday start-of-week calculation, and EXIF date parsing.
  3. `photo-validator.test.js`: Verifies same-day photo acceptance (`YYYY-MM-DD === today`) and rejection of yesterday/older timestamps.
  4. `watch-sync.test.js`: Verifies Apple Watch (HealthKit) and Pixel Watch (Google Fit / Health Connect) telemetry normalization and IndexedDB persistence.
  5. `streak-engine.test.js`: Verifies single-log fan-out across multiple isolated circles, weekly team streak math, and overcompletion (`5/3 days` → `+2 bonus days`, `+400 XP`).
  6. `xp-achievements.test.js`: Verifies base XP, weekly target bonus XP, overcompletion XP, level thresholds, and badge unlocking.
  7. `ui.test.js`: Verifies Circle Switcher isolation, Feed rendering, Watch view updates, Log modal validation state, and Ranks view rendering.

## Boundaries
- **Always do**: Keep each module focused on a single concern (<200 lines per file), lock UI to mobile viewport dimensions (`max-w-[430px]`) with safe-area insets, persist all data in IndexedDB, enforce same-day photo validation, track only Weekly Circle Streaks + individual weekly contribution/overcompletion, fan out user logs/watch stats to all joined circles automatically.
- **Ask first**: Adding paid cloud dependencies or requiring a mandatory login server.
- **Never do**: Put bloated monolithic logic in a single JS file, track individual daily streaks, mix member lists between separate friend circles, allow backdated photos to count toward streaks, or run heavy Xcode/Gradle builds locally.

## Success Criteria
1. **Modular Codebase**: Clean separation across `storage/`, `services/`, `ui/`, and `tests/` modules with zero bloated files.
2. **Multi-Circle Isolation + Single Upload**: User can switch between multiple friend circles, and logging a workout/meal or watch sync **once** updates their weekly contribution across every circle they belong to.
3. **Weekly Team Streak + Overcompletion Rewards**: Circle view displays the team's **Weekly Streak** (weeks in a row the team hit its goal), each member's weekly contribution (e.g., `3/3` or `5/3 🔥 +2 Bonus`), active wager status, and awards bonus XP + overcompletion achievements when a member exceeds their committed weekly days.
4. **Same-Day Photo Enforcement**: Rejects any image whose EXIF or file modified date is not today, with a built-in test toggle to verify rejection of older photos.
5. **Apple Watch & Pixel Watch Sync**: Fetches and displays steps, active calories, exercise minutes, and heart rate for Apple Watch and Pixel Watch, shared across all of the user's circles.

## Open Questions
- None. Ready for approval to proceed to Phase 2 (Plan/Tasks) and implementation.
