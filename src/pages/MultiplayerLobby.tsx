import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, Users, ArrowLeft, Radar } from 'lucide-react';

export default function MultiplayerLobby() {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const createRoom = () => {
    const id = Math.random().toString(36).substring(2, 8).toUpperCase();
    navigate(`/play/multiplayer/draft/${id}`);
  };

  const joinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomId.trim()) {
      setIsSearching(true);
      // Artificial delay for cool animation
      setTimeout(() => {
        navigate(`/play/multiplayer/draft/${roomId.toUpperCase()}`);
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center relative font-sans text-white overflow-hidden">
      <>
        <title>Multiplayer | JJK Stat Clash</title>
      </>

      {/* Dynamic Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(234,179,8,0.08)_0%,transparent_50%)] pointer-events-none z-0"></div>

      {/* Radar Pulse Background */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute border border-yellow-500/30 rounded-full"
            initial={{ width: 100, height: 100, opacity: 0 }}
            animate={{ width: 1200, height: 1200, opacity: [0, 1, 0] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: i * 1.3,
              ease: 'linear',
            }}
          />
        ))}
      </div>

      <button
        onClick={() => navigate('/play')}
        className="absolute top-8 left-8 text-zinc-500 hover:text-white flex items-center gap-2 font-mono uppercase text-sm z-20 transition-colors"
      >
        <ArrowLeft size={16} /> Return to Hub
      </button>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="z-10 flex flex-col items-center bg-zinc-950/60 p-12 rounded-3xl border border-zinc-800/50 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
      >
        {/* Animated Scanning Bar */}
        <motion.div
          animate={{ y: [-100, 500] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent z-0 pointer-events-none"
        />

        <div className="relative z-10 flex flex-col items-center">
          <div className="relative mb-6">
            <Globe className="text-yellow-500" size={64} />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
              className="absolute -inset-2 border-2 border-dashed border-yellow-500/20 rounded-full"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-black font-display uppercase text-white mb-2 tracking-tighter">
            Global Network
          </h1>
          <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-[0.3em] mb-12">
            Synchronizing Cursed Energy...
          </p>

          <div className="flex flex-col gap-6 w-full max-w-sm">
            <button
              onClick={createRoom}
              className="group w-full bg-yellow-600 hover:bg-yellow-500 text-black font-black uppercase tracking-[0.2em] py-5 rounded-xl flex items-center justify-center gap-3 transition-all shadow-[0_0_30px_rgba(234,179,8,0.3)] hover:scale-[1.02] active:scale-95"
            >
              <Users size={24} className="group-hover:rotate-12 transition-transform" />
              <span>Initiate New Draft</span>
            </button>

            <div className="relative flex items-center py-4">
              <div className="flex-grow border-t border-zinc-800"></div>
              <span className="flex-shrink-0 mx-4 text-zinc-600 font-mono text-[10px] uppercase tracking-widest">
                Intercept Transmission
              </span>
              <div className="flex-grow border-t border-zinc-800"></div>
            </div>

            <form onSubmit={joinRoom} className="flex flex-col gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="ENTER ROOM CODE"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl py-4 px-6 font-mono text-center uppercase tracking-[0.4em] focus:outline-none focus:border-yellow-500 transition-colors text-xl"
                  maxLength={6}
                />
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className={`w-full py-4 font-black uppercase tracking-[0.2em] rounded-xl transition-all flex items-center justify-center gap-2 ${
                  isSearching
                    ? 'bg-zinc-800 text-zinc-500 cursor-wait'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-white'
                }`}
              >
                {isSearching ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Radar size={20} />
                    </motion.div>
                    Searching...
                  </>
                ) : (
                  'Join Session'
                )}
              </button>
            </form>
          </div>
        </div>
      </motion.div>

      {/* Decorative Network Grid */}
      <div className="fixed inset-0 pointer-events-none -z-10 opacity-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      <AnimatePresence>
        {isSearching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center"
          >
            <div className="relative">
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-64 h-64 border-4 border-yellow-500/20 rounded-full flex items-center justify-center"
              >
                <Radar size={80} className="text-yellow-500 animate-pulse" />
              </motion.div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 border-t-4 border-yellow-500 rounded-full"
              />
            </div>
            <motion.h2
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="mt-12 text-2xl font-black font-display uppercase tracking-[0.5em] text-yellow-500"
            >
              Scanning Network
            </motion.h2>
            <p className="mt-4 text-zinc-500 font-mono text-xs uppercase tracking-[0.3em]">
              Locating Target Domain...
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
