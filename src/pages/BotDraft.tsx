import React, { useState, useEffect, useRef } from 'react';
import { characters, statsList, statLabels, statCategoryMap, Entity } from '../data/characters';
import {
  PlayerCard,
  DraftSelection,
  SearchableSelect,
  bindingVows,
} from '../components/PlayerCard';
import { DraftTimer } from '../components/DraftTimer';
import { AchievementsModal } from '../components/Achievements';
import { StatsModal } from '../components/StatsModal';
import { Comparison } from '../components/Comparison';
import { CursedConvergenceTransition } from '../components/CursedConvergenceTransition';
import { PhaseTransition } from '../components/PhaseTransition';
import { HelpPage } from '../components/HelpPage';
import { GameNavbar } from '../components/GameNavbar';
import { HowToPlayTutorial } from '../components/HowToPlayTutorial';
import { FeedbackSystem } from '../components/FeedbackSystem';
import { motion, AnimatePresence } from 'motion/react';
import { SystemProtocol } from '../components/SystemProtocol';
import { BanPhase } from '../components/BanPhase';
import {
  Swords,
  Ban,
  CheckCircle2,
  Trophy,
  Clock,
  Cpu,
  ArrowLeft,
  Dices,
  Sparkles,
  Target,
  Zap,
  Shield,
  AlertTriangle,
  Skull,
  X,
  HelpCircle,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getBotPick } from '../utils/botLogic';
import {
  saveDraft,
  saveFullGameState,
  loadFullGameState,
  getSavedDrafts,
  deleteDraft,
  SavedDraft,
} from '../utils/draftStorage';
import { Helmet } from 'react-helmet-async';

const TURN_TIME_SECONDS = 30;

const emptyDraft = (): DraftSelection => {
  const draft: Partial<DraftSelection> = {};
  statsList.forEach((stat) => {
    draft[stat] = null;
  });
  return draft as DraftSelection;
};

