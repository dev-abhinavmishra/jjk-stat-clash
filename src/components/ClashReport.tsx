import React from 'react';
import { motion } from 'motion/react';
import { Crown, Zap, Target, Activity, Award, ScrollText } from 'lucide-react';
import { characters } from '../data/characters';
import { DraftSelection } from './PlayerCard';

export interface ClashRound {
  stat: string;
  statName: string;
  values: number[];
  winners: number[]; // player indices tied for the max; empty when the round is void (all 0)
  margin: number; // solo winner's lead over the next best; 0 for shared or void rounds
}

interface ClashReportProps {
  players: DraftSelection[];
  scores: number[];
  rounds: ClashRound[];
  blackFlashes: boolean[][]; // [statIndex][playerIndex]
}

interface SorcererGrade {
  label: string;
  color: string;
  border: string;
}

function getSorcererGrade(score: number, maxScore: number, isWinner: boolean): SorcererGrade {
  if (isWinner) {
    return { label: 'SPECIAL GRADE', color: 'text-indigo-400', border: 'border-indigo-500/60' };
  }
  const ratio = maxScore > 0 ? score / maxScore : 0;
  if (ratio >= 0.9)
    return { label: 'GRADE 1', color: 'text-yellow-400', border: 'border-yellow-500/60' };
  if (ratio >= 0.78)
    return { label: 'GRADE 2', color: 'text-emerald-400', border: 'border-emerald-500/60' };
  if (ratio >= 0.65)
    return { label: 'GRADE 3', color: 'text-sky-400', border: 'border-sky-500/60' };
  return { label: 'GRADE 4', color: 'text-zinc-400', border: 'border-zinc-600' };
}

