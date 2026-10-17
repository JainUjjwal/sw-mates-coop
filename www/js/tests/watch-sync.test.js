import { TestRunner, assert, assertEqual } from './test-runner.js';
import { WatchSyncService, SUPPORTED_WEARABLES } from '../services/watch-sync.js';
import { getLocalDateKey } from '../services/date-utils.js';

export async function runWatchSyncTests() {
  const runner = new TestRunner('Wearable & Health Sync Unit Tests');

  runner.test('Supports all 4 requested wearables via HealthKit/Health Connect', () => {
    assertEqual(SUPPORTED_WEARABLES.includes('Apple Watch'), true);
    assertEqual(SUPPORTED_WEARABLES.includes('Pixel Watch'), true);
    assertEqual(SUPPORTED_WEARABLES.includes('Garmin'), true);
    assertEqual(SUPPORTED_WEARABLES.includes('WHOOP'), true);
  });

  runner.test('formatHealthTelemetry standardizes fields', () => {
    const formatted = WatchSyncService.formatHealthTelemetry({
      provider: 'Garmin',
      activeKcal: 550.8,
      workoutMins: 45.2,
      steps: 10050,
      avgHeartRate: 144
    });

    assertEqual(formatted.provider, 'Garmin');
    assertEqual(formatted.activeKcal, 551);
    assertEqual(formatted.workoutMins, 45);
    assertEqual(formatted.steps, 10050);
    assertEqual(formatted.avgHeartRate, 144);
    assertEqual(formatted.dateKey, getLocalDateKey());
  });

  runner.test('syncHealthData returns valid payload for WHOOP', async () => {
    const data = await WatchSyncService.syncHealthData('WHOOP');
    assertEqual(data.provider, 'WHOOP');
    assert(data.activeKcal > 0, 'Active calories must be present');
    assert(data.steps > 0, 'Steps must be present');
    assert(data.avgHeartRate > 0, 'Heart rate must be present');
  });

  return runner.run();
}
