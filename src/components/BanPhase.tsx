import React from 'react';
import { motion } from 'motion/react';
import { Ban, CheckCircle2, Plus, Swords, Trash2 } from 'lucide-react';
import { characters } from '../data/characters';
import { DraftSelection, SearchableSelect, getRarityConfig } from './PlayerCard';

interface BanPhaseProps {
  players: DraftSelection[];
  bans: string[][];
  banCount: number;
  onBanChange: (playerIndex: number, slotIndex: number, entityId: string) => void;
  onBegin: () => void;
  onNameChange?: (playerIndex: number, name: string) => void;
  onRemovePlayer?: (index: number) => void;
  onAddPlayer?: () => void;
  isReadOnly?: (playerIndex: number) => boolean;
}

const playerAccents = [
  {
    text: 'text-red-500',
    bg: 'bg-red-500',
    border: 'border-red-500/50',
    glow: 'shadow-[0_0_25px_rgba(239,68,68,0.15)]',
  },
  {
    text: 'text-blue-500',
    bg: 'bg-blue-500',
    border: 'border-blue-500/50',
    glow: 'shadow-[0_0_25px_rgba(59,130,246,0.15)]',
  },
  {
    text: 'text-green-500',
    bg: 'bg-green-500',
    border: 'border-green-500/50',
    glow: 'shadow-[0_0_25px_rgba(34,197,94,0.15)]',
  },
  {
    text: 'text-purple-500',
    bg: 'bg-purple-500',
    border: 'border-purple-500/50',
    glow: 'shadow-[0_0_25px_rgba(168,85,247,0.15)]',
  },
  {
    text: 'text-yellow-500',
    bg: 'bg-yellow-500',
    border: 'border-yellow-500/50',
    glow: 'shadow-[0_0_25px_rgba(234,179,8,0.15)]',
  },
  {
    text: 'text-orange-500',
    bg: 'bg-orange-500',
    border: 'border-orange-500/50',
    glow: 'shadow-[0_0_25px_rgba(249,115,22,0.15)]',
  },
  {
    text: 'text-pink-500',
    bg: 'bg-pink-500',
    border: 'border-pink-500/50',
    glow: 'shadow-[0_0_25px_rgba(236,72,153,0.15)]',
  },
  {
    text: 'text-cyan-500',
    bg: 'bg-cyan-500',
    border: 'border-cyan-500/50',
    glow: 'shadow-[0_0_25px_rgba(6,182,212,0.15)]',
  },
];