export function ClashReport({ players, scores, rounds, blackFlashes }: ClashReportProps) {
  const maxScore = Math.max(...scores);
  const winnerIdxs = players.map((_, i) => i).filter((i) => scores[i] === maxScore);

  const decisiveRounds = rounds.filter((r) => r.winners.length === 1);
  const blowout = decisiveRounds.length
    ? decisiveRounds.reduce((best, r) => (r.margin > best.margin ? r : best), decisiveRounds[0])
    : null;
  const closestCall = decisiveRounds.length
    ? decisiveRounds.reduce((best, r) => (r.margin < best.margin ? r : best), decisiveRounds[0])
    : null;
  const totalBlackFlashes = blackFlashes.flat().filter(Boolean).length;

  const roundsWonBy = (playerIdx: number) =>
    rounds.filter((r) => r.winners.length === 1 && r.winners[0] === playerIdx).length;

  const playerBlackFlashes = (playerIdx: number) =>
    blackFlashes.reduce((n, row) => n + (row[playerIdx] ? 1 : 0), 0);

  const mvpPick = (playerIdx: number) => {
    let best: { name: string; value: number } | null = null;
    for (const r of rounds) {
      const entity = characters.find((c) => c.id === players[playerIdx][r.stat]);
      if (entity && (best === null || r.values[playerIdx] > best.value)) {
        best = { name: entity.name, value: r.values[playerIdx] };
      }
    }
    return best;
  };

  const playerName = (i: number) => players[i].playerName || `Player ${i + 1}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-5xl bg-[#0a0a0a] border border-zinc-800 rounded-2xl p-6 md:p-10 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.08)_0%,transparent_60%)] pointer-events-none"></div>

      {/* Header */}
      <div className="relative z-10 flex items-center gap-4 mb-8">
        <div className="w-1.5 h-8 bg-indigo-500"></div>
        <div>
          <h3 className="text-xl md:text-2xl font-black font-display text-white uppercase tracking-widest flex items-center gap-3">
            Post-Clash Analysis
            <ScrollText size={20} className="text-indigo-400" />
          </h3>
          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.3em] mt-1">
            Jujutsu Intelligence // Combat Debrief
          </p>
        </div>
      </div>

      {/* Highlights Strip */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
        <div className="bg-black/40 border border-red-900/40 rounded-xl p-4 flex flex-col gap-1">
          <div className="flex items-center gap-2 text-red-500 font-mono text-[9px] font-black uppercase tracking-[0.25em]">
            <Crown size={12} />
            Biggest Blowout
          </div>
          {blowout ? (
            <>
              <p className="text-white font-display font-black text-lg uppercase tracking-wide truncate">
                {blowout.statName}
              </p>
              <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest">
                {playerName(blowout.winners[0])}{' '}
                <span className="text-red-500 font-bold">+{blowout.margin}</span>
              </p>
            </>
          ) : (
            <p className="text-zinc-600 font-mono text-[10px] uppercase tracking-widest">
              No decisive rounds
            </p>
          )}
        </div>

        <div className="bg-black/40 border border-yellow-900/40 rounded-xl p-4 flex flex-col gap-1">
          <div className="flex items-center gap-2 text-yellow-500 font-mono text-[9px] font-black uppercase tracking-[0.25em]">
            <Target size={12} />
            Closest Call
          </div>
          {closestCall ? (
            <>
              <p className="text-white font-display font-black text-lg uppercase tracking-wide truncate">
                {closestCall.statName}
              </p>
              <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest">
                {playerName(closestCall.winners[0])}{' '}
                <span className="text-yellow-500 font-bold">+{closestCall.margin}</span>
              </p>
            </>
          ) : (
            <p className="text-zinc-600 font-mono text-[10px] uppercase tracking-widest">
              No decisive rounds
            </p>
          )}
        </div>

        <div className="bg-black/40 border border-zinc-800 rounded-xl p-4 flex flex-col gap-1">
          <div className="flex items-center gap-2 text-red-400 font-mono text-[9px] font-black uppercase tracking-[0.25em]">
            <Zap size={12} />
            Black Flashes
          </div>
          <p className="text-white font-display font-black text-lg uppercase tracking-wide">
            {totalBlackFlashes}
          </p>
          <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest">
            Sparks of black this clash
          </p>
        </div>
      </div>

      {/* Sorcerer Evaluations */}
      <div
        className="relative z-10 grid gap-3 mb-8"
        style={{ gridTemplateColumns: `repeat(${Math.min(players.length, 4)}, minmax(0, 1fr))` }}
      >
        {players.map((p, i) => {
          const grade = getSorcererGrade(scores[i], maxScore, winnerIdxs.includes(i));
          const mvp = mvpPick(i);
          const flashes = playerBlackFlashes(i);
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 + i * 0.1 }}
              className={`bg-black/40 border ${grade.border} rounded-xl p-4 flex flex-col items-center text-center gap-2 min-w-0`}
            >
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest truncate max-w-full">
                {playerName(i)}
              </span>
              <span
                className={`font-display font-black text-sm md:text-base uppercase tracking-widest ${grade.color}`}
              >
                {grade.label}
              </span>
              <div className="w-full border-t border-zinc-800/60 pt-2 space-y-1.5">
                <div className="flex justify-between font-mono text-[9px] uppercase tracking-widest">
                  <span className="text-zinc-600">Score</span>
                  <span className="text-white font-bold">{scores[i]}</span>
                </div>
                <div className="flex justify-between font-mono text-[9px] uppercase tracking-widest">
                  <span className="text-zinc-600">Rounds Won</span>
                  <span className="text-white font-bold">
                    {roundsWonBy(i)}/{rounds.length}
                  </span>
                </div>
                <div className="flex justify-between font-mono text-[9px] uppercase tracking-widest">
                  <span className="text-zinc-600">Black Flash</span>
                  <span className={`font-bold ${flashes > 0 ? 'text-red-500' : 'text-zinc-600'}`}>
                    {flashes}
                  </span>
                </div>
                <div className="flex justify-between items-center font-mono text-[9px] uppercase tracking-widest gap-2">
                  <span className="text-zinc-600 shrink-0">MVP Pick</span>
                  <span
                    className="text-indigo-300 font-bold truncate"
                    title={mvp ? `${mvp.name} (${mvp.value})` : undefined}
                  >
                    {mvp ? mvp.name : '—'}
                  </span>
                </div>
              </div>
              {winnerIdxs.includes(i) && (
                <div className="flex items-center gap-1 text-yellow-500 font-mono text-[8px] font-black uppercase tracking-[0.25em]">
                  <Award size={10} />
                  Clash Victor
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Round Ledger */}
      <div className="relative z-10 border-t border-zinc-800/60 pt-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity size={14} className="text-indigo-400" />
          <h4 className="text-xs font-black font-display text-white uppercase tracking-widest">
            Round Ledger
          </h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
          {rounds.map((r) => {
            const solo = r.winners.length === 1;
            return (
              <div
                key={r.stat}
                className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg border font-mono text-[9px] uppercase tracking-widest ${
                  solo ? 'bg-zinc-950/60 border-zinc-800' : 'bg-black/30 border-zinc-900'
                }`}
              >
                <span className="text-zinc-500 truncate">{r.statName}</span>
                <span className={`shrink-0 font-bold ${solo ? 'text-white' : 'text-zinc-700'}`}>
                  {solo ? `${playerName(r.winners[0])} +${r.margin}` : 'DRAW'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
