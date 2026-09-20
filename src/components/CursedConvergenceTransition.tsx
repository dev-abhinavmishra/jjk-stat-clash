import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DraftSelection } from './PlayerCard';
import {
  useStableRandom,
  ShockRing,
  LightningArcs,
  SlashStreak,
  ImpactFlash,
  CursedEmbers,
} from './TransitionFX';

const PLAYER_COLORS = [
  '#dc2626',
  '#2563eb',
  '#16a34a',
  '#9333ea',
  '#eab308',
  '#f97316',
  '#ec4899',
  '#06b6d4',
];

type Phase = 'summon' | 'channel' | 'implode' | 'flash' | 'title';

export function CursedConvergenceTransition({
  players,
  onPhaseSwap,
  onComplete,
}: {
  players?: DraftSelection[];
  onPhaseSwap: () => void;
  onComplete: () => void;
}) {
  const rnd = useStableRandom(96);
  const rngAt = (k: number) => rnd[k % rnd.length];

  const [phase, setPhase] = useState<Phase>('summon');

  const onPhaseSwapRef = useRef(onPhaseSwap);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onPhaseSwapRef.current = onPhaseSwap;
    onCompleteRef.current = onComplete;
  }, [onPhaseSwap, onComplete]);

  useEffect(() => {
    onPhaseSwapRef.current();
    const timeouts = [
      setTimeout(() => setPhase('channel'), 1250),
      setTimeout(() => setPhase('implode'), 2100),
      setTimeout(() => setPhase('flash'), 2450),
      setTimeout(() => setPhase('title'), 2700),
      setTimeout(() => onCompleteRef.current(), 4600),
    ];
    return () => timeouts.forEach(clearTimeout);
  }, []);

  const collapsing = phase === 'implode' || phase === 'flash' || phase === 'title';
  const N = players?.length || 0;

  return (
    <motion.div
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="fixed inset-0 z-[100] flex justify-center items-center bg-black overflow-hidden perspective-[1000px]"
    >
      {/* Master Shake Container */}
      <motion.div
        className="absolute inset-0 z-10"
        animate={
          phase === 'implode' || phase === 'flash'
            ? {
                x: [0, -24, 24, -14, 14, -7, 7, 0],
                y: [0, 16, -16, 12, -12, 6, -6, 0],
              }
            : { x: 0, y: 0 }
        }
        transition={{ duration: 0.7, ease: 'easeInOut' }}
      >
        {/* Player pillars — summoned alternately, then imploded into the nucleus */}
        <div className="absolute inset-0">
          {players?.map((p, i) => {
            const color = PLAYER_COLORS[i % PLAYER_COLORS.length];

            const slant = 15;
            let tl = (i / N) * 100 + slant;
            let tr = ((i + 1) / N) * 100 + slant;
            let br = ((i + 1) / N) * 100 - slant;
            let bl = (i / N) * 100 - slant;

            if (i === 0) {
              tl = -50;
              bl = -50;
            }
            if (i === N - 1) {
              tr = 150;
              br = 150;
            }

            return (
              <motion.div
                key={i}
                initial={{ y: i % 2 === 0 ? '-100%' : '100%', filter: 'brightness(2.5)' }}
                animate={
                  collapsing
                    ? {
                        scale: 0.02,
                        opacity: 0,
                        filter: 'brightness(4) blur(8px)',
                        rotate: i % 2 === 0 ? -8 : 8,
                      }
                    : { y: '0%', filter: phase === 'channel' ? 'brightness(1.3)' : 'brightness(1)' }
                }
                transition={
                  collapsing
                    ? { duration: 0.4, ease: 'easeIn' }
                    : { duration: 0.6, delay: i * 0.1, ease: [0.19, 1, 0.22, 1] }
                }
                className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.9)] overflow-hidden"
                style={{
                  backgroundColor: color,
                  clipPath: `polygon(${tl}% 0%, ${tr}% 0%, ${br}% 100%, ${bl}% 100%)`,
                  WebkitClipPath: `polygon(${tl}% 0%, ${tr}% 0%, ${br}% 100%, ${bl}% 100%)`,
                  zIndex: 10,
                  transformOrigin: '50% 50%',
                  willChange: 'transform, filter',
                }}
              >
                {/* Internal Abstract Noise / Dark Mesh */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.15)_0%,rgba(0,0,0,0.9)_100%)] mix-blend-overlay pointer-events-none"></div>

                {/* Flowing energy texture */}
                <div className="absolute inset-0 opacity-50 pointer-events-none mix-blend-overlay">
                  <motion.div
                    className="absolute w-[150%] h-[150%] top-[-25%] left-[-25%] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.8)_0%,rgba(255,255,255,0)_60%)]"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.2, 0.6, 0.2],
                      x: ['-10%', '10%', '-10%'],
                      y: ['-10%', '10%', '-10%'],
                    }}
                    transition={{
                      duration: 3 + rngAt(i * 8) * 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                  <motion.div
                    className="absolute w-2 md:w-3 h-[200%] bg-white transform -skew-x-[15deg] shadow-[0_0_20px_rgba(255,255,255,0.8)]"
                    style={{
                      left: '50%',
                      marginLeft: `${slant}%`,
                      willChange: 'opacity, transform',
                    }}
                    animate={{ y: ['0%', '-50%'], opacity: [0.1, 0.9, 0.1] }}
                    transition={{
                      duration: 0.3 + rngAt(i * 8 + 1) * 0.2,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  />
                </div>

                {/* Esoteric Symbol Watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-30 mix-blend-overlay pointer-events-none">
                  <motion.div
                    animate={{ rotate: [0, 360], scale: [1, 1.1, 1] }}
                    transition={{
                      rotate: { duration: 20 + i * 5, repeat: Infinity, ease: 'linear' },
                      scale: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
                    }}
                    className="w-[80vw] h-[80vw] md:w-[40vw] md:h-[40vw] border-[2px] border-white rounded-full flex items-center justify-center relative"
                    style={{ willChange: 'transform' }}
                  >
                    <motion.div
                      className="absolute w-3/4 h-3/4 border-y-[4px] md:border-y-[8px] border-white rounded-full border-dashed flex items-center justify-center"
                      animate={{ rotate: -360 }}
                      transition={{ duration: 15 + i * 3, repeat: Infinity, ease: 'linear' }}
                    >
                      <div className="w-1/3 h-1/3 bg-[radial-gradient(circle_at_center,rgba(255,255,255,1)_0%,rgba(255,255,255,0)_70%)] animate-pulse" />
                    </motion.div>
                  </motion.div>
                </div>

                {/* Player nameplate pinned to the pillar's lower band */}
                {!collapsing && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55 + i * 0.1, duration: 0.3 }}
                    className="absolute bottom-24 inset-x-0 flex justify-center pointer-events-none"
                  >
                    <span
                      className="font-mono font-black text-[10px] md:text-xs uppercase tracking-[0.35em] text-white/90 bg-black/60 border border-white/20 px-3 py-1 rounded-full backdrop-blur-sm"
                      style={{ boxShadow: `0 0 18px ${color}` }}
                    >
                      {p.playerName || `Player ${i + 1}`}
                    </span>
                  </motion.div>
                )}
              </motion.div>
            );
          })}

          {/* Overlay Grid/Line borders */}
          <svg
            className="absolute inset-0 w-full h-full z-[15] pointer-events-none"
            preserveAspectRatio="none"
            viewBox="0 0 100 100"
          >
            {players?.map((_, i) => {
              if (i === 0) return null;
              const slant = 15;
              const x = (i / N) * 100;
              return (
                <line
                  key={i}
                  x1={`${x + slant}`}
                  y1="0"
                  x2={`${x - slant}`}
                  y2="100"
                  stroke="rgba(0,0,0,0.8)"
                  strokeWidth="0.5"
                  vectorEffect="non-scaling-stroke"
                  className="drop-shadow-[0_0_10px_rgba(0,0,0,1)]"
                />
              );
            })}
          </svg>
        </div>
      </motion.div>

      {/* CHANNEL — cursed energy streams converge on the nucleus */}
      <AnimatePresence>
        {(phase === 'channel' || phase === 'implode') && (
          <motion.div
            key="nucleus"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] flex items-center justify-center"
            exit={{ opacity: 0 }}
          >
            {/* Core orb — surges outward on implode */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={
                phase === 'implode'
                  ? { scale: [1, 1.7, 10], opacity: [1, 1, 0] }
                  : { scale: 1, opacity: 1 }
              }
              transition={
                phase === 'implode'
                  ? { duration: 0.5, times: [0, 0.55, 1], ease: 'easeIn' }
                  : { type: 'spring', stiffness: 170, damping: 13 }
              }
              className="w-20 h-20 md:w-32 md:h-32 rounded-full bg-white"
              style={{
                boxShadow:
                  '0 0 60px 30px rgba(255,255,255,0.75), 0 0 160px 90px rgba(220,38,38,0.55)',
              }}
            />
            {/* Counter-rotating boundary rings */}
            <motion.div
              className="absolute w-44 h-44 md:w-60 md:h-60 rounded-full border-2 border-dashed border-white/70"
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ rotate: 360, scale: 1, opacity: phase === 'implode' ? 0 : 1 }}
              transition={{
                rotate: { duration: 1.4, repeat: Infinity, ease: 'linear' },
                scale: { type: 'spring', stiffness: 120, damping: 12 },
                opacity: { duration: 0.25 },
              }}
            />
            <motion.div
              className="absolute w-60 h-60 md:w-80 md:h-80 rounded-full border border-white/30"
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ rotate: -360, scale: 1, opacity: phase === 'implode' ? 0 : 1 }}
              transition={{
                rotate: { duration: 2.2, repeat: Infinity, ease: 'linear' },
                scale: { type: 'spring', stiffness: 120, damping: 12 },
                opacity: { duration: 0.25 },
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Energy streaks bleeding toward center during channel/implode */}
      {(phase === 'channel' || phase === 'implode') &&
        players?.map((_, i) => {
          const color = PLAYER_COLORS[i % PLAYER_COLORS.length];
          const fromLeft = i < N / 2;
          return (
            <motion.div
              key={`beam-${i}`}
              className="absolute top-1/2 h-[6px] w-[55vw] pointer-events-none z-[55]"
              style={{
                left: fromLeft ? '-5%' : '50%',
                background: fromLeft
                  ? `linear-gradient(90deg, transparent, ${color} 60%, #fff)`
                  : `linear-gradient(270deg, transparent, ${color} 60%, #fff)`,
                boxShadow: `0 0 30px ${color}`,
                transformOrigin: fromLeft ? 'right center' : 'left center',
                rotate: 0,
              }}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={
                phase === 'implode'
                  ? { scaleX: 1, opacity: [1, 0] }
                  : { scaleX: 1, opacity: [0, 0.9] }
              }
              transition={{
                scaleX: { duration: phase === 'implode' ? 0.25 : 0.45, ease: 'easeIn' },
                opacity: { duration: phase === 'implode' ? 0.3 : 0.5 },
              }}
            />
          );
        })}

      {/* FLASH — white burst, inversion, and black-flash lightning */}
      {phase === 'flash' && (
        <>
          <ImpactFlash duration={0.4} peak={1} />
          <motion.div
            className="absolute inset-0 bg-white mix-blend-difference z-[118] pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0, 1, 0] }}
            transition={{ duration: 0.7, times: [0, 0.15, 0.3, 0.45, 1] }}
          />
          <div className="absolute inset-0 z-[119] pointer-events-none">
            <LightningArcs count={7} delay={0.05} />
          </div>
          <ShockRing delay={0} color="rgba(255,255,255,0.9)" maxScale={10} />
          <ShockRing delay={0.1} color="rgba(220,38,38,0.8)" maxScale={12} />
          <SlashStreak angle={-24} delay={0.15} color="rgba(220,38,38,0.95)" thickness={5} />
          <SlashStreak angle={31} delay={0.22} thickness={4} />
        </>
      )}

      {/* Initial Flash */}
      <motion.div
        className="absolute inset-0 bg-white z-[120]"
        initial={{ opacity: 0 }}
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, ease: 'circOut' }}
      />

      {/* Hero Typography overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-[130]">
        <motion.div
          initial={{ opacity: 0, scale: 0.05, rotate: 5 }}
          animate={{
            opacity: phase === 'title' ? [0, 1, 1, 1] : [0, 1, 1, 0],
            scale: phase === 'title' ? [0.05, 1.15, 1, 1.05] : [0.05, 1.2, 1.1, 3],
            rotate: [5, -5, 0, 0],
          }}
          transition={{ duration: 3.4, times: [0, 0.08, 0.75, 1], ease: 'easeInOut' }}
          className="flex flex-col items-center"
        >
          {/* Kanji Block */}
          <div className="relative px-16 md:px-24 py-8 bg-black border-y-[10px] border-white transform skew-x-[15deg] shadow-[0_0_100px_rgba(255,255,255,0.6)] backdrop-blur-sm">
            {/* Echo layers */}
            <motion.span
              aria-hidden
              animate={{ x: [0, -14, 0], opacity: [0, 0.6, 0] }}
              transition={{ duration: 0.5, delay: 2.7, repeat: 1 }}
              className="absolute inset-0 flex items-center justify-center text-[5rem] md:text-[9rem] font-black font-display uppercase tracking-tighter italic -skew-x-[15deg] leading-none text-red-600 blur-[4px] select-none"
            >
              戦闘開始
            </motion.span>
            <span className="relative text-[5rem] md:text-[9rem] font-black font-display uppercase tracking-tighter italic block -skew-x-[15deg] leading-none text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-400 drop-shadow-[0_0_20px_rgba(255,255,255,1)]">
              戦闘開始
            </span>
          </div>

          {/* Subtitle Block */}
          <motion.div
            initial={{ opacity: 0, y: 50, scaleY: 0 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            transition={{ delay: 2.75, duration: 0.3 }}
            className="mt-8 flex flex-col items-center"
          >
            <div className="bg-white px-10 py-3 transform skew-x-[15deg] shadow-[0_0_60px_rgba(255,255,255,0.9)]">
              <span className="text-2xl md:text-5xl font-mono font-black text-black uppercase tracking-[0.3em] block -skew-x-[15deg]">
                CURSED CONVERGENCE
              </span>
            </div>

            {/* Player Count Diamonds — colored to match each pillar */}
            <div className="mt-10 flex gap-6 md:gap-10">
              {players?.map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, rotate: 0 }}
                  animate={{
                    scale: [0, 2.5, 1.5],
                    rotate: [0, 180, 225],
                    boxShadow: [
                      '0 0 0px #fff',
                      `0 0 50px ${PLAYER_COLORS[i % PLAYER_COLORS.length]}`,
                      `0 0 20px ${PLAYER_COLORS[i % PLAYER_COLORS.length]}`,
                    ],
                  }}
                  transition={{ delay: 2.9 + i * 0.1, duration: 0.5, ease: 'backOut' }}
                  className="w-5 h-5 md:w-8 md:h-8"
                  style={{
                    clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                    backgroundColor: PLAYER_COLORS[i % PLAYER_COLORS.length],
                  }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Embers drift during the title hold */}
      {phase === 'title' && <CursedEmbers count={14} maxDelay={0.8} />}

      {/* Heavy Vignette to focus center */}
      <div className="absolute inset-0 z-50 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_10%,rgba(0,0,0,0.95)_100%)] opacity-100 pointer-events-none"></div>

      {/* Cinematic Letterboxes */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-20 md:h-32 bg-black z-[150]"
        initial={{ y: '-100%' }}
        animate={{ y: 0 }}
        exit={{ y: '-100%' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-20 md:h-32 bg-black z-[150]"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
    </motion.div>
  );
}
