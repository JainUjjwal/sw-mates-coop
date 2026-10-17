import { TestRunner, assert, assertEqual } from './test-runner.js';
import { AppDB } from '../storage/db.js';
import { seedDatabaseIfEmpty, SEED_CURRENT_USER_ID } from '../storage/seed.js';

export async function runDbTests() {
  const runner = new TestRunner('Storage & Seed Unit Tests');

  runner.test('AppDB opens and initializes object stores', async () => {
    const testDb = new AppDB();
    const initialized = await testDb.init();
    assert(initialized !== null, 'Database should initialize');
    assert(testDb.db.name === 'SweatCircleDB', 'Database name matches');
  });

  runner.test('AppDB puts and retrieves records', async () => {
    const testDb = new AppDB();
    await testDb.put('profiles', { id: 'test_user_1', name: 'Tester', primaryWearable: 'Garmin' });
    const fetched = await testDb.get('profiles', 'test_user_1');
    assertEqual(fetched.name, 'Tester');
    assertEqual(fetched.primaryWearable, 'Garmin');
  });

  runner.test('seedDatabaseIfEmpty creates initial profiles and isolated circles', async () => {
    const testDb = new AppDB();
    await seedDatabaseIfEmpty(testDb);
    const circles = await testDb.getAll('circles');
    assert(circles.length >= 2, 'Should seed at least 2 circles');
    const me = await testDb.get('profiles', SEED_CURRENT_USER_ID);
    assert(me !== null, 'Active profile user_me must exist');
    assertEqual(me.name, 'Alex (You)');
  });

  return runner.run();
}
