import { motion } from 'motion/react';

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({
  message = 'Loading...',
  fullScreen = false,
}: LoadingSpinnerProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-6 p-8">
      <div className="relative w-20 h-20 flex items-center justify-center">
        {/* Outer dashed seal ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full border-2 border-dashed border-red-500/40"
        />
        {/* Inner arc spinner */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-2 rounded-full border-2 border-transparent border-t-red-500 border-r-red-500/60 shadow-[0_0_15px_rgba(220,38,38,0.4)]"
        />
        {/* Core kanji */}
        <motion.span
          animate={{ opacity: [0.4, 1, 0.4], scale: [0.95, 1.05, 0.95] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          className="font-black font-display text-red-500 text-xl select-none drop-shadow-[0_0_10px_rgba(220,38,38,0.8)]"
        >
          呪
        </motion.span>
      </div>
      <p className="text-zinc-500 text-sm font-mono uppercase tracking-widest">
        {message}
        <motion.span
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          {'  '}
        </motion.span>
      </p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">{content}</div>
    );
  }

  return content;
}
