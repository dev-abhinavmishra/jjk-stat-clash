import { characters, pairings, statsList, statCategoryMap, Pairing } from '../data/characters';
import { DraftSelection, bindingVows } from '../components/PlayerCard';

type Difficulty = 'easy' | 'medium' | 'hard';

// Helper to calculate raw power of an entity
export const getEntityPower = (entity: any, statToFill: string) => {
  let pwr = 50; // Base
  if (entity.statValue) pwr = entity.statValue;
  else if (entity.stats && entity.stats[statToFill]) pwr = entity.stats[statToFill];

  const grade = entity.grade || '';
  if (grade === 'Calamity') pwr += 200;
  else if (grade === 'Mythic') pwr += 100;
  else if (grade === 'Legendary') pwr += 50;
  else if (grade === 'Epic') pwr += 30;
  else if (grade === 'Rare') pwr += 15;
  return pwr;
};

// Calculate total stat bonus weight for a synergy
export const getSynergyWeight = (pairing: Pairing) => {
  let weight = Object.values(pairing.bonusStats).reduce((acc: number, val) => acc + (val || 0), 0);
  if (pairing.isSecret) weight *= 2.5; // Secret synergies are massive priorities
  return weight;
};

// Check if a synergy can still be completed
const canCompleteSynergy = (
  pairing: Pairing,
  currentDraftIds: string[],
  takenIds: Set<string>,
  roundsRemaining: number
) => {
  const missing = pairing.entities.filter((id) => !currentDraftIds.includes(id));
  if (missing.length > roundsRemaining) return false;
  // Check if any missing piece is already taken by someone else
  if (missing.some((id) => takenIds.has(id))) return false;
  return true;
};

// Evaluate the board to find missing synergy pieces
const getSynergyTargets = (
  botDraft: DraftSelection,
  takenIds: Set<string>,
  roundsRemaining: number
) => {
  const currentIds = Object.values(botDraft).filter(Boolean) as string[];
  const targets: { id: string; weight: number }[] = [];

  // Sort pairings by their impact/weight
  const sortedPairings = [...pairings].sort((a, b) => getSynergyWeight(b) - getSynergyWeight(a));

  sortedPairings.forEach((pairing) => {
    const weight = getSynergyWeight(pairing);
    const matchCount = pairing.entities.filter((e) => currentIds.includes(e)).length;

    // If we have at least 1 piece or if it's a very high value synergy and we can still finish it
    if (matchCount > 0 || weight > 100) {
      if (canCompleteSynergy(pairing, currentIds, takenIds, roundsRemaining)) {
        pairing.entities.forEach((e) => {
          if (!currentIds.includes(e)) {
            targets.push({ id: e, weight: weight * (matchCount + 1) });
          }
        });
      }
    }
  });

  return targets.sort((a, b) => b.weight - a.weight);
};

