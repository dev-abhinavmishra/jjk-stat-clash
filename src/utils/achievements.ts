export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  check: (context: AchievementContext) => boolean;
}

export interface AchievementContext {
  hasWon: boolean;
  roundWins: number[];
  totalWins: number;
  totalMatches: number;
  playerIndex: number;
  activePairings: string[];
  blackFlashCount: number;
  playerBlackFlashes: number;
  statRoundsWon: number;
  statRoundsLost: number;
  winMargin: number;
  allSlotsFilled: boolean;
}

const STORAGE_KEY = 'jjk-achievements';

export function getUnlockedAchievements(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function unlockAchievement(id: string): boolean {
  const unlocked = getUnlockedAchievements();
  if (unlocked.includes(id)) return false;
  unlocked.push(id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(unlocked));
  return true;
}

export const achievements: Achievement[] = [
  {
    id: 'first-blood',
    name: 'First Blood',
    description: 'Complete your first match',
    icon: '⚔️',
    check: (ctx) => ctx.totalMatches >= 1,
  },
  {
    id: 'first-win',
    name: 'Domain Expansion',
    description: 'Win your first match',
    icon: '🏆',
    check: (ctx) => ctx.hasWon && ctx.totalWins >= 1,
  },
  {
    id: 'honored-one',
    name: 'The Honored One',
    description: 'Complete the Honored One pairing (Gojo + Limitless + Six Eyes)',
    icon: '🔵',
    check: (ctx) => ctx.activePairings.includes('honored-one'),
  },
  {
    id: 'king-of-curses',
    name: 'King of Curses',
    description: 'Complete the King of Curses pairing (Sukuna + Shrine + Malevolent Shrine)',
    icon: '👹',
    check: (ctx) => ctx.activePairings.includes('king-of-curses'),
  },
  {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: 'Win with all stat slots filled',
    icon: '💎',
    check: (ctx) => ctx.hasWon && ctx.allSlotsFilled,
  },
  {
    id: 'comeback-king',
    name: 'Comeback King',
    description: 'Win after losing the first round',
    icon: '🔄',
    check: (ctx) =>
      ctx.hasWon && ctx.roundWins.length >= 2 && ctx.roundWins.filter((w) => w > 0).length === 1,
  },
  {
    id: 'black-flash-master',
    name: 'Black Flash Master',
    description: 'Land 3+ Black Flashes in a single clash',
    icon: '⚡',
    check: (ctx) => ctx.blackFlashCount >= 3,
  },
  {
    id: 'collector',
    name: 'Collector',
    description: 'Complete 3 different pairings in a single draft',
    icon: '📚',
    check: (ctx) => ctx.activePairings.length >= 3,
  },
  {
    id: 'secret-hunter',
    name: 'Secret Hunter',
    description: 'Unlock a secret pairing',
    icon: '🔮',
    check: (ctx) => ctx.activePairings.some((p) => p.startsWith('secret-')),
  },
  {
    id: 'sweep',
    name: 'Perfect Sweep',
    description: 'Win without losing a single stat round',
    icon: '🧹',
    check: (ctx) => ctx.hasWon && ctx.statRoundsLost === 0,
  },
  {
    id: 'overwhelming-force',
    name: 'Overwhelming Force',
    description: 'Win 10+ stat rounds in a single clash',
    icon: '💥',
    check: (ctx) => ctx.statRoundsWon >= 10,
  },
  {
    id: 'photo-finish',
    name: 'Photo Finish',
    description: 'Win a clash by a margin of 25 points or fewer',
    icon: '📸',
    check: (ctx) => ctx.hasWon && ctx.winMargin <= 25,
  },
  {
    id: 'black-flash-adept',
    name: 'Black Flash Adept',
    description: 'Land 2+ Black Flashes on your own build in a single clash',
    icon: '✨',
    check: (ctx) => ctx.playerBlackFlashes >= 2,
  },
];
