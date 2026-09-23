import type { Party, PartyServer, Connection, Request } from 'partykit/server';
import { characters, statsList, statCategoryMap, bindingVows } from '../src/data/characters';

const VALID_STATS = new Set<string>(statsList);

export default class DraftServer implements PartyServer {
  constructor(readonly party: Party) {}

  state: any = {
    players: [],
    bans: [],
    partialBans: [],
    lockedBans: [],
    readyToClash: [],
    roundWins: [],
    draftPhase: 'setup',
    draftMode: 'normal',
    activePlayer: 0,
    currentRollingStat: null,
    timeLeft: 30,
    maxPlayers: 2,
    gambleConfig: { totalRolls: 50, luckyRolls: 10, rollsPerStat: 5 },
    gambleStates: {},
    readyToReset: [],
    extraTurns: {}, // Track extra turns per player
  };

  timerInterval: ReturnType<typeof setInterval> | null = null;
  autoTransitionTimeout: ReturnType<typeof setTimeout> | null = null;

  // Server-side legality for draft picks and gamble results — clients send
  // arbitrary stat/entityId pairs, so anything that isn't a real in-category,
  // unbanned entity (or an empowered vow id for the pact slot) is dropped.
  isLegalSelection(pIndex: number, stat: string, entityId: string): boolean {
    const draft = this.state.players[pIndex]?.draft;
    if (!draft || typeof stat !== 'string' || !VALID_STATS.has(stat)) return false;
    if (typeof entityId !== 'string') return false;
    if (stat === 'bindingVow') {
      const empowered =
        draft.specialPower1 === 'binding-vow' || draft.specialPower2 === 'binding-vow';
      return empowered && bindingVows.some((v) => v.id === entityId);
    }
    const entity = characters.find((c) => c.id === entityId);
    if (!entity) return false;
    const banned: string[] = this.state.bans.flat().filter(Boolean);
    if (banned.includes(entityId)) return false;
    const category = (statCategoryMap as Record<string, string>)[stat] || 'character';
    return entity.category === category;
  }

  onRequest(req: any): any {
    return new Response('JJK Stat Clash Party Server is online.', { status: 200 });
  }

  onConnect(conn: Connection, ctx: any) {
    if (this.state.players.length >= 8) {
      conn.send(JSON.stringify({ type: 'error', message: 'Lobby is full' }));
      return;
    }

    if (this.state.draftPhase !== 'setup') {
      // Reconnection logic: find player by ID
      const existingPlayer = this.state.players.find((p: any) => p.id === conn.id);
      if (existingPlayer) {
        this.broadcastState();
        return;
      }
      conn.send(JSON.stringify({ type: 'error', message: 'Game already in progress' }));
      return;
    }

    const playerNum = this.state.players.length + 1;
    this.state.players.push({
      id: conn.id,
      draft: this.getEmptyDraft(),
      name: `Player ${playerNum}`,
    });
    this.state.bans.push([]);
    this.state.partialBans.push([null, null]);
    this.state.lockedBans.push(false);
    this.state.readyToClash.push(false);
    this.state.roundWins.push(0);
    this.state.gambleStates[conn.id] = {
      remainingTotal: this.state.gambleConfig.totalRolls,
      remainingLucky: this.state.gambleConfig.luckyRolls,
      statRolls: {},
    };
    this.state.readyToReset.push(false);

    this.broadcastState();
  }

  onClose(conn: Connection) {
    if (this.state.draftPhase === 'setup') {
      const index = this.state.players.findIndex((p: any) => p.id === conn.id);
      if (index !== -1) {
        this.state.players.splice(index, 1);
        this.state.bans.splice(index, 1);
        this.state.partialBans.splice(index, 1);
        this.state.lockedBans.splice(index, 1);
        this.state.readyToClash.splice(index, 1);
        this.state.roundWins.splice(index, 1);
        this.state.readyToReset.splice(index, 1);
        delete this.state.gambleStates[conn.id];
        this.broadcastState();
      }
    }
  }

