import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, TrendingUp, Calendar, ArrowLeft, Crown, Medal, Award } from 'lucide-react';
import { getTopPlayers, LeaderboardEntry } from '../utils/leaderboard';

export default function Leaderboard() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await getTopPlayers(100);
      setEntries(data);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="text-yellow-500" size={24} />;
    if (rank === 2) return <Medal className="text-gray-400" size={24} />;
    if (rank === 3) return <Award className="text-amber-700" size={24} />;
    return <span className="font-mono text-zinc-500 font-bold">{rank}</span>;
  };

  const getRankStyle = (rank: number) => {
    if (rank === 1)
      return 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/50';
    if (rank === 2) return 'bg-gradient-to-r from-gray-400/20 to-slate-400/20 border-gray-400/50';
    if (rank === 3)
      return 'bg-gradient-to-r from-amber-700/20 to-orange-700/20 border-amber-700/50';
    return 'bg-zinc-900/50 border-zinc-800';
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans relative overflow-hidden">
      <>
        <title>Leaderboard | JJK Stat Clash</title>
        <meta
          name="description"
          content="View the top Jujutsu Kaisen sorcerers in JJK Stat Clash. See rankings, win rates, and best synergy combos."
        />
      </>

      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(234,179,8,0.05)_0%,transparent_50%)] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDIiLz4KPC9zdmc+')] opacity-20 pointer-events-none"></div>

      <button
        onClick={() => navigate('/')}
        className="absolute top-8 left-8 text-zinc-500 hover:text-white flex items-center gap-2 font-mono uppercase text-sm z-20 transition-colors"
      >
        <ArrowLeft size={16} /> Return to Hub
      </button>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <Trophy className="text-yellow-500" size={48} />
          </div>
          <h1 className="text-5xl md:text-6xl font-black font-display uppercase tracking-tighter text-white mb-2">
            Global Rankings
          </h1>
          <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.3em]">
            Elite Sorcerer Leaderboard
          </p>
        </motion.div>

        {/* Leaderboard Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-zinc-950/80 backdrop-blur-xl border border-zinc-800 rounded-2xl overflow-hidden"
        >
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 p-6 border-b border-zinc-800 bg-zinc-900/50 font-mono text-xs uppercase tracking-widest text-zinc-500">
            <div className="col-span-1">Rank</div>
            <div className="col-span-4">Sorcerer</div>
            <div className="col-span-2 text-center">Win Rate</div>
            <div className="col-span-2 text-center">Wins</div>
            <div className="col-span-2 text-center">Matches</div>
            <div className="col-span-1 text-center">Best Synergy</div>
          </div>

          {/* Table Body */}
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-zinc-500 font-mono text-xs uppercase">Loading Rankings...</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="p-12 text-center">
              <Trophy className="mx-auto text-zinc-800 mb-4" size={48} />
              <p className="text-zinc-600 font-mono text-xs uppercase tracking-widest">
                No Rankings Yet
              </p>
              <p className="text-zinc-500 text-sm mt-2">Be the first to compete!</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/50">
              {entries.map((entry, index) => (
                <motion.div
                  key={entry.playerId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`grid grid-cols-12 gap-4 p-6 items-center hover:bg-zinc-900/30 transition-all ${getRankStyle(index + 1)}`}
                >
                  <div className="col-span-1 flex justify-center">{getRankIcon(index + 1)}</div>
                  <div className="col-span-4">
                    <div className="font-display font-bold text-white">{entry.playerName}</div>
                    <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">
                      {entry.bestSynergy || 'No Synergy'}
                    </div>
                  </div>
                  <div className="col-span-2 text-center">
                    <div className="font-mono font-bold text-yellow-500">
                      {entry.winRate.toFixed(1)}%
                    </div>
                  </div>
                  <div className="col-span-2 text-center">
                    <div className="font-mono text-white">{entry.totalWins}</div>
                  </div>
                  <div className="col-span-2 text-center">
                    <div className="font-mono text-zinc-400">{entry.totalMatches}</div>
                  </div>
                  <div className="col-span-1 text-center">
                    <div className="text-[10px] text-zinc-600 font-mono uppercase">
                      {entry.lastPlayed ? new Date(entry.lastPlayed).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <p className="text-zinc-600 font-mono text-[10px] uppercase tracking-widest">
            Rankings Updated in Real-Time
          </p>
        </motion.div>
      </div>
    </div>
  );
}
