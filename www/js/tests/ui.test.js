import { TestRunner, assert, assertEqual } from './test-runner.js';
import { CircleSwitcherComponent } from '../ui/circle-switcher.js';
import { FeedViewComponent } from '../ui/feed-view.js';
import { WatchViewComponent } from '../ui/watch-view.js';
import { RanksViewComponent } from '../ui/ranks-view.js';

export async function runUiTests() {
  const runner = new TestRunner('UI View Components Unit Tests');

  runner.test('CircleSwitcherComponent renders isolated circles and active user dropdown', () => {
    const container = document.createElement('div');
    const switcher = new CircleSwitcherComponent({
      container,
      onCircleChange: () => {},
      onMemberSwitch: () => {},
      onNewCircle: () => {}
    });

    const mockCircles = [
      { id: 'c1', name: 'Iron Squad', emoji: '🏋️‍♂️' },
      { id: 'c2', name: 'Family Fit', emoji: '🥗' }
    ];
    const mockProfiles = [
      { id: 'user_me', name: 'Alex', avatar: '' }
    ];

    switcher.render({
      circles: mockCircles,
      activeCircleId: 'c1',
      profiles: mockProfiles,
      currentUserId: 'user_me'
    });

    assert(container.innerHTML.includes('Iron Squad'), 'Should display Iron Squad');
    assert(container.innerHTML.includes('Family Fit'), 'Should display Family Fit');
  });

  runner.test('FeedViewComponent renders weekly streak and overcompletion badges', () => {
    const container = document.createElement('div');
    const feed = new FeedViewComponent({
      container,
      onNudgeMember: () => {},
      onOpenLogModal: () => {}
    });

    feed.render({
      circleStatus: {
        circleId: 'c1',
        weeklyStreak: 4,
        allMembersMetTarget: false,
        totalDaysLogged: 7,
        totalTargetDays: 8,
        wagerDescription: 'Loser buys smoothies',
        atRiskMembers: [{ userId: 'user_sam' }],
        memberProgress: [
          { userId: 'user_me', daysLogged: 5, targetDays: 3, isOvercompleted: true, bonusDays: 2, metTarget: true },
          { userId: 'user_sam', daysLogged: 2, targetDays: 3, isOvercompleted: false, bonusDays: 0, metTarget: false }
        ]
      },
      members: [],
      profiles: [
        { id: 'user_me', name: 'Alex (You)', avatar: '' },
        { id: 'user_sam', name: 'Sam R.', avatar: '' }
      ],
      logs: [],
      currentUserId: 'user_me'
    });

    assert(container.innerHTML.includes('Weekly Streak'), 'Has Weekly Streak text');
    assert(container.innerHTML.includes('4 Weeks'), 'Shows 4 Weeks streak');
    assert(container.innerHTML.includes('+2 Bonus'), 'Highlights overcompletion bonus');
    assert(container.innerHTML.includes('⚡ Nudge'), 'Renders nudge button for behind teammate');
  });

  runner.test('WatchViewComponent renders HealthKit & Health Connect provider cards', () => {
    const container = document.createElement('div');
    const watchView = new WatchViewComponent({
      container,
      onSyncWearable: () => {}
    });

    watchView.render({
      activeWearable: 'Apple Watch',
      currentTelemetry: {
        provider: 'Apple Watch',
        activeKcal: 490,
        workoutMins: 52,
        steps: 9400,
        avgHeartRate: 142
      }
    });

    assert(container.innerHTML.includes('Apple Watch'), 'Renders Apple Watch');
    assert(container.innerHTML.includes('Pixel Watch'), 'Renders Pixel Watch');
    assert(container.innerHTML.includes('Garmin'), 'Renders Garmin');
    assert(container.innerHTML.includes('WHOOP'), 'Renders WHOOP');
    assert(container.innerHTML.includes('490'), 'Renders active kcal telemetry');
  });

  runner.test('RanksViewComponent renders level progression and badge catalog', () => {
    const container = document.createElement('div');
    const ranksView = new RanksViewComponent({ container });

    ranksView.render({
      levelData: { level: 3, totalXp: 650, percentToNext: 60, nextLevelTarget: 750 },
      unlockedBadges: ['first_sweat', 'overachiever'],
      circleStatus: {}
    });

    assert(container.innerHTML.includes('Level 3 Achiever'), 'Renders Level 3');
    assert(container.innerHTML.includes('First Sweat'), 'Renders first sweat badge');
    assert(container.innerHTML.includes('Overachiever'), 'Renders overachiever badge');
  });

  return runner.run();
}
