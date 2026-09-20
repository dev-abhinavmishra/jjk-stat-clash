import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CursedEmbers, ShockRing, SlashStreak } from './TransitionFX';

interface PhaseTransitionProps {
  onPhaseSwap: () => void;
  onComplete: () => void;
  topKanji: string;
  topEnglish: string;
  bottomPhase: string;
  bottomTitle: string;
}

export function PhaseTransition({
  onPhaseSwap,
  onComplete,
  topKanji,
  topEnglish,
  bottomPhase,
  bottomTitle,
}: PhaseTransitionProps) {
  const [phase, setPhase] = useState<
    'breach' | 'kanji_slam' | 'impact' | 'reverse_slam' | 'manifest' | 'fade'
  >('breach');

  const phaseSwapRef = useRef(onPhaseSwap);
  const completeRef = useRef(onComplete);

  useEffect(() => {
    phaseSwapRef.current = onPhaseSwap;
    completeRef.current = onComplete;
  }, [onPhaseSwap, onComplete]);

  useEffect(() => {
    const timeouts = [
      setTimeout(() => setPhase('kanji_slam'), 180),
      setTimeout(() => setPhase('impact'), 820),
      setTimeout(() => setPhase('reverse_slam'), 1520),
      setTimeout(() => {
        setPhase('manifest');
        phaseSwapRef.current(); // Background swaps underneath
      }, 1960),
      setTimeout(() => setPhase('fade'), 3050),
      setTimeout(() => completeRef.current(), 3500),
    ];

    return () => timeouts.forEach(clearTimeout);
  }, []);

  const shaking = phase === 'kanji_slam' || phase === 'impact';

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center transition-colors duration-300 ${
        phase === 'fade' || phase === 'manifest' ? 'bg-transparent' : 'bg-black'
      }`}
    >
      {/* Background overlay for manifest phase so we can see text clearly before fade */}
      <AnimatePresence>
        {phase === 'manifest' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 bg-black/85 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Master shake layer — everything inside rattles on the slam */}
      <motion.div
        className="relative flex items-center justify-center w-full h-full overflow-hidden"
        animate={
          shaking ? { x: [0, -16, 14, -9, 7, -3, 0], y: [0, 9, -9, 12, -8, 3, 0] } : { x: 0, y: 0 }
        }
        transition={{ duration: 0.4 }}
      >
        {/* BREACH — a red seam scans the screen before the slam */}
        <AnimatePresence>
          {phase === 'breach' && (
            <motion.div
              key="breach"
              className="absolute inset-0"
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
            >
              <motion.div
                className="absolute left-0 right-0 h-[3px] bg-red-600 shadow-[0_0_40px_rgba(220,38,38,0.9)]"
                initial={{ top: '-4px', opacity: 0 }}
                animate={{ top: '100%', opacity: [0, 1, 1, 0] }}
                transition={{ duration: 0.18, ease: 'easeIn' }}
              />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(127,29,29,0.25)_60%,rgba(0,0,0,0.95)_100%)]" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* KANJI SLAM — chromatic ghosts converge into the glyph */}
        <AnimatePresence>
          {(phase === 'kanji_slam' || phase === 'impact') && (
            <motion.div
              key="kanji-container"
              initial={{ scale: 3.5, opacity: 0, filter: 'blur(24px)' }}
              animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
              exit={{ scale: 0.4, opacity: 0, rotate: 10, filter: 'blur(14px)' }}
              transition={{
                duration: phase === 'kanji_slam' ? 0.28 : 0.35,
                ease: phase === 'kanji_slam' ? [0.16, 1, 0.3, 1] : 'backIn',
              }}
              className="absolute flex flex-col items-center justify-center -rotate-6"
            >
              {/* Chromatic aberration ghosts */}
              <motion.span
                aria-hidden
                initial={{ x: -60, opacity: 0.8 }}
                animate={{ x: -4, opacity: 0.5 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="absolute text-[120px] md:text-[250px] font-black font-display leading-none text-red-600 tracking-widest blur-[3px] mix-blend-screen select-none"
              >
                {topKanji}
              </motion.span>
              <motion.span
                aria-hidden
                initial={{ x: 60, opacity: 0.8 }}
                animate={{ x: 4, opacity: 0.4 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="absolute text-[120px] md:text-[250px] font-black font-display leading-none text-sky-400 tracking-widest blur-[3px] mix-blend-screen select-none"
              >
                {topKanji}
              </motion.span>

              <div className="relative text-[120px] md:text-[250px] font-black font-display leading-none text-white tracking-widest drop-shadow-[0_0_30px_rgba(220,38,38,0.9)]">
                {topKanji}
              </div>

              {/* IMPACT — English stamp + white frame flash */}
              <AnimatePresence>
                {phase === 'impact' && (
                  <motion.div
                    key="stamp"
                    initial={{ opacity: 0, scale: 1.6, x: 24 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    transition={{ type: 'spring', damping: 12, stiffness: 220 }}
                    className="absolute bg-white text-black px-6 py-2 border-l-8 border-red-600 font-black font-display uppercase tracking-[0.5em] text-2xl md:text-5xl whitespace-nowrap shadow-[0_0_60px_rgba(255,255,255,0.4)] rotate-3"
                  >
                    {topEnglish}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* IMPACT FX — flash, slash streaks, shock rings, ember burst */}
        {phase === 'impact' && (
          <>
            <motion.div
              className="absolute inset-0 bg-white z-20 pointer-events-none"
              initial={{ opacity: 0.85 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            />
            <SlashStreak angle={-18} delay={0.05} />
            <SlashStreak angle={16} delay={0.14} color="rgba(220,38,38,0.9)" thickness={4} />
            <ShockRing delay={0} />
            <ShockRing delay={0.12} color="rgba(255,255,255,0.5)" maxScale={10} />
          </>
        )}

        {/* REVERSE SLAM — a diagonal slash wipe cuts the kanji off-screen */}
        <AnimatePresence>
          {phase === 'reverse_slam' && (
            <motion.div key="slashwipe" className="absolute inset-0 z-30 pointer-events-none">
              <motion.div
                className="absolute top-[-20%] bottom-[-20%] w-[30%]"
                style={{
                  background:
                    'linear-gradient(90deg, transparent, rgba(255,255,255,0.95) 40%, rgba(220,38,38,0.95) 60%, transparent)',
                  transform: 'skewX(-14deg)',
                  filter: 'blur(1px)',
                }}
                initial={{ left: '-40%' }}
                animate={{ left: '115%' }}
                transition={{ duration: 0.42, ease: 'easeIn' }}
              />
              {/* Trailing afterimage */}
              <motion.div
                className="absolute top-[-20%] bottom-[-20%] w-[55%]"
                style={{
                  background:
                    'linear-gradient(90deg, transparent, rgba(220,38,38,0.25) 60%, transparent)',
                  transform: 'skewX(-14deg)',
                }}
                initial={{ left: '-70%' }}
                animate={{ left: '110%' }}
                transition={{ duration: 0.5, ease: 'easeIn' }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* MANIFEST — phase title assembles letter by letter over a rotating seal */}
        <AnimatePresence>
          {phase === 'manifest' && (
            <motion.div
              key="manifest"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -40, filter: 'blur(8px)' }}
              transition={{ duration: 0.3 }}
              className="absolute z-50 flex flex-col items-center justify-center text-center w-full"
            >
              {/* Rotating seal watermark behind the title */}
              <motion.div
                aria-hidden
                className="absolute font-black font-display text-red-600/[0.07] select-none leading-none"
                style={{ fontSize: 'min(70vw, 520px)' }}
                initial={{ scale: 0.8, rotate: -8 }}
                animate={{ scale: 1.05, rotate: 4 }}
                transition={{ duration: 1.1, ease: 'easeOut' }}
              >
                封
              </motion.div>

              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '60%' }}
                transition={{ duration: 0.35, delay: 0.1, ease: 'easeOut' }}
                className="h-px bg-gradient-to-r from-transparent via-red-600 to-transparent mb-5 shadow-[0_0_12px_rgba(220,38,38,0.8)]"
              />
              <motion.div
                initial={{ opacity: 0, letterSpacing: '1.2em' }}
                animate={{ opacity: 1, letterSpacing: '0.8em' }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-2xl md:text-4xl font-mono text-red-500 uppercase mb-3 font-bold drop-shadow-[0_0_10px_rgba(220,38,38,0.6)]"
              >
                {bottomPhase}
              </motion.div>
              <h1 className="text-5xl md:text-[100px] font-black font-display text-white tracking-[0.1em] uppercase leading-none drop-shadow-[0_0_20px_rgba(0,0,0,1)]">
                {bottomTitle.split('').map((ch, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 34, rotateX: -90 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{
                      delay: 0.15 + i * 0.045,
                      type: 'spring',
                      damping: 14,
                      stiffness: 180,
                    }}
                    className="inline-block"
                  >
                    {ch === ' ' ? ' ' : ch}
                  </motion.span>
                ))}
              </h1>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '60%' }}
                transition={{ duration: 0.35, delay: 0.25, ease: 'easeOut' }}
                className="h-px bg-gradient-to-r from-transparent via-red-600 to-transparent mt-5 shadow-[0_0_12px_rgba(220,38,38,0.8)]"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Embers drift while the title holds */}
        {(phase === 'manifest' || phase === 'fade') && <CursedEmbers count={16} />}

        {/* Inset red vignette pulse on the slam */}
        {shaking && (
          <motion.div
            className="absolute inset-0 pointer-events-none ring-[24px] ring-inset ring-red-600 mix-blend-overlay"
            initial={{ opacity: 0.7 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
        )}
      </motion.div>
    </div>
  );
}
