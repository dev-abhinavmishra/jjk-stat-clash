import React, { useState, useRef } from 'react';
import {
  characters,
  statsList,
  statLabels,
  categoryLabels,
  statCategoryMap,
  Entity,
} from '../data/characters';
import {
  PlayerCard,
  DraftSelection,
  SearchableSelect,
  bindingVows,
} from '../components/PlayerCard';
import { DraftTimer } from '../components/DraftTimer';
import { AchievementsModal } from '../components/Achievements';
import { StatsModal } from '../components/StatsModal';
import { GameSettings, defaultSettings } from '../utils/gameSettings';
import { Comparison } from '../components/Comparison';
import { CursedConvergenceTransition } from '../components/CursedConvergenceTransition';
import { PhaseTransition } from '../components/PhaseTransition';
import { HelpPage } from '../components/HelpPage';
import { FeedbackSystem } from '../components/FeedbackSystem';
import { TutorialOverlay } from '../components/TutorialOverlay';
import { GameNavbar } from '../components/GameNavbar';
import { GameFooter } from '../components/GameFooter';
import { ChangelogModal } from '../components/Changelog';
import { HowToPlayTutorial } from '../components/HowToPlayTutorial';
import { BanPhase } from '../components/BanPhase';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Swords,
  Plus,
  CheckCircle2,
  Ban,
  HelpCircle,
  Trophy,
  Cpu,
  Users,
  Zap,
  Dices,
  Sparkles,
  Target,
  Trash2,
  Clock,
  X,
} from 'lucide-react';
import { Analytics } from '@vercel/analytics/react';
import { SystemProtocol } from '../components/SystemProtocol';
import {
  saveDraft,
  saveFullGameState,
  loadFullGameState,
  getSavedDrafts,
  deleteDraft,
  SavedDraft,
} from '../utils/draftStorage';

const emptyDraft = (): DraftSelection => {
  const draft: Partial<DraftSelection> = {};
  statsList.forEach((stat) => {
    draft[stat] = null;
  });
  return draft as DraftSelection;
};

interface GambleState {
  remainingTotal: number;
  remainingLucky: number;
  statRolls: Record<string, number>;
}

