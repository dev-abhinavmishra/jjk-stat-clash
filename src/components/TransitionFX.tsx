import React, { useCallback, useRef } from 'react';
import { motion } from 'motion/react';

/**
 * Shared cinematic FX atoms used by the app's transition overlays.
 * Everything is pointer-events-none and absolute-positioned — drop them
 * inside a relatively-positioned container.
 */

// Deterministic per-mount RNG: StrictMode double-render keeps the same
// particle layout instead of reshuffling between the two passes.
export function useStableRandom(count: number = 64): () => number {
  const ref = useRef<number[]>([]);
  if (ref.current.length === 0) {
    for (let i = 0; i < count; i++) ref.current.push(Math.random());
  }
  const idx = useRef(0);
  return useCallback(() => ref.current[idx.current++ % ref.current.length], []);
}

/** Floating cursed-energy embers rising from the bottom edge. */
export function CursedEmbers({
  count = 18,
  color = 'rgba(239,68,68,0.9)',
  maxDelay = 1.2,
}: {
  count?: number;
  color?: string;
  maxDelay?: number;
}) {
  const rng = useStableRandom(count * 5);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: count }).map((_, i) => {
        const size = 2 + rng() * 4;
        const x = rng() * 100;
        const dur = 1.8 + rng() * 2.2;
        const delay = rng() * maxDelay;
        const drift = (rng() - 0.5) * 140;
        return (
          <motion.span
            key={i}
            className="absolute rounded-full"
            style={{
              width: size,
              height: size,
              left: `${x}%`,
              bottom: '-2%',
              background: color,
              boxShadow: `0 0 ${size * 4}px ${color}`,
            }}
            initial={{ y: 0, x: 0, opacity: 0 }}
            animate={{ y: '-105vh', x: drift, opacity: [0, 1, 0.9, 0] }}
            transition={{
              duration: dur,
              delay,
              repeat: Infinity,
              repeatDelay: rng() * 1.4,
              ease: 'easeIn',
            }}
          />
        );
      })}
    </div>
  );
}

/** Expanding concentric shockwave ring(s) from center. */
export function ShockRing({
  delay = 0,
  color = 'rgba(239,68,68,0.8)',
  maxScale = 8,
}: {
  delay?: number;
  color?: string;
  maxScale?: number;
}) {
  return (
    <>
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-2 pointer-events-none"
        style={{ borderColor: color, boxShadow: `0 0 40px ${color}, inset 0 0 40px ${color}` }}
        initial={{ scale: 0, opacity: 0.9 }}
        animate={{ scale: maxScale, opacity: 0 }}
        transition={{ duration: 0.7, delay, ease: 'easeOut' }}
      />
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border pointer-events-none"
        style={{ borderColor: color }}
        initial={{ scale: 0, opacity: 0.8 }}
        animate={{ scale: maxScale * 1.4, opacity: 0 }}
        transition={{ duration: 0.55, delay: delay + 0.08, ease: 'circOut' }}
      />
    </>
  );
}

/** A full-width glowing slash line that sweeps across once and fades. */
export function SlashStreak({
  delay = 0,
  angle = -18,
  color = 'rgba(255,255,255,0.95)',
  duration = 0.4,
  thickness = 3,
}: {
  delay?: number;
  angle?: number;
  color?: string;
  duration?: number;
  thickness?: number;
}) {
  return (
    <motion.div
      className="absolute left-1/2 top-1/2 w-[160vmax] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      style={{
        height: thickness,
        background: `linear-gradient(90deg, transparent, ${color} 35%, ${color} 65%, transparent)`,
        boxShadow: `0 0 30px ${color}, 0 0 80px ${color}`,
        rotate: angle,
      }}
      initial={{ scaleX: 0, opacity: 0 }}
      animate={{ scaleX: [0, 1, 1], opacity: [0, 1, 0] }}
      transition={{ duration, delay, times: [0, 0.35, 1], ease: 'circInOut' }}
    />
  );
}

