import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Terminal, Zap, Shield, Workflow, Eye, Calendar } from 'lucide-react';

const changelogData = [
  {
    version: 'v1.6.0',
    date: 'September 20, 2026',
    title: 'Post-Clash Analysis Protocol',
    description:
      'Match intelligence upgrade — every clash now concludes with a full analytical debrief and sorcerer grade evaluations.',
    items: [
      'Added Post-Clash Analysis report displayed after every finished clash across all game modes',
      'Introduced Sorcerer Grade evaluations (Special Grade through Grade 4) based on final score performance',
      'Added per-player evaluation cards tracking score, stat rounds won, Black Flash count, and MVP pick',
      'Added match highlights: Biggest Blowout, Closest Call, and total Black Flash tally',
      'Added round-by-round ledger showing the winner and margin of every stat round',
      'New achievement: Overwhelming Force — win 10+ stat rounds in a single clash',
      'New achievement: Photo Finish — win a clash by a margin of 25 points or fewer',
      'New achievement: Black Flash Adept — land 2+ Black Flashes on your own build',
      'Achievement engine now tracks per-player Black Flashes, stat round wins, and victory margin',
      'Fixed Perfect Sweep achievement triggering on any first-match win — now requires zero lost stat rounds',
      'Fixed stale build version labels and unified them under a shared APP_VERSION constant',
      'Rebuilt the Ban Phase as a cinematic Sealing Protocol: per-player color-coded cards with live seal progress, inline player renaming, a global seal registry with entity grades, and a dynamic seal counter',
      'Ban phase header now respects the configured ban count instead of always saying "ban 2 entities"',
      "Bot mode ban phase now reveals the bot's sealed entities instead of hiding them",
      'Fixed the Cursed Convergence clash animation being skipped entirely in bot mode — the overlay unmounted the instant the phase swapped',
      'Fixed clash and phase transitions restarting (and re-firing their completion callbacks) whenever the parent re-rendered — in multiplayer this could delay or re-send the compare signal',
      'Fixed transition overlays letting clicks pass through to the page beneath mid-animation',
      'Clash overlay now fades out instead of snapping off at the end',
      'Fixed draft lock-outs: Binding Vow is no longer required to finish a draft, and a player with no legal picks left (empty pools or exhausted rolls) no longer stalls the clash',
      'Fixed bot gamble turns hanging — the bot now skips stats with empty roll pools instead of retrying forever, and dead turns auto-skip for both players',
      'Fixed gamble rolls in vs-bot mode ignoring prerequisites — rolled entities are no longer silently discarded mid-turn',
      'Added an End Turn button to Cursed Lottery so a player with nothing to roll is never trapped in their turn',
      'Fixed bot turns starving out mid-draft — a StrictMode double-invoked timer fired the auto-pick twice per human expiry, so the bot never held a turn',
      'Turn countdown now runs during bot turns too, so any stuck turn auto-resolves instead of hanging the draft',
      'Updated build version display to v1.6.0',
    ],
  },
  {
    version: 'v1.5.0',
    date: 'May 27, 2026',
    title: 'Stability & Progression Protocol',
    description:
      'Critical bug fixes, quality-of-life improvements, and introduction of achievement and stats systems.',
    items: [
      'Fixed feedback button visibility - now appears on /play start screen and game pages',
      'Fixed duplicate phase transition overlays causing visual conflicts during phase changes',
      'Fixed leaderboard player ID persistence - players now accumulate wins across matches using persistent UUID',
      'Removed debug console logs from production build',
      'Migrated Firebase configuration to environment variables for security',
      'Added Firestore composite index for leaderboard queries',
      'Replaced hardcoded PartyKit URL with environment variable support',
      'Wrapped all pages in ErrorBoundary for graceful crash recovery',
      'Added optional turn timer with auto-fill for Local and Bot modes',
      'Added confirmation dialogs for Play Again and delete saved draft actions',
      'Responsive grid layout now adapts columns based on player count (2-8 players)',
      'Introduced Custom Rules panel with configurable ban count (1-3) and timer duration',
      'Added Achievements system with 10 unlockable challenges and toast notifications',
      'Added Player Stats dashboard tracking wins, win rate, and match history',
      'Enhanced Hard bot AI with aggressive synergy pursuit, smarter hate-drafting, and zero randomness in decision making',
    ],
  },
  {
    version: 'v1.4.0',
    date: 'May 25, 2026',
    title: 'Game Navigation & Tutorial Overhaul',
    description:
      'Complete restructure of game UI with dedicated navbar/footer and simplified tutorial system.',
    items: [
      'Added GameNavbar component with fixed bottom navigation for all game screens',
      'Created simplified HowToPlayTutorial component separate from System Archives',
      'How to Play now teaches basic game flow (Ban, Draft, Clash phases) with beginner tips',
      'System Archives remains as detailed database for advanced players',
      'Added Feedback button to GameNavbar for balance suggestions',
      'Added System Archives button to GameNavbar for character database access',
      'Removed floating buttons from game screens - all navigation now in navbar',
      'GameNavbar only appears during gameplay phases (not on setup screens)',
    ],
  },
  {
    version: 'v1.3.2',
    date: 'May 25, 2026',
    title: 'Bug Fixes & UX Improvements',
    description: 'Fixed critical bugs and enhanced help documentation for better user onboarding.',
    items: [
      "Fixed deprecated 'Sorcery Phase' transition text to 'Draft Phase' in LocalDraft and BotDraft",
      "Added 'How to Play' button to header during gameplay in LocalDraft and BotDraft modes",
      "Made 'JJK DRAFT' title clickable in LocalDraft to navigate to /play",
      'Expanded HelpPage content with comprehensive game overview, stat explanations, and winning strategies',
      'Added detailed sections on Domain Clashes, Black Flash, Binding Vows, and Synergies',
      'Added step-by-step game flow explanation and beginner tips',
    ],
  },
  {
    version: 'v1.3.1',
    date: 'May 25, 2026',
    title: 'Draft System & Mobile Optimization',
    description:
      'Enhanced save/load draft functionality and improved mobile responsiveness across the application.',
    items: [
      "Fixed save draft to properly save all players' stats and selections (not just player 1)",
      'Added load full game state support to restore complete multi-player drafts',
      'Moved How to Play button from floating overlay to home page footer for better accessibility',
      "Made 'JJK STAT CLASH' title clickable to navigate directly to game",
      "Removed 'Active Turn' indicator from local and bot modes (online only)",
      'Improved mobile responsiveness for Start Playing button and feature cards on home page',
      'Optimized PlayerCard and Comparison components for better mobile display',
    ],
  },
  {
    version: 'v1.3.0',
    date: 'May 24, 2026',
    title: 'Competitive Expansion & User Experience',
    description:
      'Introduction of global competitive features, social sharing, and comprehensive UX improvements.',
    items: [
      'Added global leaderboard system with win tracking for multiplayer matches',
      'Implemented social share functionality to broadcast match victories',
      'Added interactive tutorial overlay for new player onboarding',
      'Introduced Play Again button for quick match restarts',
      'Fixed feedback button placement to show only on game pages',
      'Fixed auto-pick validation with updated entity ID database',
      'Improved SEO with comprehensive meta tags, JSON-LD, and sitemap generation',
      'Added leaderboard link to home page footer',
    ],
  },
  {
    version: 'v1.2.4',
    date: 'May 2, 2026',
    title: 'Protocol Stabilization',
    description:
      'Final refinement of the intelligence engine and stabilization of the global cursed network.',
    items: [
      'Optimized Hard AI with scarcity scoring and strategic hate-drafting logic',
      "Implemented selection permanence with visual 'Locked' status indicators",
      'Centralized System Protocol database for real-time synergy verification',
      'Refined lobby synchronization and server-side state persistence for multiplayer',
    ],
  },
  {
    version: 'v1.2.0',
    date: 'April 25, 2026',
    title: 'Convergence & Intelligence',
    description: 'Introduction of global connectivity and advanced simulation protocols.',
    items: [
      'Deployed Multiplayer Alpha infrastructure utilizing PartyKit synchronization',
      'Overhauled Bot AI with tiered difficulty levels and adaptive decision making',
      'Added Cursed Convergence full-screen transition animations for match phases',
      'Implemented randomized turn timing to simulate human interaction in bot matches',
    ],
  },
  {
    version: 'v1.1.0',
    date: 'April 18, 2026',
    title: 'Cursed Expansion',
    description:
      'Expansion of character depth and the introduction of advanced combat constraints.',
    items: [
      'Implemented Rarity & Grade system with power scaling for Mythic and Legendary tiers',
      'Introduced Binding Vows as a high-risk strategy layer to boost specific stats',
      'Added Domain Expansion efficiency bonuses based on character IQ and Cursed Energy',
      'Integrated dynamic background video overlays and atmospheric cursed energy particles',
    ],
  },
  {
    version: 'v1.0.0',
    date: 'April 11, 2026',
    title: 'Initialization Protocol',
    description: 'The core foundation of the JJK Stat Clash engine and character database.',
    items: [
      'Architected the primary 12-stat drafting engine and combat calculation logic',
      'Initialized character database with 50+ unique sorcerers and cursed spirits',
      'Implemented local drafting mode with automated synergy detection',
      'Established the visual design system and responsive grid framework',
    ],
  },
];