export const getBotPick = (
  difficulty: Difficulty,
  botDraft: DraftSelection,
  playerDrafts: DraftSelection[],
  globalBans: string[],
  takenIds: Set<string>
): { stat: string; id: string } | null => {
  // Find empty stats in the bot's draft
  const emptyStats = statsList.filter((stat) => !botDraft[stat]);
  if (emptyStats.length === 0) return null;
  const roundsRemaining = emptyStats.length;

  // For each empty stat, gather available entities
  const availablePerStat: Record<string, any[]> = {};
  const vowEmpowered =
    botDraft.specialPower1 === 'binding-vow' || botDraft.specialPower2 === 'binding-vow';
  emptyStats.forEach((stat) => {
    if (stat === 'bindingVow') {
      // The pact slot takes pact entities only, and only while empowered.
      availablePerStat[stat] = vowEmpowered ? bindingVows : [];
      return;
    }
    const category = statCategoryMap[stat] || 'character';
    availablePerStat[stat] = characters.filter((entity) => {
      if (entity.category !== category) return false;
      if (globalBans.includes(entity.id)) return false;
      if (entity.id !== 'binding-vow' && takenIds.has(entity.id)) return false;
      if ('prerequisite' in entity && entity.prerequisite) {
        if (!Object.values(botDraft).includes(entity.prerequisite)) return false;
      }
      if (entity.id === 'sukunas-fingers') {
        const hasVessel = Object.values(botDraft).some((id) => {
          if (!id) return false;
          if (['yuji', 'modulo-yuji', 'sukuna', 'megumi'].includes(id as string)) return true;
          const char = characters.find((c) => c.id === id);
          if (
            char &&
            char.loreDescription &&
            (char.loreDescription.includes('Curse') || char.loreDescription.includes('curses'))
          )
            return true;
          return false;
        });
        if (!hasVessel) return false;
      }
      return true;
    });
  });

  // EASY: Completely random
  if (difficulty === 'easy') {
    const randomStat = emptyStats[Math.floor(Math.random() * emptyStats.length)];
    const options = availablePerStat[randomStat];
    if (options.length === 0) return null;
    const pick = options[Math.floor(Math.random() * options.length)];
    return { stat: randomStat, id: pick.id };
  }

  // MEDIUM: Balanced approach (Power + some Synergies)
  if (difficulty === 'medium') {
    const synergyTargets = getSynergyTargets(botDraft, takenIds, roundsRemaining);

    // 1. Try to complete/start a synergy (50% chance if available)
    if (synergyTargets.length > 0 && Math.random() > 0.5) {
      const topTarget = synergyTargets[0];
      for (const stat of emptyStats) {
        const options = availablePerStat[stat];
        const match = options.find((opt) => opt.id === topTarget.id);
        if (match) return { stat, id: match.id };
      }
    }

    // 2. Fallback to highest power
    let bestPick: { stat: string; id: string; power: number } | null = null;
    for (const stat of emptyStats) {
      for (const entity of availablePerStat[stat]) {
        const power = getEntityPower(entity, stat);
        if (!bestPick || power > bestPick.power) {
          bestPick = { stat, id: entity.id, power };
        }
      }
    }
    return bestPick ? { stat: bestPick.stat, id: bestPick.id } : null;
  }

  // HARD: Elite Synergy, Aggressive Hate-Drafting & Zero-Randomness Scarcity
  if (difficulty === 'hard') {
    const synergyTargets = getSynergyTargets(botDraft, takenIds, roundsRemaining);
    const currentIds = Object.values(botDraft).filter(Boolean) as string[];

    // 1. Aggressive Synergy completion/initiation (no threshold, pursue all)
    if (synergyTargets.length > 0) {
      for (const target of synergyTargets) {
        for (const stat of emptyStats) {
          const options = availablePerStat[stat];
          const match = options.find((opt) => opt.id === target.id);
          if (match && target.weight > 50) return { stat, id: match.id };
        }
      }
    }

    // 2. Binding Vow Optimization (always pick best, not random)
    if (emptyStats.includes('bindingVow') && vowEmpowered) {
      const options = availablePerStat['bindingVow'] || [];
      if (options.length > 0) {
        const vowGrades = ['Mythic', 'Legendary', 'Epic', 'Rare'];
        for (const grade of vowGrades) {
          const match = options.find((o) => o.grade === grade);
          if (match) return { stat: 'bindingVow', id: match.id };
        }
        return { stat: 'bindingVow', id: options[0].id };
      }
    }

    // 3. Aggressive Hate Drafting (Block Player's key synergies early)
    const opponentTargets: { id: string; weight: number }[] = [];
    playerDrafts.forEach((draft) => {
      const oppIds = Object.values(draft).filter(Boolean) as string[];
      pairings.forEach((pairing) => {
        const weight = getSynergyWeight(pairing);
        const matchCount = pairing.entities.filter((e) => oppIds.includes(e)).length;
        if (
          matchCount >= pairing.entities.length - 2 ||
          (pairing.isSecret && matchCount >= 1) ||
          matchCount >= 1
        ) {
          pairing.entities.forEach((e) => {
            if (!oppIds.includes(e) && !takenIds.has(e)) {
              opponentTargets.push({ id: e, weight: weight * 4 });
            }
          });
        }
      });
    });

    if (opponentTargets.length > 0) {
      const bestBlocks = opponentTargets.sort((a, b) => b.weight - a.weight).slice(0, 5);
      for (const block of bestBlocks) {
        for (const stat of emptyStats) {
          const options = availablePerStat[stat];
          const match = options.find((opt) => opt.id === block.id);
          if (match && block.weight > 80) return { stat, id: match.id };
        }
      }
    }

    // 4. Scarcity Scoring (no randomness, full strategic evaluation)
    let bestStrategicPick: { stat: string; id: string; score: number } | null = null;

    for (const stat of emptyStats) {
      const options = [...availablePerStat[stat]].sort(
        (a, b) => getEntityPower(b, stat) - getEntityPower(a, stat)
      );
      if (options.length === 0) continue;

      const bestAvailable = options[0];
      let score = getEntityPower(bestAvailable, stat);

      const highTierCount = options.filter(
        (opt) => opt.grade === 'Calamity' || opt.grade === 'Mythic' || opt.grade === 'Legendary'
      ).length;
      if (highTierCount <= 1) score += 120;
      else if (highTierCount <= 2) score += 60;

      if (bestAvailable.grade === 'Calamity') score += 200;
      else if (bestAvailable.grade === 'Mythic') score += 100;

      pairings.forEach((p) => {
        if (p.isSecret && p.entities.includes(bestAvailable.id)) {
          score += 100;
        }
        if (p.entities.includes(bestAvailable.id) && !p.isSecret) {
          score += 30;
        }
      });

      if (!bestStrategicPick || score > bestStrategicPick.score) {
        bestStrategicPick = { stat, id: bestAvailable.id, score };
      }
    }

    return bestStrategicPick ? { stat: bestStrategicPick.stat, id: bestStrategicPick.id } : null;
  }

  return null;
};