  onMessage(message: string, sender: Connection) {
    const data = JSON.parse(message);
    const pIndex = this.state.players.findIndex((p: any) => p.id === sender.id);
    const isHost = pIndex === 0;

    if (data.type === 'setMaxPlayers' && isHost) {
      this.state.maxPlayers = data.maxPlayers;
      this.broadcastState();
    }

    if (data.type === 'setDraftMode' && isHost) {
      this.state.draftMode = data.mode;
      this.broadcastState();
    }

    if (data.type === 'updateGambleConfig' && isHost) {
      // Clamp host-supplied limits — unbounded values enable roll-flood abuse.
      const clamp = (v: any, lo: number, hi: number) =>
        Math.min(hi, Math.max(lo, Math.floor(Number(v) || lo)));
      const config = {
        totalRolls: clamp(data.config?.totalRolls, 1, 500),
        luckyRolls: clamp(data.config?.luckyRolls, 0, 200),
        rollsPerStat: clamp(data.config?.rollsPerStat, 1, 50),
      };
      this.state.gambleConfig = config;
      this.state.players.forEach((p: any) => {
        this.state.gambleStates[p.id] = {
          remainingTotal: config.totalRolls,
          remainingLucky: config.luckyRolls,
          statRolls: {},
        };
      });
      this.broadcastState();
    }

    if (data.type === 'startGame' && isHost) {
      if (this.state.players.length >= 2) {
        this.state.draftPhase = 'banning';
        this.broadcastState();
      }
    }

    if (data.type === 'updateName' && pIndex !== -1) {
      this.state.players[pIndex].name = data.name;
      this.broadcastState();
    }

    if (data.type === 'updateBans' && pIndex !== -1 && !this.state.lockedBans[pIndex]) {
      this.state.partialBans[pIndex] = data.bans;
      this.broadcastState();
    }

    if (data.type === 'submitBans' && pIndex !== -1 && !this.state.lockedBans[pIndex]) {
      const otherLockedBans: string[] = [];
      this.state.bans.forEach((b: string[], i: number) => {
        if (i !== pIndex && this.state.lockedBans[i]) {
          otherLockedBans.push(...b);
        }
      });

      const validBans = data.bans.filter((b: string) => b && !otherLockedBans.includes(b));
      if (validBans.length < 2) {
        sender.send(JSON.stringify({ type: 'banConflict', conflictingBans: otherLockedBans }));
        return;
      }

      this.state.bans[pIndex] = data.bans;
      this.state.partialBans[pIndex] = data.bans;
      this.state.lockedBans[pIndex] = true;

      const allBanned = this.state.lockedBans.every((locked: boolean) => locked);
      if (allBanned && this.state.players.length >= 2) {
        this.state.draftPhase = 'drafting';
        this.state.activePlayer = 0;
        this.startTimer();
      }
      this.broadcastState();
    }

    if (
      data.type === 'selectDraft' &&
      pIndex === this.state.activePlayer &&
      this.state.draftPhase === 'drafting'
    ) {
      if (!data.entityId) return;
      if (this.state.players[pIndex].draft[data.stat]) return;
      if (!this.isLegalSelection(pIndex, data.stat, data.entityId)) return;
      this.state.players[pIndex].draft[data.stat] = data.entityId;

      // Check for extra turn from Binding Vow
      if (data.stat === 'bindingVow' && data.entityId) {
        this.state.extraTurns[sender.id] = (this.state.extraTurns[sender.id] || 0) + 1;
      }
      this.advanceTurn();
    }

    if (
      data.type === 'finishGambleTurn' &&
      pIndex === this.state.activePlayer &&
      this.state.draftPhase === 'drafting'
    ) {
      if (this.timerInterval) clearInterval(this.timerInterval);
      if (this.autoTransitionTimeout) clearTimeout(this.autoTransitionTimeout);
      this.state.currentRollingStat = null;
      this.advanceTurn();
    }

    if (
      data.type === 'gambleRoll' &&
      pIndex === this.state.activePlayer &&
      this.state.draftPhase === 'drafting' &&
      this.state.draftMode === 'gamble'
    ) {
      const gState = this.state.gambleStates[sender.id];
      if (!gState) return;

      const isLucky = data.isLucky;
      const stat = data.stat;

      // Restrict to rolling one stat per turn
      if (this.state.currentRollingStat && this.state.currentRollingStat !== stat) {
        return;
      }

      if (!this.isLegalSelection(pIndex, stat, data.entityId)) return;

      if (stat !== 'bindingVow' && gState.remainingTotal <= 0) return;
      if (isLucky && gState.remainingLucky <= 0) return;
      if ((gState.statRolls[stat] || 0) >= this.state.gambleConfig.rollsPerStat) return;

      this.state.currentRollingStat = stat;
      this.state.gambleStates[sender.id] = {
        ...gState,
        remainingTotal: stat === 'bindingVow' ? gState.remainingTotal : gState.remainingTotal - 1,
        remainingLucky: isLucky ? gState.remainingLucky - 1 : gState.remainingLucky,
        statRolls: { ...gState.statRolls, [stat]: (gState.statRolls[stat] || 0) + 1 },
      };
      this.state.players[pIndex].draft[stat] = data.entityId;

      // Special case: if they roll a Binding Vow, they get an extra turn but it ends this current "roll turn"
      if (stat === 'bindingVow' && data.entityId) {
        this.state.extraTurns[sender.id] = (this.state.extraTurns[sender.id] || 0) + 1;
        this.state.currentRollingStat = null;
        this.advanceTurn();
      } else {
        this.broadcastState();
      }
    }

    if (
      data.type === 'readyToClash' &&
      pIndex !== -1 &&
      this.state.draftPhase === 'draftComplete'
    ) {
      this.state.readyToClash[pIndex] = true;
      if (this.state.readyToClash.every((r: boolean) => r)) {
        this.state.draftPhase = 'transitioning';
        if (this.timerInterval) clearInterval(this.timerInterval);
        if (this.autoTransitionTimeout) clearTimeout(this.autoTransitionTimeout);
      }
      this.broadcastState();
    }

    if (data.type === 'startComparing' && isHost && this.state.draftPhase === 'transitioning') {
      this.state.draftPhase = 'comparing';
      this.broadcastState();
    }

    if (data.type === 'recordWin' && isHost) {
      data.winners.forEach((wIdx: number) => {
        if (this.state.roundWins[wIdx] !== undefined) {
          this.state.roundWins[wIdx]++;
        }
      });
      this.broadcastState();
    }

    if (data.type === 'readyToReset' && pIndex !== -1 && this.state.draftPhase === 'comparing') {
      this.state.readyToReset[pIndex] = true;
      if (this.state.readyToReset.every((r: boolean) => r)) {
        this.state.draftPhase = 'setup';
        this.state.players.forEach((p: any) => {
          p.draft = this.getEmptyDraft();
        });
        this.state.bans = this.state.players.map(() => []);
        this.state.partialBans = this.state.players.map(() => [null, null]);
        this.state.lockedBans = this.state.players.map(() => false);
        this.state.readyToClash = this.state.players.map(() => false);
        this.state.readyToReset = this.state.players.map(() => false);
        this.state.players.forEach((p: any) => {
          this.state.gambleStates[p.id] = {
            remainingTotal: this.state.gambleConfig.totalRolls,
            remainingLucky: this.state.gambleConfig.luckyRolls,
            statRolls: {},
          };
        });
        this.state.extraTurns = {};
      }
      this.broadcastState();
    }

    if (data.type === 'resetGame' && isHost) {
      this.state.draftPhase = 'setup';
      this.state.players.forEach((p: any) => {
        p.draft = this.getEmptyDraft();
      });
      this.state.bans = this.state.players.map(() => []);
      this.state.partialBans = this.state.players.map(() => [null, null]);
      this.state.lockedBans = this.state.players.map(() => false);
      this.state.readyToClash = this.state.players.map(() => false);
      this.state.players.forEach((p: any) => {
        this.state.gambleStates[p.id] = {
          remainingTotal: this.state.gambleConfig.totalRolls,
          remainingLucky: this.state.gambleConfig.luckyRolls,
          statRolls: {},
        };
      });
      this.state.extraTurns = {};
      this.broadcastState();
    }
  }