interface ChangelogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangelogModal: React.FC<ChangelogProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl bg-[#0a0a0a] border border-zinc-800 rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-[#050505] shrink-0">
              <div className="flex items-center gap-4">
                <Terminal className="text-red-600" size={24} />
                <div>
                  <h2 className="text-xl font-black font-display text-white uppercase tracking-tighter">
                    System Changelog
                  </h2>
                  <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-[0.3em]">
                    Operational History // Build Archive
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-zinc-500 hover:text-white transition-colors p-2 hover:bg-zinc-900 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              {changelogData.map((update, idx) => (
                <div
                  key={idx}
                  className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-md flex flex-col gap-5 hover:border-zinc-700 transition-colors relative group"
                >
                  {idx === 0 && (
                    <div className="absolute -top-3 -right-3 bg-red-600 text-white text-[9px] font-black font-mono uppercase tracking-widest px-3 py-1 rounded-full shadow-[0_0_15px_rgba(220,38,38,0.5)] animate-pulse">
                      NEW
                    </div>
                  )}
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar size={12} className="text-red-600" />
                        <span className="text-[10px] font-mono font-bold text-red-600 uppercase tracking-[0.2em]">
                          {update.date}
                        </span>
                        <span className="text-[10px] font-mono font-black text-zinc-600 uppercase tracking-widest ml-2 px-2 py-0.5 border border-zinc-800 rounded bg-black">
                          {update.version}
                        </span>
                      </div>
                      <h3 className="text-lg font-black font-display text-white uppercase tracking-tight group-hover:text-red-500 transition-colors">
                        {update.title}
                      </h3>
                      <p className="text-[11px] text-zinc-500 font-mono italic uppercase tracking-wider leading-relaxed">
                        {update.description}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 border-t border-zinc-800/50 pt-4">
                    {update.items.map((item, i) => (
                      <div
                        key={i}
                        className="flex gap-3 text-[10px] font-mono text-zinc-400 uppercase tracking-widest leading-relaxed"
                      >
                        <span className="text-red-900 font-black">/</span>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 bg-[#050505] border-t border-zinc-800 text-center shrink-0">
              <p className="text-[9px] text-zinc-600 font-mono uppercase tracking-[0.4em]">
                Historical Data Synchronized
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
