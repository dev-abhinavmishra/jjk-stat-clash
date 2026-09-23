import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import usePartySocket from 'partysocket/react';
import { characters, statsList, statCategoryMap, Entity } from '../data/characters';
import {
  PlayerCard,
  SearchableSelect,
  DraftSelection,
  bindingVows,
} from '../components/PlayerCard';
import { Comparison } from '../components/Comparison';
import { CursedConvergenceTransition } from '../components/CursedConvergenceTransition';
import { PhaseTransition } from '../components/PhaseTransition';
import { motion, AnimatePresence } from 'motion/react';
import { Swords, Ban, Trophy, Clock, Users, Copy, CheckCircle2, Radar } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { SystemProtocol } from '../components/SystemProtocol';

export default function MultiplayerDraft() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  const [gameState, setGameState] = useState<any>(null);
  const [myBans, setMyBans] = useState<string[]>(['', '']);
  const [copied, setCopied] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const [banError, setBanError] = useState<string | null>(null);
  const [localActiveRollingStat, setLocalActiveRollingStat] = useState<string | null>(null);

  // Connect to PartyKit using the room ID
  const socket = usePartySocket({
    host:
      window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'localhost:1999'
        : import.meta.env.VITE_PARTYKIT_HOST || 'jjk-stat-clash.website-deployer.partykit.dev',
    room: roomId || 'default',
    onOpen: () => {
      setConnectionError(false);
    },
    onMessage: (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'sync') {
        setGameState(data.state);
        setConnectionError(false);
      }
      if (data.type === 'timer') {
        setGameState((prev) => (prev ? { ...prev, timeLeft: data.timeLeft } : null));
      }
      if (data.type === 'banConflict') {
        setBanError(
          "One or both of your bans conflict with your opponent's locked bans. Choose different entities."
        );
      }
      if (data.type === 'error') {
        alert(data.message);
        navigate('/play/multiplayer');
      }
    },
  });

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const setMaxPlayers = (maxPlayers: number) => {
    socket.send(JSON.stringify({ type: 'setMaxPlayers', maxPlayers }));
  };

  // Send partial bans to server for real-time sync
  useEffect(() => {
    if (gameState?.draftPhase === 'banning' && (myBans[0] || myBans[1])) {
      socket.send(JSON.stringify({ type: 'updateBans', bans: myBans }));
    }
  }, [myBans]);

  const submitBans = () => {
    if (myBans[0] && myBans[1]) {
      setBanError(null);
      socket.send(JSON.stringify({ type: 'submitBans', bans: myBans }));
    }
  };

  const hasVessel = (draft: any) =>
    ['yuji', 'modulo-yuji', 'sukuna', 'megumi'].some((id) => Object.values(draft).includes(id));

  const handleSelect = (playerIndex: number, stat: string, entityId: string) => {
    const myIndex = gameState.players.findIndex((p: any) => p.id === socket.id);
    if (playerIndex !== myIndex) return;
    if (gameState.activePlayer !== myIndex) return;

    const draft = gameState.players[myIndex].draft;

    // Prevent changing selection once made
    if (draft[stat]) return;
    if (!entityId) return;

    // Sukuna's Fingers vessel check
    if (entityId === 'sukunas-fingers' && !hasVessel({ ...draft, [stat]: entityId })) {
      return;
    }
    // If selecting a non-vessel character while Sukuna's Fingers is equipped, clear it
    if (stat !== 'tool' && entityId && Object.values(draft).includes('sukunas-fingers')) {
      if (!hasVessel({ ...draft, [stat]: entityId })) {
        socket.send(JSON.stringify({ type: 'selectDraft', stat: 'tool', entityId: null }));
      }
    }

    socket.send(JSON.stringify({ type: 'selectDraft', stat, entityId }));
  };

  const handleNameChange = (name: string) => {
    socket.send(JSON.stringify({ type: 'updateName', name }));
  };

  const handleGambleRoll = (stat: string, isLucky: boolean) => {
    if (!gameState || gameState.draftPhase !== 'drafting' || gameState.draftMode !== 'gamble')
      return;
    const myIndex = gameState.players.findIndex((p: any) => p.id === socket.id);
    if (myIndex === -1) return;

    const gState = gameState.gambleStates[socket.id];
    if (!gState) return;

    if (
      (gameState.currentRollingStat || localActiveRollingStat) &&
      (gameState.currentRollingStat || localActiveRollingStat) !== stat
    )
      return;

    const isVow = stat === 'bindingVow';
    if (!isVow && gState.remainingTotal <= 0) return;
    if (isLucky && gState.remainingLucky <= 0) return;
    if ((gState.statRolls[stat] || 0) >= gameState.gambleConfig.rollsPerStat) return;

    const myDraft = gameState.players[myIndex].draft;
    const category = statCategoryMap[stat] || 'character';

    // Vow rolls draw from the pact pool and require the 'Binding Vow' power;
    // every other stat pulls its entity category.
    let available: any[] = isVow
      ? myDraft.specialPower1 === 'binding-vow' || myDraft.specialPower2 === 'binding-vow'
        ? bindingVows
        : []
      : getAvailableEntities(myDraft[stat], category, myDraft);
    if (available.length === 0) return;

    if (isLucky) {
      const getEntityPower = (entity: any) => {
        let pwr = 50;
        if (entity.statValue) pwr = entity.statValue;
        else if (entity.stats && entity.stats[stat]) pwr = entity.stats[stat];
        const grade = entity.grade || '';
        if (grade === 'Calamity') pwr += 200;
        else if (grade === 'Mythic') pwr += 100;
        else if (grade === 'Legendary') pwr += 50;
        else if (grade === 'Epic') pwr += 30;
        else if (grade === 'Rare') pwr += 15;
        return pwr;
      };
      const sorted = [...available].sort((a, b) => getEntityPower(b) - getEntityPower(a));
      available = sorted.slice(0, Math.max(1, Math.ceil(sorted.length * 0.3)));
    }

    let randomEntity = available[Math.floor(Math.random() * available.length)];
    if (category === 'character' && !isLucky && Math.random() < 0.3) {
      const humanEntity = available.find((c) => c.id === 'human');
      if (humanEntity) randomEntity = humanEntity as any;
    }
    // The server treats a vow roll as a free action — don't mark the stat as
    // being rolled locally either.
    if (!isVow) setLocalActiveRollingStat(stat);
    socket.send(JSON.stringify({ type: 'gambleRoll', stat, entityId: randomEntity.id, isLucky }));
  };

  const handleFinishGambleTurn = () => {
    setLocalActiveRollingStat(null);
    socket.send(JSON.stringify({ type: 'finishGambleTurn' }));
  };

  useEffect(() => {
    if (gameState) {
      const myIndex = gameState.players.findIndex((p: any) => p.id === socket.id);
      if (gameState.activePlayer !== myIndex) {
        setLocalActiveRollingStat(null);
      }
    }
  }, [gameState?.activePlayer, socket.id]);

  // Connection timeout check (handled by separate useEffect)

  const getAvailableEntities = (
    currentSelectedId: string | null,
    category: string,
    draft: DraftSelection
  ): Entity[] => {
    if (!gameState) return [];
    const selectedIds = new Set<string>();
    gameState.players.forEach((d: any) => {
      Object.values(d.draft).forEach((id: any) => {
        if (typeof id === 'string') selectedIds.add(id);
      });
    });
    const globalBans = gameState.bans.flat().filter(Boolean);
    return characters.filter((entity) => {
      if (entity.category !== category) return false;
      if (globalBans.includes(entity.id) && entity.id !== currentSelectedId) return false;
      if (
        entity.id !== 'binding-vow' &&
        selectedIds.has(entity.id) &&
        entity.id !== currentSelectedId
      )
        return false;
      if ('prerequisite' in entity && entity.prerequisite) {
        if (!Object.values(draft).includes(entity.prerequisite)) return false;
      }
      return true;
    });
  };

  // Timeout for connection
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!gameState) {
        setConnectionError(true);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [gameState]);

  if (connectionError && !gameState) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-8 text-center">
        <Helmet>
          <title>Connection Error | JJK Stat Clash</title>
        </Helmet>
        <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-8 border border-red-500/50">
          <Clock className="text-red-500 animate-pulse" size={48} />
        </div>
        <h1 className="text-4xl font-black font-display uppercase tracking-tighter text-white mb-4">
          Network Offline
        </h1>
        <p className="text-zinc-400 font-mono text-sm max-w-md mb-12 uppercase tracking-widest leading-relaxed">
          Failed to establish a connection to the Cursed Energy Network. If you are developing
          locally, ensure the PartyKit server is running.
        </p>
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl font-mono text-xs mb-12 w-full max-w-md text-left">
          <p className="text-zinc-500 mb-2">// Run this in a new terminal:</p>
          <code className="text-yellow-500 font-bold text-sm">npm run party</code>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-8 py-4 bg-white text-black font-black uppercase tracking-[0.2em] rounded-lg hover:bg-zinc-200 transition-all active:scale-95"
        >
          Reconnect Signal
        </button>
        <button
          onClick={() => navigate('/play')}
          className="mt-6 text-zinc-600 hover:text-white font-mono uppercase text-xs tracking-widest"
        >
          Return to Hub
        </button>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-yellow-500 font-mono space-y-6">
        <Helmet>
          <title>Synchronizing | {roomId} | JJK Stat Clash</title>
        </Helmet>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <Radar size={64} />
        </motion.div>
        <div className="animate-pulse tracking-[0.5em] uppercase text-sm">
          Synchronizing Signal...
        </div>
      </div>
    );
  }

  const myIndex = gameState.players.findIndex((p: any) => p.id === socket.id);
  const isHost = myIndex === 0;

  if (gameState.draftPhase === 'setup') {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center font-sans relative">
        <Helmet>
          <title>Lobby | {roomId}</title>
        </Helmet>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(234,179,8,0.1)_0%,transparent_50%)] pointer-events-none z-0"></div>

        <div className="z-10 flex flex-col items-center max-w-lg w-full px-4">
          <div className="bg-zinc-900 border border-yellow-500/30 p-8 rounded-2xl w-full text-center relative overflow-hidden shadow-[0_0_40px_rgba(234,179,8,0.15)]">
            <h2 className="text-3xl font-black font-display uppercase tracking-widest text-white mb-2">
              Lobby
            </h2>
            <div className="flex items-center justify-center gap-2 mb-8">
              <span className="font-mono text-zinc-400">ROOM CODE:</span>
              <span className="font-mono font-bold text-2xl tracking-widest text-yellow-500">
                {roomId}
              </span>
              <button
                onClick={copyRoomId}
                className="ml-2 text-zinc-500 hover:text-yellow-500 transition-colors"
              >
                {copied ? (
                  <CheckCircle2 size={20} className="text-green-500" />
                ) : (
                  <Copy size={20} />
                )}
              </button>
            </div>

            <div className="flex items-center justify-center gap-4 mb-8">
              <Users className="text-zinc-500" />
              <span className="text-xl font-bold">
                {gameState.players.length} / {gameState.maxPlayers} Players
              </span>
            </div>

            {isHost && (
              <div className="mb-8 border-t border-zinc-800 pt-6">
                <p className="text-xs text-zinc-500 font-mono uppercase mb-4">
                  Lobby Settings (Host)
                </p>

                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest">
                      Match Capacity
                    </p>
                    <div className="flex justify-center gap-4">
                      {[2, 3, 4, 5, 6, 7, 8].map((num) => (
                        <button
                          key={num}
                          onClick={() => setMaxPlayers(num)}
                          className={`px-3 py-2 rounded-lg font-bold font-mono text-[10px] transition-colors ${gameState.maxPlayers === num ? 'bg-yellow-500 text-black' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
                        >
                          {num} P
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest">
                      Draft Protocol
                    </p>
                    <div className="flex justify-center gap-4">
                      {['normal', 'gamble'].map((mode) => (
                        <button
                          key={mode}
                          onClick={() =>
                            socket.send(JSON.stringify({ type: 'setDraftMode', mode }))
                          }
                          className={`px-6 py-2 rounded-lg font-bold font-mono text-xs uppercase tracking-widest transition-all ${gameState.draftMode === mode ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'}`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>

                  {gameState.draftMode === 'gamble' && (
                    <div className="flex flex-col gap-3 mt-2 bg-black/40 p-4 rounded-xl border border-yellow-500/20">
                      <p className="text-[10px] text-yellow-500 font-mono uppercase tracking-widest mb-1 text-left">
                        Cursed Lottery Config
                      </p>

                      <div className="flex flex-col gap-1 text-left">
                        <div className="flex justify-between items-end">
                          <label className="text-[10px] text-zinc-400 font-mono uppercase">
                            Global Roll Pool
                          </label>
                          <span className="text-xs font-bold text-yellow-500">
                            {gameState.gambleConfig.totalRolls}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="300"
                          step="5"
                          value={gameState.gambleConfig.totalRolls}
                          onChange={(e) => {
                            const val = +e.target.value;
                            socket.send(
                              JSON.stringify({
                                type: 'updateGambleConfig',
                                config: {
                                  ...gameState.gambleConfig,
                                  totalRolls: val,
                                  rollsPerStat: Math.min(
                                    gameState.gambleConfig.rollsPerStat,
                                    Math.floor(val / 10)
                                  ),
                                },
                              })
                            );
                          }}
                          className="w-full accent-yellow-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      <div className="flex flex-col gap-1 text-left mt-2">
                        <div className="flex justify-between items-end">
                          <label className="text-[10px] text-zinc-400 font-mono uppercase">
                            Jackpot Rolls
                          </label>
                          <span className="text-xs font-bold text-yellow-400">
                            {gameState.gambleConfig.luckyRolls}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max={Math.min(50, gameState.gambleConfig.totalRolls)}
                          step="1"
                          value={gameState.gambleConfig.luckyRolls}
                          onChange={(e) => {
                            socket.send(
                              JSON.stringify({
                                type: 'updateGambleConfig',
                                config: { ...gameState.gambleConfig, luckyRolls: +e.target.value },
                              })
                            );
                          }}
                          className="w-full accent-yellow-400 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      <div className="flex flex-col gap-1 text-left mt-2">
                        <div className="flex justify-between items-end">
                          <label className="text-[10px] text-zinc-400 font-mono uppercase">
                            Category Limit
                          </label>
                          <span className="text-xs font-bold text-red-500">
                            {gameState.gambleConfig.rollsPerStat}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="30"
                          step="1"
                          value={gameState.gambleConfig.rollsPerStat}
                          onChange={(e) => {
                            const val = +e.target.value;
                            socket.send(
                              JSON.stringify({
                                type: 'updateGambleConfig',
                                config: {
                                  ...gameState.gambleConfig,
                                  rollsPerStat: val,
                                  totalRolls: Math.max(gameState.gambleConfig.totalRolls, val * 10),
                                },
                              })
                            );
                          }}
                          className="w-full accent-red-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => socket.send(JSON.stringify({ type: 'startGame' }))}
                    disabled={gameState.players.length < 2}
                    className={`mt-4 py-4 rounded-xl font-black uppercase tracking-[0.3em] transition-all ${gameState.players.length >= 2 ? 'bg-white text-black hover:bg-zinc-200 hover:scale-[1.02]' : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'}`}
                  >
                    Initiate Clash
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-center mt-4">
              <div className="animate-pulse flex items-center gap-3 text-yellow-500 font-mono text-[10px] uppercase tracking-widest">
                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                {gameState.players.length < 2
                  ? 'Awaiting additional sorcerers...'
                  : 'Ready for engagement...'}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans relative overflow-x-hidden">
      <Helmet>
        <title>Clash | {roomId}</title>
      </Helmet>

      {gameState.draftPhase === 'drafting' && (
        <div className="w-full bg-[#111] border-b border-zinc-800 p-4 sticky top-0 z-50 flex justify-between items-center px-8">
          <div className="flex items-center gap-4">
            <span
              className={`text-xs font-mono font-bold px-3 py-1 rounded ${gameState.activePlayer === myIndex ? 'bg-green-500/20 text-green-500 border border-green-500/50 animate-pulse' : 'text-zinc-500'}`}
            >
              {gameState.activePlayer === myIndex ? 'YOUR TURN' : 'OPPONENT TURN'}
            </span>
            <span className="text-xs font-mono text-zinc-400">
              Active: Player {gameState.activePlayer + 1}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Clock
              className={gameState.timeLeft <= 5 ? 'text-red-500 animate-bounce' : 'text-zinc-400'}
              size={20}
            />
            <span
              className={`text-2xl font-mono font-black ${gameState.timeLeft <= 5 ? 'text-red-500' : 'text-white'}`}
            >
              00:{gameState.timeLeft.toString().padStart(2, '0')}
            </span>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-12 flex flex-col items-center">
        {gameState.draftPhase === 'banning' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center w-full"
          >
            <h2 className="text-4xl font-black text-red-500 uppercase tracking-widest mb-12 flex items-center gap-3">
              <Ban size={36} /> Ban Phase
            </h2>
            <div className="flex flex-col md:flex-row gap-8 w-full max-w-5xl justify-center items-stretch">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 w-full max-w-md flex flex-col">
                <h3 className="text-xl font-bold uppercase mb-4 text-white">Your Bans</h3>
                <p className="text-xs text-zinc-500 font-mono mb-6">
                  Select 2 entities to remove from the global pool.
                </p>
                <div className="flex-1 space-y-4">
                  {[0, 1].map((bIndex) => {
                    const otherBanId = myBans[bIndex === 0 ? 1 : 0];
                    // Filter out: own other ban + opponent's locked bans
                    const opponentLockedBans: string[] = [];
                    gameState.bans.forEach((b: string[], i: number) => {
                      if (i !== myIndex && gameState.lockedBans?.[i]) {
                        opponentLockedBans.push(...b);
                      }
                    });
                    const options = characters
                      .filter((c) => c.id !== otherBanId && !opponentLockedBans.includes(c.id))
                      .map((c) => ({ value: c.id, label: c.name, grade: c.grade }));
                    return (
                      <div key={bIndex} className="mb-4">
                        <SearchableSelect
                          value={myBans[bIndex] || ''}
                          options={options}
                          onChange={(val: string) => {
                            if (gameState.lockedBans?.[myIndex]) return;
                            setBanError(null);
                            const newBans = [...myBans];
                            newBans[bIndex] = val;
                            setMyBans(newBans);
                          }}
                          disabled={gameState.lockedBans?.[myIndex]}
                          placeholder="Select Entity..."
                          kanji="禁"
                        />
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={submitBans}
                  disabled={!(myBans[0] && myBans[1]) || gameState.lockedBans?.[myIndex]}
                  className={`mt-8 px-12 py-4 rounded-full font-bold uppercase text-xl transition-all ${myBans[0] && myBans[1] && !gameState.lockedBans?.[myIndex] ? 'bg-red-600 text-white hover:bg-red-700 hover:scale-105' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}`}
                >
                  {gameState.lockedBans?.[myIndex] ? 'Bans Locked' : 'Lock In Bans'}
                </button>
                {banError && (
                  <p className="mt-3 text-xs font-mono text-red-500 bg-red-500/10 border border-red-500/30 px-4 py-2 rounded">
                    {banError}
                  </p>
                )}
                <p className="mt-4 text-xs font-mono text-zinc-500 animate-pulse">
                  {gameState.lockedBans?.[myIndex]
                    ? 'Waiting for opponent sorcerers...'
                    : 'Seal two entities from this match.'}
                </p>
              </div>

              <div className="bg-zinc-950/30 border border-zinc-900 rounded-xl p-8 w-full max-w-md backdrop-blur-sm flex flex-col">
                <h3 className="text-xl font-bold uppercase mb-4 text-zinc-500">Opponent Bans</h3>
                <p className="text-xs text-zinc-600 font-mono mb-6 italic">
                  Synchronizing cursed signals...
                </p>

                <div className="flex-1 space-y-8">
                  {gameState.players.map((p: any, idx: number) => {
                    if (idx === myIndex) return null;
                    const pBans = gameState.partialBans?.[idx] || [null, null];
                    const isLocked = gameState.lockedBans?.[idx];
                    return (
                      <div key={idx} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${isLocked ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`}
                            />
                            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                              {p.name || `Player ${idx + 1}`}
                            </p>
                          </div>
                          {isLocked && (
                            <span className="text-[8px] font-mono font-black text-green-500 bg-green-500/10 px-1.5 rounded border border-green-500/30 uppercase">
                              Locked
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                          {[0, 1].map((bIdx) => (
                            <motion.div
                              key={bIdx}
                              initial={false}
                              animate={{ opacity: pBans[bIdx] ? 1 : 0.5 }}
                              className="bg-black/40 border border-zinc-800/50 p-4 rounded-lg flex items-center justify-between"
                            >
                              <span
                                className={`text-xs font-mono ${pBans[bIdx] ? 'text-zinc-300' : 'text-zinc-700 italic'}`}
                              >
                                {pBans[bIdx]
                                  ? characters.find((c) => c.id === pBans[bIdx])?.name
                                  : 'Decision pending...'}
                              </span>
                              {pBans[bIdx] && <Ban size={14} className="text-red-900/50" />}
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-8 pt-6 border-t border-zinc-900 flex items-center gap-3 text-zinc-600">
                  <div className="w-1 h-1 bg-zinc-700 rounded-full animate-ping" />
                  <p className="text-[9px] font-mono uppercase tracking-widest">
                    Real-time sync active
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-8 text-xs font-mono text-zinc-500 animate-pulse">
              Waiting for all sorcerers to finalize restrictions...
            </p>
          </motion.div>
        )}

        {(gameState.draftPhase === 'drafting' ||
          gameState.draftPhase === 'draftComplete' ||
          gameState.draftPhase === 'banning') &&
          gameState.roundWins?.some((w: number) => w > 0) && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-8 mb-10 bg-zinc-900 border border-zinc-800 px-8 py-3 rounded-full shadow-lg relative z-20"
            >
              <div className="flex items-center gap-3">
                <Trophy className="text-yellow-500" size={20} />
                <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest">
                  Series Score
                </span>
              </div>
              <div className="flex gap-6 items-center font-mono font-bold text-sm tracking-widest uppercase">
                {gameState.players.map((p: any, i: number) => (
                  <span
                    key={i}
                    className={
                      gameState.roundWins[i] > 0
                        ? 'text-yellow-400 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]'
                        : 'text-zinc-500'
                    }
                  >
                    {p.name}: <span className="text-xl">{gameState.roundWins[i] || 0}</span>
                  </span>
                ))}
              </div>
            </motion.div>
          )}

        {(gameState.draftPhase === 'drafting' || gameState.draftPhase === 'draftComplete') && (
          <div className="flex flex-col items-center gap-8 w-full">
            <div className="flex flex-wrap justify-center gap-8 w-full items-start relative z-20">
              {gameState.players.map((p: any, index: number) => (
                <div
                  key={index}
                  className={`relative transition-all duration-300 ${gameState.draftPhase === 'drafting' && gameState.activePlayer !== index ? 'opacity-70 scale-95 pointer-events-none' : gameState.draftPhase === 'drafting' && gameState.activePlayer === index ? 'ring-4 ring-yellow-500/50 rounded-2xl shadow-[0_0_30px_rgba(234,179,8,0.2)] z-30' : ''}`}
                >
                  {index !== myIndex && gameState.draftPhase === 'drafting' && (
                    <div className="absolute inset-0 z-50 rounded-2xl pointer-events-auto cursor-not-allowed"></div>
                  )}
                  <PlayerCard
                    playerNum={index + 1}
                    draft={{ ...p.draft, playerName: p.name }}
                    onSelect={(stat, entityId) => handleSelect(index, stat, entityId)}
                    onNameChange={handleNameChange}
                    onRemove={() => {}}
                    canRemove={false}
                    getAvailableEntities={(id, cat) => getAvailableEntities(id, cat, p.draft)}
                    allEntities={characters}
                    draftMode={gameState.draftMode}
                    lockOnSelect={true}
                    gambleState={gameState.gambleStates?.[p.id]}
                    gambleConfig={gameState.gambleConfig}
                    onGambleRoll={(stat, isLucky) => handleGambleRoll(stat, isLucky)}
                    isTurn={gameState.activePlayer === index}
                    activeRollingStat={gameState.currentRollingStat || localActiveRollingStat}
                    onFinishGambleTurn={handleFinishGambleTurn}
                    isOnlineMode={true}
                  />
                  {myIndex === index && (
                    <div className="absolute -top-3 -right-3 bg-green-500 text-black font-black text-[10px] px-2 py-1 rounded-full uppercase z-50">
                      YOU
                    </div>
                  )}
                </div>
              ))}
            </div>

            {gameState.draftPhase === 'draftComplete' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-6 mt-8"
              >
                <h2 className="text-3xl font-black text-white uppercase tracking-widest font-display">
                  Draft Complete
                </h2>
                <p className="text-sm text-zinc-400 font-mono">
                  {gameState.readyToClash.filter((r: boolean) => r).length} /{' '}
                  {gameState.players.length} sorcerers ready
                </p>

                <button
                  onClick={() => socket.send(JSON.stringify({ type: 'readyToClash' }))}
                  disabled={gameState.readyToClash?.[myIndex]}
                  className={`px-12 py-5 rounded-full font-black uppercase text-xl tracking-widest transition-all ${
                    gameState.readyToClash?.[myIndex]
                      ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-red-600 to-red-800 text-white hover:scale-105 shadow-[0_0_30px_rgba(220,38,38,0.4)]'
                  }`}
                >
                  {gameState.readyToClash?.[myIndex]
                    ? `Waiting (${gameState.readyToClash.filter((r: boolean) => r).length}/${gameState.players.length})`
                    : 'Clash!'}
                </button>

                <div className="flex gap-3 mt-2">
                  {gameState.players.map((p: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${gameState.readyToClash?.[idx] ? 'bg-green-500' : 'bg-zinc-700 animate-pulse'}`}
                      />
                      <span className="text-[10px] font-mono text-zinc-500 uppercase">
                        {p.name}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {gameState.draftPhase === 'drafting' && (
              <div className="w-full flex justify-center mt-12">
                <SystemProtocol />
              </div>
            )}

            <AnimatePresence></AnimatePresence>
          </div>
        )}

        <AnimatePresence>
          {gameState.draftPhase === 'transitioning' && (
            <CursedConvergenceTransition
              players={gameState.players.map((p: any) => p.draft)}
              onPhaseSwap={() => {}}
              onComplete={() => {
                if (isHost) {
                  socket.send(JSON.stringify({ type: 'startComparing' }));
                }
              }}
            />
          )}
        </AnimatePresence>

        {gameState.draftPhase === 'comparing' && (
          <div className="w-full flex justify-center pb-24 relative z-20">
            <Comparison
              players={gameState.players.map((p: any) => p.draft)}
              roundWins={gameState.roundWins}
              readyToReset={gameState.readyToReset}
              isMultiplayer={true}
              onPlayAgain={() => {
                navigate('/play/multiplayer');
              }}
              onReset={(winners) => {
                socket.send(JSON.stringify({ type: 'readyToReset' }));
                if (isHost) {
                  socket.send(JSON.stringify({ type: 'recordWin', winners }));
                }
              }}
            />
          </div>
        )}
      </main>
    </div>
  );
}