  getEmptyDraft() {
    const statsList = [
      'strength',
      'speed',
      'durability',
      'ce',
      'ct',
      'body',
      'tool',
      'specialPower1',
      'specialPower2',
      'shikigami',
      'domainExpansion',
      'iq',
    ];
    const draft: any = {};
    statsList.forEach((s) => (draft[s] = null));
    draft.bindingVow = null;
    return draft;
  }

  startTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.state.timeLeft = 30;
    this.timerInterval = setInterval(() => {
      this.state.timeLeft--;
      if (this.state.timeLeft <= 0) {
        this.autoPickForActivePlayer();
      } else {
        this.party.broadcast(JSON.stringify({ type: 'timer', timeLeft: this.state.timeLeft }));
      }
    }, 1000);
  }

  advanceTurn() {
    // bindingVow is optional — it never gates completion or forces a turn.
    const statsList = [
      'strength',
      'speed',
      'durability',
      'ce',
      'ct',
      'body',
      'tool',
      'specialPower1',
      'specialPower2',
      'shikigami',
      'domainExpansion',
      'iq',
    ];

    // Clear the current timer before doing anything
    if (this.timerInterval) clearInterval(this.timerInterval);

    const allFull = this.state.players.every((p: any) =>
      statsList.every((s) => p.draft[s] !== null)
    );

    if (allFull) {
      this.state.draftPhase = 'draftComplete';
      this.broadcastState();

      this.autoTransitionTimeout = setTimeout(() => {
        if (this.state.draftPhase === 'draftComplete') {
          this.state.draftPhase = 'transitioning';
          this.broadcastState();
        }
      }, 15000);
      return;
    }

    // Check for extra turns
    const currentPlayerId = this.state.players[this.state.activePlayer].id;
    if (this.state.extraTurns[currentPlayerId] > 0) {
      this.state.extraTurns[currentPlayerId]--;
      this.state.currentRollingStat = null;
      this.state.timeLeft = 30;
      this.broadcastState();
      this.startTimer();
      return;
    }

    let nextPlayer = (this.state.activePlayer + 1) % this.state.players.length;
    let attempts = 0;
    while (attempts < this.state.players.length) {
      const hasEmpty = statsList.some((s) => this.state.players[nextPlayer].draft[s] === null);
      if (hasEmpty) break;
      nextPlayer = (nextPlayer + 1) % this.state.players.length;
      attempts++;
    }

    this.state.activePlayer = nextPlayer;
    this.state.currentRollingStat = null;
    this.state.timeLeft = 30;
    this.broadcastState();
    this.startTimer();
  }

  autoPickForActivePlayer() {
    // Stop the timer immediately to prevent double-fires
    if (this.timerInterval) clearInterval(this.timerInterval);

    const pIndex = this.state.activePlayer;
    const player = this.state.players[pIndex];
    if (!player) return this.advanceTurn();

    const statsList = [
      'strength',
      'speed',
      'durability',
      'ce',
      'ct',
      'body',
      'tool',
      'specialPower1',
      'specialPower2',
      'shikigami',
      'domainExpansion',
      'iq',
    ];

    // NOTE: These arrays must be kept in sync with src/data/characters.ts
    // When adding new entities, update both files to prevent auto-pick from selecting invalid entities
    const categoryToIds: Record<string, string[]> = {
      character: [
        'gojo',
        'sukuna',
        'yuta',
        'geto',
        'kenjaku',
        'yuki',
        'yuji',
        'megumi',
        'nobara',
        'maki',
        'toge',
        'panda',
        'hakari',
        'kirara',
        'todo',
        'kamo',
        'momo',
        'mai',
        'miwa',
        'mechamaru',
        'nanami',
        'yaga',
        'shoko',
        'utahime',
        'gakuganji',
        'kusakabe',
        'ino',
        'meimei',
        'uiui',
        'ijichi',
        'nitta-akari',
        'nitta-arata',
        'naobito',
        'naoya',
        'ogi',
        'jinichi',
        'kashimo',
        'higuruma',
        'takaba',
        'ryu',
        'uro',
        'kurourushi',
        'charles',
        'reggie',
        'hazenoki',
        'remi',
        'angel',
        'yorozu',
        'daido',
        'miyo',
        'dhruv',
        'amai',
        'haba',
        'hanyu',
        'mahito',
        'jogo',
        'hanami',
        'dagon',
        'choso',
        'eso',
        'kechizu',
        'uraume',
        'toji',
        'rika',
        'miguel',
        'larue',
        'riko',
        'kuroi',
        'haibara',
        'tengen',
        'junpei',
        'juzo',
        'haruta',
        'awasaka',
        'ogami',
        'saki',
        'kaito',
        'kensuke',
        'dabura',
        'modulo-yuji',
        'human',
      ],
      tool: [
        'playful-cloud',
        'inverted-spear',
        'split-soul-katana',
        'executioners-sword',
        'kamutoke',
        'hiten',
        'prison-realm',
        'slaughter-demon',
        'dragon-bone',
        'chain-of-a-thousand-miles',
        'black-rope',
        'sukunas-fingers',
        'sword-of-extermination',
        'festering-life-sword',
        'nanamis-blunt-sword',
        'g-warstaff',
        'hand-sword',
        'miwas-katana',
        'mei-meis-axe',
        'jet-black-sword',
      ],
      domainExpansion: [
        'unlimited-void',
        'malevolent-shrine',
        'modulo-yuji-domain',
        'authentic-mutual-love',
        'womb-profusion',
        'chimera-shadow-garden',
        'deadly-sentencing',
        'self-embodiment-of-perfection',
        'coffin-of-the-iron-mountain',
        'ceremonial-sea-of-light',
        'horizon-of-the-captivating-skandha',
        'threefold-affliction',
        'time-cell-moon-palace',
        'idle-death-gamble',
        'graveyard-domain',
        'shadow-realm',
        'empty-barrier',
      ],
      cursedTechnique: [
        'copy',
        'straw-doll',
        'mythical-beast-amber',
        'boogie-woogie',
        'ratio-technique',
        'jacobs-ladder',
        'limitless',
        'shrine',
        'ten-shadows',
        'cursed-spirit-manipulation',
        'star-rage',
        'blood-manipulation',
        'idle-transfiguration',
        'disaster-flames',
        'disaster-plants',
        'disaster-tides',
        'sky-manipulation',
        'ice-formation',
        'creation',
        'puppet-manipulation',
        'black-bird-manipulation',
        'projection-sorcery',
        'antigravity-system',
        'miracles',
        'love-rendezvous',
        'contract-reproduction',
        'comedian',
        'bird-strike',
        'soul-resonance',
        'seance-technique',
        'inverse',
        'auspicious-beasts',
      ],
      shikigami: [
        'mahoraga',
        'agito',
        'judgeman',
        'nue',
        'divine-dogs',
        'rika-shikigami',
        'garuda',
        'great-serpent',
        'demon-dogs',
        'toad',
        'max-elephant',
        'rabbit-escape',
        'round-deer',
        'piercing-ox',
        'moon-dregs',
        'rainbow-dragon',
        'kuchisake-onna',
        'dhruv-giant',
        'gorilla-core',
        'triceratops-core',
        'smallpox-deity',
        'ganesha-curse',
        'crows',
      ],
      specialPower: [
        'six-eyes',
        'rct',
        'black-flash',
        'heavenly-restriction',
        'simple-domain',
        'falling-blossom-emotion',
        'hollow-wicker-basket',
        'domain-amplification',
        'cursed-energy-trait',
        'the-bath',
        'cursed-realm',
        'death-painting-womb',
        'cursed-corpse-core',
        'supreme-martial-arts',
        'soul-perception',
        'maximum-output',
        'new-shadow-style',
        'curtain-mastery',
        'soul-info-perception',
      ],
    };

    const statCategoryMap: Record<string, string> = {
      strength: 'character',
      speed: 'character',
      durability: 'character',
      ce: 'character',
      body: 'character',
      iq: 'character',
      ct: 'cursedTechnique',
      tool: 'tool',
      specialPower1: 'specialPower',
      specialPower2: 'specialPower',
      shikigami: 'shikigami',
      domainExpansion: 'domainExpansion',
    };

    const allBans = this.state.bans.flat().filter(Boolean);
    const takenIds = new Set<string>();
    this.state.players.forEach((p: any) => {
      Object.values(p.draft).forEach((v: any) => {
        if (typeof v === 'string') takenIds.add(v);
      });
    });

    if (this.state.draftMode === 'gamble') {
      const gState = this.state.gambleStates[player.id];
      const rolledStat = this.state.currentRollingStat;

      if (rolledStat && player.draft[rolledStat] !== null) {
        // Player already rolled a stat this turn and has a value — just accept it
        this.state.currentRollingStat = null;
        this.advanceTurn();
      } else {
        // Player hasn't rolled anything this turn — auto-roll a random stat for them
        const emptyStats = statsList.filter((s) => player.draft[s] === null);
        if (emptyStats.length === 0) {
          this.state.currentRollingStat = null;
          return this.advanceTurn();
        }
        const statToResolve = emptyStats[Math.floor(Math.random() * emptyStats.length)];

        const category = statCategoryMap[statToResolve];
        const validIds = categoryToIds[category] || categoryToIds['character'];

        let availableIds = validIds.filter(
          (id) => !allBans.includes(id) && (id === 'binding-vow' || !takenIds.has(id))
        );
        if (availableIds.length === 0) availableIds = validIds;

        let randomId = availableIds[Math.floor(Math.random() * availableIds.length)];
        if (category === 'character' && Math.random() < 0.3) {
          if (availableIds.includes('human')) randomId = 'human';
        }

        this.state.gambleStates[player.id] = {
          ...gState,
          remainingTotal: gState.remainingTotal - 1,
          statRolls: {
            ...gState.statRolls,
            [statToResolve]: (gState.statRolls[statToResolve] || 0) + 1,
          },
        };
        player.draft[statToResolve] = randomId;
        this.state.currentRollingStat = null;
        this.advanceTurn();
      }
    } else {
      const emptyStats = statsList.filter((s) => player.draft[s] === null);
      if (emptyStats.length === 0) return this.advanceTurn();
      const randomStat = emptyStats[Math.floor(Math.random() * emptyStats.length)];

      const category = statCategoryMap[randomStat];
      const validIds = categoryToIds[category] || categoryToIds['character'];

      let availableIds = validIds.filter(
        (id) => !allBans.includes(id) && (id === 'binding-vow' || !takenIds.has(id))
      );
      if (availableIds.length === 0) availableIds = validIds;

      let randomId = availableIds[Math.floor(Math.random() * availableIds.length)];
      if (category === 'character' && Math.random() < 0.3) {
        if (availableIds.includes('human')) randomId = 'human';
      }

      player.draft[randomStat] = randomId;
      this.advanceTurn();
    }
  }

  broadcastState() {
    this.party.broadcast(JSON.stringify({ type: 'sync', state: this.state }));
  }
}