export default function LocalDraft() {
  const navigate = useNavigate();
  const [players, setPlayers] = useState<DraftSelection[]>([emptyDraft(), emptyDraft()]);
  const [draftPhase, setDraftPhase] = useState<
    'start' | 'gambleConfig' | 'banning' | 'drafting' | 'comparing' | 'transitioning'
  >('start');
  const [draftMode, setDraftMode] = useState<'normal' | 'gamble'>('normal');
  const [bans, setBans] = useState<string[][]>([[], []]);
  const [roundWins, setRoundWins] = useState<number[]>([0, 0]);
  const [matchHistory, setMatchHistory] = useState<any[]>([]);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isSavedDraftsOpen, setIsSavedDraftsOpen] = useState(false);
  const [savedDrafts, setSavedDrafts] = useState<SavedDraft[]>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isSaveConfirmOpen, setIsSaveConfirmOpen] = useState(false);
  const [gameSettings, setGameSettings] = useState<GameSettings>(defaultSettings);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);

  // Load saved drafts from localStorage on mount
  React.useEffect(() => {
    setSavedDrafts(getSavedDrafts());
  }, []);

  // Gamble configurations
  const [gambleConfig, setGambleConfig] = useState({
    totalRolls: 50,
    luckyRolls: 10,
    rollsPerStat: 5,
  });
  const [gambleStates, setGambleStates] = useState<Record<number, GambleState>>({});
  const [currentTurnPlayer, setCurrentTurnPlayer] = useState(0);
  const [activeRollingStat, setActiveRollingStat] = useState<string | null>(null);

  // Sync gamble states if players are added/removed or config changes
  React.useEffect(() => {
    if (draftMode === 'gamble' && players.length > 0) {
      setGambleStates((prev) => {
        const next = { ...prev };
        let changed = false;
        players.forEach((_, i) => {
          if (!next[i]) {
            next[i] = {
              remainingTotal: gambleConfig.totalRolls,
              remainingLucky: gambleConfig.luckyRolls,
              statRolls: {},
            };
            changed = true;
          } else if (Object.keys(next[i].statRolls).length === 0) {
            // If hasn't started spinning, allow config overwrite
            if (
              next[i].remainingTotal !== gambleConfig.totalRolls ||
              next[i].remainingLucky !== gambleConfig.luckyRolls
            ) {
              next[i] = {
                ...next[i],
                remainingTotal: gambleConfig.totalRolls,
                remainingLucky: gambleConfig.luckyRolls,
              };
              changed = true;
            }
          }
        });
        return changed ? next : prev;
      });
    }
  }, [players.length, draftMode, gambleConfig.totalRolls, gambleConfig.luckyRolls]);

  // Triggers for full-screen transition overlays
  const [activeOverlay, setActiveOverlay] = useState<'ban' | 'clash' | 'startToBan' | null>(null);

  const isVowEmpowered = (draft: DraftSelection) =>
    draft.specialPower1 === 'binding-vow' || draft.specialPower2 === 'binding-vow';

  const validateDraft = (draft: DraftSelection) => {
    const newDraft = { ...draft };
    statsList.forEach((s) => {
      const selectedId = newDraft[s];
      if (selectedId) {
        const entity = characters.find((c) => c.id === selectedId);
        if (entity && 'prerequisite' in entity && entity.prerequisite) {
          const hasPrerequisite = Object.values(newDraft).includes(entity.prerequisite);
          if (!hasPrerequisite) newDraft[s] = null;
        }
        if (selectedId === 'sukunas-fingers') {
          const hasVessel = Object.values(newDraft).some((id) => {
            if (!id) return false;
            if (['yuji', 'modulo-yuji', 'sukuna', 'megumi'].includes(id as string)) return true;
            const char = characters.find((c) => c.id === id);
            if (
              char &&
              char.loreDescription &&
              (char.loreDescription.includes('Curse') || char.loreDescription.includes('curses'))
            )
              return true;
            return false;
          });
          if (!hasVessel) newDraft[s] = null;
        }
      }
    });
    // The pact slot only accepts vow ids — scrub anything else (e.g. a
    // special-power id written by an older build or a stale saved draft).
    if (
      newDraft.bindingVow &&
      (!bindingVows.some((v) => v.id === newDraft.bindingVow) || !isVowEmpowered(newDraft))
    ) {
      newDraft.bindingVow = null;
    }
    return newDraft as DraftSelection;
  };

  const handleSelect = (playerIndex: number, stat: string, entityId: string) => {
    const newPlayers = [...players];
    const updatedDraft = { ...newPlayers[playerIndex], [stat]: entityId || null };
    newPlayers[playerIndex] = validateDraft(updatedDraft);
    setPlayers(newPlayers);
  };

  const handleNameChange = (playerIndex: number, name: string) => {
    const newPlayers = [...players];
    newPlayers[playerIndex] = { ...newPlayers[playerIndex], playerName: name };
    setPlayers(newPlayers);
  };

  // Update gamble states if players are added/removed
  const handleAddPlayer = () => {
    if (players.length < 8) {
      setPlayers([...players, emptyDraft()]);
      setBans([...bans, []]);
      setRoundWins((prev) => [...prev, 0]);
    }
  };

  const handleRemovePlayer = (index: number) => {
    if (players.length > 2) {
      const newPlayers = [...players];
      newPlayers.splice(index, 1);
      setPlayers(newPlayers);

      const newBans = [...bans];
      newBans.splice(index, 1);
      setBans(newBans);

      const newWins = [...roundWins];
      newWins.splice(index, 1);
      setRoundWins(newWins);

      // Re-index gamble states
      if (Object.keys(gambleStates).length > 0) {
        setGambleStates((prev) => {
          const next: Record<number, GambleState> = {};
          Object.keys(prev).forEach((keyStr) => {
            const k = parseInt(keyStr);
            if (k < index) next[k] = prev[k];
            else if (k > index) next[k - 1] = prev[k];
          });
          return next;
        });
      }
    }
  };

  const getSelectedIds = () => {
    const ids = new Set<string>();
    players.forEach((draft) => {
      Object.values(draft).forEach((id) => {
        if (typeof id === 'string') ids.add(id);
      });
    });
    return ids;
  };

  const handleGambleRoll = (playerIndex: number, stat: string, isLucky: boolean) => {
    if (draftMode === 'gamble' && playerIndex !== currentTurnPlayer) return;
    if (activeRollingStat && activeRollingStat !== stat) return;

    const currentState = gambleStates[playerIndex];
    if (!currentState) return;

    // Binding Vows are exempt from the global currency pool but still respect the per-stat limit
    const isVow = stat === 'bindingVow';

    if (!isVow) {
      if (currentState.remainingTotal <= 0) return;
    }

    if ((currentState.statRolls[stat] || 0) >= gambleConfig.rollsPerStat) return;

    if (isLucky && currentState.remainingLucky <= 0) return;

    const draft = players[playerIndex];
    const category = statCategoryMap[stat] || 'character';

    let available: any = isVow
      ? isVowEmpowered(draft)
        ? bindingVows
        : []
      : getAvailableEntities(draft[stat], category as string, draft);

    if (stat === 'tool') {
      available = getAvailableEntities(draft[stat], 'tool', draft);
    }

    if (available.length === 0) return;

    // Filter logic for lucky roll
    if (isLucky) {
      const getEntityPower = (entity: any) => {
        let pwr = 50;
        if (entity.statValue) pwr = entity.statValue;
        else if (entity.stats && entity.stats[stat]) pwr = entity.stats[stat];
        const grade = entity.grade || '';
        if (grade === 'Calamity') pwr += 200;
        else if (grade === 'Mythic') pwr += 100;
        else if (grade === 'Legendary') pwr += 50;
        else if (grade === 'Epic') pwr += 30;
        else if (grade === 'Rare') pwr += 15;
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
      remainingTotal: isVow ? currentState.remainingTotal : currentState.remainingTotal - 1,
      remainingLucky:
        isLucky && !isVow ? currentState.remainingLucky - 1 : currentState.remainingLucky,
      statRolls: {
        ...currentState.statRolls,
        [stat]: (currentState.statRolls[stat] || 0) + 1,
      },
    };
    setGambleStates(newGambleStates);

    const newPlayers = [...players];
    newPlayers[playerIndex] = { ...newPlayers[playerIndex], [stat]: randomEntity.id };

    // Auto-resolve Sukuna's Fingers edge case if vessel changes
    if (stat !== 'tool') {
      newPlayers[playerIndex] = validateDraft(newPlayers[playerIndex]);
    }
    setPlayers(newPlayers);

    // Track active stat for the turn — vow rolls are free actions that don't
    // begin (or end) the player's stat roll.
    if (!activeRollingStat && !isVow) {
      setActiveRollingStat(stat);
    }
  };

  const currentTurnPlayerRef = useRef(currentTurnPlayer);
  currentTurnPlayerRef.current = currentTurnPlayer;

  const handleFinishGambleTurn = () => {
    setActiveRollingStat(null);

    let nextPlayer = (currentTurnPlayer + 1) % players.length;
    let attempts = 0;
    while (attempts < players.length) {
      if (!isPlayerDone(nextPlayer)) break;
      nextPlayer = (nextPlayer + 1) % players.length;
      attempts++;
    }
    setCurrentTurnPlayer(nextPlayer);
  };

  const getAvailableEntities = (
    currentSelectedId: string | null,
    category: string,
    draft: DraftSelection
  ) => {
    const selectedIds = getSelectedIds();
    const globalBans = bans.flat().filter(Boolean);

    return characters.filter((entity) => {
      if (entity.category !== category) return false;
      if (globalBans.includes(entity.id) && entity.id !== currentSelectedId) return false;

      // Allow 'binding-vow' to be selected by multiple players
      if (entity.id !== 'binding-vow') {
        if (selectedIds.has(entity.id) && entity.id !== currentSelectedId) return false;
      }

      if ('prerequisite' in entity && entity.prerequisite) {
        const hasPrerequisite = Object.values(draft).includes(entity.prerequisite);
        if (!hasPrerequisite) return false;
      }

      if (entity.id === 'sukunas-fingers') {
        const hasVessel = Object.values(draft).some((id) => {
          if (!id) return false;
          if (['yuji', 'modulo-yuji', 'sukuna', 'megumi'].includes(id)) return true;
          const char = characters.find((c) => c.id === id);
          if (
            char &&
            char.loreDescription &&
            (char.loreDescription.includes('Curse') || char.loreDescription.includes('curses'))
          )
            return true;
          return false;
        });
        if (!hasVessel) return false;
      }

      return true;
    });
  };

  const requiredStats = statsList.filter((s) => s !== 'bindingVow');

  const getGamblePool = (playerIndex: number, stat: string): any[] => {
    const draft = players[playerIndex];
    if (stat === 'bindingVow') return isVowEmpowered(draft) ? (bindingVows as any[]) : [];
    const category = statCategoryMap[stat] || 'character';
    return getAvailableEntities(draft[stat], category, draft);
  };

  const getRollableStats = (index: number) => {
    const draft = players[index];
    const state = gambleStates[index];
    return requiredStats.filter((stat) => {
      if (draft[stat]) return false;
      if (state) {
        if ((state.statRolls[stat] || 0) >= gambleConfig.rollsPerStat) return false;
        if (stat !== 'bindingVow' && state.remainingTotal <= 0) return false;
      }
      return getGamblePool(index, stat).length > 0;
    });
  };

  const getFillableStats = (index: number) => {
    const draft = players[index];
    return requiredStats.filter((stat) => {
      if (draft[stat]) return false;
      const category = statCategoryMap[stat] || 'character';
      return getAvailableEntities(null, category, draft).length > 0;
    });
  };

  // A draft counts as complete when every required stat is filled, or when the
  // player has no legal way to fill the rest (empty pools / exhausted rolls) —
  // otherwise the clash can be locked out forever. Binding Vow is optional.
  const isPlayerDone = (index: number) => {
    const draft = players[index];
    if (requiredStats.every((stat) => draft[stat] !== null)) return true;
    if (draftMode === 'gamble') return getRollableStats(index).length === 0;
    return getFillableStats(index).length === 0;
  };

  const handleAutoFill = () => {
    const newPlayers = players.map((draft) => ({ ...draft }));
    const takenIds = new Set(getSelectedIds());
    const globalBans = bans.flat().filter(Boolean);

    newPlayers.forEach((draft) => {
      statsList.forEach((stat) => {
        if (!draft[stat]) {
          if (stat === 'bindingVow') {
            // Vow slot: optional; fill with a random pact only when empowered.
            if (isVowEmpowered(draft)) {
              const vow = bindingVows[Math.floor(Math.random() * bindingVows.length)];
              draft[stat] = vow.id;
            }
            return;
          }
          const category = statCategoryMap[stat] || 'character';
          const available = characters.filter((entity) => {
            if (entity.category !== category) return false;
            if (globalBans.includes(entity.id)) return false;
            if (entity.id !== 'binding-vow' && takenIds.has(entity.id)) return false;
            if ('prerequisite' in entity && entity.prerequisite) {
              const hasReq = Object.values(draft).includes(entity.prerequisite);
              if (!hasReq) return false;
            }
            if (entity.id === 'sukunas-fingers') {
              const hasVessel = Object.values(draft).some((id) => {
                if (!id) return false;
                if (['yuji', 'modulo-yuji', 'sukuna', 'megumi'].includes(id as string)) return true;
                const char = characters.find((c) => c.id === id);
                if (
                  char &&
                  char.loreDescription &&
                  (char.loreDescription.includes('Curse') ||
                    char.loreDescription.includes('curses'))
                )
                  return true;
                return false;
              });
              if (!hasVessel) return false;
            }
            return true;
          });

          if (available.length > 0) {
            const randomEntity = available[Math.floor(Math.random() * available.length)];
            draft[stat] = randomEntity.id;
            takenIds.add(randomEntity.id);
          }
        }
      });
    });

    setPlayers(newPlayers);

    if (draftMode === 'gamble') {
      const newGambleStates = { ...gambleStates };
      newPlayers.forEach((_, i) => {
        if (newGambleStates[i]) {
          newGambleStates[i] = {
            ...newGambleStates[i],
            remainingTotal: 0,
            remainingLucky: 0,
          };
        }
      });
      setGambleStates(newGambleStates);
    }
  };

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
      // Loaded picks aren't tied to prior roll counts — reset budgets.
      if (draftMode === 'gamble') {
        const reset: Record<number, GambleState> = {};
        state.players.forEach((_, i) => {
          reset[i] = {
            remainingTotal: gambleConfig.totalRolls,
            remainingLucky: gambleConfig.luckyRolls,
            statRolls: {},
          };
        });
        setGambleStates(reset);
        setActiveRollingStat(null);
      }
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

  const allSelected = players.every((_, index) => isPlayerDone(index));

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-red-500/30 relative overflow-x-hidden flex flex-col">
      <>
        <title>Local Draft | JJK Stat Clash</title>
      </>
      {/* Atmospheric Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(220,38,38,0.08)_0%,transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(220,38,38,0.05)_0%,transparent_40%)]"></div>
        <div className="absolute inset-0 bg-pattern opacity-30"></div>
      </div>

      {draftPhase !== 'start' && (
        <header className="w-full py-3 md:py-4 border-b border-zinc-900/80 bg-[#050505]/80 backdrop-blur-xl sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4">
            <div
              className="flex flex-col items-center md:items-start cursor-pointer"
              onClick={() => navigate('/play')}
            >
              <h1 className="text-2xl md:text-3xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400 uppercase tracking-wide drop-shadow-[0_0_15px_rgba(220,38,38,0.3)] pr-1 hover:from-red-500 hover:to-red-300 transition-all">
                JJK DRAFT
              </h1>
              <p className="text-zinc-500 font-mono text-[10px] md:text-xs tracking-widest uppercase hover:text-zinc-400 transition-colors">
                Build Your Ultimate Sorcerer
              </p>
            </div>

            {!draftPhase.includes('comparing') && draftPhase === 'drafting' && (
              <div className="flex gap-2">
                <button
                  onClick={handleSaveDraft}
                  className="flex items-center gap-2 px-4 py-3 rounded-full font-mono text-xs uppercase tracking-widest bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600 transition-all"
                >
                  <Clock size={16} />
                  Save Draft
                </button>
                <button
                  onClick={() => allSelected && setActiveOverlay('clash')}
                  disabled={!allSelected}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold font-display uppercase tracking-wider transition-all ${
                    allSelected
                      ? 'bg-red-600 hover:bg-red-700 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:scale-105'
                      : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  }`}
                >
                  <CheckCircle2 size={20} />
                  {allSelected ? 'Finish Draft' : 'Complete Selections'}
                </button>
              </div>
            )}
          </div>
        </header>
      )}

      <main
        className={`max-w-7xl mx-auto px-4 py-12 flex flex-col items-center ${draftPhase === 'start' ? 'flex-1 w-full' : ''}`}
      >
        {draftPhase !== 'start' && draftPhase !== 'comparing' && matchHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row gap-4 md:gap-8 items-center mb-10 bg-zinc-900 border border-zinc-800 px-8 py-3 rounded-full shadow-lg relative z-20"
          >
            <div className="flex items-center gap-3">
              <Trophy className="text-yellow-500" size={20} />
              <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest">
                {matchHistory.length} Matches
              </span>
            </div>
            <div className="flex gap-6 items-center font-mono font-bold text-sm tracking-widest uppercase">
              {players.map((p, i) => (
                <span
                  key={i}
                  className={
                    roundWins[i] > 0
                      ? 'text-yellow-400 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]'
                      : 'text-zinc-500'
                  }
                >
                  {p.playerName || `P${i + 1}`}:{' '}
                  <span className="text-xl">{roundWins[i] || 0}</span>
                </span>
              ))}
            </div>
            <div className="hidden md:block w-px h-6 bg-zinc-700"></div>
            <button
              onClick={() => {
                setMatchHistory([]);
                setRoundWins(players.map(() => 0));
                setDraftPhase('start');
              }}
              className="text-[10px] font-mono text-zinc-500 hover:text-red-500 uppercase tracking-widest transition-colors flex items-center gap-2"
            >
              End Series
            </button>
          </motion.div>
        )}
        <AnimatePresence mode="wait">
          {draftPhase === 'start' && (
            <motion.div
              key="start"
              className="flex flex-col items-center justify-center flex-1 w-full relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                initial={{ scale: 3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.5, ease: 'circOut', bounce: 0 }}
                className="text-7xl md:text-[180px] font-black font-display uppercase tracking-[-0.05em] text-center leading-[0.85] z-10"
              >
                JJK
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-red-800 drop-shadow-[0_0_20px_rgba(220,38,38,0.4)] px-2">
                  DRAFT
                </span>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, duration: 0.8, ease: 'easeOut' }}
                className="mt-8 text-zinc-400 font-mono tracking-[0.3em] uppercase text-sm md:text-lg text-center mb-8"
                style={{ willChange: 'opacity, transform' }}
              >
                Build Your Ultimate Sorcerer
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 0.6 }}
                className="flex flex-col gap-5 mt-4 z-20 w-full max-w-4xl"
              >
                {/* 2×2 Mode Selection Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 1.8, duration: 0.6 }}
                    onClick={() => {
                      setDraftMode('normal');
                      setActiveOverlay('startToBan');
                    }}
                    className="relative group overflow-hidden px-5 py-7 bg-zinc-900/60 border-2 border-red-900/30 hover:border-red-500 rounded-2xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(220,38,38,0.2)] hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute top-0 left-0 w-1 h-full bg-red-600 opacity-50 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10 flex flex-col items-center gap-3">
                      <Swords
                        size={34}
                        className="text-red-500 group-hover:text-red-400 transition-colors"
                      />
                      <div className="text-center">
                        <div className="text-base md:text-lg font-black text-white uppercase tracking-wider">
                          Standard Protocol
                        </div>
                        <div className="text-[10px] font-mono text-zinc-500 mt-1 uppercase tracking-widest">
                          Classic 1v1 Draft
                        </div>
                      </div>
                    </div>
                  </motion.button>

                  <motion.button
                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 1.9, duration: 0.6 }}
                    onClick={() => {
                      setDraftMode('gamble');
                      setDraftPhase('gambleConfig');
                    }}
                    className="relative group overflow-hidden px-5 py-7 bg-zinc-900/60 border-2 border-yellow-900/30 hover:border-yellow-500 rounded-2xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(234,179,8,0.2)] hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute top-0 left-0 w-1 h-full bg-yellow-600 opacity-50 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10 flex flex-col items-center gap-3">
                      <Dices
                        size={34}
                        className="text-yellow-500 group-hover:text-yellow-400 transition-colors"
                      />
                      <div className="text-center">
                        <div className="text-base md:text-lg font-black text-white uppercase tracking-wider">
                          Cursed Lottery
                        </div>
                        <div className="text-[10px] font-mono text-zinc-500 mt-1 uppercase tracking-widest">
                          Randomized Stat Roll
                        </div>
                      </div>
                    </div>
                  </motion.button>

                  <motion.button
                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 2.0, duration: 0.6 }}
                    onClick={() => navigate('/play/bot')}
                    className="relative group overflow-hidden px-5 py-7 bg-zinc-900/60 border-2 border-blue-900/30 hover:border-blue-500 rounded-2xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.2)] hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-600 opacity-50 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10 flex flex-col items-center gap-3">
                      <Cpu
                        size={34}
                        className="text-blue-500 group-hover:text-blue-400 transition-colors"
                      />
                      <div className="text-center">
                        <div className="text-base md:text-lg font-black text-white uppercase tracking-wider">
                          Vs Bot
                        </div>
                        <div className="text-[10px] font-mono text-zinc-500 mt-1 uppercase tracking-widest">
                          AI-Powered Combat
                        </div>
                      </div>
                    </div>
                  </motion.button>

                  <motion.button
                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 2.1, duration: 0.6 }}
                    onClick={() => navigate('/play/multiplayer')}
                    className="relative group overflow-hidden px-5 py-7 bg-zinc-900/60 border-2 border-purple-900/30 hover:border-purple-500 rounded-2xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute top-0 left-0 w-1 h-full bg-purple-600 opacity-50 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10 flex flex-col items-center gap-3">
                      <Users
                        size={34}
                        className="text-purple-500 group-hover:text-purple-400 transition-colors"
                      />
                      <div className="text-center">
                        <div className="text-base md:text-lg font-black text-white uppercase tracking-wider">
                          Online
                        </div>
                        <div className="text-[10px] font-mono text-zinc-500 mt-1 uppercase tracking-widest">
                          Global Network
                        </div>
                      </div>
                    </div>
                  </motion.button>
                </div>

                {/* Secondary Actions Row */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.3, duration: 0.4 }}
                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                    className="flex items-center gap-2 px-5 py-3 bg-zinc-900/60 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white font-mono text-xs uppercase tracking-[0.2em] transition-all rounded-xl"
                  >
                    <Zap size={16} />
                    {isSettingsOpen ? 'Hide Custom Rules' : 'Custom Rules'}
                  </motion.button>
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.4, duration: 0.4 }}
                    onClick={() => setIsSavedDraftsOpen(true)}
                    className="flex items-center gap-2 px-5 py-3 bg-zinc-900/60 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white font-mono text-xs uppercase tracking-[0.2em] transition-all rounded-xl"
                  >
                    <Clock size={16} />
                    Load Saved Draft
                  </motion.button>
                </div>

                {/* Collapsible Custom Rules */}
                <AnimatePresence>
                  {isSettingsOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-2xl backdrop-blur-sm">
                        <div className="flex flex-col gap-4">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                              Bans per player
                            </label>
                            <div className="flex gap-2">
                              {[1, 2, 3].map((n) => (
                                <button
                                  key={n}
                                  onClick={() =>
                                    setGameSettings((prev) => ({ ...prev, banCount: n }))
                                  }
                                  className={`w-8 h-8 rounded-lg text-xs font-mono font-bold transition-colors ${
                                    gameSettings.banCount === n
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                                  }`}
                                >
                                  {n}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                              Timer
                            </label>
                            <div className="flex gap-2">
                              {[
                                { label: 'OFF', value: 0 },
                                { label: '60s', value: 60 },
                                { label: '120s', value: 120 },
                                { label: '180s', value: 180 },
                              ].map((opt) => (
                                <button
                                  key={opt.value}
                                  onClick={() =>
                                    setGameSettings((prev) => ({
                                      ...prev,
                                      timerEnabled: opt.value > 0,
                                      timerDuration: opt.value || 120,
                                    }))
                                  }
                                  className={`px-3 h-8 rounded-lg text-xs font-mono font-bold transition-colors ${
                                    (opt.value === 0 && !gameSettings.timerEnabled) ||
                                    (opt.value > 0 &&
                                      gameSettings.timerEnabled &&
                                      gameSettings.timerDuration === opt.value)
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                                  }`}
                                >
                                  {opt.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Decorative background element for start screen */}
              <motion.div
                initial={{ scale: 0, rotate: -45, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 0.05 }}
                transition={{ duration: 3, delay: 0.5, ease: 'easeOut' }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10 overflow-hidden"
              >
                <div className="text-[400px] md:text-[600px] font-black font-display rotate-12 leading-none text-white blur-[4px]">
                  呪
                </div>
              </motion.div>

              {/* Match History / Series Recorder */}
              {matchHistory.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-16 w-full max-w-2xl bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-6xl italic -rotate-12 pointer-events-none">
                    HISTORY
                  </div>
                  <h3 className="text-xl font-black font-display text-white uppercase tracking-widest mb-6 flex items-center gap-3">
                    <Trophy className="text-yellow-500" size={24} />
                    Series Logs
                  </h3>
                  <div className="space-y-4 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                    {matchHistory.map((m, i) => (
                      <div
                        key={i}
                        className="bg-black/40 border border-white/5 p-3 rounded-lg flex items-center justify-between group-hover:border-red-500/20 transition-colors"
                      >
                        <div className="flex flex-col">
                          <span className="text-[10px] font-mono text-zinc-500 uppercase">
                            {new Date(m.date).toLocaleTimeString()}
                          </span>
                          <div className="flex gap-2 items-center mt-1">
                            {m.players.map((p: any, pi: number) => (
                              <div key={pi} className="flex items-center gap-1">
                                <span
                                  className={`text-xs font-black uppercase ${p.isWinner ? 'text-yellow-500 underline decoration-yellow-500/50 underline-offset-2' : 'text-zinc-400'}`}
                                >
                                  {p.name}: {p.score}
                                </span>
                                {pi < m.players.length - 1 && (
                                  <span className="text-zinc-700 text-[10px]">VS</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                        {m.players.length > 0 && (
                          <div className="text-[10px] font-mono font-black text-red-500 bg-red-500/10 px-2 py-1 rounded">
                            MATCH {matchHistory.length - i}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      setMatchHistory([]);
                      setRoundWins(players.map(() => 0));
                    }}
                    className="mt-4 text-[10px] font-mono text-zinc-600 hover:text-red-500 uppercase tracking-widest transition-colors flex items-center gap-2"
                  >
                    <Trash2 size={12} /> Clear Records
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {draftPhase === 'gambleConfig' && (
            <div className="flex justify-center items-center h-[80vh] py-8">
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
                    const initialGambleStates: Record<number, GambleState> = {};
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
              key="banning"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="flex flex-col items-center gap-12 w-full"
            >
              <BanPhase
                players={players}
                bans={bans}
                banCount={gameSettings.banCount}
                onBanChange={(pIndex, banIndex, val) => {
                  const newBans = bans.map((b) => [...b]);
                  while (newBans.length <= pIndex) newBans.push([]);
                  newBans[pIndex][banIndex] = val;
                  setBans(newBans);
                }}
                onNameChange={handleNameChange}
                onRemovePlayer={players.length > 2 ? handleRemovePlayer : undefined}
                onAddPlayer={players.length < 8 ? handleAddPlayer : undefined}
                onBegin={() => setActiveOverlay('ban')}
              />
            </motion.div>
          )}

          {draftPhase === 'drafting' && (
            <motion.div
              key="selection"
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.5, type: 'spring', bounce: 0.3 }}
              className="flex flex-col items-center gap-12"
            >
              <div
                className={`grid gap-8 w-full items-start relative z-20 ${
                  players.length <= 2
                    ? 'grid-cols-1 md:grid-cols-2 justify-items-center'
                    : players.length <= 4
                      ? 'grid-cols-1 md:grid-cols-2 justify-items-center'
                      : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-items-center'
                }`}
              >
                {players.map((draft, index) => (
                  <PlayerCard
                    key={index}
                    playerNum={index + 1}
                    draft={draft}
                    onSelect={(stat, entityId) => handleSelect(index, stat, entityId)}
                    onNameChange={(name) => handleNameChange(index, name)}
                    onRemove={() => handleRemovePlayer(index)}
                    canRemove={players.length > 2}
                    getAvailableEntities={getAvailableEntities}
                    allEntities={characters}
                    draftMode={draftMode}
                    gambleState={gambleStates[index]}
                    gambleConfig={gambleConfig}
                    onGambleRoll={(stat, isLucky) => handleGambleRoll(index, stat, isLucky)}
                    isTurn={draftMode === 'gamble' ? index === currentTurnPlayer : true}
                    activeRollingStat={index === currentTurnPlayer ? activeRollingStat : null}
                    onFinishGambleTurn={handleFinishGambleTurn}
                    isOnlineMode={false}
                  />
                ))}
              </div>

              <div className="flex items-center gap-4">
                {draftMode === 'gamble' && !allSelected && (
                  <div className="flex items-center gap-3 mr-2">
                    <span className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest animate-pulse">
                      {players[currentTurnPlayer].playerName || `Player ${currentTurnPlayer + 1}`}'s
                      Turn
                    </span>
                    {!activeRollingStat && (
                      <button
                        onClick={handleFinishGambleTurn}
                        className="px-4 py-1.5 bg-zinc-900 border border-zinc-700 hover:border-red-500/60 text-zinc-400 hover:text-red-400 rounded-full font-mono text-[10px] uppercase tracking-widest transition-colors"
                      >
                        End Turn
                      </button>
                    )}
                  </div>
                )}
                <DraftTimer
                  isActive={gameSettings.timerEnabled && draftPhase === 'drafting'}
                  duration={gameSettings.timerDuration}
                  onTimeUp={() => {
                    if (draftMode === 'gamble') {
                      // Timeout belongs to the active roller — pick from the
                      // legal roll pool, not the first player with empty slots.
                      if (activeRollingStat) {
                        handleFinishGambleTurn();
                        return;
                      }
                      const rollable = getRollableStats(currentTurnPlayer);
                      if (rollable.length === 0) return;
                      const stat = rollable[Math.floor(Math.random() * rollable.length)];
                      const pool = getGamblePool(currentTurnPlayer, stat);
                      if (pool.length > 0) {
                        handleGambleRoll(currentTurnPlayer, stat, false);
                        // Auto-rolls still finish the turn — unless the player
                        // already ended it manually in the meantime.
                        setTimeout(() => {
                          if (currentTurnPlayerRef.current === currentTurnPlayer) {
                            handleFinishGambleTurn();
                          }
                        }, 500);
                      }
                      return;
                    }
                    const emptyPlayer = players.findIndex((_, i) => getFillableStats(i).length > 0);
                    if (emptyPlayer === -1) return;
                    const emptyStat = getFillableStats(emptyPlayer)[0];
                    const category = statCategoryMap[emptyStat] || 'character';
                    const available = getAvailableEntities(null, category, players[emptyPlayer]);
                    if (available.length > 0) {
                      handleSelect(
                        emptyPlayer,
                        emptyStat,
                        available[Math.floor(Math.random() * available.length)].id
                      );
                    }
                  }}
                />
                <button
                  onClick={() =>
                    setGameSettings((prev) => ({ ...prev, timerEnabled: !prev.timerEnabled }))
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider border transition-colors ${
                    gameSettings.timerEnabled
                      ? 'bg-red-950/40 border-red-800/40 text-red-400'
                      : 'bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                  }`}
                >
                  Timer {gameSettings.timerEnabled ? 'ON' : 'OFF'}
                </button>
              </div>

              <SystemProtocol
                onClash={() => setActiveOverlay('clash')}
                showClashButton={allSelected}
              />
            </motion.div>
          )}

          {draftPhase === 'comparing' && (
            <motion.div
              key="comparison"
              initial={{ opacity: 0, scale: 1.2 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="w-full flex justify-center"
            >
              <Comparison
                players={players}
                roundWins={roundWins}
                isMultiplayer={false}
                onPlayAgain={() => {
                  // Preserve player count + names — previously hardcoded to 2.
                  setPlayers(
                    players.map((p) => ({ ...emptyDraft(), playerName: p.playerName || null }))
                  );
                  setBans(players.map(() => []));
                  setDraftPhase('start');
                  setRoundWins(players.map(() => 0));
                  setMatchHistory([]);
                  if (draftMode === 'gamble') {
                    const resetGambleStates: Record<number, GambleState> = {};
                    players.forEach((_, i) => {
                      resetGambleStates[i] = {
                        remainingTotal: gambleConfig.totalRolls,
                        remainingLucky: gambleConfig.luckyRolls,
                        statRolls: {},
                      };
                    });
                    setGambleStates(resetGambleStates);
                  }
                }}
                onReset={(winners, finalScores) => {
                  const newWins = [...roundWins];
                  while (newWins.length < players.length) newWins.push(0);

                  const matchRecord = {
                    date: new Date().toISOString(),
                    players: players.map((p, i) => ({
                      name: p.playerName || `Player ${i + 1}`,
                      score: finalScores[i],
                      isWinner: winners.includes(i),
                    })),
                  };
                  setMatchHistory((prev) => [matchRecord, ...prev]);

                  winners.forEach((w) => {
                    if (newWins[w] !== undefined) newWins[w]++;
                  });
                  setRoundWins(newWins);

                  // Reset gamble states for new matchup if in gamble mode
                  if (draftMode === 'gamble') {
                    const resetGambleStates: Record<number, GambleState> = {};
                    players.forEach((_, i) => {
                      resetGambleStates[i] = {
                        remainingTotal: gambleConfig.totalRolls,
                        remainingLucky: gambleConfig.luckyRolls,
                        statRolls: {},
                      };
                    });
                    setGambleStates(resetGambleStates);
                  }

                  const names = players.map((p) => p.playerName || '');
                  const newPlayers = players.map(() => emptyDraft());
                  names.forEach((n, i) => {
                    newPlayers[i].playerName = n;
                  });

                  setPlayers(newPlayers);
                  setBans(players.map(() => []));
                  setDraftPhase('banning');
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {draftPhase === 'start' && (
        <GameFooter
          onChangelog={() => setIsChangelogOpen(true)}
          onHowToPlay={() => setIsHowToPlayOpen(true)}
          onFeedback={() => setIsFeedbackOpen(true)}
          onArchives={() => setIsHelpOpen(true)}
          onStats={() => setIsStatsOpen(true)}
          onAchievements={() => setIsAchievementsOpen(true)}
        />
      )}

      {/* Game Navbar */}
      {draftPhase !== 'start' && (
        <GameNavbar
          onHowToPlay={() => setIsHowToPlayOpen(true)}
          onFeedback={() => setIsFeedbackOpen(true)}
          onAchievements={() => setIsAchievementsOpen(true)}
          onStats={() => setIsStatsOpen(true)}
        />
      )}

      {/* Changelog Modal */}
      <ChangelogModal isOpen={isChangelogOpen} onClose={() => setIsChangelogOpen(false)} />

      {/* Help Modal */}
      <HelpPage isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

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

      {/* Phase Transition Overlays */}
      <AnimatePresence>
        {activeOverlay === 'ban' && (
          <PhaseTransition
            key="toDraft"
            topKanji="選別開始"
            topEnglish="Drafting Phase"
            bottomPhase="Phase 2"
            bottomTitle="COMMENCE DRAFTING"
            onPhaseSwap={() => setDraftPhase('drafting')}
            onComplete={() => setActiveOverlay(null)}
          />
        )}
        {activeOverlay === 'clash' && (
          <CursedConvergenceTransition
            key="toClash"
            players={players}
            onPhaseSwap={() => setDraftPhase('comparing')}
            onComplete={() => setActiveOverlay(null)}
          />
        )}
        {activeOverlay === 'startToBan' && (
          <PhaseTransition
            key="toBan"
            topKanji="封印開始"
            topEnglish="Banning Phase"
            bottomPhase="Phase 1"
            bottomTitle="COMMENCE SEALING"
            onPhaseSwap={() => setDraftPhase('banning')}
            onComplete={() => setActiveOverlay(null)}
          />
        )}
      </AnimatePresence>

      {/* Tutorial Overlay */}
      <TutorialOverlay
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        currentPhase={draftPhase}
      />

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

      <Analytics />
    </div>
  );
}
