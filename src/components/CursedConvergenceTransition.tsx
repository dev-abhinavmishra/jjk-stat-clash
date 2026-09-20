import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { DraftSelection } from './PlayerCard';

function useStableRandom() {
  const ref = useRef<number[]>([]);
  if (ref.current.length === 0) {
    for (let i = 0; i < 50; i++) ref.current.push(Math.random());
  }
  return ref.current;
}

export function CursedConvergenceTransition({
  players,
  onPhaseSwap,
  onComplete,
}: {
  players?: DraftSelection[];
  onPhaseSwap: () => void;
  onComplete: () => void;
}) {
  const randoms = useStableRandom();
  let rngIndex = 0;
  const rng = () => randoms[rngIndex++ % randoms.length];

  const onPhaseSwapRef = useRef(onPhaseSwap);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onPhaseSwapRef.current = onPhaseSwap;
    onCompleteRef.current = onComplete;
  }, [onPhaseSwap, onComplete]);

  useEffect(() => {
    onPhaseSwapRef.current();
    const timer = setTimeout(() => onCompleteRef.current(), 4500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="fixed inset-0 z-[100] flex justify-center items-center bg-black overflow-hidden perspective-[1000px]"
    >
      {/* Master Shake Container */}
      <motion.div
        className="absolute inset-0 z-10"
        animate={{
          x: [0, -20, 20, -10, 10, -5, 5, 0],
          y: [0, 15, -15, 10, -10, 5, -5, 0],
        }}
        transition={{ duration: 0.8, delay: 0.8, ease: 'easeInOut' }}
      >
        {/* Dynamic Slanted Pillars using Clip-Path for perfect screen distribution */}
        <div className="absolute inset-0">
          {players?.map((p, i) => {
            const colors = [
              '#dc2626',
              '#2563eb',
              '#16a34a',
              '#9333ea',
              '#eab308',
              '#f97316',
              '#ec4899',
              '#06b6d4',
            ];
            const color = colors[i % colors.length];

            const N = players.length;
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
                initial={{ y: i % 2 === 0 ? '-100%' : '100%', filter: 'brightness(2)' }}
                animate={{ y: '0%', filter: 'brightness(1)' }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.1,
                  ease: [0.19, 1, 0.22, 1],
                }}
                className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.9)] overflow-hidden"
                style={{
                  backgroundColor: color,
                  clipPath: `polygon(${tl}% 0%, ${tr}% 0%, ${br}% 100%, ${bl}% 100%)`,
                  WebkitClipPath: `polygon(${tl}% 0%, ${tr}% 0%, ${br}% 100%, ${bl}% 100%)`,
                  zIndex: 10,
                  willChange: 'transform, filter',
                }}
              >
                {/* Internal Abstract Noise / Dark Mesh */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.15)_0%,rgba(0,0,0,0.9)_100%)] mix-blend-overlay pointer-events-none"></div>

                {/* Flowing energy texture with radial gradients */}
                <div className="absolute inset-0 opacity-50 pointer-events-none mix-blend-overlay">
                  <motion.div
                    className="absolute w-[150%] h-[150%] top-[-25%] left-[-25%] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.8)_0%,rgba(255,255,255,0)_60%)]"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.2, 0.6, 0.2],
                      x: ['-10%', '10%', '-10%'],
                      y: ['-10%', '10%', '-10%'],
                    }}
                    transition={{ duration: 3 + rng() * 2, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <motion.div
                    className="absolute w-2 md:w-3 h-[200%] bg-white transform -skew-x-[15deg] shadow-[0_0_20px_rgba(255,255,255,0.8)]"
                    style={{
                      left: '50%',
                      marginLeft: `${slant}%`,
                      willChange: 'opacity, transform',
                    }}
                    animate={{ y: ['0%', '-50%'], opacity: [0.1, 0.9, 0.1] }}
                    transition={{ duration: 0.3 + rng() * 0.2, repeat: Infinity, ease: 'linear' }}
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
                    {/* Inner spinning rings */}
                    <motion.div
                      className="absolute w-3/4 h-3/4 border-y-[4px] md:border-y-[8px] border-white rounded-full border-dashed flex items-center justify-center"
                      animate={{ rotate: -360 }}
                      transition={{ duration: 15 + i * 3, repeat: Infinity, ease: 'linear' }}
                    >
                      {/* Geometric Core */}
                      <div className="w-1/3 h-1/3 bg-[radial-gradient(circle_at_center,rgba(255,255,255,1)_0%,rgba(255,255,255,0)_70%)] animate-pulse" />
                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}

          {/* Overlay Grid/Line borders using SVG */}
          <svg
            className="absolute inset-0 w-full h-full z-[15] pointer-events-none"
            preserveAspectRatio="none"
            viewBox="0 0 100 100"
          >
            {players?.map((_, i) => {
              if (i === 0) return null;
              const N = players.length;
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

      {/* Initial Flash */}
      <motion.div
        className="absolute inset-0 bg-white z-[120]"
        initial={{ opacity: 0 }}
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, ease: 'circOut' }}
      />

      {/* Epic Central Collision Flash (The "Clash" moment) */}
      <motion.div
        className="absolute inset-0 bg-white z-[120]"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 0.4, delay: 0.8 }}
      />

      {/* Hero Typography overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-[130]">
        <motion.div
          initial={{ opacity: 0, scale: 0.05, rotate: 5 }}
          animate={{
            opacity: [0, 1, 1, 0],
            scale: [0.05, 1.2, 1.1, 3],
            rotate: [5, -5, 0, 10],
          }}
          transition={{ duration: 3.2, times: [0, 0.1, 0.8, 1], ease: 'easeInOut' }}
          className="flex flex-col items-center"
        >
          {/* Kanji Block */}
          <div className="px-16 md:px-24 py-8 bg-black border-y-[10px] border-white transform skew-x-[15deg] shadow-[0_0_100px_rgba(255,255,255,0.6)] backdrop-blur-sm">
            <span className="text-[5rem] md:text-[9rem] font-black font-display uppercase tracking-tighter italic block -skew-x-[15deg] leading-none text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-400 drop-shadow-[0_0_20px_rgba(255,255,255,1)]">
              戦闘開始
            </span>
          </div>

          {/* Subtitle Block */}
          <motion.div
            initial={{ opacity: 0, y: 50, scaleY: 0 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            transition={{ delay: 0.9, duration: 0.3 }}
            className="mt-8 flex flex-col items-center"
          >
            <div className="bg-white px-10 py-3 transform skew-x-[15deg] shadow-[0_0_60px_rgba(255,255,255,0.9)]">
              <span className="text-2xl md:text-5xl font-mono font-black text-black uppercase tracking-[0.3em] block -skew-x-[15deg]">
                CURSED CONVERGENCE
              </span>
            </div>

            {/* Player Count Diamonds */}
            <div className="mt-10 flex gap-6 md:gap-10">
              {players?.map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, rotate: 0 }}
                  animate={{
                    scale: [0, 2.5, 1.5],
                    rotate: [0, 180, 225],
                    backgroundColor: ['#000', '#fff', '#fff'],
                    boxShadow: ['0 0 0px #fff', '0 0 50px #fff', '0 0 20px #fff'],
                  }}
                  transition={{ delay: 1.1 + i * 0.1, duration: 0.5, ease: 'backOut' }}
                  className="w-5 h-5 md:w-8 md:h-8"
                  style={{
                    clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                  }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Heavy Vignette to focus center */}
      <div className="absolute inset-0 z-50 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_10%,rgba(0,0,0,0.95)_100%)] opacity-100 pointer-events-none"></div>

      {/* Cinematic Letterboxes */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-20 md:h-32 bg-black z-[150]"
        initial={{ y: '-100%' }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-20 md:h-32 bg-black z-[150]"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
    </motion.div>
  );
}
