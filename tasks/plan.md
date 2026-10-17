# Implementation Plan: Pre-Publish Readiness & Cloud CI (Option B)

## Overview
Prepare SweatCircle for official store publishing across the Apple App Store and Google Play Store using **Option B: Zero Mac / Zero Local Setup via Cloud CI**. This plan covers cross-device cloud sync ($0/month), store compliance features (account deletion, content reporting, privacy policy), native app assets and manifest configurations, and automated GitHub Actions workflows to compile iOS and Android packages without needing local Node, Xcode, or Android Studio.

## Architecture Decisions
1. **Option B Cloud CI Pipeline**: All native compilation (`npx cap add ios`, `npx cap add android`, Gradle, Xcodebuild) runs entirely inside automated GitHub Actions workflows. The local repository stays 100% lightweight and zero-build.
2. **Pluggable Cloud Sync Adapter (`www/js/services/cloud-sync.js`)**: An offline-first sync layer that mirrors IndexedDB changes to a free-tier Supabase/Firebase project when credentials are provided, falling back seamlessly to local-only mode when unconfigured.
3. **Store Compliance Modules**:
   - `www/js/ui/settings-modal.js`: Contains mandatory account deletion ("Delete Account & Clear All Data") and export tools required by Apple Guideline 5.1.1(v).
   - In-feed post reporting & user blocking required by Apple Guideline 1.2 for user-generated photo content.
   - Self-hosted Privacy Policy & Terms page template (`www/privacy.html`).
4. **Native Configuration Stubs**: Pre-configured `ios/` and `android/` permission strings ready for Capacitor synthesis (`Info.plist` strings and `AndroidManifest.xml` permissions).

## Task List

### Phase 1: Store Compliance & Safety Gates (Agent-Executed)
- [ ] Task 11: Add In-Feed Content Moderation & Reporting (Apple Guideline 1.2)
  - Implement "Report Post" and "Block User" options on photo feed cards.
- [ ] Task 12: Implement Settings & Account Deletion (Apple Guideline 5.1.1(v))
  - Add Settings modal with "Delete My Account & All Stored Data" and confirmation dialog.
- [ ] Task 13: Create Static Privacy Policy & Terms Template
  - Add compliant `www/privacy.html` detailing camera, HealthKit, and Google Health Connect data usage.

### Checkpoint 1: Compliance Readiness
- [ ] All store compliance screens render cleanly in local preview.

### Phase 2: Cloud Sync Layer & Native Configs (Agent-Executed)
- [ ] Task 14: Implement Pluggable Cloud Sync Adapter (`www/js/services/cloud-sync.js`)
  - Create free-tier Supabase/Firebase sync adapter with schema SQL setup script.
- [ ] Task 15: Create Native App Manifest & Permissions Template
  - Configure `Info.plist` and `AndroidManifest.xml` permissions templates for Camera and HealthKit/Health Connect.
- [ ] Task 16: Configure GitHub Actions CI Workflows for Option B
  - Create `.github/workflows/build-android.yml` (builds `.aab` / `.apk`) and `.github/workflows/build-ios.yml` (builds `.ipa`).

### Checkpoint 2: Codebase Publishing Complete
- [ ] CI workflow files valid and ready to push to GitHub.

### Phase 3: User Action Items & Store Release (User Actions Required)
- [ ] Task 17: User Setup — Push to GitHub & Connect Secrets
  - Explicit steps for git init, pushing to private GitHub repository, and adding store credentials.
- [ ] Task 18: User Setup — Store Accounts & Privacy Policy Link
  - Explicit steps for Apple Developer Program ($99/yr) and Google Play Console ($25 one-time).
