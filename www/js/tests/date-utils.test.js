import { TestRunner, assert, assertEqual } from './test-runner.js';
import { getLocalDateKey, getWeekStartKey, formatFriendlyDate, parsePhotoDate } from '../services/date-utils.js';

export async function runDateUtilsTests() {
  const runner = new TestRunner('Date Utilities Unit Tests');

  runner.test('getLocalDateKey formats YYYY-MM-DD correctly', () => {
    const fixed = new Date(2026, 9, 16); // Oct 16, 2026
    assertEqual(getLocalDateKey(fixed), '2026-10-16');
  });

  runner.test('getWeekStartKey resolves to Monday of the given week', () => {
    // Friday Oct 16, 2026 -> Monday is Oct 12, 2026
    const friday = new Date(2026, 9, 16);
    assertEqual(getWeekStartKey(friday), '2026-10-12');

    // Sunday Oct 18, 2026 -> Monday is Oct 12, 2026
    const sunday = new Date(2026, 9, 18);
    assertEqual(getWeekStartKey(sunday), '2026-10-12');

    // Monday Oct 19, 2026 -> Monday is Oct 19, 2026
    const monday = new Date(2026, 9, 19);
    assertEqual(getWeekStartKey(monday), '2026-10-19');
  });

  runner.test('formatFriendlyDate identifies Today', () => {
    const today = getLocalDateKey();
    assertEqual(formatFriendlyDate(today), 'Today');
  });

  runner.test('parsePhotoDate extracts date from file.lastModified fallback', async () => {
    const mockFile = {
      name: 'test.jpg',
      lastModified: new Date('2026-10-16T12:00:00').getTime(),
      slice: () => ({ arrayBuffer: async () => new ArrayBuffer(0) })
    };
    const parsed = await parsePhotoDate(mockFile);
    assertEqual(parsed, '2026-10-16');
  });

  return runner.run();
}