export default function BotDraft() {
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | null>(null);
  const [draftMode, setDraftMode] = useState<'normal' | 'gamble'>('normal');
  const [gambleConfig, setGambleConfig] = useState({
    totalRolls: 50,
    luckyRolls: 10,
    rollsPerStat: 5,
  });
  interface GambleState {
    remainingTotal: number;
    remainingLucky: number;
    statRolls: Record<string, number>;
  }

  const [gambleStates, setGambleStates] = useState<Record<number, GambleState>>({
    0: { remainingTotal: 50, remainingLucky: 10, statRolls: {} },
    1: { remainingTotal: 50, remainingLucky: 10, statRolls: {} },
  });

  const [players, setPlayers] = useState<DraftSelection[]>([emptyDraft(), emptyDraft()]);
  const [draftPhase, setDraftPhase] = useState<
    'setup' | 'gambleConfig' | 'banning' | 'drafting' | 'comparing' | 'transitioning'
  >('setup');
  const [bans, setBans] = useState<string[][]>([[], []]);
  const [roundWins, setRoundWins] = useState<number[]>([0, 0]);
  const [matchHistory, setMatchHistory] = useState<any[]>([]);

  // Turn-based State
  const [activePlayer, setActivePlayer] = useState<number>(0);
  const [activeRollingStat, setActiveRollingStat] = useState<string | null>(null);
  const [extraTurns, setExtraTurns] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState<number>(TURN_TIME_SECONDS);
  const [activeOverlay, setActiveOverlay] = useState<
    | 'ban'
    | 'clash'
    | 'startToBan'
    | 'startToDraft'
    | 'banToDraft'
    | 'transitioning'
    | 'gambleConfig'
    | null
  >(null);
  const [isSavedDraftsOpen, setIsSavedDraftsOpen] = useState(false);
  const [savedDrafts, setSavedDrafts] = useState<SavedDraft[]>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isSaveConfirmOpen, setIsSaveConfirmOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timerDuration] = useState(120);

  const allSelected = players.every((draft) => statsList.every((stat) => draft[stat] !== null));

  // Timer & Auto-Turn Logic
  useEffect(() => {
    if (draftPhase !== 'drafting' || allSelected) return;

    if (activePlayer === 1 && difficulty) {
      const delay = 1000 + Math.random() * 2000;
      const botTimer = setTimeout(() => {
        executeBotTurnRef.current();
      }, delay);
      return () => clearTimeout(botTimer);
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setTimeout(() => executeAutoTurnRef.current(0), 0);
          return TURN_TIME_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [draftPhase, activePlayer, allSelected, players]);

  const handleSaveDraft = () => setIsSaveConfirmOpen(true);

  const confirmSaveDraft = () => {
    const success = saveFullGameState(players, bans, `Draft ${getSavedDrafts().length + 1}`);
    if (success) {
      setSavedDrafts(getSavedDrafts());
    }
    setIsSaveConfirmOpen(false);
  };

  const handleLoadDraft = (saved: SavedDraft) => {
    const state = loadFullGameState(saved.id);
    if (state) {
      setPlayers(state.players.map((p) => ({ ...p })));
      setBans(state.bans.map((b) => [...b]));
    }
    setIsSavedDraftsOpen(false);
  };

  const handleDeleteDraft = (id: string) => {
    const success = deleteDraft(id);
    if (success) {
      setSavedDrafts(getSavedDrafts());
    }
    setDeleteConfirmId(null);
  };

  const executeBotTurnRef = useRef<() => void>(() => {});
  const executeAutoTurnRef = useRef<(pIndex: number) => void>(() => {});

  const executeBotTurn = () => {
    if (!difficulty) return;

    if (draftMode === 'gamble') {
      const emptyStats = statsList.filter((stat) => !players[1][stat]);
      if (emptyStats.length === 0) {
        passTurn();
        return;
      }

      const currentState = gambleStates[1];

      if (difficulty === 'hard') {
        const takenIds = new Set<string>();
        players.forEach((draft) => {
          Object.values(draft).forEach((id) => {
            if (typeof id === 'string') takenIds.add(id);
          });
        });
        const globalBans = bans.flat().filter(Boolean);
        const pick = getBotPick(difficulty, players[1], [players[0]], globalBans, takenIds);
        if (pick) {
          handleSelect(1, pick.stat, pick.id);
        } else {
          executeAutoTurn(1);
        }
        return;
      }

      if (difficulty === 'medium') {
        if (activeRollingStat) {
          handleFinishGambleTurn();
          return;
        }
        const statToRoll = emptyStats[Math.floor(Math.random() * emptyStats.length)];
        const category =
          statToRoll === 'bindingVow' ? 'bindingVow' : statCategoryMap[statToRoll] || 'character';

        const selectedIds = new Set<string>();
        players.forEach((d) => {
          Object.values(d).forEach((id) => {
            if (typeof id === 'string') selectedIds.add(id);
          });
        });
        const globalBans = bans.flat().filter(Boolean);

        let available = characters.filter((entity) => {
          if (entity.category !== category) return false;
          if (globalBans.includes(entity.id)) return false;
          if (entity.id !== 'binding-vow' && selectedIds.has(entity.id)) return false;
          return true;
        });

        if (available.length > 0) {
          const numRolls = Math.min(3, currentState.remainingTotal);
          let bestEntity = available[0];
          let bestPower = -1;

          for (let i = 0; i < numRolls; i++) {
            let roll = available[Math.floor(Math.random() * available.length)];
            if (category === 'character' && Math.random() < 0.3) {
              const humanEntity = available.find((c) => c.id === 'human');
              if (humanEntity) roll = humanEntity as any;
            }

            const power =
              ('statValue' in roll
                ? roll.statValue
                : roll.stats?.[statToRoll as keyof typeof roll.stats]) || 50;
            if (power > bestPower) {
              bestPower = power;
              bestEntity = roll;
            }
          }

          const newGambleStates = { ...gambleStates };
          newGambleStates[1] = {
            ...currentState,
            remainingTotal: currentState.remainingTotal - numRolls,
            statRolls: {
              ...currentState.statRolls,
              [statToRoll]: (currentState.statRolls[statToRoll] || 0) + 1,
            },
          };
          setGambleStates(newGambleStates);

          const newPlayers = [...players];
          newPlayers[1] = { ...newPlayers[1], [statToRoll]: bestEntity.id };
          newPlayers[1] = validateDraft(newPlayers[1]);
          setPlayers(newPlayers);

          if (!activeRollingStat) setActiveRollingStat(statToRoll);
          setTimeout(() => handleFinishGambleTurn(), 500);
        } else {
          passTurn();
        }
        return;
      }

      // Easy difficulty logic
      const statToRoll = emptyStats[Math.floor(Math.random() * emptyStats.length)];
      if (!activeRollingStat) {
        handleGambleRoll(1, statToRoll, false);
      } else {
        handleFinishGambleTurn();
      }
      return;
    }

    const takenIds = new Set<string>();
    players.forEach((draft) => {
      Object.values(draft).forEach((id) => {
        if (typeof id === 'string') takenIds.add(id);
      });
    });

    const globalBans = bans.flat().filter(Boolean);
    const pick = getBotPick(difficulty, players[1], [players[0]], globalBans, takenIds);

    if (pick) {
      handleSelect(1, pick.stat, pick.id);
    } else {
      // Fallback
      executeAutoTurn(1);
    }
  };
  executeBotTurnRef.current = executeBotTurn;

  const handleGambleRoll = (playerIndex: number, stat: string, isLucky: boolean) => {
    if (draftMode === 'gamble' && playerIndex !== activePlayer) return;
    if (activeRollingStat && activeRollingStat !== stat) return;

    const currentState = gambleStates[playerIndex];
    if (!currentState) return;

    const isVow = stat === 'bindingVow';
    if (!isVow && currentState.remainingTotal <= 0) return;
    if ((currentState.statRolls[stat] || 0) >= gambleConfig.rollsPerStat) return;
    if (isLucky && currentState.remainingLucky <= 0) return;

    const draft = players[playerIndex];
    const category = stat === 'bindingVow' ? 'bindingVow' : statCategoryMap[stat] || 'character';

    const selectedIds = new Set<string>();
    players.forEach((d) => {
      Object.values(d).forEach((id) => {
        if (typeof id === 'string') selectedIds.add(id);
      });
    });
    const globalBans = bans.flat().filter(Boolean);

    let available = characters.filter((entity) => {
      if (entity.category !== category) return false;
      if (globalBans.includes(entity.id)) return false;
      if (entity.id !== 'binding-vow' && selectedIds.has(entity.id)) return false;
      return true;
    });

    if (stat === 'bindingVow') available = bindingVows as any;

    if (available.length === 0) return;

    if (isLucky) {
      const getEntityPower = (entity: any) => {
        let pwr = 50;
        if (entity.statValue) pwr = entity.statValue;
        else if (entity.stats && entity.stats[stat]) pwr = entity.stats[stat];
        const grade = entity.grade || '';
        if (grade === 'Calamity') pwr += 200;
        else if (grade === 'Mythic') pwr += 100;
        else if (grade === 'Legendary') pwr += 50;
        return pwr;
      };

      const sorted = [...available].sort((a, b) => getEntityPower(b) - getEntityPower(a));
      available = sorted.slice(0, Math.max(1, Math.ceil(sorted.length * 0.3)));
    }

    let randomEntity = available[Math.floor(Math.random() * available.length)];
    if (category === 'character' && !isLucky && Math.random() < 0.3) {
      const humanEntity = available.find((c) => c.id === 'human');
      if (humanEntity) randomEntity = humanEntity as any;
    }

    const newGambleStates = { ...gambleStates };
    newGambleStates[playerIndex] = {
      ...currentState,
      remainingTotal: isVow
        ? Number(currentState.remainingTotal)
        : Number(currentState.remainingTotal) - 1,
      remainingLucky:
        isLucky && !isVow
          ? Number(currentState.remainingLucky) - 1
          : Number(currentState.remainingLucky),
      statRolls: { ...currentState.statRolls, [stat]: (currentState.statRolls[stat] || 0) + 1 },
    };
    setGambleStates(newGambleStates);

    const newPlayers = [...players];
    newPlayers[playerIndex] = { ...newPlayers[playerIndex], [stat]: randomEntity.id };
    newPlayers[playerIndex] = validateDraft(newPlayers[playerIndex]);
    setPlayers(newPlayers);

    if (!activeRollingStat) {
      setActiveRollingStat(stat);
    }

    if (stat === 'bindingVow' && randomEntity.id) {
      setExtraTurns((prev) => ({ ...prev, [playerIndex]: (prev[playerIndex] || 0) + 1 }));
      handleFinishGambleTurn();
    }
  };

  const handleFinishGambleTurn = () => {
    setActiveRollingStat(null);

    if (extraTurns[activePlayer] > 0) {
      setExtraTurns((prev) => ({ ...prev, [activePlayer]: prev[activePlayer] - 1 }));
      setTimeLeft(TURN_TIME_SECONDS);
      return;
    }

    passTurn();
  };

  const executeAutoTurn = (pIndex: number) => {
    if (draftMode === 'gamble') {
      if (activeRollingStat) {
        handleFinishGambleTurn();
        return;
      }
      const emptyStats = statsList.filter((stat) => !players[pIndex][stat]);
      if (emptyStats.length === 0) {
        handleFinishGambleTurn();
        return;
      }
      const randomStat = emptyStats[Math.floor(Math.random() * emptyStats.length)];
      handleGambleRoll(pIndex, randomStat, false);
      // After auto-roll, immediately finish turn
      setTimeout(() => handleFinishGambleTurn(), 500);
      return;
    }

    const takenIds = new Set<string>();
    players.forEach((draft) => {
      Object.values(draft).forEach((id) => {
        if (typeof id === 'string') takenIds.add(id);
      });
    });
    const globalBans = bans.flat().filter(Boolean);

    const emptyStats = statsList.filter((stat) => !players[pIndex][stat]);
    if (emptyStats.length === 0) {
      passTurn();
      return;
    }

    const randomStat = emptyStats[Math.floor(Math.random() * emptyStats.length)];
    const category = statCategoryMap[randomStat] || 'character';

    const available = characters.filter((entity) => {
      if (entity.category !== category) return false;
      if (globalBans.includes(entity.id)) return false;
      if (entity.id !== 'binding-vow' && takenIds.has(entity.id)) return false;
      return true;
    });

    if (available.length > 0) {
      const pick = available[Math.floor(Math.random() * available.length)];
      handleSelect(pIndex, randomStat, pick.id);
    } else {
      passTurn();
    }
  };
  executeAutoTurnRef.current = executeAutoTurn;

  const passTurn = () => {
    setActivePlayer((prev) => (prev === 0 ? 1 : 0));
    setTimeLeft(TURN_TIME_SECONDS);
  };

  const validateDraft = (draft: DraftSelection) => {
    const newDraft = { ...draft };
    statsList.forEach((s) => {
      const selectedId = newDraft[s];
      if (selectedId) {
        const entity = characters.find((c) => c.id === selectedId);
        if (entity && 'prerequisite' in entity && entity.prerequisite) {
          if (!Object.values(newDraft).includes(entity.prerequisite)) newDraft[s] = null;
        }
      }
    });
    return newDraft as DraftSelection;
  };

  const handleSelect = (playerIndex: number, stat: string, entityId: string) => {
    // Only allow selection if it's that player's turn
    if (playerIndex !== activePlayer) return;

    // Prevent changing selection once made
    if (players[playerIndex][stat]) return;

    const newPlayers = [...players];
    const updatedDraft = { ...newPlayers[playerIndex], [stat]: entityId || null };
    newPlayers[playerIndex] = validateDraft(updatedDraft);
    setPlayers(newPlayers);
    passTurn();
  };

  const getAvailableEntities = (
    currentSelectedId: string | null,
    category: string,
    draft: DraftSelection
  ): Entity[] => {
    const selectedIds = new Set<string>();
    players.forEach((d) => {
      Object.values(d).forEach((id) => {
        if (typeof id === 'string') selectedIds.add(id);
      });
    });
    const globalBans = bans.flat().filter(Boolean);

    return characters.filter((entity) => {
      if (entity.category !== category) return false;
      if (globalBans.includes(entity.id) && entity.id !== currentSelectedId) return false;
      if (
        entity.id !== 'binding-vow' &&
        selectedIds.has(entity.id) &&
        entity.id !== currentSelectedId
      )
        return false;
      if ('prerequisite' in entity && entity.prerequisite) {
        if (!Object.values(draft).includes(entity.prerequisite)) return false;
      }
      return true;
    });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans relative overflow-x-hidden flex flex-col items-center pb-20">
      <Helmet>
        <title>Vs Bot | JJK Stat Clash</title>
      </Helmet>

      {/* Background elements common to all phases */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.1)_0%,transparent_50%)] pointer-events-none z-0"></div>

      {draftPhase === 'setup' ? (
        <div className="flex-1 flex items-center justify-center relative py-20 px-4 w-full">
          <button
            onClick={() => navigate('/play')}
            className="absolute top-8 left-8 text-zinc-500 hover:text-white flex items-center gap-2 font-mono uppercase text-sm z-20"
          >
            <ArrowLeft size={16} /> Return
          </button>

          <div className="z-10 flex flex-col items-center w-full max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-16"
            >
              <Cpu className="text-blue-500 mx-auto mb-6" size={64} />
              <h1 className="text-4xl md:text-6xl font-black font-display uppercase text-white mb-4 tracking-tighter">
                Simulated Combat
              </h1>
              <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.4em]">
                Protocol: Neutralize Simulated Sorcerer
              </p>
            </motion.div>

            {!difficulty ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
                <motion.button
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0 }}
                  onClick={() => setIsSavedDraftsOpen(true)}
                  className="flex flex-col items-center p-8 rounded-3xl border-2 border-zinc-800 bg-zinc-900/40 backdrop-blur-sm transition-all duration-500 group relative overflow-hidden hover:border-zinc-600 hover:bg-zinc-800/50"
                  whileHover={{ y: -10 }}
                >
                  <div className="mb-6 transform group-hover:scale-110 transition-transform duration-500">
                    <Clock className="text-zinc-400" size={32} />
                  </div>
                  <h2 className="text-3xl font-black uppercase tracking-widest mb-4 font-display text-zinc-400">
                    Load Draft
                  </h2>
                  <p className="text-zinc-600 font-mono text-[10px] text-center uppercase tracking-widest leading-relaxed">
                    Load a saved draft
                  </p>
                </motion.button>
                {[
                  {
                    id: 'easy',
                    title: 'Grade 4',
                    desc: 'Randomized drafting. For beginners.',
                    icon: <Shield className="text-green-500" size={32} />,
                    color: 'border-green-500/20 hover:border-green-500 text-green-500',
                    bg: 'hover:bg-green-500/5',
                    glow: 'rgba(34,197,94,0.2)',
                  },
                  {
                    id: 'medium',
                    title: 'Grade 1',
                    desc: 'Prioritizes high stats and character grades.',
                    icon: <AlertTriangle className="text-yellow-500" size={32} />,
                    color: 'border-yellow-500/20 hover:border-yellow-500 text-yellow-500',
                    bg: 'hover:bg-yellow-500/5',
                    glow: 'rgba(234,179,8,0.2)',
                  },
                  {
                    id: 'hard',
                    title: 'Special Grade',
                    desc: 'Hate drafting & complex synergy completion.',
                    icon: <Skull className="text-red-500" size={32} />,
                    color: 'border-red-500/20 hover:border-red-500 text-red-500',
                    bg: 'hover:bg-red-500/5',
                    glow: 'rgba(239,68,68,0.2)',
                  },
                ].map((diff, i) => (
                  <motion.button
                    key={diff.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => setDifficulty(diff.id as any)}
                    className={`flex flex-col items-center p-8 rounded-3xl border-2 bg-zinc-900/40 backdrop-blur-sm transition-all duration-500 group relative overflow-hidden ${diff.color} ${diff.bg}`}
                    style={{ boxShadow: `0 0 0 transparent` }}
                    whileHover={{ y: -10, boxShadow: `0 20px 40px ${diff.glow}` }}
                  >
                    <div className="mb-6 transform group-hover:scale-110 transition-transform duration-500">
                      {diff.icon}
                    </div>
                    <h2 className="text-3xl font-black uppercase tracking-widest mb-4 font-display">
                      {diff.title}
                    </h2>
                    <p className="text-zinc-500 font-mono text-[10px] text-center uppercase tracking-widest leading-relaxed">
                      {diff.desc}
                    </p>
                    <div className="mt-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity">
                      Initialize Protocol <ArrowLeft className="rotate-180" size={12} />
                    </div>
                  </motion.button>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center w-full max-w-2xl bg-zinc-900/90 border border-zinc-800 p-12 rounded-[2rem] relative z-20"
              >
                <button
                  onClick={() => setDifficulty(null)}
                  className="absolute top-6 left-6 text-zinc-600 hover:text-white transition-colors z-30"
                >
                  <ArrowLeft size={20} />
                </button>

                <div className="flex items-center gap-4 mb-8">
                  <div
                    className={`w-3 h-3 rounded-full animate-pulse ${
                      difficulty === 'easy'
                        ? 'bg-green-500'
                        : difficulty === 'medium'
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                    }`}
                  ></div>
                  <span className="text-zinc-400 font-mono text-xs uppercase tracking-[0.3em]">
                    Difficulty: {difficulty}
                  </span>
                </div>

                <h2 className="text-3xl font-black text-white uppercase tracking-widest mb-12 relative z-50">
                  Select Engagement Mode
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full relative z-50">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setDraftMode('normal');
                      setActiveOverlay('startToBan');
                    }}
                    className="flex flex-col items-center p-8 bg-black/60 border border-zinc-800 rounded-2xl hover:border-blue-500 transition-all group cursor-pointer pointer-events-auto"
                  >
                    <Target
                      className="text-zinc-500 group-hover:text-blue-500 mb-4 transition-colors"
                      size={32}
                    />
                    <span className="text-xl font-bold text-white uppercase tracking-widest mb-2">
                      Standard
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">
                      Competitive Drafting
                    </span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setDraftMode('gamble');
                      setDraftPhase('gambleConfig');
                    }}
                    className="flex flex-col items-center p-8 bg-black/60 border border-zinc-800 rounded-2xl hover:border-yellow-500 transition-all group cursor-pointer pointer-events-auto"
                  >
                    <Dices
                      className="text-zinc-500 group-hover:text-yellow-500 mb-4 transition-colors"
                      size={32}
                    />
                    <span className="text-xl font-bold text-white uppercase tracking-widest mb-2">
                      Cursed Lottery
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">
                      High Stakes Gambling
                    </span>
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      ) : (
        <>
          {draftPhase === 'drafting' && (
            <div className="w-full bg-[#111] border-b border-zinc-800 p-4 sticky top-0 z-50 flex justify-between items-center px-8">
              <div className="flex items-center gap-4">
                <span
                  className={`text-xs font-mono font-bold px-3 py-1 rounded ${activePlayer === 0 ? 'bg-blue-500/20 text-blue-500 border border-blue-500/50 animate-pulse' : 'text-zinc-500'}`}
                >
                  HUMAN TURN
                </span>
                <span
                  className={`text-xs font-mono font-bold px-3 py-1 rounded ${activePlayer === 1 ? 'bg-red-500/20 text-red-500 border border-red-500/50 animate-pulse' : 'text-zinc-500'}`}
                >
                  BOT TURN
                </span>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={handleSaveDraft}
                  className="flex items-center gap-2 px-3 py-2 bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600 rounded-lg font-mono text-xs uppercase tracking-widest transition-all"
                >
                  <Clock size={14} />
                  Save
                </button>
                <div className="flex items-center gap-3">
                  <Clock
                    className={
                      timeLeft <= 5 && activePlayer === 0
                        ? 'text-red-500 animate-bounce'
                        : 'text-zinc-400'
                    }
                    size={20}
                  />
                  <span
                    className={`text-2xl font-mono font-black ${timeLeft <= 5 && activePlayer === 0 ? 'text-red-500' : 'text-white'}`}
                  >
                    00:{timeLeft.toString().padStart(2, '0')}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col items-center w-full">
            {draftPhase === 'gambleConfig' && (
              <div className="flex justify-center items-center py-8">
                <motion.div
                  key="gambleConfig"
                  initial={{ opacity: 0, scale: 0.9, y: 40 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                  className="flex flex-col items-center gap-5 w-full max-w-xl bg-black/90 backdrop-blur-xl border border-yellow-500/20 p-6 rounded-2xl shadow-[0_0_50px_rgba(234,179,8,0.15)] relative overflow-y-auto max-h-[85vh] custom-scrollbar"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-50"></div>
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(234,179,8,0.1)_0%,transparent_70%)] pointer-events-none"></div>

                  <div className="text-center z-10 relative">
                    <h2 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-yellow-300 via-yellow-500 to-amber-700 uppercase tracking-widest font-display flex items-center justify-center gap-3 drop-shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                      <Dices size={32} className="text-yellow-500" />
                      Cursed Lottery
                    </h2>
                    <p className="text-yellow-500/50 font-mono tracking-[0.2em] uppercase text-xs mt-1">
                      Configure Rules
                    </p>
                  </div>

                  <div className="flex flex-col gap-4 w-full text-zinc-300 z-10 mt-2">
                    <div className="bg-[#111] p-4 rounded-xl border border-white/5 relative group hover:border-yellow-500/30 transition-colors">
                      <div className="flex justify-between items-end mb-3">
                        <div className="flex gap-3 items-center">
                          <Dices
                            className="text-zinc-500 group-hover:text-yellow-500 transition-colors"
                            size={20}
                          />
                          <div>
                            <label className="text-base font-black uppercase tracking-wider text-white">
                              Global Roll Pool
                            </label>
                            <p className="text-[10px] text-zinc-500 font-mono">
                              Total spins shared across 10 categories.
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-black text-yellow-500 font-display">
                            {gambleConfig.totalRolls}
                          </span>
                          {gambleConfig.totalRolls < gambleConfig.rollsPerStat * 10 && (
                            <div className="text-[10px] text-red-500 font-bold animate-pulse">
                              Below Optimal: {gambleConfig.rollsPerStat * 10} min
                            </div>
                          )}
                        </div>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="300"
                        step="5"
                        value={gambleConfig.totalRolls}
                        onChange={(e) => {
                          const val = +e.target.value;
                          setGambleConfig({
                            ...gambleConfig,
                            totalRolls: val,
                            rollsPerStat: Math.min(gambleConfig.rollsPerStat, Math.floor(val / 10)),
                          });
                        }}
                        className="w-full accent-yellow-500 cursor-pointer h-2 bg-zinc-800 rounded-lg appearance-none"
                      />
                    </div>

                    <div className="bg-[#111] p-4 rounded-xl border border-white/5 relative group hover:border-yellow-400/30 transition-colors">
                      <div className="flex justify-between items-end mb-3">
                        <div className="flex gap-3 items-center">
                          <Sparkles
                            className="text-zinc-500 group-hover:text-yellow-400 transition-colors"
                            size={20}
                          />
                          <div>
                            <label className="text-base font-black uppercase tracking-wider text-white">
                              Jackpot (Lucky) Rolls
                            </label>
                            <p className="text-[10px] text-zinc-500 font-mono">
                              Elite/Mythic focus (Uses Global Pool + Stat Capacity).
                            </p>
                          </div>
                        </div>
                        <span className="text-2xl font-black text-yellow-400 font-display">
                          {gambleConfig.luckyRolls}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max={Math.min(50, gambleConfig.totalRolls)}
                        step="1"
                        value={gambleConfig.luckyRolls}
                        onChange={(e) => {
                          setGambleConfig({ ...gambleConfig, luckyRolls: +e.target.value });
                        }}
                        className="w-full accent-yellow-400 cursor-pointer h-2 bg-zinc-800 rounded-lg appearance-none"
                      />
                    </div>

                    <div className="bg-[#111] p-4 rounded-xl border border-white/5 relative group hover:border-red-500/30 transition-colors">
                      <div className="flex justify-between items-end mb-3">
                        <div className="flex gap-3 items-center">
                          <Target
                            className="text-zinc-500 group-hover:text-red-500 transition-colors"
                            size={20}
                          />
                          <div>
                            <label className="text-base font-black uppercase tracking-wider text-white">
                              Category Limit
                            </label>
                            <p className="text-[10px] text-zinc-500 font-mono">
                              Max spins allowed per individual category.
                            </p>
                          </div>
                        </div>
                        <span className="text-2xl font-black text-red-500 font-display">
                          {gambleConfig.rollsPerStat}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="30"
                        step="1"
                        value={gambleConfig.rollsPerStat}
                        onChange={(e) => {
                          const val = +e.target.value;
                          setGambleConfig({
                            ...gambleConfig,
                            rollsPerStat: val,
                            totalRolls: Math.max(gambleConfig.totalRolls, val * 10),
                          });
                        }}
                        className="w-full accent-red-500 cursor-pointer h-2 bg-zinc-800 rounded-lg appearance-none"
                      />
                    </div>
                  </div>

                  <motion.button
                    onClick={() => {
                      const initialGambleStates: Record<number, any> = {};
                      players.forEach((_, i) => {
                        initialGambleStates[i] = {
                          remainingTotal: gambleConfig.totalRolls,
                          remainingLucky: gambleConfig.luckyRolls,
                          statRolls: {},
                        };
                      });
                      setGambleStates(initialGambleStates);
                      setActiveOverlay('startToBan');
                    }}
                    className="mt-4 w-full py-4 bg-[linear-gradient(45deg,#b45309,#eab308,#b45309)] bg-[length:200%_auto] text-black font-black uppercase tracking-[0.3em] rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] animate-[gradient_3s_ease_infinite] shadow-[0_0_30px_rgba(234,179,8,0.3)] hover:shadow-[0_0_50px_rgba(234,179,8,0.5)] z-10 text-lg"
                  >
                    Confirm Vow
                  </motion.button>
                </motion.div>
              </div>
            )}

            {draftPhase === 'banning' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center w-full"
              >
                <BanPhase
                  players={players}
                  bans={bans}
                  banCount={2}
                  onBanChange={(pIndex, banIndex, val) => {
                    const newBans = bans.map((b) => [...b]);
                    while (newBans.length <= pIndex) newBans.push([]);
                    newBans[pIndex][banIndex] = val;

                    // Bot auto-seals into the matching slot once the player picks
                    if (!newBans[1][banIndex] || newBans[1][banIndex] === val) {
                      const taken = newBans.flat().filter(Boolean);
                      const available = characters.filter((c) => !taken.includes(c.id));
                      if (available.length > 0) {
                        newBans[1][banIndex] =
                          available[Math.floor(Math.random() * available.length)].id;
                      }
                    }
                    setBans(newBans);
                  }}
                  isReadOnly={(i) => i === 1}
                  onBegin={() => setActiveOverlay('banToDraft')}
                />
              </motion.div>
            )}

            {draftPhase === 'drafting' && (
              <div className="flex flex-col items-center gap-8 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full justify-items-center items-start relative z-20">
                  {players.map((draft, index) => (
                    <div
                      key={index}
                      className={`relative ${activePlayer !== index ? 'opacity-60 pointer-events-none' : 'ring-4 ring-blue-500/50 rounded-2xl shadow-[0_0_30px_rgba(59,130,246,0.2)]'}`}
                    >
                      {index === 1 && activePlayer === 1 && (
                        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-2xl">
                          <div className="bg-zinc-900 border border-red-500 p-4 rounded-xl flex items-center gap-3 animate-pulse">
                            <Cpu className="text-red-500" />
                            <span className="font-mono text-white font-bold">
                              AI IS THINKING...
                            </span>
                          </div>
                        </div>
                      )}
                      <PlayerCard
                        playerNum={index + 1}
                        draft={draft}
                        onSelect={(stat, entityId) => handleSelect(index, stat, entityId)}
                        onNameChange={() => {}}
                        onRemove={() => {}}
                        canRemove={false}
                        getAvailableEntities={getAvailableEntities}
                        allEntities={characters}
                        draftMode={draftMode}
                        lockOnSelect={true}
                        gambleState={gambleStates[index]}
                        onGambleRoll={(stat, isLucky) => handleGambleRoll(index, stat, isLucky)}
                        isTurn={index === activePlayer}
                        activeRollingStat={index === activePlayer ? activeRollingStat : null}
                        onFinishGambleTurn={handleFinishGambleTurn}
                        isOnlineMode={false}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-4">
                  <DraftTimer
                    isActive={timerEnabled && draftPhase === 'drafting'}
                    duration={timerDuration}
                    onTimeUp={() => {
                      if (activePlayer === 0) {
                        const emptyStat = statsList.find((s) => players[0][s] === null);
                        if (emptyStat) {
                          const category = statCategoryMap[emptyStat] || 'character';
                          const available = characters.filter(
                            (e) =>
                              e.category === category && !Object.values(players[0]).includes(e.id)
                          );
                          if (available.length > 0) {
                            handleSelect(0, emptyStat, available[0].id);
                          }
                        }
                      }
                    }}
                  />
                  <button
                    onClick={() => setTimerEnabled(!timerEnabled)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider border transition-colors ${
                      timerEnabled
                        ? 'bg-red-950/40 border-red-800/40 text-red-400'
                        : 'bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                    }`}
                  >
                    Timer {timerEnabled ? 'ON' : 'OFF'}
                  </button>
                </div>

                <SystemProtocol
                  onClash={() => setActiveOverlay('clash')}
                  showClashButton={allSelected}
                />

                {!allSelected && activePlayer === 0 && (
                  <div className="mt-8 flex flex-col items-center gap-4">
                    <div className="text-zinc-500 font-mono text-xs animate-pulse tracking-widest uppercase">
                      Your Turn -{' '}
                      {draftMode === 'gamble'
                        ? 'Roll for a category'
                        : 'Select a category to draft'}
                    </div>
                    {draftMode === 'gamble' && (
                      <div className="flex items-center gap-6 bg-zinc-900/50 border border-zinc-800 px-6 py-3 rounded-full">
                        <div className="flex items-center gap-2">
                          <Dices size={16} className="text-zinc-400" />
                          <span className="text-[10px] font-mono text-zinc-500 uppercase">
                            Rolls: {gambleStates[0].remainingTotal}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Sparkles size={16} className="text-yellow-500" />
                          <span className="text-[10px] font-mono text-yellow-500 uppercase tracking-tighter">
                            Lucky: {gambleStates[0].remainingLucky}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {draftPhase === 'comparing' && (
              <div className="w-full flex justify-center pb-24 relative z-20">
                <Comparison
                  players={players}
                  roundWins={roundWins}
                  isMultiplayer={false}
                  onPlayAgain={() => {
                    setPlayers([emptyDraft(), emptyDraft()]);
                    setBans([[], []]);
                    setRoundWins([0, 0]);
                    setMatchHistory([]);
                    setGambleStates({
                      0: {
                        remainingTotal: gambleConfig.totalRolls,
                        remainingLucky: gambleConfig.luckyRolls,
                        statRolls: {},
                      },
                      1: {
                        remainingTotal: gambleConfig.totalRolls,
                        remainingLucky: gambleConfig.luckyRolls,
                        statRolls: {},
                      },
                    });
                    setDraftPhase('setup');
                    setActivePlayer(0);
                    setTimeLeft(TURN_TIME_SECONDS);
                  }}
                  onReset={(winners, finalScores) => {
                    const newWins = [...roundWins];
                    winners.forEach((w) => newWins[w]++);
                    setRoundWins(newWins);
                    setPlayers([emptyDraft(), emptyDraft()]);
                    setBans([[], []]);
                    setGambleStates({
                      0: {
                        remainingTotal: gambleConfig.totalRolls,
                        remainingLucky: gambleConfig.luckyRolls,
                        statRolls: {},
                      },
                      1: {
                        remainingTotal: gambleConfig.totalRolls,
                        remainingLucky: gambleConfig.luckyRolls,
                        statRolls: {},
                      },
                    });
                    setDraftPhase('setup');
                    setActivePlayer(0);
                    setTimeLeft(TURN_TIME_SECONDS);
                  }}
                />
              </div>
            )}
          </div>
        </>
      )}

      {/* Transition Overlays - Always available in the component tree */}
      <AnimatePresence>
        {activeOverlay === 'startToBan' && (
          <PhaseTransition
            key="startToBan"
            topKanji="拒否"
            topEnglish="REJECTION PHASE"
            bottomPhase="PHASE 01"
            bottomTitle="BAN SELECTION"
            onPhaseSwap={() => setDraftPhase('banning')}
            onComplete={() => setActiveOverlay(null)}
          />
        )}
        {activeOverlay === 'startToDraft' && (
          <PhaseTransition
            key="startToDraft"
            topKanji="運命"
            topEnglish="DESTINY PHASE"
            bottomPhase="PHASE 02"
            bottomTitle="CURSED LOTTERY"
            onPhaseSwap={() => setDraftPhase('drafting')}
            onComplete={() => setActiveOverlay(null)}
          />
        )}
        {activeOverlay === 'banToDraft' && (
          <PhaseTransition
            key="banToDraft"
            topKanji="選定"
            topEnglish="DRAFT PHASE"
            bottomPhase="PHASE 02"
            bottomTitle="DRAFT SELECTION"
            onPhaseSwap={() => setDraftPhase('drafting')}
            onComplete={() => setActiveOverlay(null)}
          />
        )}
        {activeOverlay === 'clash' && (
          <CursedConvergenceTransition
            players={players}
            onPhaseSwap={() => setDraftPhase('comparing')}
            onComplete={() => setActiveOverlay(null)}
          />
        )}
      </AnimatePresence>

      {/* Save Confirmation Modal */}
      <AnimatePresence>
        {isSaveConfirmOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSaveConfirmOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-[#0a0a0a] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-zinc-800 bg-[#050505]">
                <h2 className="text-xl font-black font-display text-white uppercase tracking-tighter">
                  Save Draft
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-zinc-400 font-mono text-sm">
                  Save your current draft to localStorage?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsSaveConfirmOpen(false)}
                    className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600 rounded-lg font-mono text-xs uppercase tracking-widest transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmSaveDraft}
                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-mono text-xs uppercase tracking-widest hover:bg-green-500 transition-all"
                  >
                    Save Draft
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Saved Drafts Modal */}
      <AnimatePresence>
        {isSavedDraftsOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSavedDraftsOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-[#0a0a0a] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-[#050505]">
                <h2 className="text-xl font-black font-display text-white uppercase tracking-tighter">
                  Saved Drafts
                </h2>
                <button
                  onClick={() => setIsSavedDraftsOpen(false)}
                  className="text-zinc-500 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-3">
                {savedDrafts.length === 0 ? (
                  <p className="text-zinc-500 font-mono text-sm text-center">No saved drafts yet</p>
                ) : (
                  savedDrafts.map((saved) => (
                    <div
                      key={saved.id}
                      className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-lg flex items-center justify-between hover:border-zinc-700 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="text-white font-mono text-sm font-bold">{saved.name}</p>
                        <p className="text-zinc-500 font-mono text-xs">
                          {new Date(saved.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleLoadDraft(saved)}
                          className="px-3 py-1 bg-green-600 text-white text-xs font-mono uppercase rounded hover:bg-green-500 transition-colors"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(saved.id)}
                          className="px-3 py-1 bg-red-600 text-white text-xs font-mono uppercase rounded hover:bg-red-500 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {deleteConfirmId && (
                <div className="p-6 border-t border-zinc-800 bg-black/50">
                  <p className="text-zinc-300 text-sm mb-4 font-mono uppercase tracking-widest text-center">
                    Delete this saved draft?
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        handleDeleteDraft(deleteConfirmId);
                        setDeleteConfirmId(null);
                      }}
                      className="flex-1 py-2 bg-red-600 text-white text-sm font-mono uppercase rounded hover:bg-red-500 transition-colors"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      className="flex-1 py-2 bg-zinc-800 text-zinc-400 text-sm font-mono uppercase rounded hover:bg-zinc-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <HelpPage isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {/* Game Navbar */}
      {draftPhase !== 'setup' && draftPhase !== 'gambleConfig' && (
        <GameNavbar
          onHowToPlay={() => setIsHowToPlayOpen(true)}
          onFeedback={() => setIsFeedbackOpen(true)}
          onAchievements={() => setIsAchievementsOpen(true)}
          onStats={() => setIsStatsOpen(true)}
        />
      )}

      {/* How to Play Tutorial */}
      <HowToPlayTutorial isOpen={isHowToPlayOpen} onClose={() => setIsHowToPlayOpen(false)} />

      {/* Feedback System */}
      <FeedbackSystem
        hidden={true}
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />

      {/* Achievements Modal */}
      <AchievementsModal isOpen={isAchievementsOpen} onClose={() => setIsAchievementsOpen(false)} />

      {/* Stats Modal */}
      <StatsModal isOpen={isStatsOpen} onClose={() => setIsStatsOpen(false)} />
    </div>
  );
}
