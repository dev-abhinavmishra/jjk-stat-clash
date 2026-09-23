import { DraftSelection, bindingVows } from '../components/PlayerCard';
import { characters, statsList } from '../data/characters';

// The vow pact slot is optional — completion checks must not require it.
const requiredStats = statsList.filter((s) => s !== 'bindingVow');

export interface ValidationError {
  type:
    | 'empty_slot'
    | 'duplicate_selection'
    | 'invalid_entity'
    | 'invalid_ban'
    | 'invalid_player_count'
    | 'incomplete_draft'
    | 'prerequisite_missing'
    | 'invalid_state';
  message: string;
  details?: any;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Validates that all player drafts are complete (no empty slots)
 */
export const validateDraftCompletion = (players: DraftSelection[]): ValidationResult => {
  const errors: ValidationError[] = [];

  players.forEach((draft, playerIndex) => {
    requiredStats.forEach((stat) => {
      if (!draft[stat]) {
        errors.push({
          type: 'empty_slot',
          message: `Player ${playerIndex + 1}: ${stat} is empty. All slots must be filled before clash.`,
          details: { playerIndex, stat },
        });
      }
    });
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Calculates draft progress for UI feedback
 */
export const calculateDraftProgress = (
  players: DraftSelection[]
): {
  totalStats: number;
  filledStats: number;
  completedPlayers: number;
} => {
  const totalStats = players.length * requiredStats.length;
  let filledStats = 0;
  let completedPlayers = 0;

  players.forEach((draft) => {
    let filled = 0;
    requiredStats.forEach((stat) => {
      if (draft[stat]) filled++;
    });

    if (filled === requiredStats.length) {
      completedPlayers++;
    }

    filledStats += filled;
  });

  return {
    totalStats,
    filledStats,
    completedPlayers,
  };
};

/**
 * Validates draft with detailed feedback for UI
 */
export const validateDraftWithFeedback = (players: DraftSelection[]): ValidationResult => {
  const errors: ValidationError[] = [];

  // Check for missing selections
  players.forEach((draft, playerIndex) => {
    requiredStats.forEach((stat) => {
      if (!draft[stat]) {
        errors.push({
          type: 'empty_slot',
          message: `Player ${playerIndex + 1}: ${stat} is not selected`,
          details: { playerIndex, stat },
        });
      }
    });
  });

  // Check for duplicates (except binding vows)
  const selectedIds = new Map<string, number[]>();

  players.forEach((draft, playerIndex) => {
    Object.entries(draft).forEach(([stat, entityId]) => {
      if (!entityId || stat === 'bindingVow') return;
      if (!selectedIds.has(entityId)) {
        selectedIds.set(entityId, []);
      }
      selectedIds.get(entityId)!.push(playerIndex);
    });
  });

  selectedIds.forEach((playerIndices, entityId) => {
    if (playerIndices.length > 1) {
      const entity = characters.find((c) => c.id === entityId);
      const entityName = entity?.name || entityId;
      errors.push({
        type: 'duplicate_selection',
        message: `${entityName} is selected by multiple players`,
        details: { entityId, playerIndices },
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Gets a summary of draft status for UI feedback
 */
export const getDraftSummary = (
  players: DraftSelection[]
): {
  totalPlayers: number;
  completedPlayers: number;
  totalStats: number;
  filledStats: number;
  incompletePlayers: number[];
} => {
  const totalPlayers = players.length;
  let completedPlayers = 0;
  let totalStats = totalPlayers * requiredStats.length;
  let filledStats = 0;
  const incompletePlayers: number[] = [];

  players.forEach((draft, playerIndex) => {
    let filled = 0;
    requiredStats.forEach((stat) => {
      if (draft[stat]) filled++;
    });

    if (filled === requiredStats.length) {
      completedPlayers++;
    } else if (filled > 0) {
      incompletePlayers.push(playerIndex);
    }

    filledStats += filled;
  });

  return {
    totalPlayers,
    completedPlayers,
    totalStats,
    filledStats,
    incompletePlayers,
  };
};

/**
 * Gets detailed draft status for UI feedback
 */
export const getDetailedDraftStatus = (
  players: DraftSelection[]
): {
  incompletePlayers: number[];
  playerStats: Array<{ playerIndex: number; filled: number; total: number }>;
} => {
  const incompletePlayers: number[] = [];
  const playerStats: Array<{ playerIndex: number; filled: number; total: number }> = [];

  players.forEach((draft, playerIndex) => {
    let filled = 0;
    requiredStats.forEach((stat) => {
      if (draft[stat]) filled++;
    });

    playerStats.push({
      playerIndex,
      filled,
      total: requiredStats.length,
    });

    if (filled < requiredStats.length) {
      incompletePlayers.push(playerIndex);
    }
  });

  return {
    incompletePlayers,
    playerStats,
  };
};

/**
 * Gets list of specific missing stats for each player
 */
export const getMissingStatsPerPlayer = (
  players: DraftSelection[]
): Array<{
  playerIndex: number;
  missingStats: string[];
}> => {
  return players.map((draft, playerIndex) => {
    const missingStats = requiredStats.filter((stat) => !draft[stat]);
    return {
      playerIndex,
      missingStats,
    };
  });
};

/**
 * Validates that no entity is selected by multiple players (except binding vows)
 */
export const validateNoDuplicateSelections = (players: DraftSelection[]): ValidationResult => {
  const errors: ValidationError[] = [];
  const selectedIds = new Map<string, number[]>();

  players.forEach((draft, playerIndex) => {
    Object.entries(draft).forEach(([stat, entityId]) => {
      if (!entityId || stat === 'bindingVow') return;
      if (!selectedIds.has(entityId)) {
        selectedIds.set(entityId, []);
      }
      selectedIds.get(entityId)!.push(playerIndex);
    });
  });

  selectedIds.forEach((playerIndices, entityId) => {
    if (playerIndices.length > 1) {
      const entity = characters.find((c) => c.id === entityId);
      const entityName = entity?.name || entityId;
      errors.push({
        type: 'duplicate_selection',
        message: `${entityName} is selected by multiple players. Each entity can only be selected once.`,
        details: { entityId, playerIndices },
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validates that all bans are valid entities
 */
export const validateBans = (bans: string[][]): ValidationResult => {
  const errors: ValidationError[] = [];
  const validIds = new Set(characters.map((c) => c.id));

  bans.forEach((playerBans, playerIndex) => {
    playerBans.forEach((banId) => {
      if (!validIds.has(banId)) {
        errors.push({
          type: 'invalid_ban',
          message: `Invalid entity banned by player ${playerIndex + 1}: ${banId}`,
          details: { playerIndex, banId },
        });
      }
    });
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validates that the number of players is within acceptable range (2-8)
 */
export const validatePlayerCount = (players: DraftSelection[]): ValidationResult => {
  const errors: ValidationError[] = [];

  if (players.length < 2) {
    errors.push({
      type: 'invalid_player_count',
      message: 'At least 2 players are required.',
      details: { count: players.length },
    });
  }

  if (players.length > 8) {
    errors.push({
      type: 'invalid_player_count',
      message: 'Maximum 8 players are allowed.',
      details: { count: players.length },
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validates all entities in a player's draft exist
 */
export const validateDraftEntities = (
  draft: DraftSelection,
  playerIndex: number
): ValidationResult => {
  const errors: ValidationError[] = [];
  const validIds = new Set([...characters.map((c) => c.id), ...bindingVows.map((v) => v.id)]);

  Object.entries(draft).forEach(([stat, entityId]) => {
    if (entityId && !validIds.has(entityId)) {
      errors.push({
        type: 'invalid_entity',
        message: `Player ${playerIndex + 1}: Invalid entity selected for ${stat}`,
        details: { playerIndex, stat, entityId },
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validates entity prerequisites are met
 */
export const validatePrerequisites = (
  draft: DraftSelection,
  playerIndex: number
): ValidationResult => {
  const errors: ValidationError[] = [];

  Object.entries(draft).forEach(([stat, entityId]) => {
    if (!entityId) return;

    const entity = characters.find((c) => c.id === entityId);
    if (!entity || !('prerequisite' in entity) || !entity.prerequisite) return;

    const hasPrerequisite = Object.values(draft).includes(entity.prerequisite);
    if (!hasPrerequisite) {
      const prerequisiteEntity = characters.find((c) => c.id === entity.prerequisite);
      const prerequisiteName = prerequisiteEntity?.name || entity.prerequisite;
      errors.push({
        type: 'prerequisite_missing',
        message: `Player ${playerIndex + 1}: ${entity.name} requires ${prerequisiteName} to be selected first.`,
        details: { playerIndex, entityId, prerequisite: entity.prerequisite },
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Comprehensive validation of draft state
 */
export const validateDraftState = (players: DraftSelection[], phase: string): ValidationResult => {
  const allErrors: ValidationError[] = [];

  // Always validate player count
  const playerCountResult = validatePlayerCount(players);
  allErrors.push(...playerCountResult.errors);

  // Validate each player's draft
  players.forEach((draft, playerIndex) => {
    const entityResult = validateDraftEntities(draft, playerIndex);
    allErrors.push(...entityResult.errors);

    const prereqResult = validatePrerequisites(draft, playerIndex);
    allErrors.push(...prereqResult.errors);
  });

  // If in drafting phase or comparing, validate no duplicates
  if (phase === 'drafting' || phase === 'comparing') {
    const dupResult = validateNoDuplicateSelections(players);
    allErrors.push(...dupResult.errors);
  }

  // If in comparing phase, validate all slots are filled
  if (phase === 'comparing') {
    const completionResult = validateDraftCompletion(players);
    allErrors.push(...completionResult.errors);
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  };
};

/**
 * Validates that a single entity selection is valid (no duplicates, exists, etc)
 */
export const validateEntitySelection = (
  entityId: string,
  stat: string,
  players: DraftSelection[],
  playerIndex: number,
  bans: string[][]
): ValidationResult => {
  const errors: ValidationError[] = [];

  // Check if entity exists (pact ids resolve against the vow list)
  const entity =
    characters.find((c) => c.id === entityId) || bindingVows.find((v) => v.id === entityId);
  if (!entity) {
    errors.push({
      type: 'invalid_entity',
      message: 'Invalid entity selected.',
    });
    return { isValid: false, errors };
  }

  // Check if entity is banned globally
  const globalBans = bans.flat().filter(Boolean);
  if (globalBans.includes(entityId)) {
    errors.push({
      type: 'invalid_ban',
      message: `${entity.name} has been banned and cannot be selected.`,
      details: { entityId },
    });
  }

  // Check if entity is already selected by another player (except binding vows)
  if (stat !== 'bindingVow') {
    const isSelected = players.some((draft, idx) => {
      if (idx === playerIndex) return false;
      return Object.values(draft).includes(entityId);
    });

    if (isSelected) {
      errors.push({
        type: 'duplicate_selection',
        message: `${entity.name} is already selected by another player.`,
        details: { entityId },
      });
    }
  }

  // Check prerequisites
  if ('prerequisite' in entity && entity.prerequisite) {
    const currentDraft = players[playerIndex];
    const hasPrerequisite = Object.values(currentDraft).includes(entity.prerequisite);
    if (!hasPrerequisite) {
      const prerequisiteEntity = characters.find((c) => c.id === entity.prerequisite);
      const prerequisiteName = prerequisiteEntity?.name || entity.prerequisite;
      errors.push({
        type: 'prerequisite_missing',
        message: `${entity.name} requires ${prerequisiteName} first.`,
        details: { entityId, prerequisite: entity.prerequisite },
      });
    }
  }

  // Special case: Sukuna's Fingers
  if (entityId === 'sukunas-fingers') {
    const currentDraft = players[playerIndex];
    const hasVessel = Object.values(currentDraft).some((id) => {
      if (!id) return false;
      if (['yuji', 'modulo-yuji', 'sukuna', 'megumi'].includes(id)) return true;
      const char = characters.find((c) => c.id === id);
      if (
        char &&
        char.loreDescription &&
        (char.loreDescription.includes('Curse') || char.loreDescription.includes('curses'))
      ) {
        return true;
      }
      return false;
    });

    if (!hasVessel) {
      errors.push({
        type: 'prerequisite_missing',
        message: "Sukuna's Fingers requires a vessel (Yuji, Sukuna, Megumi, or a curse user).",
        details: { entityId },
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validates that a ban is valid
 */
export const validateBanSelection = (
  entityId: string,
  playerIndex: number,
  bans: string[][]
): ValidationResult => {
  const errors: ValidationError[] = [];

  // Check if entity exists
  const entity = characters.find((c) => c.id === entityId);
  if (!entity) {
    errors.push({
      type: 'invalid_entity',
      message: 'Invalid entity to ban.',
    });
    return { isValid: false, errors };
  }

  // Check if already banned by this player
  if (bans[playerIndex].includes(entityId)) {
    errors.push({
      type: 'duplicate_selection',
      message: `${entity.name} is already banned by you.`,
      details: { entityId },
    });
  }

  // Check if already banned globally
  const globalBans = bans.flat().filter(Boolean);
  if (globalBans.includes(entityId)) {
    errors.push({
      type: 'duplicate_selection',
      message: `${entity.name} is already banned.`,
      details: { entityId },
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
