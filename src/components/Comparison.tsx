import React, { useState, useEffect, useMemo } from 'react';
import { characters, statLabels, statsList, pairings, Pairing } from '../data/characters';
import { DraftSelection } from './PlayerCard';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Swords, Zap, Share2, Check, Sparkles } from 'lucide-react';
import { ClashRow } from './ClashRow';
import { ClashReport, ClashRound } from './ClashReport';
import { HaloRays, CursedEmbers, ShockRing } from './TransitionFX';
import { initializePlayer, recordMatchResult } from '../utils/leaderboard';
import {
  achievements,
  unlockAchievement,
  getUnlockedAchievements,
  type AchievementContext,
} from '../utils/achievements';
import { addMatchRecord } from '../utils/playerStats';

interface ComparisonProps {
  players: DraftSelection[];
  roundWins: number[];
  readyToReset?: boolean[];
  onReset: (winners: number[], finalScores: number[]) => void;
  isMultiplayer?: boolean;
  onPlayAgain?: () => void;
}

export function Comparison({
  players,
  roundWins,
  readyToReset,
  onReset,
  isMultiplayer = false,
  onPlayAgain,
}: ComparisonProps) {
  const [currentStatIndex, setCurrentStatIndex] = useState(-1);
  const [scores, setScores] = useState<number[]>(new Array(players.length).fill(0));
  const [isFinished, setIsFinished] = useState(false);
  const [blackFlashes, setBlackFlashes] = useState<boolean[][]>([]);
  const [newAchievement, setNewAchievement] = useState<string | null>(null);
  const [showExpansionConfirm, setShowExpansionConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showPlayAgainConfirm, setShowPlayAgainConfirm] = useState(false);
  const [hasClickedReset, setHasClickedReset] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const getWinners = () => {
    const maxScore = Math.max(...scores);
    return players.map((_, i) => i).filter((i) => scores[i] === maxScore);
  };

  const handleShare = () => {
    const winners = getWinners();
    const winnerNames = winners.map((i) => players[i].playerName || `Player ${i + 1}`).join(' & ');

    // Find best synergy for winner
    const winnerIndex = winners[0];
    const activePairings = pairings.filter((pairing) =>
      pairing.entities.every((id) => Object.values(players[winnerIndex]).includes(id))
    );
    const bestSynergy = activePairings.length > 0 ? activePairings[0].name : 'No special synergy';

    const shareText = `I just won a JJK Stat Clash match! 🏆
    
Winner: ${winnerNames}
Best Synergy: ${bestSynergy}

Try it yourself: https://jjk-stat-clash.vercel.app
#JJKStatClash #JujutsuKaisen`;

    navigator.clipboard
      .writeText(shareText)
      .then(() => {
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
      })
      .catch(() => {});
  };

  const displayWins = [...roundWins];
  if (isFinished) {
    getWinners().forEach((w) => displayWins[w]++);
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  // Check achievements when the match finishes
  useEffect(() => {
    if (isFinished) {
      const unlocked = getUnlockedAchievements();
      const totalBlackFlashes = blackFlashes.flat().filter(Boolean).length;
      const activePairingIds = pairings
        .filter((p) =>
          p.entities.every((id) => players.some((pl) => Object.values(pl).includes(id)))
        )
        .map((p) => p.id);
      // bindingVow is optional — a complete draft doesn't require it, so
      // Perfectionist shouldn't either.
      const allSlotsFilled = players.every((pl) =>
        statsList.every((s) => s === 'bindingVow' || pl[s] !== null)
      );

      const winners = getWinners();
      const sortedScores = [...scores].sort((a, b) => b - a);
      const topMargin = sortedScores.length > 1 ? sortedScores[0] - sortedScores[1] : 0;

      // Save match record
      players.forEach((p, i) => {
        addMatchRecord({
          date: new Date().toISOString(),
          mode: isMultiplayer ? 'multiplayer' : 'local',
          playerCount: players.length,
          won: winners.includes(i),
          playerName: p.playerName || `Player ${i + 1}`,
          score: scores[i] || 0,
          opponentScore: scores[i === 0 ? 1 : 0] || 0,
          pairingsUsed: activePairingIds,
        });
      });

      for (let playerIdx = 0; playerIdx < players.length; playerIdx++) {
        const ctx: AchievementContext = {
          hasWon: winners.includes(playerIdx),
          roundWins: [...roundWins],
          totalWins: winners.length,
          totalMatches: 1,
          playerIndex: playerIdx,
          activePairings: activePairingIds,
          blackFlashCount: totalBlackFlashes,
          playerBlackFlashes: blackFlashes.reduce((n, row) => n + (row[playerIdx] ? 1 : 0), 0),
          statRoundsWon: clashRounds.filter(
            (r) => r.winners.length === 1 && r.winners[0] === playerIdx
          ).length,
          statRoundsLost: clashRounds.filter(
            (r) => r.winners.length === 1 && r.winners[0] !== playerIdx
          ).length,
          winMargin: winners.includes(playerIdx) ? topMargin : 0,
          allSlotsFilled,
        };
        for (const a of achievements) {
          if (!unlocked.includes(a.id) && a.check(ctx)) {
            if (unlockAchievement(a.id)) {
              setNewAchievement(a.name);
              setTimeout(() => setNewAchievement(null), 4000);
            }
          }
        }
      }
    }
  }, [isFinished]);

  // Record match results to leaderboard when comparison finishes (only for multiplayer)
  useEffect(() => {
    if (isFinished && isMultiplayer) {
      const winners = getWinners();

      players.forEach((player, index) => {
        const playerName = player.playerName || `Player ${index + 1}`;
        const PLAYER_UUID_KEY = 'jjk-player-uuid';
        let playerUuid = localStorage.getItem(PLAYER_UUID_KEY);
        if (!playerUuid) {
          try {
            playerUuid = crypto.randomUUID();
          } catch {
            playerUuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
              const r = (Math.random() * 16) | 0;
              return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
            });
          }
          localStorage.setItem(PLAYER_UUID_KEY, playerUuid);
        }
        const playerId = `${playerName}-${playerUuid}`;
        const won = winners.includes(index);

        // Calculate best synergy combo
        const activePairings = pairings.filter((pairing) =>
          pairing.entities.every((id) => Object.values(player).includes(id))
        );
        const bestSynergy = activePairings.length > 0 ? activePairings[0].name : '';

        // Initialize player and record result
        initializePlayer(playerId, playerName)
          .then(() => {
            recordMatchResult(playerId, playerName, won, bestSynergy);
          })
          .catch((err) => {
            console.error('Failed to record match result:', err);
          });
      });
    }
  }, [isFinished, players, isMultiplayer]);

  useEffect(() => {
    // Generate a deterministic seed based on draft picks and round count
    let seedStr = players.map((p) => Object.values(p).join('')).join('') + roundWins.join('-');
    let seed = 0;
    for (let i = 0; i < seedStr.length; i++) {
      seed = (seed << 5) - seed + seedStr.charCodeAt(i);
      seed |= 0;
    }
    const seededRandom = () => {
      let t = (seed += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };

    const flashes = statsList.map(() => players.map(() => false));

    players.forEach((player, playerIndex) => {
      const hasBlackFlashAbility = Object.values(player).includes('black-flash');

      // Scale base chance by body stat of the drafted Body character
      const char = characters.find((c) => c.id === player.body);
      const bodyStat = (char as any)?.stats?.body || 50;

      statsList.forEach((stat, statIndex) => {
        // Black Flash is essentially for physical strikes (Strength/Body)
        const isPhysical = ['strength', 'body', 'speed'].includes(stat);

        let chance = hasBlackFlashAbility ? 0.08 : 0.015;
        if (isPhysical) {
          // Boost chance for physical slots based on body mastery
          chance += bodyStat / 1000;
        } else {
          // Significantly lower chance for non-physical categories
          chance *= 0.2;
        }

        if (seededRandom() < chance) {
          flashes[statIndex][playerIndex] = true;
        }
      });

      // Pity system for Black Flash ability holders — scoped to this player
      if (hasBlackFlashAbility && !flashes.some((row) => row[playerIndex])) {
        const physicalStats = statsList.filter((s) => ['strength', 'body', 'speed'].includes(s));
        const randomStat = physicalStats[Math.floor(seededRandom() * physicalStats.length)];
        const targetIndex = statsList.indexOf(randomStat);
        if (targetIndex !== -1) flashes[targetIndex][playerIndex] = true;
      }
    });

    setBlackFlashes(flashes);
  }, [players]);

  const hasHeavenlyRestriction = (draft: DraftSelection) => {
    return (
      ['toji', 'maki'].includes(draft.body as string) ||
      Object.values(draft).includes('heavenly-restriction')
    );
  };

  const getStatValue = (
    draft: DraftSelection,
    statKey: string,
    allPlayers: DraftSelection[],
    isBlackFlash: boolean = false
  ) => {
    const entityId = draft[statKey];
    const entity = characters.find((c) => c.id === entityId);
    let baseValue = 0;
    if (entity) {
      if (entity.category === 'character') {
        baseValue = (entity as any).stats[statKey] || 0;
      } else {
        baseValue = (entity as any).statValue || 0;
      }
    }

    const isHR = hasHeavenlyRestriction(draft);

    if (isHR && ['ct', 'ce', 'domainExpansion'].includes(statKey)) {
      return { baseValue, bonus: -baseValue, total: 0, isBlackFlash: false, isNullified: true };
    }

    const tool = draft.tool;

    const vow = draft.bindingVow;

    if (vow === 'simple-territory' && statKey === 'domainExpansion') {
      return { baseValue, bonus: -baseValue, total: 0, isBlackFlash: false, isNullified: true };
    }

    if (vow === 'heavenly-pact' && ['ce', 'ct', 'domainExpansion'].includes(statKey)) {
      return { baseValue, bonus: -baseValue, total: 0, isBlackFlash: false, isNullified: true };
    }

    if (vow === 'future-sacrifice' && ['ce', 'ct'].includes(statKey)) {
      return { baseValue, bonus: -baseValue, total: 0, isBlackFlash: false, isNullified: true };
    }

    const draftedEntityIds = Object.values(draft).filter(Boolean) as string[];
    let bonus = 0;
    pairings.forEach((pairing) => {
      if (pairing.entities.every((id) => draftedEntityIds.includes(id))) {
        if (pairing.bonusStats[statKey as keyof typeof pairing.bonusStats]) {
          bonus += pairing.bonusStats[statKey as keyof typeof pairing.bonusStats]!;
        }
      }
    });

    if (isHR && ['speed', 'durability', 'iq'].includes(statKey)) {
      bonus += 25;

      // HR Niche: Immunity to Domain barriers translates to extra durability vs DE users
      if (statKey === 'durability') {
        const anyOpponentDE = allPlayers.some((p) => p !== draft && p.domainExpansion);
        if (anyOpponentDE) {
          bonus += 35;
        }
      }
    }

    if (entityId === 'gojo' && ['speed', 'durability'].includes(statKey)) {
      const hasLimitless = Object.values(draft).includes('limitless');
      const hasSixEyes = Object.values(draft).includes('six-eyes');
      if (!hasLimitless || !hasSixEyes) {
        bonus -= 15;
      }
    }

    // Gojo + Six Eyes Efficiency
    if (entityId === 'gojo' && Object.values(draft).includes('six-eyes')) {
      if (['ce', 'ct', 'domainExpansion'].includes(statKey)) {
        bonus += Math.floor(baseValue * 0.2);
      }
    }

    // Domain Refinement Mechanic
    if (statKey === 'domainExpansion' && baseValue > 0) {
      const iqValue = (entity as any)?.stats?.iq || 0;
      const ceValue = (entity as any)?.stats?.ce || 0;
      // Refinement is 10% of IQ + 5% of CE
      bonus += Math.floor(iqValue * 0.1 + ceValue * 0.05);
    }

    // Sukuna World Slash Niche
    if (
      entityId === 'sukuna' &&
      Object.values(draft).includes('shrine') &&
      Object.values(draft).includes('ten-shadows')
    ) {
      if (statKey === 'ct') {
        bonus += 40;
      }
    }

    if (vow === 'revealing-hand') {
      if (statKey === 'iq') {
        bonus -= 10;
      } else if (['ct', 'specialPower1', 'specialPower2', 'ce'].includes(statKey)) {
        bonus += Math.floor(baseValue * 0.2); // Buffed to 20%
      }
    } else if (vow === 'life-gamble') {
      if (statKey === 'durability') {
        return { baseValue, bonus: 1 - baseValue, total: 1, isBlackFlash: false };
      } else if (['strength', 'speed', 'body'].includes(statKey)) {
        bonus += baseValue;
      }
    } else if (vow === 'simple-territory') {
      if (statKey === 'durability') {
        const anyOpponentDE = allPlayers.some(
          (p) => p !== draft && p.domainExpansion && p.domainExpansion !== ''
        );
        if (anyOpponentDE) {
          bonus += 20;
        }
      }
    } else if (vow === 'overtime') {
      const isNanami = Object.values(draft).includes('nanami');
      const totalRounds = roundWins.reduce((a, b) => a + b, 0);
      const isLateGame = totalRounds >= 3;

      if (statKey === 'ce') {
        if (isNanami && isLateGame) {
          bonus += Math.floor(baseValue * 0.3); // 30% boost to CE
        } else {
          bonus -= 10;
        }
      } else if (['strength', 'speed', 'durability'].includes(statKey)) {
        // Base Overtime bonus
        bonus += 20;
        // Nanami specific late-game scaling
        if (isNanami && isLateGame) {
          bonus += 30; // Massive spike in Output (Strength/Speed/Durability)
        }
      }
    } else if (vow === 'heavenly-pact') {
      if (['strength', 'speed', 'durability'].includes(statKey)) {
        bonus += isHR ? 15 : 40; // If already HR, only add 15 to reach +40 total bonus
      }
    } else if (vow === 'future-sacrifice') {
      if (['strength', 'speed'].includes(statKey)) {
        bonus += 50;
      }
    } else if (vow === 'open-barrier') {
      if (statKey === 'domainExpansion') {
        bonus += 20;
      } else if (statKey === 'durability') {
        bonus -= 10;
      }
    } else if (vow === 'sacrificial-limb') {
      if (statKey === 'ce') {
        bonus += 20;
      } else if (statKey === 'body') {
        bonus -= 20;
      }
    }

    let finalTotal = baseValue + bonus;
    if (isBlackFlash && finalTotal > 0) {
      finalTotal = Math.floor(finalTotal * 2.5);
    }

    return { baseValue, bonus, total: finalTotal, isBlackFlash, isNullified: false };
  };

  const getActivePairings = (draft: DraftSelection) => {
    const draftedEntityIds = Object.values(draft).filter(Boolean) as string[];
    const active = pairings.filter((pairing) =>
      pairing.entities.every((id) => draftedEntityIds.includes(id))
    );
    if (hasHeavenlyRestriction(draft)) {
      active.push({
        id: 'heavenly-restriction-active',
        name: 'Heavenly Restriction',
        entities: [],
        bonusStats: { speed: 25, durability: 25, iq: 25 },
        description: '0 CE/CT/DE, +25 Speed/Durability/IQ, Immune to Sure-Hit.',
      });
    }

    const vow = draft.bindingVow;
    if (vow === 'revealing-hand') {
      active.push({
        id: 'vow-revealing-hand',
        name: "Revealing One's Hand",
        entities: [],
        bonusStats: {},
        description: '-10 IQ, +15% CT/Special',
      });
    } else if (vow === 'life-gamble') {
      active.push({
        id: 'vow-life-gamble',
        name: 'Life Gamble',
        entities: [],
        bonusStats: {},
        description: '1 Durability, 2x Strength/Speed',
      });
    } else if (vow === 'simple-territory') {
      active.push({
        id: 'vow-simple-territory',
        name: 'Simple Territory',
        entities: [],
        bonusStats: {},
        description: 'No DE, +20 Durability vs DE',
      });
    } else if (vow === 'overtime') {
      active.push({
        id: 'vow-overtime',
        name: 'Overtime',
        entities: [],
        bonusStats: {},
        description: '-10 CE, +20 Physicals',
      });
    } else if (vow === 'heavenly-pact') {
      active.push({
        id: 'vow-heavenly-pact',
        name: 'Heavenly Pact',
        entities: [],
        bonusStats: {},
        description: '0 Cursed Stats, +40 Physicals',
      });
    } else if (vow === 'future-sacrifice') {
      active.push({
        id: 'vow-future-sacrifice',
        name: 'Future Sacrifice',
        entities: [],
        bonusStats: {},
        description: '+50 Str/Spd, -50 CE/CT',
      });
    } else if (vow === 'open-barrier') {
      active.push({
        id: 'vow-open-barrier',
        name: 'Open Barrier',
        entities: [],
        bonusStats: {},
        description: '+20 DE, -10 Durability',
      });
    } else if (vow === 'sacrificial-limb') {
      active.push({
        id: 'vow-sacrificial-limb',
        name: 'Sacrificial Limb',
        entities: [],
        bonusStats: {},
        description: '+20 CE, -20 Body',
      });
    }

    return active;
  };

  // Per-stat round outcomes for the post-clash analysis report and achievements
  const clashRounds: ClashRound[] = useMemo(() => {
    return statsList.map((stat, statIndex) => {
      const values = players.map(
        (draft, i) =>
          getStatValue(draft, stat, players, blackFlashes[statIndex]?.[i] || false).total
      );
      const maxVal = Math.max(...values);
      const winners =
        maxVal > 0 ? values.map((v, i) => (v === maxVal ? i : -1)).filter((i) => i >= 0) : [];
      let margin = 0;
      if (winners.length === 1) {
        const runnerUp = Math.max(...values.filter((_, i) => i !== winners[0]));
        margin = maxVal - runnerUp;
      }
      return { stat, statName: statLabels[stat], values, winners, margin };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [players, blackFlashes]);

  useEffect(() => {
    if (currentStatIndex >= 0 && currentStatIndex < statsList.length) {
      const statKey = statsList[currentStatIndex];

      const values = players.map(
        (draft, i) =>
          getStatValue(draft, statKey, players, blackFlashes[currentStatIndex]?.[i] || false).total
      );

      setScores((prev) => {
        const newScores = [...prev];
        values.forEach((val, i) => {
          newScores[i] = (newScores[i] || 0) + val;
        });
        return newScores;
      });

      const timer = setTimeout(() => {
        setCurrentStatIndex((prev) => prev + 1);
      }, 2000);
      return () => clearTimeout(timer);
    } else if (currentStatIndex === statsList.length) {
      setIsFinished(true);
    }
  }, [currentStatIndex]);

  const startComparison = () => {
    setCurrentStatIndex(0);
    setScores(new Array(players.length).fill(0));
    setIsFinished(false);
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col items-center gap-8 p-4 relative">
      {/* Achievement Toast */}
      <AnimatePresence>
        {newAchievement && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-[9999] bg-yellow-950 border border-yellow-500/50 px-8 py-4 rounded-2xl shadow-[0_0_40px_rgba(234,179,8,0.3)] flex items-center gap-4"
          >
            <Sparkles className="text-yellow-400" size={24} />
            <div>
              <p className="text-yellow-400 font-black font-display text-lg uppercase tracking-wider">
                Achievement Unlocked!
              </p>
              <p className="text-zinc-300 font-mono text-sm">{newAchievement}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative flex flex-wrap justify-center gap-4 items-center bg-[#0a0a0a]/80 backdrop-blur-md border border-red-900/40 shadow-[0_0_20px_rgba(220,38,38,0.2)] px-6 py-3 rounded-2xl mb-4">
        <div className="absolute inset-0 bg-red-950/5 rounded-2xl pointer-events-none"></div>
        {players.map((p, i) => (
          <div key={i} className="flex gap-3 items-center relative z-10">
            <div className="flex flex-col items-end">
              <span className="font-mono text-[10px] font-black text-zinc-500 uppercase tracking-tighter leading-none">
                {p.playerName || `Player ${i + 1}`}
              </span>
              <span className="font-mono text-[9px] font-bold text-zinc-600 uppercase tracking-widest mt-0.5">
                Series Record
              </span>
            </div>
            <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-lg border border-red-900/20">
              <Trophy
                size={16}
                className={displayWins[i] > 0 ? 'text-yellow-500 animate-pulse' : 'text-zinc-700'}
              />
              <span className="font-display font-black text-red-500 text-2xl drop-shadow-[0_0_8px_rgba(220,38,38,0.6)]">
                {displayWins[i] || 0}
                <span className="text-xs ml-1 text-red-900/60 uppercase">Wins</span>
              </span>
            </div>
            {i < players.length - 1 && (
              <div className="h-8 w-px bg-zinc-800/50 mx-2 hidden md:block"></div>
            )}
          </div>
        ))}
      </div>

      <div className="w-full max-w-[100vw] pb-6 px-1 lg:px-4">
        <div className="flex flex-col items-center w-full mx-auto max-w-7xl">
          {/* HEADERS */}
          <div className="w-full mb-8 relative flex justify-center overflow-x-auto custom-scrollbar">
            <div
              className="grid w-full relative z-10 px-1 lg:px-4 gap-1 lg:gap-4 max-w-5xl min-w-max"
              style={{ gridTemplateColumns: `repeat(${players.length}, minmax(0, 1fr))` }}
            >
              {/* VS Divider */}
              {players.length === 2 && (
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0 opacity-20 pointer-events-none flex flex-col items-center mt-8">
                  <div className="w-px h-16 bg-gradient-to-b from-transparent via-red-500 to-transparent"></div>
                  <span className="font-display font-black text-4xl text-red-500 italic my-2">
                    VS
                  </span>
                  <div className="w-px h-16 bg-gradient-to-b from-red-500 via-red-500 to-transparent"></div>
                </div>
              )}

              {players.map((_, i) => (
                <div
                  key={i}
                  className="flex w-full flex-col items-center gap-2 md:gap-4 relative z-10 px-1 md:px-2"
                >
                  <div
                    className={`relative bg-[#0a0a0a] border-2 ${players.length > 4 ? 'w-10 h-10 md:w-16 md:h-16 lg:w-20 lg:h-20' : 'w-16 h-16 md:w-24 md:h-24 lg:w-32 lg:h-32'} rounded-full flex items-center justify-center transition-all duration-700 ${
                      isFinished && getWinners().includes(i)
                        ? 'border-yellow-500 shadow-[0_0_40px_rgba(234,179,8,0.4)] scale-110'
                        : 'border-zinc-800 shadow-inner'
                    }`}
                  >
                    <div className="absolute inset-1 rounded-full border border-zinc-800/50"></div>
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.02)_50%,transparent_75%,transparent_100%)] bg-[length:10px_10px] rounded-full pointer-events-none"></div>

                    <span
                      className={`${players.length > 4 ? 'text-xs md:text-xl lg:text-3xl' : 'text-xl md:text-3xl lg:text-5xl'} font-black font-display transition-colors duration-700 mt-1 ${isFinished && getWinners().includes(i) ? 'text-yellow-400 drop-shadow-[0_0_10px_rgba(234,179,8,0.8)]' : 'text-zinc-600'}`}
                    >
                      {players[i].playerName
                        ? players[i].playerName.substring(0, 2).toUpperCase()
                        : `P${i + 1}`}
                    </span>

                    <div
                      className={`absolute ${players.length > 4 ? '-bottom-2 md:-bottom-3' : '-bottom-3 md:-bottom-5'} left-1/2 -translate-x-1/2 bg-[#050505] border-2 px-2 md:px-4 py-0.5 md:py-1 rounded-full font-mono font-bold ${players.length > 4 ? 'text-[10px] md:text-sm lg:text-base' : 'text-sm md:text-xl lg:text-2xl'} shadow-lg transition-colors duration-700 ${isFinished && getWinners().includes(i) ? 'border-yellow-500 text-yellow-400' : 'border-red-900 text-white'}`}
                    >
                      {scores[i]}
                    </div>
                  </div>
                  <h3
                    className={`${players.length > 4 ? 'text-[10px] md:text-sm lg:text-base' : 'text-sm md:text-lg lg:text-2xl'} font-black font-display text-white text-center mt-2 md:mt-4 truncate max-w-full uppercase tracking-wider`}
                  >
                    {players[i].playerName || `Player ${i + 1}`}
                  </h3>

                  {/* Display Active Pairings */}
                  <div className="flex flex-col gap-1 mt-1 md:mt-2 w-full items-center">
                    {getActivePairings(players[i]).map((pairing) => (
                      <div
                        key={pairing.id}
                        className="bg-yellow-950/30 border border-yellow-600/30 rounded px-1.5 py-0.5 flex items-center justify-center gap-1 w-full max-w-[140px]"
                        title={pairing.description}
                      >
                        <Zap size={10} className="text-yellow-500 shrink-0 hidden md:block" />
                        <span className="text-[7px] md:text-[9px] text-yellow-400 font-mono font-bold truncate uppercase tracking-widest">
                          {pairing.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* INITIATE EXPANSION BLOCK */}
          {currentStatIndex === -1 && !isFinished && (
            <div className="w-full max-w-[100vw] xl:max-w-4xl space-y-8 mt-4 px-4 mb-8 mx-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#050505] border border-red-900/30 rounded-2xl p-8 relative overflow-hidden"
              >
                {/* Background scanner line animation */}
                <motion.div
                  animate={{ y: ['0%', '1000%', '0%'] }}
                  transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                  className="absolute top-0 left-0 right-0 h-px bg-red-500/20 z-0"
                />

                <div className="relative z-10 w-full max-w-full">
                  <div className="flex overflow-x-auto gap-4 mb-8 pb-4 custom-scrollbar">
                    {players.map((p, i) => (
                      <div
                        key={i}
                        className="min-w-[250px] shrink-0 bg-white/[0.02] border border-white/5 p-4 rounded-xl space-y-4"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-1.5 h-4 ${i === 0 ? 'bg-red-500' : 'bg-blue-500'}`}
                          ></div>
                          <span className="font-mono font-black text-[10px] text-white uppercase">
                            {p.playerName || `P${i + 1}`} METRIC
                          </span>
                        </div>
                        <div className="space-y-2">
                          {getActivePairings(p).length > 0 ? (
                            getActivePairings(p).map((pairing) => (
                              <motion.div
                                key={pairing.id}
                                initial={{ x: -10, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                className="bg-zinc-900/50 border-l-2 border-yellow-500 p-2 font-mono"
                              >
                                <div className="text-yellow-500 text-[10px] font-black uppercase tracking-tighter">
                                  {pairing.name}
                                </div>
                                <div className="text-zinc-400 text-[9px] uppercase leading-tight mt-1">
                                  SYNERGY DETECTED
                                </div>
                              </motion.div>
                            ))
                          ) : (
                            <div className="text-zinc-800 font-mono text-[9px] uppercase">
                              No abnormal power spikes detected.
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Added Public Synergies List */}
                  <div className="border-t border-white/5 pt-8">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-4 bg-yellow-500"></div>
                        <h3 className="text-sm font-black font-display text-white uppercase tracking-widest">
                          Confirmed Lore Bonds
                        </h3>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-600 uppercase">
                        System Archives v2.4.1
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 max-h-40 overflow-y-auto pr-4 custom-scrollbar">
                      {pairings
                        .filter((p) => !p.isSecret)
                        .map((pairing) => (
                          <div
                            key={pairing.id}
                            className="bg-zinc-950/40 border border-zinc-900 p-2 rounded hover:border-yellow-500/30 transition-colors"
                          >
                            <div className="text-yellow-600 text-[9px] font-black uppercase mb-1">
                              {pairing.name}
                            </div>
                            <div className="text-zinc-600 text-[8px] uppercase leading-tight">
                              {pairing.description}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="mt-10 flex justify-center">
                    {!showExpansionConfirm ? (
                      <button
                        onClick={() => setShowExpansionConfirm(true)}
                        className="bg-red-600 hover:bg-red-700 text-white font-black font-display py-5 px-20 rounded-full text-2xl uppercase tracking-[0.3em] shadow-[0_0_50px_rgba(220,38,38,0.3)] transition-all hover:scale-110 flex items-center gap-4 group relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        <Swords
                          size={32}
                          className="group-hover:rotate-12 transition-transform relative z-10"
                        />
                        <span className="relative z-10 font-black italic">Initiate Expansion</span>
                      </button>
                    ) : (
                      <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center">
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          className="flex flex-col items-center gap-6 bg-zinc-950 border border-red-500/50 p-10 rounded-3xl shadow-[0_0_100px_rgba(220,38,38,0.3)] relative"
                        >
                          <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>
                          <Swords size={48} className="text-red-500 mb-2 animate-pulse" />
                          <p className="text-red-500 font-black font-display text-2xl uppercase tracking-widest text-center">
                            Confirm Domain Expansion
                          </p>
                          <p className="text-zinc-400 font-mono text-xs uppercase tracking-widest text-center max-w-sm mb-4">
                            Once initiated, the clash cannot be stopped. Both sorcerers' stats will
                            be measured.
                          </p>
                          <div className="flex gap-4 w-full">
                            <button
                              onClick={() => {
                                setShowExpansionConfirm(false);
                                startComparison();
                              }}
                              className="flex-1 py-4 bg-red-600 text-white font-black uppercase tracking-[0.2em] rounded-xl hover:bg-red-500 transition-colors shadow-[0_0_30px_rgba(220,38,38,0.5)]"
                            >
                              Yes, Expand!
                            </button>
                            <button
                              onClick={() => setShowExpansionConfirm(false)}
                              className="flex-1 py-4 bg-zinc-900 text-zinc-400 font-bold uppercase tracking-[0.2em] rounded-xl border border-zinc-800 hover:bg-zinc-800 hover:text-white transition-colors"
                            >
                              Wait
                            </button>
                          </div>
                        </motion.div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Tactical Tips / Combat Directives */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-2">
                {[
                  {
                    label: 'SURE-HIT',
                    desc: 'Heavenly Restriction provides immunity to domain barrier techniques.',
                  },
                  {
                    label: 'BLACK FLASH',
                    desc: 'Critical hits grant a 2.5x multiplier to the active stat round.',
                  },
                  {
                    label: 'EFFICIENCY',
                    desc: 'High Intelligence and CE grant a hidden refinement bonus to expansion.',
                  },
                  {
                    label: 'VOWS',
                    desc: 'Drafting specific counter-techniques can nullify opponent base stats.',
                  },
                  {
                    label: 'OUTPUT',
                    desc: 'Maximum Cursed Output grants a +10 flat bonus to all Legendary entities.',
                  },
                  {
                    label: 'RCT',
                    desc: 'Healing abilities allow survival even after a lost Domain stat check.',
                  },
                  {
                    label: 'REFINEMENT',
                    desc: 'Special Power synergy increases domain tug-of-war priority.',
                  },
                  {
                    label: 'TOOL',
                    desc: 'Cursed Tools provide additive stat modifiers during physical rounds.',
                  },
                ].map((tip) => (
                  <div
                    key={tip.label}
                    className="bg-black/40 border border-white/5 p-2 rounded-lg hover:border-red-500/40 transition-colors group"
                  >
                    <div className="text-red-500 font-mono font-black text-[8px] mb-1 tracking-widest group-hover:text-red-400">
                      {tip.label}
                    </div>
                    <div className="text-zinc-600 text-[8px] font-mono uppercase leading-tight group-hover:text-zinc-400">
                      {tip.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CLASH ROWS */}
          <div className="w-full max-w-5xl relative flex flex-col gap-3">
            <AnimatePresence>
              {statsList.map((stat, index) => {
                const statData = players.map((draft, i) =>
                  getStatValue(draft, stat, players, blackFlashes[index]?.[i] || false)
                );
                const values = statData.map((d) => d.total);
                const maxVal = Math.max(...values);
                return (
                  <ClashRow
                    key={stat}
                    statKey={stat}
                    statName={statLabels[stat]}
                    players={players}
                    statData={statData}
                    isActive={index === currentStatIndex}
                    isPast={index < currentStatIndex}
                    maxVal={maxVal}
                  />
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {isFinished && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.5 }}
          className="mt-8 flex flex-col items-center gap-6 bg-[#0a0a0a] border-2 border-yellow-500/50 p-12 rounded-2xl shadow-[0_0_80px_rgba(234,179,8,0.2)] relative overflow-hidden group"
        >
          {/* Animated Background Elements */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(234,179,8,0.15)_0%,transparent_70%)] pointer-events-none"></div>
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.02)_50%,transparent_75%,transparent_100%)] bg-[length:10px_10px] pointer-events-none animate-[pulse_3s_linear_infinite]"></div>

          {/* Rotating halo rays + victory seal watermark + embers */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <HaloRays color="rgba(234,179,8,0.10)" />
            <motion.span
              aria-hidden
              initial={{ opacity: 0, scale: 1.4, rotate: -10 }}
              animate={{ opacity: 0.07, scale: 1, rotate: 0 }}
              transition={{ delay: 0.7, duration: 0.8, ease: 'easeOut' }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-black font-display text-yellow-500 select-none leading-none"
              style={{ fontSize: 'min(60vh, 420px)' }}
            >
              勝
            </motion.span>
            <CursedEmbers count={14} color="rgba(234,179,8,0.7)" maxDelay={1.6} />
          </div>
          <ShockRing delay={0.55} color="rgba(234,179,8,0.55)" maxScale={4} />

          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
            className="absolute -top-32 -left-32 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 15, ease: 'linear' }}
            className="absolute -bottom-32 -right-32 w-80 h-80 bg-red-500/10 rounded-full blur-3xl pointer-events-none"
          />

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{
              delay: 0.8,
              duration: 0.5,
              type: 'tween',
              times: [0, 0.5, 1],
              ease: 'easeInOut',
            }}
          >
            <Trophy
              size={80}
              className="text-yellow-500 drop-shadow-[0_0_30px_rgba(234,179,8,0.8)] relative z-10"
            />
          </motion.div>

          <div className="text-center relative z-10">
            <h2 className="text-6xl md:text-7xl font-black font-display text-white mb-4 tracking-wider uppercase drop-shadow-md">
              {(getWinners().length > 1 ? 'DRAW!' : 'WINNER!').split('').map((ch, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 40, rotateX: -90 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{
                    delay: 0.7 + i * 0.05,
                    type: 'spring',
                    stiffness: 220,
                    damping: 14,
                  }}
                  className="inline-block drop-shadow-[0_0_18px_rgba(234,179,8,0.35)]"
                >
                  {ch}
                </motion.span>
              ))}
            </h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="text-4xl md:text-5xl font-black font-display text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 uppercase tracking-widest drop-shadow-[0_0_15px_rgba(234,179,8,0.4)]"
            >
              {getWinners()
                .map((i) => players[i].playerName || `Player ${i + 1}`)
                .join(' & ')}
            </motion.p>
          </div>

          {!showResetConfirm ? (
            <div className="flex flex-col items-center gap-2 relative z-10 mt-8">
              <div className="flex gap-4 flex-wrap justify-center">
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  onClick={handleShare}
                  className="px-8 py-4 bg-zinc-950 border border-blue-500/30 text-blue-400 hover:text-blue-300 hover:border-blue-500/50 rounded-xl font-mono text-sm tracking-[0.2em] uppercase transition-all shadow-xl flex items-center gap-2"
                >
                  {shareCopied ? <Check size={16} /> : <Share2 size={16} />}
                  {shareCopied ? '[ Copied! ]' : '[ Share ]'}
                </motion.button>
                {onPlayAgain && (
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    onClick={() => setShowPlayAgainConfirm(true)}
                    className="px-8 py-4 bg-zinc-950 border border-green-500/30 text-green-400 hover:text-green-300 hover:border-green-500/50 rounded-xl font-mono text-sm tracking-[0.2em] uppercase transition-all shadow-xl"
                  >
                    [ Play Again ]
                  </motion.button>
                )}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  disabled={hasClickedReset}
                  onClick={() => {
                    if (!readyToReset) {
                      onReset(getWinners(), scores);
                    } else {
                      setShowResetConfirm(true);
                    }
                  }}
                  className={`px-8 py-4 ${hasClickedReset ? 'bg-zinc-900 border-yellow-500/30 text-yellow-500/50 cursor-not-allowed' : 'bg-zinc-950 border-white/10 text-zinc-400 hover:text-white hover:border-white/30'} border rounded-xl font-mono text-sm tracking-[0.2em] uppercase transition-all shadow-xl`}
                >
                  {hasClickedReset || (readyToReset && readyToReset.some((r) => r))
                    ? `[ Waiting for Players: ${readyToReset ? readyToReset.filter(Boolean).length : 0} / ${readyToReset ? readyToReset.length : 0} ]`
                    : readyToReset
                      ? '[ Ready for New Round ]'
                      : '[ New Matchup ]'}
                </motion.button>
              </div>
              {(hasClickedReset || (readyToReset && readyToReset.some((r) => r))) && (
                <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest animate-pulse">
                  Waiting for all players to accept...
                </p>
              )}
            </div>
          ) : (
            <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="flex flex-col items-center gap-6 bg-zinc-950 border border-yellow-500/50 p-10 rounded-3xl shadow-[0_0_100px_rgba(234,179,8,0.2)] relative"
              >
                <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>
                <Trophy size={48} className="text-yellow-500 mb-2 animate-pulse" />
                <p className="text-yellow-500 font-black font-display text-2xl uppercase tracking-widest text-center">
                  Start Another Match?
                </p>
                <p className="text-zinc-400 font-mono text-xs uppercase tracking-widest text-center max-w-sm mb-4">
                  Are you ready to initiate a new drafting phase?
                </p>
                <div className="flex gap-4 w-full">
                  <button
                    onClick={() => {
                      setShowResetConfirm(false);
                      setHasClickedReset(true);
                      onReset(getWinners(), scores);
                    }}
                    className="flex-1 py-4 bg-yellow-500 text-black font-black uppercase tracking-[0.2em] rounded-xl hover:bg-yellow-400 transition-colors shadow-[0_0_30px_rgba(234,179,8,0.3)]"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="flex-1 py-4 bg-zinc-900 text-zinc-400 font-bold uppercase tracking-[0.2em] border border-zinc-800 rounded-xl hover:bg-zinc-800 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {showPlayAgainConfirm && (
            <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="flex flex-col items-center gap-6 bg-zinc-950 border border-green-500/50 p-10 rounded-3xl shadow-[0_0_100px_rgba(34,197,94,0.2)] relative"
              >
                <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent"></div>
                <Swords size={48} className="text-green-500 mb-2" />
                <p className="text-green-500 font-black font-display text-2xl uppercase tracking-widest text-center">
                  New Game?
                </p>
                <p className="text-zinc-400 font-mono text-xs uppercase tracking-widest text-center max-w-sm mb-4">
                  This will reset all drafts and scores. Are you sure?
                </p>
                <div className="flex gap-4 w-full">
                  <button
                    onClick={() => {
                      setShowPlayAgainConfirm(false);
                      onPlayAgain?.();
                    }}
                    className="flex-1 py-4 bg-green-500 text-black font-black uppercase tracking-[0.2em] rounded-xl hover:bg-green-400 transition-colors shadow-[0_0_30px_rgba(34,197,94,0.3)]"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setShowPlayAgainConfirm(false)}
                    className="flex-1 py-4 bg-zinc-900 text-zinc-400 font-bold uppercase tracking-[0.2em] border border-zinc-800 rounded-xl hover:bg-zinc-800 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          <button
            onClick={() => (window.location.href = '/play')}
            className="mt-4 text-[10px] font-mono text-zinc-600 hover:text-white uppercase tracking-widest transition-colors relative z-10"
          >
            [ Return to Hub ]
          </button>
        </motion.div>
      )}

      {isFinished && (
        <ClashReport
          players={players}
          scores={scores}
          rounds={clashRounds}
          blackFlashes={blackFlashes}
        />
      )}
    </div>
  );
}
