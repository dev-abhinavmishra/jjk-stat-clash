import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

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
    'blackout' | 'kanji_slam' | 'impact' | 'reverse_slam' | 'manifest' | 'fade'
  >('blackout');

  const phaseSwapRef = useRef(onPhaseSwap);
  const completeRef = useRef(onComplete);

  useEffect(() => {
    phaseSwapRef.current = onPhaseSwap;
    completeRef.current = onComplete;
  }, [onPhaseSwap, onComplete]);

  useEffect(() => {
    // Highly performant sequence using simple states
    const timeouts = [
      setTimeout(() => setPhase('kanji_slam'), 150),
      setTimeout(() => setPhase('impact'), 700),
      setTimeout(() => setPhase('reverse_slam'), 1400),
      setTimeout(() => {
        setPhase('manifest');
        phaseSwapRef.current(); // Background swaps underneath
      }, 1800),
      setTimeout(() => setPhase('fade'), 2800),
      setTimeout(() => completeRef.current(), 3200),
    ];

    return () => timeouts.forEach(clearTimeout);
  }, []);

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
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <div className="relative flex items-center justify-center w-full h-full overflow-hidden">
        {/* KANJI SLAM PHASE */}
        <AnimatePresence>
          {(phase === 'kanji_slam' || phase === 'impact') && (
            <motion.div
              layoutId="kanji-container"
              initial={{ scale: 3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{
                duration: phase === 'kanji_slam' ? 0.2 : 0.3,
                ease: phase === 'kanji_slam' ? 'easeIn' : 'backIn',
              }}
              className="absolute flex flex-col items-center justify-center -rotate-6"
            >
              <div className="text-[120px] md:text-[250px] font-black font-display leading-none text-white tracking-widest drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]">
                {topKanji}
              </div>

              {/* IMPACT PHASE ENGLISH TEXT */}
              <AnimatePresence>
                {phase === 'impact' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 1.5, x: 20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                    className="absolute bg-white text-black px-6 py-2 border-l-8 border-red-600 font-black font-display uppercase tracking-[0.5em] text-2xl md:text-5xl whitespace-nowrap shadow-2xl rotate-3"
                  >
                    {topEnglish}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MANIFEST PHASE */}
        <AnimatePresence>
          {phase === 'manifest' && (
            <motion.div
              initial={{ scale: 1.5, opacity: 0, rotateX: 90 }}
              animate={{ scale: 1, opacity: 1, rotateX: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: -50 }}
              transition={{ type: 'spring', damping: 20, stiffness: 100 }}
              className="absolute z-50 flex flex-col items-center justify-center text-center perspective-[1000px]"
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="h-1 bg-red-600 mb-4"
              />
              <div className="text-2xl md:text-4xl font-mono text-red-500 tracking-[0.8em] uppercase mb-2 font-bold drop-shadow-md">
                {bottomPhase}
              </div>
              <h1 className="text-5xl md:text-[100px] font-black font-display text-white tracking-[0.1em] uppercase leading-none drop-shadow-[0_0_20px_rgba(0,0,0,1)]">
                {bottomTitle}
              </h1>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="h-1 bg-red-600 mt-4"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* SCREEN SHAKE EFFECT */}
        {(phase === 'kanji_slam' || phase === 'manifest') && (
          <motion.div
            className="absolute inset-0 pointer-events-none ring-[20px] ring-inset ring-red-600 mix-blend-overlay opacity-50"
            animate={{ x: [-10, 10, -10, 10, 0], y: [-10, 10, -10, 10, 0] }}
            transition={{ duration: 0.3, repeat: 1 }}
          />
        )}
      </div>
    </div>
  );
}
