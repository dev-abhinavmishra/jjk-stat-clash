import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useMotionValueEvent,
  animate,
} from 'motion/react';
import { DraftSelection, bindingVows } from './PlayerCard';
import { characters, statLabels } from '../data/characters';

interface ClashRowProps {
  key?: React.Key;
  statKey: string;
  statName: string;
  players: DraftSelection[];
  statData: any[];
  isActive: boolean;
  isPast: boolean;
  maxVal: number;
}

export function ClashRow({
  statKey,
  statName,
  players,
  statData,
  isActive,
  isPast,
  maxVal,
}: ClashRowProps) {
  const [showFlash, setShowFlash] = useState(false);
  const [flashPos, setFlashPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (isActive) {
      const hasFlash = statData.some((d) => d.isBlackFlash);
      if (hasFlash) {
        setShowFlash(true);
        // We keep the text permanent, but the screen flash is temporary
      }
    } else {
      setShowFlash(false);
    }
  }, [isActive, statData]);

  const showResult = isActive || isPast;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col xl:flex-row items-center p-4 rounded-xl border transition-all duration-500 gap-4 relative overflow-hidden ${
        isActive
          ? 'bg-[#111] border-red-500 shadow-[0_0_20px_rgba(220,38,38,0.15)] z-20'
          : isPast
            ? 'bg-[#0a0a0a] border-zinc-800 z-10'
            : 'bg-transparent border-zinc-900 opacity-40 z-0'
      }`}
    >
      {/* Active state scanline + cursed energy sweep */}
      {isActive && (
        <>
          <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(220,38,38,0.05)_50%)] bg-[size:100%_4px] pointer-events-none"></div>
          <motion.div
            className="absolute top-0 bottom-0 w-1/3 pointer-events-none"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(220,38,38,0.18) 50%, transparent)',
              filter: 'blur(2px)',
            }}
            animate={{ x: ['-110%', '320%'] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute inset-0 border border-red-500/40 rounded-xl pointer-events-none"
            animate={{ opacity: [0.2, 0.7, 0.2] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          />
        </>
      )}

      <div className="w-full xl:w-[200px] font-bold font-display text-zinc-400 uppercase tracking-widest text-sm md:text-base relative z-10 xl:border-r border-zinc-800 pr-4 text-center xl:text-right shrink-0">
        {statName}
      </div>

      <div
        className="grid w-full relative z-10 px-1 lg:px-4 gap-1 lg:gap-4"
        style={{ gridTemplateColumns: `repeat(${players.length}, minmax(0, 1fr))` }}
      >
        {players.map((draft, i) => {
          const entityId = draft[statKey];
          // Pact ids live in bindingVows, not the entity list
          const entity =
            characters.find((c) => c.id === entityId) || bindingVows.find((v) => v.id === entityId);
          const { baseValue, bonus, total, isBlackFlash, isNullified } = statData[i];
          const isWinner = total === maxVal && showResult && !isNullified;
          const flavorText = entity && 'flavorText' in entity ? entity.flavorText : null;

          const isHRZero =
            isNullified ||
            (statKey === 'ce' &&
              ['toji', 'maki'].includes((draft.strength as string) || (draft.body as string)));
          const isLoser = showResult && !isWinner && total < maxVal;

          return (
            <StatColumn
              key={i}
              entity={entity}
              total={total}
              bonus={bonus}
              isWinner={isWinner}
              isBlackFlash={isBlackFlash}
              showResult={showResult}
              showFlash={showFlash}
              isActive={isActive}
              flavorText={flavorText}
              isHRZero={isHRZero}
              isLoser={isLoser}
              maxVal={maxVal}
              isNullified={isNullified}
            />
          );
        })}
      </div>
    </motion.div>
  );
}

// Sub-component for individual stat readout featuring a counting animation
function StatColumn({
  entity,
  total,
  bonus,
  isWinner,
  isBlackFlash,
  showResult,
  showFlash,
  isActive,
  flavorText,
  isHRZero,
  isLoser,
  maxVal,
  isNullified,
}: any) {
  const count = useMotionValue(0);
  const [displayValue, setDisplayValue] = useState(0);
  const rounded = useTransform(count, Math.round);

  useMotionValueEvent(rounded, 'change', setDisplayValue);

  useEffect(() => {
    if (showResult && !isNullified) {
      const controls = animate(count, total, {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
      });
      return controls.stop;
    } else {
      count.set(0);
    }
  }, [showResult, total, count, isNullified]);

  return (
    <div
      className={`flex w-full flex-col items-center justify-center px-1 md:px-2 relative transition-all duration-700 ${isHRZero ? 'opacity-30 grayscale' : ''} ${isLoser ? 'opacity-40 grayscale scale-95' : 'scale-100'}`}
    >
      {isBlackFlash && showFlash && (
        <>
          {/* Screen Inversion Flash (Temporary) */}
          {isActive &&
            typeof document !== 'undefined' &&
            createPortal(
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0, 1, 0] }}
                transition={{ duration: 1.5, times: [0, 0.1, 0.2, 0.3, 1], ease: 'easeOut' }}
                className="fixed inset-0 bg-white mix-blend-difference z-[9999] pointer-events-none"
              />,
              document.body
            )}

          {/* Permanent Black Flash Text */}
          <motion.div
            initial={{ opacity: 0, scale: 0, rotate: -20, y: 50 }}
            animate={{ opacity: 1, scale: 1, rotate: [-20, 5, -5, 0], y: -30 }}
            transition={{
              duration: 1.2,
              type: 'spring',
              stiffness: 200,
              damping: 12,
              rotate: { duration: 0.8, ease: 'easeOut' },
            }}
            className="absolute whitespace-nowrap text-lg font-black text-red-500 bg-black/90 px-3 py-1 rounded border-2 border-red-600 z-30 uppercase tracking-widest shadow-[0_0_20px_rgba(220,38,38,0.8)]"
            style={{ textShadow: '2px 2px 0px #000, -2px -2px 0px #000' }}
          >
            Black Flash!
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="absolute inset-0 border-2 border-red-500 rounded mix-blend-screen"
            />
          </motion.div>
        </>
      )}

      <span
        className={`text-[10px] md:text-xs text-center mb-2 leading-tight h-8 flex items-end justify-center font-mono uppercase tracking-wider ${isWinner ? 'text-yellow-400 font-bold drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]' : 'text-zinc-500'}`}
      >
        {entity?.name || '-'}
      </span>

      <div className="w-full relative h-10 flex items-center justify-center">
        {/* Visual Stat Bar */}
        {showResult && (
          <motion.div
            initial={{ width: 0 }}
            animate={{
              width: `${Math.max(0, Math.min(100, (total / Math.max(1, maxVal)) * 100))}%`,
            }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`absolute bottom-0 h-1 rounded-full ${isBlackFlash ? 'bg-red-500 shadow-[0_0_10px_rgba(220,38,38,0.8)]' : isWinner ? 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]' : 'bg-zinc-700'}`}
          />
        )}

        <div
          className={`flex items-center gap-1 bg-[#050505]/80 px-3 py-1 rounded-md border border-zinc-800/50 backdrop-blur-sm z-10 transition-colors duration-500 ${isWinner && isActive ? 'border-yellow-500/50 bg-[#1a1505]/80 shadow-[0_0_15px_rgba(234,179,8,0.3)]' : ''}`}
        >
          {showResult ? (
            <motion.span
              animate={isWinner ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.5, type: 'tween', times: [0, 0.5, 1], ease: 'easeInOut' }}
              className={`font-mono text-xl md:text-2xl font-bold ${
                isNullified
                  ? 'text-zinc-600 tracking-widest text-lg'
                  : isBlackFlash
                    ? 'text-red-500 font-black tracking-widest drop-shadow-[0_0_15px_rgba(220,38,38,1)]'
                    : isWinner
                      ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]'
                      : 'text-zinc-400'
              }`}
            >
              {isNullified ? 'NULL' : displayValue}
            </motion.span>
          ) : (
            <span className="font-mono text-xl md:text-2xl font-bold text-transparent">?</span>
          )}
          {bonus !== 0 && !isBlackFlash && showResult && (
            <motion.span
              initial={{ opacity: 0, scale: 0.5, x: -10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ delay: 0.6, type: 'spring', stiffness: 300, damping: 20 }}
              className={`text-[10px] font-bold flex items-center ${bonus > 0 ? 'text-green-500 drop-shadow-[0_0_5px_rgba(34,197,94,0.5)]' : 'text-red-500'}`}
              title={bonus > 0 ? `+${bonus} from Synergy` : `Nullified by Restriction`}
            >
              ({bonus > 0 ? '+' : ''}
              {bonus})
            </motion.span>
          )}
        </div>
      </div>
    </div>
  );
}
