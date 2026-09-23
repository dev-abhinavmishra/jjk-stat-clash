import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Entity,
  CharacterStats,
  statLabels,
  statsList,
  statCategoryMap,
  pairings,
  bindingVows,
} from '../data/characters';
import { Trash2, ChevronDown, Zap, Search, X, CheckCircle2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export type DraftSelection = Record<string, string | null>;
export { bindingVows };

const playerColors: Record<number, any> = {
  1: {
    text: 'text-red-500',
    border: 'border-red-500',
    shadow: 'shadow-red-500/50',
    glow: 'shadow-[0_0_15px_rgba(239,68,68,0.3)]',
    bg: 'bg-red-500/20',
  },
  2: {
    text: 'text-blue-500',
    border: 'border-blue-500',
    shadow: 'shadow-blue-500/50',
    glow: 'shadow-[0_0_15px_rgba(59,130,246,0.3)]',
    bg: 'bg-blue-500/20',
  },
  3: {
    text: 'text-green-500',
    border: 'border-green-500',
    shadow: 'shadow-green-500/50',
    glow: 'shadow-[0_0_15px_rgba(34,197,94,0.3)]',
    bg: 'bg-green-500/20',
  },
  4: {
    text: 'text-purple-500',
    border: 'border-purple-500',
    shadow: 'shadow-purple-500/50',
    glow: 'shadow-[0_0_15px_rgba(168,85,247,0.3)]',
    bg: 'bg-purple-500/20',
  },
  5: {
    text: 'text-yellow-500',
    border: 'border-yellow-500',
    shadow: 'shadow-yellow-500/50',
    glow: 'shadow-[0_0_15px_rgba(234,179,8,0.3)]',
    bg: 'bg-yellow-500/20',
  },
  6: {
    text: 'text-orange-500',
    border: 'border-orange-500',
    shadow: 'shadow-orange-500/50',
    glow: 'shadow-[0_0_15px_rgba(249,115,22,0.3)]',
    bg: 'bg-orange-500/20',
  },
  7: {
    text: 'text-pink-500',
    border: 'border-pink-500',
    shadow: 'shadow-pink-500/50',
    glow: 'shadow-[0_0_15px_rgba(236,72,153,0.3)]',
    bg: 'bg-pink-500/20',
  },
  8: {
    text: 'text-cyan-500',
    border: 'border-cyan-500',
    shadow: 'shadow-cyan-500/50',
    glow: 'shadow-[0_0_15px_rgba(6,182,212,0.3)]',
    bg: 'bg-cyan-500/20',
  },
};

const statKanji: Record<string, string> = {
  strength: '力',
  speed: '速',
  durability: '耐',
  ce: '呪',
  ct: '術',
  body: '体',
  tool: '具',
  specialPower1: '特',
  specialPower2: '特',
  shikigami: '式',
  domainExpansion: '域',
  iq: '智',
  bindingVow: '誓',
};

export const getRarityConfig = (entity: any) => {
  if (!entity)
    return {
      label: 'UNKNOWN',
      tier: '',
      color: 'text-zinc-500',
      badgeTheme: 'bg-zinc-800 text-zinc-500',
      border: 'border-zinc-700',
      bg: 'bg-zinc-900',
      effects: '',
    };
  const grade = entity.grade || 'Common';

  if (grade === 'Calamity') {
    return {
      label: 'CALAMITY',
      tier: 'EX',
      color: 'text-indigo-400',
      badgeTheme:
        'bg-black text-indigo-400 border border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.8)]',
      border: 'border-indigo-500',
      bg: 'bg-indigo-950/40',
      effects:
        'shadow-[0_0_40px_rgba(99,102,241,0.8)] animate-pulse border-2 ring-4 ring-indigo-500/50',
    };
  }

  if (grade === 'Mythic') {
    return {
      label: 'MYTHIC',
      tier: 'S',
      color: 'text-red-500',
      badgeTheme: 'bg-red-600 text-white',
      border: 'border-red-600',
      bg: 'bg-red-950/40',
      effects:
        'shadow-[0_0_30px_rgba(220,38,38,0.8)] animate-pulse border-2 ring-2 ring-red-500/50',
    };
  }

  if (grade === 'Legendary') {
    return {
      label: 'LEGENDARY',
      tier: 'A',
      color: 'text-yellow-400',
      badgeTheme: 'bg-yellow-500 text-black shadow-[0_0_10px_rgba(234,179,8,0.5)]',
      border: 'border-yellow-500',
      bg: 'bg-yellow-950/30',
      effects: 'shadow-[0_0_20px_rgba(250,204,21,0.6)] border-2 ring-1 ring-yellow-400/30',
    };
  }

  if (grade === 'Epic') {
    return {
      label: 'EPIC',
      tier: 'B',
      color: 'text-purple-500',
      badgeTheme: 'bg-purple-600 text-white shadow-[0_0_10px_rgba(168,85,247,0.5)]',
      border: 'border-purple-600',
      bg: 'bg-purple-950/30',
      effects: 'shadow-[0_0_15px_rgba(168,85,247,0.5)] border-2',
    };
  }

  if (grade === 'Rare') {
    return {
      label: 'RARE',
      tier: 'C',
      color: 'text-blue-500',
      badgeTheme: 'bg-blue-600 text-white',
      border: 'border-blue-600',
      bg: 'bg-blue-950/30',
      effects: 'shadow-[0_0_10px_rgba(59,130,246,0.5)]',
    };
  }

  if (grade === 'Uncommon') {
    return {
      label: 'UNCOMMON',
      tier: 'D',
      color: 'text-green-400',
      badgeTheme: 'bg-green-500 text-black',
      border: 'border-green-400',
      bg: 'bg-green-950/20',
      effects: '',
    };
  }

  return {
    label: 'COMMON',
    tier: 'E',
    color: 'text-zinc-400',
    badgeTheme: 'bg-zinc-600 text-white',
    border: 'border-zinc-600',
    bg: 'bg-[#111]',
    effects: '',
  };
};

function RollingScrambler({
  allEntities,
  targetId,
  kanji,
}: {
  allEntities: any[];
  targetId: string | null;
  kanji: string;
}) {
  const [currentEntity, setCurrentEntity] = useState<any>(null);

  useEffect(() => {
    let isCancelled = false;
    let delay = 30;
    const duration = 1500;
    const startTime = Date.now();
    const targetEntity = targetId
      ? allEntities.find((e) => e.id === targetId || e.value === targetId)
      : null;

    const tick = () => {
      if (isCancelled) return;
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easeOut = 1 - Math.pow(1 - progress, 3);
      delay = 20 + easeOut * 300; // slightly faster bottom bound for snappiness

      if (elapsed < duration - 100) {
        const randomEntity = allEntities[Math.floor(Math.random() * allEntities.length)];
        setCurrentEntity(randomEntity);
        setTimeout(tick, delay);
      } else {
        setCurrentEntity(targetEntity);
      }
    };

    tick();
    return () => {
      isCancelled = true;
    };
  }, [allEntities, targetId]);

  const displayEntity = currentEntity || allEntities[0];
  const rarity = getRarityConfig(displayEntity);

  return (
    <div
      className={`w-full bg-black ${rarity.bg} border ${rarity.border} ${rarity.effects} text-white p-1 pl-10 pr-2 rounded-md flex items-center relative transition-colors duration-75 h-[42px] overflow-hidden`}
    >
      <div
        className={`absolute inset-0 bg-white/5 animate-[pulse_0.2s_ease-in-out_infinite] pointer-events-none`}
      />
      <span
        className={`absolute left-3 font-black text-xl ${rarity.color} font-display drop-shadow-md`}
      >
        {kanji}
      </span>
      <div className="flex flex-col truncate ml-1 leading-tight justify-center h-full relative z-10 w-full">
        <span className="truncate font-bold tracking-wide text-[14px] text-zinc-200">
          {displayEntity?.name || displayEntity?.label || '???'}
        </span>
        <div className="flex justify-between items-center w-full pr-1">
          <span
            className={`text-[9px] ${rarity.color} font-black uppercase tracking-[0.1em] opacity-90 transition-colors duration-75`}
          >
            {rarity.label}
          </span>
          {rarity.tier && (
            <span
              className={`text-[9px] ${rarity.badgeTheme} px-1 rounded-sm font-black tracking-widest`}
            >
              {rarity.tier} RANK
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function SearchableSelect({
  value,
  options,
  onChange,
  placeholder,
  kanji,
  colorTheme,
  isSynergyActive,
  isBindingVow,
  disabled,
}: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [hoveredOption, setHoveredOption] = useState<any>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHoveredOption(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    const tooltipWidth = 288;
    const tooltipHeight = 150;

    let x = e.clientX + 15;
    let y = e.clientY + 15;

    if (x + tooltipWidth > window.innerWidth) {
      x = e.clientX - tooltipWidth - 15;
    }
    if (y + tooltipHeight > window.innerHeight) {
      y = e.clientY - tooltipHeight - 15;
    }

    x = Math.max(10, x);
    y = Math.max(10, y);

    setTooltipPos({ x, y });
  };

  const selectedOption = options.find((o: any) => o.value === value);

  const defaultTheme = {
    text: 'text-red-500',
    border: 'border-red-900/50',
    shadow: '',
    glow: 'shadow-[0_0_15px_rgba(220,38,38,0.2)]',
    bg: '',
  };
  const theme = colorTheme || defaultTheme;

  return (
    <div ref={wrapperRef} className={`relative w-full ${disabled ? 'pointer-events-none' : ''}`}>
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full bg-[#0a0a0a] border ${value ? theme.border : 'border-zinc-800'} text-white p-2 pl-10 pr-10 rounded-md text-sm cursor-pointer flex items-center justify-between transition-all duration-300 ${value ? theme.glow : 'hover:border-zinc-600'} ${isSynergyActive ? 'animate-pulse' : ''} ${disabled ? 'opacity-90 grayscale-[0.2]' : ''} relative`}
      >
        {/* Subtle scanline effect */}
        <div className="absolute inset-0 rounded-md overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.25)_50%)] bg-[size:100%_4px] opacity-20"></div>
        </div>

        <span
          className={`absolute left-3 font-black text-lg ${value ? theme.text : 'text-zinc-700'} font-display`}
        >
          {kanji}
        </span>
        <span
          className={`truncate font-medium z-10 ${value ? 'text-zinc-100' : 'text-zinc-500 italic'}`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        <div className="absolute right-2 flex items-center gap-1 z-10 bg-[#0a0a0a] pl-1">
          {value && !disabled && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              className="text-zinc-500 hover:text-red-500 transition-colors p-1"
            >
              <X size={14} />
            </button>
          )}
          <ChevronDown
            size={14}
            className={`text-zinc-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>

        {isSynergyActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`absolute -right-1 -top-1 ${colorTheme.text} drop-shadow-md`}
          >
            <Zap size={16} fill="currentColor" />
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-1 bg-zinc-800/95 backdrop-blur-xl border border-zinc-700 rounded-md shadow-2xl max-h-60 flex flex-col overflow-hidden"
          >
            <div className="p-2 border-b border-zinc-800 flex items-center gap-2 bg-[#050505]">
              <Search size={14} className="text-zinc-500" />
              <input
                type="text"
                className="w-full bg-transparent text-white text-sm outline-none font-mono placeholder:text-zinc-600"
                placeholder="Search database..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
            </div>
            <div className="overflow-y-auto flex-1">
              {!disabled && (
                <div
                  className="px-3 py-2 text-xs font-mono uppercase tracking-widest text-zinc-500 hover:text-red-400 hover:bg-zinc-900 cursor-pointer transition-colors border-b border-zinc-800/50"
                  onClick={() => {
                    onChange('');
                    setIsOpen(false);
                    setSearch('');
                  }}
                >
                  [ Clear Selection ]
                </div>
              )}
              {options
                .filter((o: any) => o.label.toLowerCase().includes(search.toLowerCase()))
                .map((option: any, i: number) => (
                  <div
                    key={`${option.value}-${i}`}
                    className={`px-3 py-2.5 text-sm cursor-pointer transition-colors border-l-2 ${value === option.value ? theme.border + ' ' + theme.text + ' bg-zinc-900/80 font-bold' : 'border-transparent text-zinc-300 hover:bg-zinc-800 hover:border-zinc-500'}`}
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                      setSearch('');
                      setHoveredOption(null);
                    }}
                    onMouseEnter={() => setHoveredOption(option)}
                    onMouseLeave={() => setHoveredOption(null)}
                    onMouseMove={handleMouseMove}
                  >
                    {option.label}
                  </div>
                ))}
              {options.filter((o: any) => o.label.toLowerCase().includes(search.toLowerCase()))
                .length === 0 && (
                <div className="px-3 py-4 text-sm text-zinc-500 text-center">No matches found</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cursed Record Tooltip */}
      {hoveredOption &&
        hoveredOption.loreDescription &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className={`fixed z-[9999] w-72 ${isBindingVow ? 'bg-[#2a1a1a]/95 border-[#5a2a2a]' : 'bg-[#1a1515]/95 border-[#3a2a2a]'} backdrop-blur-md p-4 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] pointer-events-none transition-opacity duration-200`}
            style={{ top: tooltipPos.y, left: tooltipPos.x }}
          >
            <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] mix-blend-overlay"></div>
            <h4
              className={`font-display font-black ${isBindingVow ? 'text-yellow-500' : 'text-red-100'} text-lg mb-1 relative z-10`}
            >
              {hoveredOption.label}
            </h4>
            {hoveredOption.grade && (
              <div
                className={`text-xs font-bold ${isBindingVow ? 'text-yellow-600/80 border-yellow-900/30' : 'text-red-500/80 border-red-900/30'} uppercase tracking-widest mb-2 relative z-10 border-b pb-1`}
              >
                {hoveredOption.grade}
              </div>
            )}
            <p
              className={`text-sm ${isBindingVow ? 'text-yellow-100/80' : 'text-zinc-300'} leading-relaxed relative z-10 font-serif`}
            >
              {hoveredOption.loreDescription}
            </p>
            {isBindingVow && hoveredOption.description && (
              <div className="mt-2 text-xs font-bold text-red-400 bg-red-950/30 p-2 rounded border border-red-900/50 relative z-10">
                EFFECT: {hoveredOption.description}
              </div>
            )}
          </div>,
          document.body
        )}
    </div>
  );
}

interface PlayerCardProps {
  key?: React.Key;
  playerNum: number;
  draft: DraftSelection;
  onSelect: (stat: string, entityId: string) => void;
  onNameChange: (name: string) => void;
  onRemove?: () => void;
  canRemove: boolean;
  getAvailableEntities: (
    currentSelectedId: string | null,
    category: string,
    draft: DraftSelection
  ) => Entity[];
  allEntities: Entity[];
  draftMode?: 'normal' | 'gamble';
  gambleState?: {
    remainingTotal: number;
    remainingLucky: number;
    statRolls: Record<string, number>;
  };
  gambleConfig?: { totalRolls: number; luckyRolls: number; rollsPerStat: number };
  onGambleRoll?: (stat: string, isLucky: boolean) => void;
  lockOnSelect?: boolean;
  isTurn?: boolean;
  activeRollingStat?: string | null;
  onFinishGambleTurn?: () => void;
  isOnlineMode?: boolean;
}

export function PlayerCard({
  playerNum,
  draft,
  onSelect,
  onNameChange,
  onRemove,
  canRemove,
  getAvailableEntities,
  allEntities,
  draftMode,
  gambleState,
  gambleConfig,
  onGambleRoll,
  lockOnSelect,
  isTurn,
  activeRollingStat,
  onFinishGambleTurn,
  isOnlineMode = false,
}: PlayerCardProps) {
  const colorTheme = playerColors[playerNum] || playerColors[1];
  const [rollingStats, setRollingStats] = useState<Record<string, boolean>>({});

  const draftedEntityIds = Object.values(draft).filter(Boolean) as string[];
  const activePairings = pairings.filter((pairing) =>
    pairing.entities.every((id) => draftedEntityIds.includes(id))
  );

  const isEntityInActiveSynergy = (entityId: string | null) => {
    if (!entityId) return false;
    return activePairings.some((p) => p.entities.includes(entityId));
  };

  const vowEmpowered =
    draft.specialPower1 === 'binding-vow' || draft.specialPower2 === 'binding-vow';
  const boundVow = bindingVows.find((v) => v.id === draft.bindingVow);

  const formatCategoryName = (cat: string) => {
    if (cat === 'domainExpansion') return 'Domain Expansion';
    if (cat === 'cursedTechnique') return 'Cursed Technique';
    if (cat === 'specialPower') return 'Special Power';
    return cat.charAt(0).toUpperCase() + cat.slice(1);
  };

  const handleRollClick = (stat: string, isLucky: boolean) => {
    if (rollingStats[stat]) return;
    setRollingStats((prev) => ({ ...prev, [stat]: true }));
    onGambleRoll?.(stat, isLucky); // Execute instantly to update state.draft[stat]
    setTimeout(() => {
      setRollingStats((prev) => ({ ...prev, [stat]: false }));
    }, 1500);
  };

  // The optional vow slot doesn't count toward the "must have a roll for every
  // unfilled stat" safeguard — an unfilled pact should never lock re-rolls.
  const emptyRequiredStatsCount = statsList.filter(
    (s) => s !== 'bindingVow' && draft[s] === null
  ).length;
  const requireRollsSafeguard =
    draftMode === 'gamble' && gambleState
      ? gambleState.remainingTotal <= emptyRequiredStatsCount
      : false;

  return (
    <div
      className={`bg-[#0a0a0a]/90 backdrop-blur-md border ${colorTheme.border} rounded-xl p-4 md:p-5 flex flex-col gap-4 relative w-full max-w-full md:max-w-sm shadow-2xl transition-all duration-500 hover:z-50 focus-within:z-50`}
    >
      {/* Card Background Grid */}
      <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:16px_16px]"></div>
      </div>

      <div className="flex justify-between items-center gap-2 relative z-10 w-full mb-4">
        <div className="flex flex-col">
          <input
            type="text"
            placeholder={`Player ${playerNum}`}
            value={draft.playerName || ''}
            onChange={(e) => onNameChange(e.target.value)}
            className={`bg-transparent border-b-2 border-transparent hover:border-zinc-800 focus:border-red-500 outline-none text-2xl md:text-3xl font-black ${colorTheme.text} font-display uppercase tracking-wider w-full placeholder:text-zinc-800 transition-colors truncate pb-1`}
          />
          {isTurn && isOnlineMode && (
            <motion.div
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className={`text-[10px] font-black uppercase tracking-[0.3em] ${colorTheme.text} mt-1 flex items-center gap-2`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${colorTheme.bg.replace('bg-', 'bg-').replace('/20', '')} animate-pulse`}
              />
              Active Turn
            </motion.div>
          )}
        </div>
        {draftMode === 'gamble' && gambleState && (
          <div className="flex flex-col items-end whitespace-nowrap text-xs font-mono">
            <span className="text-zinc-400 font-bold uppercase tracking-wider">
              Rolls: <span className="text-white">{gambleState.remainingTotal}</span>
            </span>
            <span className="text-yellow-500 font-bold uppercase tracking-wider">
              Lucky: <span className="text-white">{gambleState.remainingLucky}</span>
            </span>
          </div>
        )}
        {canRemove && onRemove && (
          <button
            onClick={onRemove}
            className="text-zinc-500 hover:text-red-500 transition-colors my-auto ml-2 shrink-0"
          >
            <Trash2 size={20} />
          </button>
        )}
      </div>

      {/* Draft progress bar */}
      <div className="mb-2">
        <div className="flex justify-between text-[10px] text-zinc-500 mb-1 font-mono">
          <span>
            {statsList.filter((s) => draft[s] !== null).length}/{statsList.length} filled
          </span>
          {statsList.filter((s) => draft[s] !== null).length < statsList.length &&
            draftMode !== 'gamble' && (
              <span className="text-yellow-600">
                {statsList.length - statsList.filter((s) => draft[s] !== null).length} remaining
              </span>
            )}
        </div>
        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 rounded-full ${colorTheme.bg.replace('/20', '')}`}
            style={{
              width: `${(statsList.filter((s) => draft[s] !== null).length / statsList.length) * 100}%`,
            }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {statsList.map((stat) => {
          if (stat === 'bindingVow') {
            // The pact slot accepts vow ids only — it is a selector for the
            // 'Binding Vow' special power, not a generic special-power slot.
            return (
              <div
                key={stat}
                className={`flex flex-col gap-1 bg-[#111] p-2.5 rounded-lg border ${boundVow ? 'border-yellow-600/50 shadow-inner' : 'border-zinc-800'} transition-all duration-300 relative focus-within:z-50`}
              >
                <div className="flex justify-between w-full">
                  <label
                    className={`text-[10px] font-mono font-bold uppercase tracking-widest ${boundVow ? 'text-yellow-500' : 'text-zinc-600'}`}
                  >
                    {statLabels[stat]}
                  </label>
                  <div className="flex gap-2 items-center">
                    {lockOnSelect && boundVow && (
                      <span className="text-[9px] font-mono font-black text-green-500 bg-green-500/10 border border-green-500/30 px-1.5 rounded uppercase tracking-tighter">
                        Locked
                      </span>
                    )}
                    {draftMode === 'gamble' && gambleState && gambleConfig && (
                      <span className="text-[10px] font-mono font-bold text-yellow-600 uppercase">
                        {gambleState.statRolls['bindingVow'] || 0}/{gambleConfig.rollsPerStat} Vow
                        Rolls (Free)
                      </span>
                    )}
                  </div>
                </div>

                {vowEmpowered ? (
                  draftMode === 'gamble' ? (
                    <div className="flex flex-col gap-2 w-full mt-1">
                      {rollingStats['bindingVow'] ? (
                        <RollingScrambler
                          allEntities={bindingVows}
                          targetId={boundVow?.id || null}
                          kanji="誓"
                        />
                      ) : boundVow ? (
                        (() => {
                          const rarity = getRarityConfig(boundVow);
                          return (
                            <motion.div
                              key={boundVow.id}
                              initial={{ scale: 1.1, opacity: 0, y: -10, filter: 'brightness(3)' }}
                              animate={{ scale: 1, opacity: 1, y: 0, filter: 'brightness(1)' }}
                              transition={{ type: 'spring', damping: 10, stiffness: 100 }}
                              className={`w-full bg-black ${rarity.bg} border ${rarity.border} ${rarity.effects} text-white p-1 pl-10 pr-2 rounded-md flex items-center relative transition-colors h-[42px] overflow-hidden group`}
                            >
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: [1, 1.5, 0], opacity: [1, 0, 0] }}
                                transition={{ duration: 0.6 }}
                                className={`absolute inset-0 rounded-md border-2 ${rarity.border} pointer-events-none`}
                              />
                              <span
                                className={`absolute left-3 font-black text-xl ${rarity.color} font-display drop-shadow-md`}
                              >
                                誓
                              </span>
                              <div className="flex flex-col truncate ml-1 leading-tight justify-center h-full w-full">
                                <span className="truncate font-bold tracking-wide text-[14px] text-zinc-200">
                                  {boundVow.name}
                                </span>
                                <div className="flex justify-between items-center w-full">
                                  <span
                                    className={`text-[9px] ${rarity.color} font-black uppercase tracking-[0.1em] opacity-90`}
                                  >
                                    {rarity.label}
                                  </span>
                                  <span
                                    className={`text-[10px] ${rarity.badgeTheme} px-1.5 rounded-sm font-black tracking-widest`}
                                  >
                                    {rarity.tier} RANK
                                  </span>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })()
                      ) : (
                        <div className="w-full bg-[#0a0a0a] border border-dashed border-zinc-700 text-zinc-500 p-2 text-center rounded-md text-sm font-medium italic h-[42px] flex items-center justify-center">
                          Awaiting Pact...
                        </div>
                      )}
                      <div className="flex gap-2">
                        <button
                          disabled={
                            !isTurn ||
                            (activeRollingStat && activeRollingStat !== 'bindingVow') ||
                            rollingStats['bindingVow'] ||
                            !gambleConfig ||
                            !gambleState ||
                            (gambleState.statRolls['bindingVow'] || 0) >= gambleConfig.rollsPerStat
                          }
                          onClick={() => handleRollClick('bindingVow', false)}
                          className={`flex-1 ${isTurn && (!activeRollingStat || activeRollingStat === 'bindingVow') ? 'bg-yellow-950/40 hover:bg-yellow-900/60 border-yellow-800/40' : 'bg-zinc-900/50 text-zinc-700 border-transparent'} border disabled:cursor-not-allowed text-yellow-500 font-black text-xs py-2 rounded uppercase tracking-[0.2em] transition-all shadow-[0_0_10px_rgba(234,179,8,0.1)] active:scale-95`}
                        >
                          Soul Roll
                        </button>
                      </div>
                    </div>
                  ) : (
                    <SearchableSelect
                      value={boundVow?.id || ''}
                      options={bindingVows.map((v) => ({
                        value: v.id,
                        label: v.name,
                        loreDescription: v.loreDescription,
                        grade: v.grade,
                        description: v.description,
                      }))}
                      onChange={(val: string) => onSelect('bindingVow', val)}
                      placeholder="None"
                      kanji="誓"
                      colorTheme={{
                        text: 'text-yellow-500',
                        border: 'border-yellow-600/50',
                        shadow: '',
                        glow: 'shadow-[0_0_15px_rgba(234,179,8,0.2)]',
                        bg: '',
                      }}
                      isSynergyActive={false}
                      isBindingVow={true}
                      disabled={lockOnSelect && !!boundVow}
                    />
                  )
                ) : (
                  <div className="w-full bg-[#0a0a0a] border border-zinc-800/50 text-zinc-600 p-2 pl-10 rounded-md text-sm flex items-center justify-between cursor-not-allowed relative overflow-hidden">
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.02)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px] pointer-events-none"></div>
                    <span className="absolute left-3 font-black text-lg text-zinc-800 font-display">
                      誓
                    </span>
                    <span className="truncate font-medium italic text-zinc-600 text-xs">
                      Requires 'Binding Vow' Special Power
                    </span>
                  </div>
                )}
              </div>
            );
          }

          const currentId = draft[stat];
          const category = statCategoryMap[stat];
          const available = getAvailableEntities(currentId, category, draft);

          const options: {
            value: string;
            label: string;
            loreDescription?: string;
            grade?: string;
          }[] = [];
          if (currentId && !available.find((a) => a.id === currentId)) {
            const entity = allEntities.find((e) => e.id === currentId);
            if (entity)
              options.push({
                value: entity.id,
                label: entity.name,
                loreDescription: entity.loreDescription,
                grade: entity.grade,
              });
          }
          available.forEach((entity) => {
            options.push({
              value: entity.id,
              label: entity.name,
              loreDescription: entity.loreDescription,
              grade: entity.grade,
            });
          });

          return (
            <div
              key={stat}
              className={`flex flex-col gap-1 bg-[#111] p-2.5 rounded-lg border ${currentId ? colorTheme.border + ' border-opacity-50 shadow-inner' : 'border-zinc-800'} transition-all duration-300 relative focus-within:z-50`}
            >
              <div className="flex justify-between w-full">
                <label
                  className={`text-[10px] font-mono font-bold uppercase tracking-widest ${currentId ? colorTheme.text : 'text-zinc-600'}`}
                >
                  {statLabels[stat]}
                </label>
                <div className="flex gap-2 items-center">
                  {lockOnSelect && currentId && (
                    <span className="text-[9px] font-mono font-black text-green-500 bg-green-500/10 border border-green-500/30 px-1.5 rounded uppercase tracking-tighter">
                      Locked
                    </span>
                  )}
                  {draftMode === 'gamble' && gambleState && gambleConfig && (
                    <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">
                      {gambleState.statRolls[stat] || 0}/{gambleConfig.rollsPerStat} Rolls
                    </span>
                  )}
                  {!currentId && draftMode !== 'gamble' && (
                    <AlertTriangle size={10} className="text-yellow-600" />
                  )}
                </div>
              </div>

              {draftMode === 'gamble' ? (
                <div className="flex flex-col gap-2 w-full mt-1">
                  {rollingStats[stat] ? (
                    <RollingScrambler
                      allEntities={options.filter((o: any) => o.value)}
                      targetId={currentId}
                      kanji={statKanji[stat]}
                    />
                  ) : currentId ? (
                    (() => {
                      const rarity = getRarityConfig(allEntities.find((e) => e.id === currentId));
                      return (
                        <motion.div
                          key={currentId}
                          initial={{ scale: 1.1, opacity: 0, y: -10, filter: 'brightness(3)' }}
                          animate={{ scale: 1, opacity: 1, y: 0, filter: 'brightness(1)' }}
                          transition={{ type: 'spring', damping: 10, stiffness: 100 }}
                          className={`w-full bg-black ${rarity.bg} border ${rarity.border} ${rarity.effects} text-white p-1 pl-10 pr-2 rounded-md flex items-center relative transition-colors h-[42px] overflow-hidden group`}
                        >
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: [1, 1.5, 0], opacity: [1, 0, 0] }}
                            transition={{ duration: 0.6 }}
                            className={`absolute inset-0 rounded-md border-2 ${rarity.border} pointer-events-none`}
                          />
                          <span
                            className={`absolute left-3 font-black text-xl ${rarity.color} font-display drop-shadow-md`}
                          >
                            {statKanji[stat]}
                          </span>
                          <div className="flex flex-col truncate ml-1 leading-tight justify-center h-full w-full">
                            <span className="truncate font-bold tracking-wide text-[14px] text-zinc-200">
                              {allEntities.find((e) => e.id === currentId)?.name || currentId}
                            </span>
                            <div className="flex justify-between items-center w-full">
                              <span
                                className={`text-[9px] ${rarity.color} font-black uppercase tracking-[0.1em] opacity-90`}
                              >
                                {rarity.label}
                              </span>
                              <span
                                className={`text-[10px] ${rarity.badgeTheme} px-1.5 rounded-sm font-black tracking-widest`}
                              >
                                {rarity.tier} RANK
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })()
                  ) : (
                    <div className="w-full bg-[#0a0a0a] border border-dashed border-zinc-700 text-zinc-500 p-2 text-center rounded-md text-sm font-medium italic h-[42px] flex items-center justify-center">
                      Awaiting Roll...
                    </div>
                  )}
                  <div className="flex gap-2 items-center">
                    <button
                      disabled={
                        !isTurn ||
                        (activeRollingStat && activeRollingStat !== stat) ||
                        rollingStats[stat] ||
                        !gambleConfig ||
                        !gambleState ||
                        gambleState.remainingTotal <= 0 ||
                        (gambleState.statRolls[stat] || 0) >= gambleConfig.rollsPerStat ||
                        (requireRollsSafeguard && currentId !== null)
                      }
                      onClick={() => handleRollClick(stat, false)}
                      className={`flex-1 ${isTurn && (!activeRollingStat || activeRollingStat === stat) ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-zinc-900/50 text-zinc-700'} disabled:cursor-not-allowed text-white font-bold text-xs py-1.5 rounded uppercase tracking-wider transition-colors relative overflow-hidden`}
                    >
                      {requireRollsSafeguard && currentId !== null ? 'Locked' : 'Roll'}
                    </button>
                    <button
                      disabled={
                        !isTurn ||
                        (activeRollingStat && activeRollingStat !== stat) ||
                        rollingStats[stat] ||
                        !gambleConfig ||
                        !gambleState ||
                        gambleState.remainingTotal <= 0 ||
                        gambleState.remainingLucky <= 0 ||
                        (gambleState.statRolls[stat] || 0) >= gambleConfig.rollsPerStat ||
                        (requireRollsSafeguard && currentId !== null)
                      }
                      onClick={() => handleRollClick(stat, true)}
                      className={`flex-1 ${isTurn && (!activeRollingStat || activeRollingStat === stat) ? 'bg-yellow-600/20 hover:bg-yellow-500/30 border-yellow-600/30' : 'bg-zinc-900/50 text-zinc-700 border-transparent'} border disabled:cursor-not-allowed text-yellow-500 font-bold text-xs py-1.5 rounded uppercase tracking-wider transition-colors`}
                    >
                      Lucky
                    </button>
                    {isTurn && activeRollingStat === stat && (
                      <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        onClick={onFinishGambleTurn}
                        className="shrink-0 bg-green-600 hover:bg-green-500 text-white p-1.5 rounded transition-colors"
                        title="Lock Stat & End Turn"
                      >
                        <CheckCircle2 size={16} />
                      </motion.button>
                    )}
                  </div>
                </div>
              ) : (
                <SearchableSelect
                  value={currentId || ''}
                  options={options}
                  onChange={(val: string) => onSelect(stat, val)}
                  placeholder={`Select ${formatCategoryName(category)}...`}
                  kanji={statKanji[stat]}
                  colorTheme={colorTheme}
                  isSynergyActive={isEntityInActiveSynergy(currentId)}
                  disabled={lockOnSelect && currentId !== null}
                />
              )}
            </div>
          );
        })}

        <div className="flex flex-col gap-1 bg-[#111] p-2.5 rounded-lg border border-zinc-800 mt-2 relative">
          <div className="flex justify-between w-full">
            <label className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">
              Vow Covenant
            </label>
            {boundVow && (
              <span className="text-[9px] font-mono font-black text-yellow-500 uppercase tracking-widest">
                {boundVow.grade}
              </span>
            )}
          </div>
          {vowEmpowered ? (
            boundVow ? (
              <div className="flex flex-col gap-1 py-1">
                <span className="text-sm font-bold text-yellow-500 font-display tracking-wide">
                  {boundVow.name}
                </span>
                <span className="text-[11px] font-mono text-green-400 uppercase tracking-wide">
                  {boundVow.description}
                </span>
                <span className="text-[10px] text-zinc-500 italic leading-snug mt-0.5">
                  {boundVow.loreDescription}
                </span>
              </div>
            ) : (
              <p className="text-[10px] font-mono text-zinc-600 italic leading-snug py-1">
                No pact bound — draft a pact in the Vow Pact slot above to inscribe its terms here.
              </p>
            )
          ) : (
            <p className="text-[10px] font-mono text-zinc-600 italic leading-snug py-1">
              Pacts are sealed covenants — only sorcerers wielding the 'Binding Vow' special power
              may bind one.
            </p>
          )}
        </div>
      </div>

      <AnimatePresence>
        {activePairings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-2 flex flex-col gap-2"
          >
            {activePairings.map((pairing) => (
              <div
                key={pairing.id}
                className={`p-3 rounded-lg border ${pairing.isSecret ? 'border-yellow-400 bg-yellow-500/20 shadow-[0_0_20px_rgba(250,204,21,0.4)]' : colorTheme.border + ' ' + colorTheme.bg} flex flex-col gap-1 relative overflow-hidden`}
              >
                <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] mix-blend-overlay pointer-events-none"></div>
                {pairing.isSecret && (
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px] animate-[pulse_2s_linear_infinite] pointer-events-none"></div>
                )}
                <div className="flex items-center gap-2 z-10">
                  <Zap
                    size={16}
                    className={pairing.isSecret ? 'text-yellow-400' : colorTheme.text}
                    fill="currentColor"
                  />
                  <span
                    className={`font-black uppercase tracking-wider text-sm ${pairing.isSecret ? 'text-yellow-400' : colorTheme.text} drop-shadow-md`}
                  >
                    {pairing.isSecret ? `??? SECRET: ${pairing.name} ???` : pairing.name}
                  </span>
                </div>
                <span
                  className={`text-xs ${pairing.isSecret ? 'text-yellow-100/90 font-bold' : 'text-zinc-300'} z-10`}
                >
                  {pairing.description}
                </span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