export function BanPhase({
  players,
  bans,
  banCount,
  onBanChange,
  onBegin,
  onNameChange,
  onRemovePlayer,
  onAddPlayer,
  isReadOnly,
}: BanPhaseProps) {
  const playerBans = (i: number) => bans[i] || [];
  const sealedBy = (i: number) => playerBans(i).slice(0, banCount).filter(Boolean).length;
  const playerComplete = (i: number) => isReadOnly?.(i) || sealedBy(i) >= banCount;
  const canBegin = players.every((_, i) => playerComplete(i));

  const totalSeals = players.length * banCount;
  const placedSeals = players.reduce(
    (n, _, i) => n + (isReadOnly?.(i) ? banCount : sealedBy(i)),
    0
  );

  const registry = players.flatMap((_, i) =>
    playerBans(i)
      .filter(Boolean)
      .slice(0, banCount)
      .map((id) => ({ id, owner: i }))
  );

  return (
    <div className="flex flex-col items-center gap-10 w-full relative">
      {/* Watermark Kanji */}
      <div className="absolute inset-0 flex items-start justify-center pointer-events-none -z-10 overflow-hidden">
        <span className="text-[300px] md:text-[420px] font-black font-display leading-none text-red-600/[0.04] select-none -mt-16">
          封
        </span>
      </div>

      {/* Header */}
      <div className="text-center relative z-10">
        <p className="text-[10px] font-mono text-red-600/70 uppercase tracking-[0.5em] mb-3">
          封印 // Sealing Protocol
        </p>
        <h2 className="text-4xl md:text-5xl font-black font-display text-red-500 uppercase tracking-widest mb-3 flex items-center justify-center gap-4 drop-shadow-[0_0_20px_rgba(220,38,38,0.4)]">
          <Ban size={40} /> Ban Phase
        </h2>
        <p className="text-zinc-400 font-mono text-xs uppercase tracking-widest">
          Each sorcerer must seal {banCount} {banCount === 1 ? 'entity' : 'entities'} from the draft
          pool
        </p>
      </div>

      {/* Global Seal Progress */}
      <div className="w-full max-w-md relative z-10">
        <div className="flex justify-between items-center mb-2 font-mono text-[9px] uppercase tracking-[0.3em] text-zinc-500">
          <span>Seals Placed</span>
          <span className={canBegin ? 'text-red-400' : ''}>
            {placedSeals} / {totalSeals}
          </span>
        </div>
        <div className="h-1.5 w-full bg-zinc-900 border border-zinc-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-red-800 via-red-500 to-red-400"
            initial={{ width: 0 }}
            animate={{ width: `${totalSeals > 0 ? (placedSeals / totalSeals) * 100 : 0}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Player Cards */}
      <div
        className={`grid gap-6 w-full items-start relative ${
          players.length <= 4
            ? 'grid-cols-1 md:grid-cols-2 justify-items-center'
            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-items-center'
        }`}
      >
        {players.map((_, pIndex) => {
          const accent = playerAccents[pIndex % playerAccents.length];
          const complete = playerComplete(pIndex);
          const readOnly = isReadOnly?.(pIndex) || false;
          return (
            <motion.div
              key={pIndex}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: pIndex * 0.08 }}
              className={`bg-zinc-900/80 border ${complete ? accent.border : 'border-zinc-800'} rounded-2xl p-6 flex flex-col gap-4 w-full max-w-sm relative transition-all duration-300 hover:z-50 focus-within:z-50 ${complete ? accent.glow : ''}`}
            >
              {/* Player accent bar */}
              <div
                className={`absolute top-0 left-0 w-full h-1 rounded-t-2xl ${accent.bg} ${complete ? 'opacity-100' : 'opacity-30'} transition-opacity`}
              />

              <div className="flex justify-between items-center gap-2 mt-1">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${accent.bg}`} />
                  {onNameChange && !readOnly ? (
                    <input
                      value={players[pIndex].playerName || ''}
                      onChange={(e) => onNameChange(pIndex, e.target.value)}
                      placeholder={`Player ${pIndex + 1}`}
                      className={`bg-transparent border-b border-transparent hover:border-zinc-700 focus:border-red-500 outline-none text-lg font-black font-display ${accent.text} uppercase tracking-wider w-full placeholder:text-zinc-700 transition-colors truncate pb-0.5`}
                    />
                  ) : (
                    <h3
                      className={`text-lg font-black font-display ${accent.text} uppercase truncate`}
                    >
                      {players[pIndex].playerName || `Player ${pIndex + 1}`}
                    </h3>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      complete
                        ? 'text-green-400 border-green-500/40 bg-green-500/10'
                        : 'text-zinc-500 border-zinc-800 bg-black/40'
                    }`}
                  >
                    {readOnly ? 'AUTO' : `${sealedBy(pIndex)}/${banCount}`}
                  </span>
                  {complete && <CheckCircle2 size={16} className="text-green-500" />}
                  {!readOnly && onRemovePlayer && players.length > 2 && (
                    <button
                      onClick={() => onRemovePlayer(pIndex)}
                      className="text-zinc-600 hover:text-red-500 transition-colors"
                      title="Remove challenger"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Ban Slots */}
              <div className="flex flex-col gap-3">
                {Array.from({ length: banCount }).map((_, banIndex) => {
                  const bannedId = playerBans(pIndex)[banIndex];
                  if (readOnly) {
                    const entity = characters.find((c) => c.id === bannedId);
                    return (
                      <div
                        key={banIndex}
                        className="bg-black/40 border border-zinc-800/60 rounded-md p-2 pl-10 pr-3 min-h-[38px] flex items-center justify-between relative"
                      >
                        <span className="absolute left-3 font-black text-lg text-zinc-700 font-display">
                          禁
                        </span>
                        <span
                          className={`truncate text-sm font-medium ${entity ? 'text-zinc-300' : 'text-zinc-600 italic'}`}
                        >
                          {entity ? entity.name : 'Sealing...'}
                        </span>
                        {entity && <Ban size={14} className="text-red-900/70 shrink-0" />}
                      </div>
                    );
                  }

                  const otherBanIds = bans
                    .flat()
                    .filter((id) => id && id !== playerBans(pIndex)[banIndex]);
                  const options = characters
                    .filter((c) => !otherBanIds.includes(c.id))
                    .map((c) => ({
                      value: c.id,
                      label: c.name,
                      loreDescription: c.loreDescription,
                      grade: c.grade,
                      description: c.flavorText,
                    }));
                  return (
                    <SearchableSelect
                      key={banIndex}
                      value={bannedId || ''}
                      placeholder={`Seal Entity ${banIndex + 1}`}
                      kanji="禁"
                      options={options}
                      onChange={(val: string) => onBanChange(pIndex, banIndex, val)}
                    />
                  );
                })}
              </div>
            </motion.div>
          );
        })}

        {onAddPlayer && players.length < 8 && (
          <button
            onClick={onAddPlayer}
            className="h-full min-h-[220px] w-full max-w-sm flex flex-col items-center justify-center gap-3 bg-zinc-900/30 border border-dashed border-zinc-700 hover:border-red-500/60 hover:bg-zinc-900/60 text-zinc-500 hover:text-red-400 rounded-2xl font-mono text-sm uppercase tracking-widest transition-all cursor-pointer"
          >
            <Plus size={24} /> Add Challenger
          </button>
        )}
      </div>

      {/* Seal Registry */}
      {registry.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-4xl bg-black/40 border border-zinc-800/60 rounded-xl px-5 py-4 relative z-10"
        >
          <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-[0.4em] mb-3">
            Seal Registry
          </p>
          <div className="flex flex-wrap gap-2">
            {registry.map(({ id, owner }) => {
              const entity = characters.find((c) => c.id === id);
              const rarity = getRarityConfig(entity);
              const ownerAccent = playerAccents[owner % playerAccents.length];
              if (!entity) return null;
              return (
                <motion.div
                  key={`${owner}-${id}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 bg-zinc-950 border border-red-900/40 rounded-full pl-2 pr-3 py-1"
                  title={`Sealed by ${players[owner].playerName || `Player ${owner + 1}`}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${ownerAccent.bg}`} />
                  <Ban size={11} className="text-red-500/80" />
                  <span className="text-[10px] font-mono font-bold text-zinc-300 uppercase tracking-wider line-through decoration-red-500/60">
                    {entity.name}
                  </span>
                  <span
                    className={`text-[8px] font-mono font-black uppercase tracking-widest ${rarity.color}`}
                  >
                    {rarity.label}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Begin CTA */}
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={onBegin}
        disabled={!canBegin}
        className={`relative z-10 font-black font-display py-4 px-12 rounded-full text-xl uppercase tracking-widest transition-all flex items-center gap-3 ${
          canBegin
            ? 'bg-red-600 hover:bg-red-700 text-white shadow-[0_0_25px_rgba(220,38,38,0.4)] hover:scale-105'
            : 'bg-zinc-900 border border-zinc-800 text-zinc-600 cursor-not-allowed'
        }`}
      >
        <Swords size={20} />
        {canBegin ? 'Begin Draft' : `${totalSeals - placedSeals} seals remaining`}
      </motion.button>
    </div>
  );
}
