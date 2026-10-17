# Todo: SweatCircle Pre-Publish & Cloud CI (Option B)

## Phase 1: Store Compliance & Safety Gates (Agent Executed)
- [x] Task 11: Add In-Feed Content Moderation & Reporting (Apple Guideline 1.2)
  - Description: Add a report button ("🚩 Report Post") and user-blocking capability on all feed photo posts to satisfy Apple/Google user-generated content requirements.
  - Acceptance: Tapping "Report" flags the post and hides it from view; user can block a teammate's feed content.
  - Verify: Click report/block on feed cards in local preview.
  - Files: `www/js/ui/feed-view.js`
- [x] Task 12: Implement Settings & Account Deletion Modal (Apple Guideline 5.1.1(v))
  - Description: Implement a Settings modal accessible from the header containing an explicit "Delete Account & Wipe Data" action that purges IndexedDB and resets all local storage.
  - Acceptance: Modal allows triggering data wipe with a confirmation prompt; cleans all object stores and reloads seed fresh.
  - Verify: Trigger data wipe, verify IndexedDB is cleared.
  - Files: `www/js/ui/settings-modal.js`, `www/js/main.js`, `www/index.html`
- [x] Task 13: Create Static Privacy Policy & Terms Page
  - Description: Add an official, compliant privacy policy HTML page detailing zero third-party sale of health data, camera usage, HealthKit, and Google Health Connect handling.
  - Acceptance: Page can be hosted directly or on GitHub Pages as the mandatory store privacy policy URL.
  - Verify: Open `www/privacy.html` in browser.
  - Files: `www/privacy.html`

## Checkpoint 1: Compliance Readiness
- [x] Tasks 11-13 complete and verified.

## Phase 2: Cloud Sync Layer & Native Configs (Agent Executed)
- [x] Task 14: Implement Pluggable Cloud Sync Adapter (`www/js/services/cloud-sync.js`)
  - Description: Create an offline-first sync adapter that connects `db.js` with a free-tier Supabase backend (PostgreSQL + Realtime), with provided SQL table definitions.
  - Acceptance: Can read/write remote circle logs when URL & anon key are set; seamlessly stays offline when unset.
  - Verify: Unit test verifies adapter transitions cleanly between offline and online modes.
  - Files: `www/js/services/cloud-sync.js`, `supabase-schema.sql`
- [x] Task 15: Create Native App Permissions & Manifest Templates
  - Description: Provide standard iOS `Info.plist` snippets and Android `AndroidManifest.xml` snippets for Camera, HealthKit, and Google Health Connect.
  - Acceptance: Pre-populated permission strings and rationale explanations ready for Capacitor sync.
  - Verify: Review file contents.
  - Files: `native-configs/ios-Info.plist.snippet`, `native-configs/android-AndroidManifest.xml.snippet`
- [x] Task 16: Configure GitHub Actions CI Workflows for Option B (Cloud Build)
  - Description: Setup GitHub Actions workflows to build Android `.aab` / `.apk` and iOS `.ipa` in GitHub's cloud runners on push.
  - Acceptance: Workflow files `.github/workflows/build-android.yml` and `.github/workflows/build-ios.yml` created with step-by-step artifact uploading.
  - Verify: Workflow YAML syntax check.
  - Files: `.github/workflows/build-android.yml`, `.github/workflows/build-ios.yml`

## Checkpoint 2: Codebase Publishing Complete
- [x] Tasks 14-16 complete.

## Phase 3: Explicit User Action Checklist (Required from User)
- [ ] Task 17: User Setup — Push Code to Private GitHub Repository
  - Description: User initializes git and pushes this folder to GitHub.
  - Steps: Detailed commands provided in response.
- [ ] Task 18: User Setup — Create Free Cloud Database (Supabase)
  - Description: User creates a free $0/month Supabase project and pastes 2 config strings.
- [ ] Task 19: User Setup — Register Store Developer Accounts
  - Description: User enrolls in Apple Developer Program and Google Play Console.
