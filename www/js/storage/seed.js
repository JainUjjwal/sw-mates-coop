/**
 * Default Seed Fixtures for SweatCircle
 * Prepopulates active user and multiple isolated friend circles
 */
export const SEED_CURRENT_USER_ID = 'user_me';

export const SEED_PROFILES = [
  {
    id: 'user_me',
    name: 'Alex (You)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    primaryWearable: 'Apple Watch'
  },
  {
    id: 'user_sam',
    name: 'Sam R.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    primaryWearable: 'Pixel Watch'
  },
  {
    id: 'user_jordan',
    name: 'Jordan K.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    primaryWearable: 'Garmin'
  },
  {
    id: 'user_taylor',
    name: 'Mom (Taylor)',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    primaryWearable: 'WHOOP'
  }
];

export const SEED_CIRCLES = [
  {
    id: 'circle_iron',
    name: 'Iron Squad',
    emoji: '🏋️‍♂️',
    category: 'Gym & Lifting',
    wager: 'Loser buys post-workout protein smoothies for everyone',
    weeklyStreak: 4,
    members: [
      { id: 'user_me', weeklyTargetDays: 4 },
      { id: 'user_sam', weeklyTargetDays: 4 },
      { id: 'user_jordan', weeklyTargetDays: 4 }
    ]
  },
  {
    id: 'circle_family',
    name: 'Family Wellness',
    emoji: '🥗',
    category: 'Walks & Meals',
    wager: 'Loser cooks Sunday dinner for the whole family',
    weeklyStreak: 2,
    members: [
      { id: 'user_me', weeklyTargetDays: 3 },
      { id: 'user_taylor', weeklyTargetDays: 3 }
    ]
  }
];

export async function seedDatabaseIfEmpty(dbInstance) {
  const existingCircles = await dbInstance.getAll('circles');
  if (existingCircles && existingCircles.length > 0) {
    return false; // Already seeded
  }

  for (const profile of SEED_PROFILES) {
    await dbInstance.put('profiles', profile);
  }

  for (const circle of SEED_CIRCLES) {
    await dbInstance.put('circles', circle);
  }

  await dbInstance.put('progression', {
    userId: SEED_CURRENT_USER_ID,
    xp: 650,
    level: 3,
    badges: ['First Sweat', 'Circle Pioneer']
  });

  return true;
}
