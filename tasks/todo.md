# Todo: SweatCircle Pre-Publish & Cloud CI (Option B)

## Phase 1: Store Compliance & Safety Gates (Agent Executed)
- [x] Task 11: Add In-Feed Content Moderation & Reporting (Apple Guideline 1.2)
- [x] Task 12: Implement Settings & Account Deletion Modal (Apple Guideline 5.1.1(v))
- [x] Task 13: Create Static Privacy Policy & Terms Page

## Checkpoint 1: Compliance Readiness
- [x] Tasks 11-13 complete and verified.

## Phase 2: Cloud Sync Layer & Native Configs (Agent Executed)
- [x] Task 14: Implement Pluggable Cloud Sync Adapter (`www/js/services/cloud-sync.js`)
- [x] Task 15: Create Native App Permissions & Manifest Templates
- [x] Task 16: Configure GitHub Actions CI Workflows for Option B (Cloud Build)

## Checkpoint 2: Codebase Publishing Complete
- [x] Tasks 14-16 complete.

## Phase 3: Live Cloud Realtime Sync & Code Polish (Active Code Path)
- [x] Task 20: Auto-Sync `circle_logs` and `circles` with Supabase in `main.js`
  - Wire `cloudSync.syncLog(...)` and `cloudSync.fetchCircleLogs(...)` into `handleLogSubmit` and `loadState` so new photos and circle stats mirror to Supabase in real-time when online.
- [x] Task 21: Add Shareable Circle Invite Code / Deep Link
  - Generate a 6-character invite code (e.g., `IRON99`) so friends can type or paste a code to join an existing circle instantly.
- [ ] Task 22: Add Interactive SweatCam Gallery Filter (All vs. Workouts vs. Meals)
  - Allow filtering the circle feed by Workouts or Meals.

## Phase 4: Deferred Publishing & Release Actions (TODO for Later)
- [ ] Task 23: Host Privacy Policy page (`www/privacy.html`) via Vercel / Netlify / Cloudflare Pages
- [ ] Task 24: Register Apple Developer Program ($99/year) & Google Play Console ($25 one-time)
- [ ] Task 25: Generate 1024x1024 Store App Icon & Screenshots for Store Listing