/** Jagged lightning bolts radiating from center, drawn then dissolved. */
export function LightningArcs({
  count = 5,
  color = '#ef4444',
  delay = 0,
}: {
  count?: number;
  color?: string;
  delay?: number;
}) {
  const rng = useStableRandom(count * 10);
  const bolts = Array.from({ length: count }).map((_, i) => {
    const angle = (i / count) * Math.PI * 2 + (rng() - 0.5) * 0.8;
    const segs = 4 + Math.floor(rng() * 3);
    let d = 'M 0 0';
    let dist = 40;
    for (let s = 0; s < segs; s++) {
      dist += 140 + rng() * 200;
      const jitter = (rng() - 0.5) * 260;
      const x = Math.cos(angle) * dist + Math.cos(angle + Math.PI / 2) * jitter;
      const y = Math.sin(angle) * dist + Math.sin(angle + Math.PI / 2) * jitter;
      d += ` L ${x.toFixed(0)} ${y.toFixed(0)}`;
    }
    return d;
  });
  return (
    <svg
      className="absolute left-1/2 top-1/2 w-0 h-0 overflow-visible pointer-events-none"
      viewBox="-1000 -1000 2000 2000"
    >
      {bolts.map((d, i) => (
        <motion.path
          key={i}
          d={d}
          fill="none"
          stroke={i % 3 === 0 ? '#ffffff' : color}
          strokeWidth={i % 3 === 0 ? 2.5 : 5}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: [0, 1, 1], opacity: [0, 1, 0] }}
          transition={{ duration: 0.55, delay: delay + i * 0.05, times: [0, 0.3, 1] }}
          style={{ filter: `drop-shadow(0 0 10px ${color})` }}
        />
      ))}
    </svg>
  );
}

/** Counter-rotating dashed barrier rings — the classic domain-boundary seal. */
export function BarrierRings({
  size = 220,
  color = 'rgba(255,255,255,0.5)',
  spinDuration = 14,
}: {
  size?: number;
  color?: string;
  spinDuration?: number;
}) {
  return (
    <div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      style={{ width: size, height: size }}
    >
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-dashed"
        style={{ borderColor: color }}
        animate={{ rotate: 360 }}
        transition={{ duration: spinDuration, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute rounded-full border"
        style={{ borderColor: color, inset: size * 0.12 }}
        animate={{ rotate: -360 }}
        transition={{ duration: spinDuration * 0.7, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          inset: size * 0.28,
          border: `1px solid ${color}`,
          boxShadow: `0 0 ${size * 0.15}px ${color}`,
        }}
        animate={{ rotate: 360, scale: [1, 1.06, 1] }}
        transition={{
          rotate: { duration: spinDuration * 1.6, repeat: Infinity, ease: 'linear' },
          scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
        }}
      />
    </div>
  );
}

/** Full-screen single-shot impact flash. */
export function ImpactFlash({
  delay = 0,
  duration = 0.3,
  color = '#ffffff',
  peak = 0.9,
}: {
  delay?: number;
  duration?: number;
  color?: string;
  peak?: number;
}) {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      style={{ background: color }}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, peak, 0] }}
      transition={{ duration, delay, times: [0, 0.15, 1], ease: 'easeOut' }}
    />
  );
}

/** Rotating conic halo — use behind a focal element (winner panel, titles). */
export function HaloRays({ color = 'rgba(234,179,8,0.12)' }: { color?: string }) {
  return (
    <motion.div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[160%] aspect-square pointer-events-none"
      style={{
        background: `repeating-conic-gradient(${color} 0deg 8deg, transparent 8deg 24deg)`,
        maskImage: 'radial-gradient(circle, black 0%, transparent 65%)',
        WebkitMaskImage: 'radial-gradient(circle, black 0%, transparent 65%)',
      }}
      animate={{ rotate: 360 }}
      transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
    />
  );
}
