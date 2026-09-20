import React from 'react';
import {
  Github,
  Twitter,
  MessageSquare,
  FileText,
  HelpCircle,
  BookOpen,
  BarChart3,
  Trophy,
} from 'lucide-react';
import { motion } from 'motion/react';
import { APP_VERSION } from '../utils/gameSettings';

interface GameFooterProps {
  onChangelog: () => void;
  onHowToPlay: () => void;
  onFeedback: () => void;
  onArchives: () => void;
  onStats?: () => void;
  onAchievements?: () => void;
}

export const GameFooter: React.FC<GameFooterProps> = ({
  onChangelog,
  onHowToPlay,
  onFeedback,
  onArchives,
  onStats,
  onAchievements,
}) => {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2.6, duration: 0.6 }}
      className="w-full border-t border-zinc-900/80 bg-[#050505]/60 backdrop-blur-sm relative z-30"
    >
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-col items-center md:items-start">
          <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-[0.3em]">
            Build: Production {APP_VERSION}
          </p>
          <p className="text-[10px] text-zinc-600 font-mono uppercase mt-0.5">
            © 2026 Jujutsu Intelligence Systems
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={onHowToPlay}
            className="flex items-center gap-1.5 text-zinc-400 hover:text-blue-500 transition-all font-mono text-[10px] uppercase tracking-widest bg-zinc-900/50 px-3 py-1.5 border border-zinc-800 rounded-sm"
          >
            <HelpCircle size={11} />
            How to Play
          </button>
          <button
            onClick={onFeedback}
            className="flex items-center gap-1.5 text-zinc-400 hover:text-green-500 transition-all font-mono text-[10px] uppercase tracking-widest bg-zinc-900/50 px-3 py-1.5 border border-zinc-800 rounded-sm"
          >
            <MessageSquare size={11} />
            Feedback
          </button>
          <button
            onClick={onArchives}
            className="flex items-center gap-1.5 text-zinc-400 hover:text-yellow-500 transition-all font-mono text-[10px] uppercase tracking-widest bg-zinc-900/50 px-3 py-1.5 border border-zinc-800 rounded-sm"
          >
            <BookOpen size={11} />
            Archives
          </button>
          {onStats && (
            <button
              onClick={onStats}
              className="flex items-center gap-1.5 text-zinc-400 hover:text-blue-400 transition-all font-mono text-[10px] uppercase tracking-widest bg-zinc-900/50 px-3 py-1.5 border border-zinc-800 rounded-sm"
            >
              <BarChart3 size={11} />
              Stats
            </button>
          )}
          {onAchievements && (
            <button
              onClick={onAchievements}
              className="flex items-center gap-1.5 text-zinc-400 hover:text-yellow-400 transition-all font-mono text-[10px] uppercase tracking-widest bg-zinc-900/50 px-3 py-1.5 border border-zinc-800 rounded-sm"
            >
              <Trophy size={11} />
              Achievements
            </button>
          )}
          <button
            onClick={onChangelog}
            className="flex items-center gap-1.5 text-zinc-400 hover:text-red-500 transition-all font-mono text-[10px] uppercase tracking-widest bg-zinc-900/50 px-3 py-1.5 border border-zinc-800 rounded-sm"
          >
            <FileText size={11} />
            Changelog
          </button>
          <div className="flex items-center gap-2 border-l border-zinc-800 pl-3">
            <Twitter
              size={13}
              className="text-zinc-500 hover:text-white cursor-pointer transition-colors"
            />
            <Github
              size={13}
              className="text-zinc-500 hover:text-white cursor-pointer transition-colors"
            />
            <MessageSquare
              size={13}
              className="text-zinc-500 hover:text-white cursor-pointer transition-colors"
            />
          </div>
        </div>
      </div>
    </motion.footer>
  );
};
