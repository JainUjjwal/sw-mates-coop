import { TestRunner, assert, assertEqual } from './test-runner.js';
import { PhotoValidator } from '../services/photo-validator.js';
import { getLocalDateKey } from '../services/date-utils.js';

export async function runPhotoValidatorTests() {
  const runner = new TestRunner('Same-Day Photo Validator Unit Tests');

  runner.test('Accepts photo taken today', async () => {
    const today = getLocalDateKey();
    const mockTodayFile = {
      name: 'workout_today.jpg',
      lastModified: Date.now(),
      slice: () => ({ arrayBuffer: async () => new ArrayBuffer(0) })
    };

    const result = await PhotoValidator.validatePhoto(mockTodayFile);
    assertEqual(result.valid, true, 'Today photo must be accepted');
    assertEqual(result.photoDate, today);
  });

  runner.test('Rejects older photo from yesterday', async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const mockOldFile = {
      name: 'workout_old.jpg',
      lastModified: yesterday.getTime(),
      slice: () => ({ arrayBuffer: async () => new ArrayBuffer(0) })
    };

    const result = await PhotoValidator.validatePhoto(mockOldFile);
    assertEqual(result.valid, false, 'Older photo must be rejected');
    assert(result.reason.includes('does not match today'), 'Explains reason for rejection');
  });

  runner.test('Rejects photo when simulated today differs', async () => {
    const mockFile = {
      name: 'meal.jpg',
      lastModified: new Date('2026-10-15T10:00:00').getTime(),
      slice: () => ({ arrayBuffer: async () => new ArrayBuffer(0) })
    };

    // Simulate today is 2026-10-16
    const result = await PhotoValidator.validatePhoto(mockFile, '2026-10-16');
    assertEqual(result.valid, false);
    assertEqual(result.photoDate, '2026-10-15');
    assertEqual(result.today, '2026-10-16');
  });

  return runner.run();
}
