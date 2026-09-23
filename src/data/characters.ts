export type EntityCategory =
  | 'character'
  | 'tool'
  | 'shikigami'
  | 'specialPower'
  | 'domainExpansion'
  | 'cursedTechnique'
  | 'bindingVow';

export interface CharacterStats {
  strength: number;
  speed: number;
  durability: number;
  ce: number;
  body: number;
  iq: number;
}

export interface Character {
  id: string;
  name: string;
  category: 'character';
  stats: CharacterStats;
  flavorText?: string;
  signatureMove?: string;
  loreDescription?: string;
  grade?: string;
}

export interface Ability {
  id: string;
  name: string;
  category: 'tool' | 'shikigami' | 'specialPower' | 'domainExpansion' | 'cursedTechnique';
  statValue: number;
  prerequisite?: string;
  flavorText?: string;
  loreDescription?: string;
  grade?: string;
}

export interface Pairing {
  id: string;
  name: string;
  entities: string[];
  bonusStats: Partial<Record<string, number>>;
  description: string;
  isSecret?: boolean;
}

export type Entity = Character | Ability;

export const characters: Entity[] = [
  {
    id: 'gojo',
    name: 'Satoru Gojo',
    category: 'character',
    stats: { strength: 105, speed: 118, durability: 100, ce: 120, body: 105, iq: 115 },
    flavorText: 'Throughout Heaven and Earth, I alone am the honored one.',
    signatureMove: 'Hollow Purple',
    loreDescription:
      'The pinnacle of modern jujutsu. Born with both the Six Eyes and the Limitless technique, altering the balance of the world upon his birth.',
    grade: 'Calamity',
  },
  {
    id: 'sukuna',
    name: 'Ryomen Sukuna',
    category: 'character',
    stats: { strength: 118, speed: 115, durability: 118, ce: 120, body: 120, iq: 120 },
    flavorText: 'Know your place, fool.',
    signatureMove: 'Malevolent Shrine',
    loreDescription:
      'An imaginary demon with four arms and two faces. The undisputed King of Curses whose very fingers are classified as Special Grade objects.',
    grade: 'Calamity',
  },
  {
    id: 'yuta',
    name: 'Yuta Okkotsu',
    category: 'character',
    stats: { strength: 103, speed: 101, durability: 100, ce: 119, body: 97, iq: 104 },
    signatureMove: 'Pure Love',
    loreDescription:
      'A prodigy burdened by the Queen of Curses. Possesses boundless cursed energy and the ability to unconditionally copy cursed techniques.',
    grade: 'Legendary',
  },
  {
    id: 'geto',
    name: 'Suguru Geto',
    category: 'character',
    stats: { strength: 102, speed: 96, durability: 96, ce: 108, body: 102, iq: 108 },
    signatureMove: 'Uzumaki',
    loreDescription:
      'A fallen sorcerer who commands an army of curses. His ideology shifted after witnessing the ugly truth of non-sorcerers.',
    grade: 'Legendary',
  },
  {
    id: 'kenjaku',
    name: 'Kenjaku',
    category: 'character',
    stats: { strength: 102, speed: 102, durability: 102, ce: 114, body: 102, iq: 120 },
    signatureMove: 'Anti-Gravity System',
    loreDescription:
      'An ancient, parasitic sorcerer who hops between bodies by transplanting his brain. The mastermind behind the Culling Game.',
    grade: 'Legendary',
  },
  {
    id: 'yuki',
    name: 'Yuki Tsukumo',
    category: 'character',
    stats: { strength: 119, speed: 106, durability: 113, ce: 109, body: 110, iq: 112 },
    signatureMove: 'Black Hole',
    loreDescription:
      'A free-spirited Special Grade who seeks to eradicate cursed energy entirely. Her strikes carry the overwhelming mass of a star.',
    grade: 'Legendary',
  },
  {
    id: 'yuji',
    name: 'Yuji Itadori',
    category: 'character',
    stats: { strength: 112, speed: 107, durability: 113, ce: 98, body: 118, iq: 92 },
    signatureMove: 'Divergent Fist',
    loreDescription:
      'A boy with superhuman physical abilities who became the vessel for the King of Curses. A martial arts prodigy favored by the sparks of Black Flash.',
    grade: 'Legendary',
  },
  {
    id: 'megumi',
    name: 'Megumi Fushiguro',
    category: 'character',
    stats: { strength: 84, speed: 90, durability: 84, ce: 90, body: 84, iq: 108 },
    signatureMove: 'Divine General Mahoraga',
    loreDescription:
      "The heir to the Zenin clan's prized technique. A tactical genius who uses shadows to summon powerful shikigami and store weapons.",
    grade: 'Epic',
  },
  {
    id: 'nobara',
    name: 'Nobara Kugisaki',
    category: 'character',
    stats: { strength: 72, speed: 78, durability: 72, ce: 84, body: 72, iq: 96 },
    signatureMove: 'Resonance',
    loreDescription:
      'A brash and confident sorcerer from the countryside. Her technique allows her to strike the soul directly through a sympathetic connection.',
    grade: 'Rare',
  },
  {
    id: 'maki',
    name: 'Maki Zenin',
    category: 'character',
    stats: { strength: 115, speed: 115, durability: 112, ce: 0, body: 120, iq: 103 },
    signatureMove: 'Split Soul Katana',
    loreDescription:
      'Rejected by her clan for lacking cursed energy, she honed her body and weapons mastery to become a demon of pure physical prowess.',
    grade: 'Epic',
  },
  {
    id: 'toge',
    name: 'Toge Inumaki',
    category: 'character',
    stats: { strength: 78, speed: 84, durability: 78, ce: 90, body: 78, iq: 96 },
    signatureMove: 'Cursed Speech',
    loreDescription:
      'A descendant of the Inumaki clan who speaks only in rice ball ingredients to avoid accidentally cursing others.',
    grade: 'Epic',
  },
  {
    id: 'panda',
    name: 'Panda',
    category: 'character',
    stats: { strength: 96, speed: 90, durability: 102, ce: 90, body: 108, iq: 90 },
    signatureMove: 'Gorilla Mode',
    loreDescription:
      'Not an actual panda, but an Abrupt Mutated Cursed Corpse created by Principal Yaga. He houses three distinct cores.',
    grade: 'Epic',
  },
  {
    id: 'hakari',
    name: 'Kinji Hakari',
    category: 'character',
    stats: { strength: 102, speed: 102, durability: 120, ce: 120, body: 102, iq: 96 },
    signatureMove: 'Idle Death Gamble',
    loreDescription:
      'A suspended third-year student who runs an underground fight club. When he hits a jackpot, his cursed energy becomes infinite.',
    grade: 'Legendary',
  },
  {
    id: 'kirara',
    name: 'Kirara Hoshi',
    category: 'character',
    stats: { strength: 72, speed: 78, durability: 72, ce: 84, body: 72, iq: 102 },
    signatureMove: 'Love Rendezvous',
    loreDescription:
      "Hakari's partner. Their technique marks targets with stars from the Southern Cross, forcing them to approach in a specific order.",
    grade: 'Rare',
  },
  {
    id: 'todo',
    name: 'Aoi Todo',
    category: 'character',
    stats: { strength: 102, speed: 96, durability: 102, ce: 96, body: 102, iq: 114 },
    signatureMove: 'Boogie Woogie',
    loreDescription:
      'An eccentric powerhouse who loves tall women with big butts. His Boogie Woogie technique makes him a terrifyingly unpredictable fighter.',
    grade: 'Legendary',
  },
  {
    id: 'kamo',
    name: 'Noritoshi Kamo',
    category: 'character',
    stats: { strength: 84, speed: 90, durability: 84, ce: 90, body: 84, iq: 102 },
    signatureMove: 'Piercing Blood',
    loreDescription:
      'The heir to the Kamo clan. He utilizes Blood Manipulation to enhance his physical abilities and control the trajectory of his arrows.',
    grade: 'Epic',
  },
  {
    id: 'momo',
    name: 'Momo Nishimiya',
    category: 'character',
    stats: { strength: 60, speed: 90, durability: 60, ce: 78, body: 60, iq: 84 },
    signatureMove: 'Wind Scythe',
    loreDescription:
      'A third-year student at Kyoto Jujutsu High. She uses a broom for flight and wind-based attacks.',
    grade: 'Rare',
  },
  {
    id: 'mai',
    name: 'Mai Zenin',
    category: 'character',
    stats: { strength: 66, speed: 72, durability: 66, ce: 72, body: 66, iq: 90 },
    signatureMove: 'Creation',
    loreDescription:
      "Maki's twin sister. She uses a revolver and can create a single bullet per day using her Creation technique.",
    grade: 'Uncommon',
  },
  {
    id: 'miwa',
    name: 'Kasumi Miwa',
    category: 'character',
    stats: { strength: 72, speed: 78, durability: 72, ce: 78, body: 72, iq: 84 },
    signatureMove: 'Batto Sword Drawing',
    loreDescription:
      "A self-proclaimed 'useless' student from Kyoto. She uses New Shadow Style sword techniques.",
    grade: 'Uncommon',
  },
  {
    id: 'mechamaru',
    name: 'Kokichi Muta',
    category: 'character',
    stats: { strength: 108, speed: 102, durability: 108, ce: 114, body: 48, iq: 102 },
    signatureMove: 'Ultra Cannon',
    loreDescription:
      'Born with a Heavenly Restriction that destroyed his body but granted him vast cursed energy and range, allowing him to pilot Mechamaru.',
    grade: 'Epic',
  },
  {
    id: 'nanami',
    name: 'Kento Nanami',
    category: 'character',
    stats: { strength: 96, speed: 90, durability: 96, ce: 96, body: 96, iq: 108 },
    signatureMove: 'Ratio Technique: Collapse',
    loreDescription:
      'A former salaryman who returned to jujutsu. He forcibly creates weak points on his targets and grows stronger when working overtime.',
    grade: 'Epic',
  },
  {
    id: 'yaga',
    name: 'Masamichi Yaga',
    category: 'character',
    stats: { strength: 84, speed: 78, durability: 84, ce: 96, body: 84, iq: 102 },
    signatureMove: 'Cursed Corpse Creation',
    loreDescription:
      'The principal of Tokyo Jujutsu High. A master of creating independent, self-sustaining cursed corpses.',
    grade: 'Epic',
  },
  {
    id: 'shoko',
    name: 'Shoko Ieiri',
    category: 'character',
    stats: { strength: 48, speed: 60, durability: 48, ce: 96, body: 48, iq: 102 },
    signatureMove: 'Reverse Cursed Technique',
    loreDescription:
      'The primary doctor at Tokyo Jujutsu High. One of the rare few capable of outputting positive energy to heal others.',
    grade: 'Uncommon',
  },
  {
    id: 'utahime',
    name: 'Utahime Iori',
    category: 'character',
    stats: { strength: 60, speed: 66, durability: 60, ce: 90, body: 60, iq: 96 },
    signatureMove: 'Solo Forbidden Area',
    loreDescription:
      'A teacher at Kyoto Jujutsu High. Her technique amplifies the cursed energy reserves and output of any sorcerer in range.',
    grade: 'Epic',
  },
  {
    id: 'gakuganji',
    name: 'Yoshinobu Gakuganji',
    category: 'character',
    stats: { strength: 78, speed: 72, durability: 78, ce: 96, body: 72, iq: 102 },
    signatureMove: 'Amplifier Melody',
    loreDescription:
      'The principal of Kyoto Jujutsu High. He uses his own body as an amplifier to blast cursed energy through an electric guitar.',
    grade: 'Epic',
  },
  {
    id: 'kusakabe',
    name: 'Atsuya Kusakabe',
    category: 'character',
    stats: { strength: 90, speed: 96, durability: 90, ce: 96, body: 90, iq: 114 },
    signatureMove: 'Evening Moon Sword Drawing',
    loreDescription:
      'A teacher at Tokyo Jujutsu High. He has no innate technique but is a master of New Shadow Style and Simple Domain.',
    grade: 'Epic',
  },
  {
    id: 'ino',
    name: 'Takuma Ino',
    category: 'character',
    stats: { strength: 84, speed: 84, durability: 84, ce: 90, body: 84, iq: 96 },
    signatureMove: 'Auspicious Beast Summon',
    loreDescription:
      "Nanami's protégé. He fights using a ski mask to channel the abilities of auspicious beasts.",
    grade: 'Rare',
  },
  {
    id: 'meimei',
    name: 'Mei Mei',
    category: 'character',
    stats: { strength: 102, speed: 102, durability: 96, ce: 102, body: 102, iq: 108 },
    signatureMove: 'Bird Strike',
    loreDescription:
      'A freelance sorcerer who only works for money. She wields a massive battle axe and controls crows.',
    grade: 'Legendary',
  },
  {
    id: 'uiui',
    name: 'Ui Ui',
    category: 'character',
    stats: { strength: 60, speed: 102, durability: 60, ce: 96, body: 60, iq: 102 },
    signatureMove: 'Teleportation',
    loreDescription:
      "Mei Mei's younger brother. He possesses a powerful teleportation technique and acts as her support.",
    grade: 'Rare',
  },
  {
    id: 'ijichi',
    name: 'Kiyotaka Ijichi',
    category: 'character',
    stats: { strength: 36, speed: 48, durability: 36, ce: 48, body: 36, iq: 90 },
    signatureMove: 'Curtain',
    loreDescription:
      'An auxiliary manager at Tokyo Jujutsu High. He handles logistics, barriers, and driving.',
    grade: 'Common',
  },
  {
    id: 'nitta-akari',
    name: 'Akari Nitta',
    category: 'character',
    stats: { strength: 48, speed: 54, durability: 48, ce: 54, body: 48, iq: 84 },
    signatureMove: 'Logistics',
    loreDescription: 'An auxiliary manager who assists the students on their missions.',
    grade: 'Common',
  },
  {
    id: 'nitta-arata',
    name: 'Arata Nitta',
    category: 'character',
    stats: { strength: 60, speed: 66, durability: 60, ce: 72, body: 60, iq: 90 },
    signatureMove: 'Painkiller',
    loreDescription:
      'A first-year student from Kyoto. His technique stops existing injuries from worsening.',
    grade: 'Uncommon',
  },
  {
    id: 'naobito',
    name: 'Naobito Zenin',
    category: 'character',
    stats: { strength: 96, speed: 114, durability: 96, ce: 102, body: 96, iq: 108 },
    signatureMove: 'Projection Sorcery',
    loreDescription:
      'The 26th head of the Zenin clan. His Projection Sorcery makes him the fastest sorcerer alive, second only to Gojo.',
    grade: 'Mythic',
  },
  {
    id: 'naoya',
    name: 'Naoya Zenin',
    category: 'character',
    stats: { strength: 96, speed: 114, durability: 96, ce: 102, body: 96, iq: 102 },
    signatureMove: 'Projection Sorcery',
    loreDescription:
      "Naobito's arrogant son. He inherited Projection Sorcery and fights with a concealed blade.",
    grade: 'Legendary',
  },
  {
    id: 'ogi',
    name: 'Ogi Zenin',
    category: 'character',
    stats: { strength: 90, speed: 96, durability: 90, ce: 96, body: 90, iq: 96 },
    signatureMove: 'Blazing Courage',
    loreDescription:
      "Maki and Mai's father. A master swordsman who imbues his blade with blazing cursed energy.",
    grade: 'Epic',
  },
  {
    id: 'jinichi',
    name: 'Jinichi Zenin',
    category: 'character',
    stats: { strength: 102, speed: 90, durability: 102, ce: 96, body: 102, iq: 90 },
    signatureMove: 'Missile Fists',
    loreDescription:
      'A high-ranking member of the Zenin clan. His technique summons massive, disembodied fists to crush opponents.',
    grade: 'Epic',
  },
  {
    id: 'kashimo',
    name: 'Hajime Kashimo',
    category: 'character',
    stats: { strength: 108, speed: 116, durability: 102, ce: 108, body: 114, iq: 102 },
    signatureMove: 'Mythical Beast Amber',
    loreDescription:
      'The God of Lightning from 400 years ago. His cursed energy has the properties of electricity, making his strikes unblockable.',
    grade: 'Legendary',
  },
  {
    id: 'higuruma',
    name: 'Hiromi Higuruma',
    category: 'character',
    stats: { strength: 96, speed: 96, durability: 96, ce: 102, body: 96, iq: 114 },
    signatureMove: 'Deadly Sentencing',
    loreDescription:
      'A genius defense attorney who awakened his technique during the Culling Game. He mastered domain expansion and domain amplification in mere days.',
    grade: 'Epic',
  },
  {
    id: 'takaba',
    name: 'Fumihiko Takaba',
    category: 'character',
    stats: { strength: 90, speed: 90, durability: 114, ce: 102, body: 96, iq: 72 },
    signatureMove: 'Comedian',
    loreDescription:
      'A failed comedian whose technique alters reality to match whatever he finds funny. He is completely unaware of his own power.',
    grade: 'Epic',
  },
  {
    id: 'ryu',
    name: 'Ryu Ishigori',
    category: 'character',
    stats: { strength: 108, speed: 102, durability: 108, ce: 114, body: 108, iq: 96 },
    signatureMove: 'Granité Blast',
    loreDescription:
      'A sorcerer from the past with the highest cursed energy output in history. He fires devastating blasts from his pompadour.',
    grade: 'Legendary',
  },
  {
    id: 'uro',
    name: 'Takako Uro',
    category: 'character',
    stats: { strength: 96, speed: 108, durability: 96, ce: 102, body: 96, iq: 102 },
    signatureMove: 'Thin Ice Breaker',
    loreDescription:
      'A former assassin from the Heian era. She manipulates the sky as if it were a tangible surface, bending space to redirect attacks.',
    grade: 'Epic',
  },
  {
    id: 'kurourushi',
    name: 'Kurourushi',
    category: 'character',
    stats: { strength: 102, speed: 102, durability: 102, ce: 102, body: 102, iq: 84 },
    signatureMove: 'Festering Life Sword',
    loreDescription:
      'A cockroach cursed spirit that feeds on humans. It wields the Festering Life Sword and commands endless swarms of insects.',
    grade: 'Epic',
  },
  {
    id: 'charles',
    name: 'Charles Bernard',
    category: 'character',
    stats: { strength: 84, speed: 90, durability: 84, ce: 90, body: 84, iq: 90 },
    signatureMove: 'G-Warstaff',
    loreDescription:
      "An aspiring manga artist from France. His technique allows him to see into his opponent's future by drawing their blood.",
    grade: 'Rare',
  },
  {
    id: 'reggie',
    name: 'Reggie Star',
    category: 'character',
    stats: { strength: 90, speed: 96, durability: 90, ce: 96, body: 90, iq: 108 },
    signatureMove: 'Contract Reproduction',
    loreDescription:
      'A cunning incarnated sorcerer who uses receipts to recreate the items or services printed on them.',
    grade: 'Epic',
  },
  {
    id: 'hazenoki',
    name: 'Iori Hazenoki',
    category: 'character',
    stats: { strength: 84, speed: 90, durability: 90, ce: 96, body: 90, iq: 96 },
    signatureMove: 'Explosive Flesh',
    loreDescription:
      'An incarnated sorcerer who uses his own body parts, like teeth and eyes, as explosive projectiles.',
    grade: 'Epic',
  },
  {
    id: 'remi',
    name: 'Remi',
    category: 'character',
    stats: { strength: 60, speed: 72, durability: 60, ce: 72, body: 60, iq: 78 },
    signatureMove: 'Scorpion Hair',
    loreDescription:
      'An awakened sorcerer in the Culling Game who uses her scorpion-like hair as a weapon.',
    grade: 'Uncommon',
  },
  {
    id: 'angel',
    name: 'Hana Kurusu',
    category: 'character',
    stats: { strength: 78, speed: 96, durability: 78, ce: 108, body: 78, iq: 102 },
    signatureMove: "Jacob's Ladder",
    loreDescription:
      "Co-exists with the 'Angel', a sorcerer from the Heian era whose technique can extinguish any other cursed technique.",
    grade: 'Epic',
  },
  {
    id: 'yorozu',
    name: 'Yorozu',
    category: 'character',
    stats: { strength: 108, speed: 108, durability: 114, ce: 108, body: 108, iq: 102 },
    signatureMove: 'Perfect Sphere',
    loreDescription:
      'A Heian era sorcerer obsessed with Sukuna. She uses Creation to form liquid metal and insect armor.',
    grade: 'Mythic',
  },
  {
    id: 'daido',
    name: 'Hagane Daido',
    category: 'character',
    stats: { strength: 102, speed: 102, durability: 96, ce: 0, body: 102, iq: 102 },
    signatureMove: 'Master Swordsmanship',
    loreDescription:
      'A nameless swordsman incarnated into the modern era. He possesses no cursed energy but has unparalleled mastery of the blade.',
    grade: 'Rare',
  },
  {
    id: 'miyo',
    name: 'Rokujushi Miyo',
    category: 'character',
    stats: { strength: 96, speed: 96, durability: 96, ce: 90, body: 96, iq: 90 },
    signatureMove: 'Sumo Simple Domain',
    loreDescription:
      'A sumo enthusiast who traps opponents in a Simple Domain where only sumo wrestling matters.',
    grade: 'Epic',
  },
  {
    id: 'dhruv',
    name: 'Dhruv Lakdawalla',
    category: 'character',
    stats: { strength: 90, speed: 90, durability: 90, ce: 102, body: 90, iq: 96 },
    signatureMove: 'Domain Tracks',
    loreDescription:
      'A veteran of the second subjugation of the archipelago. He commands massive, autonomous shikigami whose tracks form a domain.',
    grade: 'Epic',
  },
  {
    id: 'amai',
    name: 'Rin Amai',
    category: 'character',
    stats: { strength: 48, speed: 60, durability: 48, ce: 60, body: 48, iq: 72 },
    signatureMove: 'Sugar Creation',
    loreDescription: 'A participant in the Culling Game who can produce sugary substances.',
    grade: 'Common',
  },
  {
    id: 'haba',
    name: 'Haba',
    category: 'character',
    stats: { strength: 78, speed: 84, durability: 78, ce: 78, body: 78, iq: 72 },
    signatureMove: 'Propeller Head',
    loreDescription: 'A Culling Game player who uses a propeller on his head to fly and attack.',
    grade: 'Rare',
  },
  {
    id: 'hanyu',
    name: 'Hanyu',
    category: 'character',
    stats: { strength: 72, speed: 90, durability: 72, ce: 78, body: 72, iq: 72 },
    signatureMove: 'Jet Hair',
    loreDescription: 'A Culling Game player who transforms her hair into a jet engine.',
    grade: 'Uncommon',
  },
  {
    id: 'mahito',
    name: 'Mahito',
    category: 'character',
    stats: { strength: 96, speed: 102, durability: 114, ce: 102, body: 114, iq: 102 },
    signatureMove: 'Idle Transfiguration',
    loreDescription:
      "A curse born from humanity's hatred of each other. He can reshape souls with a touch, making him nearly immune to physical damage.",
    grade: 'Legendary',
  },
  {
    id: 'jogo',
    name: 'Jogo',
    category: 'character',
    stats: { strength: 90, speed: 114, durability: 72, ce: 108, body: 84, iq: 96 },
    signatureMove: 'Maximum Meteor',
    loreDescription:
      'A curse born from the fear of earth and volcanoes. Extremely fast and capable of incinerating entire city blocks in an instant.',
    grade: 'Legendary',
  },
  {
    id: 'hanami',
    name: 'Hanami',
    category: 'character',
    stats: { strength: 102, speed: 96, durability: 114, ce: 102, body: 108, iq: 90 },
    signatureMove: 'Cursed Buds',
    loreDescription:
      'A curse born from the fear of nature. Possesses incredible durability and the ability to drain life force from the surrounding environment.',
    grade: 'Legendary',
  },
  {
    id: 'dagon',
    name: 'Dagon',
    category: 'character',
    stats: { strength: 96, speed: 90, durability: 108, ce: 108, body: 102, iq: 90 },
    signatureMove: 'Death Swarm',
    loreDescription:
      'A curse born from the fear of the ocean. Commands vast amounts of water and can summon endless swarms of carnivorous sea life.',
    grade: 'Legendary',
  },
  {
    id: 'choso',
    name: 'Choso',
    category: 'character',
    stats: { strength: 102, speed: 102, durability: 102, ce: 102, body: 102, iq: 102 },
    signatureMove: 'Piercing Blood',
    loreDescription:
      'The eldest of the Death Painting Wombs. A master of Blood Manipulation who fights with fierce devotion to his younger brothers.',
    grade: 'Legendary',
  },
  {
    id: 'eso',
    name: 'Eso',
    category: 'character',
    stats: { strength: 90, speed: 96, durability: 90, ce: 96, body: 90, iq: 90 },
    signatureMove: 'Rot Technique: Maximum Wing King',
    loreDescription:
      'One of the Death Painting Wombs. He wields the Rot Technique, poisoning those who are stained by his blood.',
    grade: 'Epic',
  },
  {
    id: 'kechizu',
    name: 'Kechizu',
    category: 'character',
    stats: { strength: 84, speed: 84, durability: 84, ce: 90, body: 84, iq: 78 },
    signatureMove: 'Rot Technique',
    loreDescription:
      'The youngest of the active Death Painting Wombs. He assists his brother Eso by spitting corrosive blood.',
    grade: 'Rare',
  },
  {
    id: 'uraume',
    name: 'Uraume',
    category: 'character',
    stats: { strength: 96, speed: 102, durability: 96, ce: 108, body: 96, iq: 102 },
    signatureMove: 'Frost Calm',
    loreDescription:
      "Sukuna's loyal servant from the Heian era. A master of Ice Formation, capable of freezing entire city blocks instantly.",
    grade: 'Mythic',
  },
  {
    id: 'toji',
    name: 'Toji Fushiguro',
    category: 'character',
    stats: { strength: 116, speed: 115, durability: 113, ce: 0, body: 120, iq: 113 },
    signatureMove: 'Inverted Spear of Heaven',
    loreDescription:
      'The Sorcerer Killer. A man who completely discarded cursed energy in exchange for physical abilities that rival the strongest sorcerers.',
    grade: 'Mythic',
  },
  {
    id: 'rika',
    name: 'Rika Orimoto',
    category: 'character',
    stats: { strength: 114, speed: 102, durability: 114, ce: 120, body: 114, iq: 72 },
    signatureMove: 'Unconditional Copy',
    loreDescription:
      'The Queen of Curses. A vengeful spirit bound by love, possessing an endless reservoir of cursed energy and terrifying physical might.',
    grade: 'Legendary',
  },
  {
    id: 'miguel',
    name: 'Miguel',
    category: 'character',
    stats: { strength: 102, speed: 108, durability: 102, ce: 96, body: 102, iq: 102 },
    signatureMove: 'Black Rope',
    loreDescription:
      'A sorcerer from Africa who fought Gojo Satoru to a standstill using the Black Rope. His physical movements are incredibly fluid and unpredictable.',
    grade: 'Mythic',
  },
  {
    id: 'larue',
    name: 'Larue',
    category: 'character',
    stats: { strength: 96, speed: 96, durability: 96, ce: 96, body: 96, iq: 96 },
    signatureMove: 'Heart Catch',
    loreDescription:
      "A former ally of Suguru Geto. His technique 'Heart Catch' allows him to grab a target's heart and physically move or distract them.",
    grade: 'Epic',
  },
  {
    id: 'riko',
    name: 'Riko Amanai',
    category: 'character',
    stats: { strength: 48, speed: 60, durability: 48, ce: 60, body: 48, iq: 72 },
    signatureMove: 'Star Plasma Vessel',
    loreDescription:
      'The Star Plasma Vessel, destined to merge with Master Tengen to stabilize his immortality.',
    grade: 'Common',
  },
  {
    id: 'kuroi',
    name: 'Misato Kuroi',
    category: 'character',
    stats: { strength: 72, speed: 72, durability: 72, ce: 72, body: 72, iq: 84 },
    signatureMove: 'Combat Maid',
    loreDescription:
      'The caretaker of Riko Amanai. Though not a sorcerer, she is highly trained in combat and fiercely protective.',
    grade: 'Uncommon',
  },
  {
    id: 'haibara',
    name: 'Yu Haibara',
    category: 'character',
    stats: { strength: 78, speed: 78, durability: 78, ce: 84, body: 78, iq: 84 },
    signatureMove: 'Cursed Energy Output',
    loreDescription:
      'A cheerful and optimistic underclassman of Gojo and Geto, possessing a bright outlook on the jujutsu world.',
    grade: 'Rare',
  },
  {
    id: 'tengen',
    name: 'Master Tengen',
    category: 'character',
    stats: { strength: 48, speed: 48, durability: 96, ce: 120, body: 48, iq: 120 },
    signatureMove: 'Pure Barrier',
    loreDescription:
      'An immortal sorcerer whose barriers form the foundation of modern jujutsu society. They are more curse than human.',
    grade: 'Legendary',
  },
  {
    id: 'junpei',
    name: 'Junpei Yoshino',
    category: 'character',
    stats: { strength: 60, speed: 66, durability: 60, ce: 78, body: 60, iq: 84 },
    signatureMove: 'Moon Dregs',
    loreDescription:
      'A bullied high school student manipulated by Mahito. He uses a jellyfish shikigami that secretes deadly poison.',
    grade: 'Uncommon',
  },
  {
    id: 'juzo',
    name: 'Juzo Kumiya',
    category: 'character',
    stats: { strength: 84, speed: 78, durability: 84, ce: 84, body: 84, iq: 90 },
    signatureMove: 'Dragon-Bone Mastery',
    loreDescription:
      'A deranged curse user and master craftsman who desires to turn Gojo Satoru into a coat rack.',
    grade: 'Rare',
  },
  {
    id: 'haruta',
    name: 'Haruta Shigemo',
    category: 'character',
    stats: { strength: 72, speed: 90, durability: 72, ce: 78, body: 72, iq: 84 },
    signatureMove: 'Miracles',
    loreDescription:
      "A cowardly curse user whose technique stores 'miracles' from everyday life to save him from fatal blows.",
    grade: 'Rare',
  },
  {
    id: 'awasaka',
    name: 'Jiro Awasaka',
    category: 'character',
    stats: { strength: 96, speed: 84, durability: 114, ce: 90, body: 96, iq: 90 },
    signatureMove: 'Inverse',
    loreDescription:
      'A curse user allied with Kenjaku. His Inverse technique makes strong attacks weak and weak attacks strong.',
    grade: 'Epic',
  },
  {
    id: 'ogami',
    name: 'Granny Ogami',
    category: 'character',
    stats: { strength: 48, speed: 48, durability: 48, ce: 84, body: 48, iq: 96 },
    signatureMove: 'Seance Technique',
    loreDescription:
      'An elderly curse user who can summon the bodies and souls of the deceased into a willing vessel.',
    grade: 'Uncommon',
  },
  {
    id: 'saki',
    name: 'Saki Rindo',
    category: 'character',
    stats: { strength: 78, speed: 84, durability: 78, ce: 84, body: 78, iq: 90 },
    signatureMove: 'Cursed Output',
    loreDescription: 'A participant in the Culling Game.',
    grade: 'Rare',
  },
  {
    id: 'kaito',
    name: 'Kaito Yuki',
    category: 'character',
    stats: { strength: 84, speed: 78, durability: 84, ce: 90, body: 84, iq: 96 },
    signatureMove: 'Cursed Strike',
    loreDescription: 'A participant in the Culling Game.',
    grade: 'Rare',
  },
  {
    id: 'kensuke',
    name: 'Kensuke Nagino',
    category: 'character',
    stats: { strength: 90, speed: 90, durability: 90, ce: 96, body: 90, iq: 102 },
    signatureMove: 'Cursed Aura',
    loreDescription: 'A participant in the Culling Game.',
    grade: 'Epic',
  },
  {
    id: 'dabura',
    name: 'Dabura',
    category: 'character',
    stats: { strength: 105, speed: 120, durability: 100, ce: 105, body: 105, iq: 95 },
    flavorText: 'Instantaneous Displacement - Speed of Light!',
    signatureMove: 'Instantaneous Displacement',
    loreDescription:
      'An entity from beyond the veil. His movement is said to outpace the perception of even the most seasoned sorcerers.',
    grade: 'Calamity',
  },
  {
    id: 'modulo-yuji',
    name: 'Modulo Yuji',
    category: 'character',
    stats: { strength: 120, speed: 110, durability: 120, ce: 105, body: 120, iq: 100 },
    flavorText: 'The cog that breaks the machine.',
    signatureMove: 'Black Box',
    loreDescription:
      'A vessel that has fully synchronized with the cursed energy of his inhabitant, breaking the boundaries of normal jujutsu.',
    grade: 'Calamity',
  },
  {
    id: 'copy',
    name: 'Copy',
    category: 'cursedTechnique',
    statValue: 114,
    loreDescription:
      "Yuta Okkotsu's innate technique. Allows him to unconditionally copy other cursed techniques.",
    grade: 'Mythic',
  },
  {
    id: 'straw-doll',
    name: 'Straw Doll Technique',
    category: 'cursedTechnique',
    statValue: 96,
    loreDescription:
      "Nobara's technique. Uses a hammer, nails, and a straw doll to strike the opponent's soul from a distance.",
    grade: 'Epic',
  },
  {
    id: 'mythical-beast-amber',
    name: 'Mythical Beast Amber',
    category: 'cursedTechnique',
    statValue: 120,
    loreDescription:
      "Kashimo's one-time use technique. Reconstructs his flesh to manifest any phenomena caused by electricity, destroying his body afterward.",
    grade: 'Mythic',
  },
  {
    id: 'boogie-woogie',
    name: 'Boogie Woogie',
    category: 'cursedTechnique',
    statValue: 102,
    loreDescription:
      'Allows the user to swap the positions of anything with a certain amount of cursed energy by clapping their hands.',
    grade: 'Legendary',
  },
  {
    id: 'ratio-technique',
    name: 'Ratio Technique',
    category: 'cursedTechnique',
    statValue: 102,
    loreDescription:
      'Forcibly creates a weak point on the target at the ratio of 7:3. Striking this point guarantees a critical hit.',
    grade: 'Legendary',
  },
  {
    id: 'jacobs-ladder',
    name: "Jacob's Ladder",
    category: 'cursedTechnique',
    statValue: 114,
    loreDescription:
      'A multidimensional technique that extinguishes other cursed techniques and purifies cursed objects.',
    grade: 'Mythic',
  },
  {
    id: 'limitless',
    name: 'Limitless',
    category: 'cursedTechnique',
    statValue: 120,
    prerequisite: 'six-eyes',
    flavorText: 'Infinity exists everywhere.',
    loreDescription:
      'Brings the concept of infinity into reality, allowing the user to manipulate space at an atomic level.',
    grade: 'Calamity',
  },
  {
    id: 'shrine',
    name: 'Shrine',
    category: 'cursedTechnique',
    statValue: 120,
    loreDescription:
      'An ancient technique allowing the user to launch invisible, devastating slashing attacks and manipulate flames.',
    grade: 'Calamity',
  },
  {
    id: 'ten-shadows',
    name: 'Ten Shadows Technique',
    category: 'cursedTechnique',
    statValue: 114,
    loreDescription:
      'The ancestral technique of the Zenin clan. Allows the user to manifest shikigami from shadows, including the untameable Mahoraga.',
    grade: 'Mythic',
  },
  {
    id: 'cursed-spirit-manipulation',
    name: 'Cursed Spirit Manipulation',
    category: 'cursedTechnique',
    statValue: 114,
    loreDescription:
      'Allows the user to absorb and control conquered cursed spirits, wielding their unique abilities as their own.',
    grade: 'Mythic',
  },
  {
    id: 'star-rage',
    name: 'Star Rage',
    category: 'cursedTechnique',
    statValue: 114,
    loreDescription:
      'Grants the user the ability to imbue themselves and their shikigami with imaginary mass, delivering devastating blows.',
    grade: 'Mythic',
  },
  {
    id: 'blood-manipulation',
    name: 'Blood Manipulation',
    category: 'cursedTechnique',
    statValue: 102,
    loreDescription:
      'The inherited technique of the Kamo clan. Allows the user to freely control their own blood and its properties.',
    grade: 'Legendary',
  },
  {
    id: 'idle-transfiguration',
    name: 'Idle Transfiguration',
    category: 'cursedTechnique',
    statValue: 114,
    loreDescription:
      "Mahito's technique. Grants the ability to reshape souls, altering the physical body of the target or the user.",
    grade: 'Mythic',
  },
  {
    id: 'disaster-flames',
    name: 'Disaster Flames',
    category: 'cursedTechnique',
    statValue: 108,
    loreDescription:
      "Jogo's technique. Manifests and controls extremely hot flames and volcanic eruptions.",
    grade: 'Legendary',
  },
  {
    id: 'disaster-plants',
    name: 'Disaster Plants',
    category: 'cursedTechnique',
    statValue: 102,
    loreDescription:
      "Hanami's technique. Manipulates cursed plants that feed on the life force of the surrounding environment.",
    grade: 'Legendary',
  },
  {
    id: 'disaster-tides',
    name: 'Disaster Tides',
    category: 'cursedTechnique',
    statValue: 102,
    loreDescription:
      "Dagon's technique. Summons endless torrents of water and carnivorous sea life from the depths.",
    grade: 'Legendary',
  },
  {
    id: 'sky-manipulation',
    name: 'Sky Manipulation',
    category: 'cursedTechnique',
    statValue: 108,
    loreDescription:
      'Allows the user to grab and pull the sky as if it were a physical surface, bending space itself.',
    grade: 'Legendary',
  },
  {
    id: 'ice-formation',
    name: 'Ice Formation',
    category: 'cursedTechnique',
    statValue: 114,
    loreDescription:
      "Uraume's technique. Generates and manipulates massive amounts of ice, freezing targets to the bone instantly.",
    grade: 'Mythic',
  },
  {
    id: 'creation',
    name: 'Creation',
    category: 'cursedTechnique',
    statValue: 102,
    loreDescription:
      'Constructs matter from nothing using cursed energy. The created objects remain permanently.',
    grade: 'Legendary',
  },
  {
    id: 'puppet-manipulation',
    name: 'Puppet Manipulation',
    category: 'cursedTechnique',
    statValue: 102,
    loreDescription:
      'Allows the user to control multiple cursed corpses over vast distances, seeing through their eyes.',
    grade: 'Legendary',
  },
  {
    id: 'black-bird-manipulation',
    name: 'Black Bird Manipulation',
    category: 'cursedTechnique',
    statValue: 102,
    loreDescription:
      "Mei Mei's technique. Controls crows and allows her to share their vision. Can force them into suicide attacks.",
    grade: 'Legendary',
  },
  {
    id: 'projection-sorcery',
    name: 'Projection Sorcery',
    category: 'cursedTechnique',
    statValue: 108,
    loreDescription:
      'Divides one second into 24 frames. The user pre-determines their movements, granting them blinding speed.',
    grade: 'Legendary',
  },
  {
    id: 'antigravity-system',
    name: 'Antigravity System',
    category: 'cursedTechnique',
    statValue: 114,
    loreDescription:
      "Kaori Itadori's technique. Nullifies gravity around the user, allowing them to survive crushing forces.",
    grade: 'Mythic',
  },
  {
    id: 'miracles',
    name: 'Miracles',
    category: 'cursedTechnique',
    statValue: 102,
    loreDescription:
      "Erases the memory of small daily miracles and stores them to be released automatically when the user's life is in danger.",
    grade: 'Legendary',
  },
  {
    id: 'love-rendezvous',
    name: 'Love Rendezvous',
    category: 'cursedTechnique',
    statValue: 102,
    loreDescription:
      'Marks targets with stars, forcing them to approach each other in a specific order based on distance.',
    grade: 'Legendary',
  },
  {
    id: 'contract-reproduction',
    name: 'Contract Reproduction',
    category: 'cursedTechnique',
    statValue: 102,
    loreDescription:
      'Recreates the items or services printed on receipts by burning them with cursed energy.',
    grade: 'Legendary',
  },
  {
    id: 'comedian',
    name: 'Comedian',
    category: 'cursedTechnique',
    statValue: 114,
    loreDescription:
      'Alters reality to match whatever the user finds funny. A technique capable of opposing even Satoru Gojo.',
    grade: 'Mythic',
  },
  {
    id: 'bird-strike',
    name: 'Bird Strike',
    category: 'cursedTechnique',
    statValue: 108,
    loreDescription:
      'A binding vow placed on a crow, forcing it to commit suicide in exchange for a devastatingly powerful strike.',
    grade: 'Legendary',
  },
  {
    id: 'soul-resonance',
    name: 'Soul Resonance',
    category: 'specialPower',
    statValue: 108,
    prerequisite: 'straw-doll',
    loreDescription:
      "Nobara's signature move. Strikes a sympathetic link between a severed body part and the main body, damaging the soul directly.",
    grade: 'Legendary',
  },
  {
    id: 'seance-technique',
    name: 'Seance Technique',
    category: 'cursedTechnique',
    statValue: 102,
    loreDescription: 'Summons the physical body or soul of a deceased person into a living vessel.',
    grade: 'Legendary',
  },
  {
    id: 'inverse',
    name: 'Inverse',
    category: 'cursedTechnique',
    statValue: 102,
    loreDescription:
      'Inverts the damage taken. Strong attacks deal minimal damage, while weak attacks deal massive damage.',
    grade: 'Legendary',
  },
  {
    id: 'auspicious-beasts',
    name: 'Auspicious Beasts Summon',
    category: 'cursedTechnique',
    statValue: 96,
    loreDescription:
      "Ino's technique. Channels the abilities of four auspicious beasts by wearing a mask and acting as a medium.",
    grade: 'Epic',
  },
  {
    id: 'unlimited-void',
    name: 'Unlimited Void',
    category: 'domainExpansion',
    statValue: 120,
    flavorText: 'Perception Overloaded!',
    loreDescription:
      "A metaphysical space that floods the target's brain with infinite information, rendering them catatonic.",
    grade: 'Calamity',
  },
  {
    id: 'malevolent-shrine',
    name: 'Malevolent Shrine',
    category: 'domainExpansion',
    statValue: 120,
    flavorText: 'Relentless Divine Slashes.',
    loreDescription:
      'An open-barrier domain that paints the landscape with relentless slashes, turning everything within its massive radius to dust.',
    grade: 'Calamity',
  },
  {
    id: 'modulo-yuji-domain',
    name: 'Black Box',
    category: 'domainExpansion',
    statValue: 120,
    prerequisite: 'modulo-yuji',
    flavorText: 'Open.',
    loreDescription:
      "An open-barrier, constantly active state extending directly from the soul. It dismantles the boundaries of an opponent's domain seamlessly without needing to open a distinct barrier.",
    grade: 'Calamity',
  },
  {
    id: 'authentic-mutual-love',
    name: 'Authentic Mutual Love',
    category: 'domainExpansion',
    statValue: 114,
    loreDescription:
      'A domain filled with katanas representing copied techniques. The user can wield any of them, and one is applied as the sure-hit.',
    grade: 'Mythic',
  },
  {
    id: 'womb-profusion',
    name: 'Womb Profusion',
    category: 'domainExpansion',
    statValue: 120,
    loreDescription:
      'An open-barrier domain that manifests a grotesque pillar of faces, unleashing a devastating sure-hit attack.',
    grade: 'Mythic',
  },
  {
    id: 'chimera-shadow-garden',
    name: 'Chimera Shadow Garden',
    category: 'domainExpansion',
    statValue: 108,
    loreDescription:
      'Floods the area with fluid shadows, allowing the user to summon endless shikigami and create clones of themselves.',
    grade: 'Legendary',
  },
  {
    id: 'deadly-sentencing',
    name: 'Deadly Sentencing',
    category: 'domainExpansion',
    statValue: 114,
    prerequisite: 'higuruma',
    loreDescription:
      'A non-lethal domain that forces the target into a courtroom trial. Violence is prohibited until a verdict is reached.',
    grade: 'Mythic',
  },
  {
    id: 'self-embodiment-of-perfection',
    name: 'Self-Embodiment of Perfection',
    category: 'domainExpansion',
    statValue: 114,
    loreDescription:
      "Traps the target in a space made of giant hands. The user's soul-manipulating technique becomes a guaranteed hit.",
    grade: 'Mythic',
  },
  {
    id: 'coffin-of-the-iron-mountain',
    name: 'Coffin of the Iron Mountain',
    category: 'domainExpansion',
    statValue: 108,
    loreDescription:
      'A volcanic domain with extreme heat. Normal sorcerers burn to ash the moment they enter.',
    grade: 'Legendary',
  },
  {
    id: 'ceremonial-sea-of-light',
    name: 'Ceremonial Sea of Light',
    category: 'domainExpansion',
    statValue: 108,
    loreDescription:
      "Hanami's domain expansion. While its exact sure-hit is unknown, it draws upon the power of nature and solar energy.",
    grade: 'Legendary',
  },
  {
    id: 'horizon-of-the-captivating-skandha',
    name: 'Horizon of the Captivating Skandha',
    category: 'domainExpansion',
    statValue: 108,
    loreDescription:
      'A tropical beach domain that guarantees the hit of endless swarms of carnivorous shikigami.',
    grade: 'Legendary',
  },
  {
    id: 'threefold-affliction',
    name: 'Threefold Affliction',
    category: 'domainExpansion',
    statValue: 114,
    loreDescription:
      "A domain that perfectly complements the user's technique, though its exact sure-hit remains shrouded in mystery.",
    grade: 'Mythic',
  },
  {
    id: 'time-cell-moon-palace',
    name: 'Time Cell Moon Palace',
    category: 'domainExpansion',
    statValue: 108,
    loreDescription:
      "Forces the target's cells to move at different frame rates, causing devastating internal damage upon the slightest movement.",
    grade: 'Legendary',
  },
  {
    id: 'idle-death-gamble',
    name: 'Idle Death Gamble',
    category: 'domainExpansion',
    statValue: 114,
    loreDescription:
      'A pachinko-themed domain where the user rolls for a jackpot. A win grants infinite cursed energy and automatic healing for 4 minutes and 11 seconds.',
    grade: 'Mythic',
  },
  {
    id: 'graveyard-domain',
    name: 'Graveyard Domain',
    category: 'domainExpansion',
    statValue: 102,
    loreDescription:
      "The Smallpox Deity's domain. It traps the target in a coffin, buries them under a gravestone, and counts to three before infecting them.",
    grade: 'Legendary',
  },
  {
    id: 'shadow-realm',
    name: 'Shadow Realm (Incomplete)',
    category: 'domainExpansion',
    statValue: 96,
    loreDescription:
      'An incomplete domain expansion that lacks a barrier. It floods the area with shadows but does not have a guaranteed hit.',
    grade: 'Epic',
  },
  {
    id: 'empty-barrier',
    name: 'Empty Barrier',
    category: 'domainExpansion',
    statValue: 114,
    loreDescription:
      "Tengen's specialized barrier technique. It is entirely defensive, designed to hide and protect rather than attack.",
    grade: 'Mythic',
  },
  {
    id: 'playful-cloud',
    name: 'Playful Cloud',
    category: 'tool',
    statValue: 114,
    loreDescription:
      "A three-section staff that relies entirely on the user's raw physical strength rather than imbued cursed energy.",
    grade: 'Mythic',
  },
  {
    id: 'inverted-spear',
    name: 'Inverted Spear of Heaven',
    category: 'tool',
    statValue: 120,
    loreDescription:
      'A dagger imbued with a foreign cursed energy that forces the nullification of any cursed technique it touches.',
    grade: 'Mythic',
  },
  {
    id: 'split-soul-katana',
    name: 'Split Soul Katana',
    category: 'tool',
    statValue: 114,
    loreDescription:
      "A blade that ignores the physical shell to strike at the soul itself. Requires the user to 'see' the soul of inanimate objects.",
    grade: 'Mythic',
  },
  {
    id: 'executioners-sword',
    name: "Executioner's Sword",
    category: 'tool',
    statValue: 120,
    prerequisite: 'deadly-sentencing',
    loreDescription:
      'A blade manifested after a guilty verdict. A single scratch from this sword guarantees instant death.',
    grade: 'Mythic',
  },
  {
    id: 'kamutoke',
    name: 'Kamutoke',
    category: 'tool',
    statValue: 108,
    loreDescription:
      'A cursed tool from the Heian era wielded by Sukuna. It summons devastating lightning strikes without needing a cursed technique.',
    grade: 'Mythic',
  },
  {
    id: 'hiten',
    name: 'Hiten',
    category: 'tool',
    statValue: 108,
    loreDescription:
      'A legendary cursed tool wielded by Sukuna in the Heian era, resembling a trident.',
    grade: 'Mythic',
  },
  {
    id: 'prison-realm',
    name: 'Prison Realm',
    category: 'tool',
    statValue: 120,
    loreDescription:
      'A living barrier that can seal absolutely anything inside an inescapable pocket dimension, provided the target is kept within a 4-meter radius for one minute in their mind.',
    grade: 'Mythic',
  },
  {
    id: 'slaughter-demon',
    name: 'Slaughter Demon',
    category: 'tool',
    statValue: 84,
    loreDescription:
      'A short sword imbued with cursed energy, ideal for beginners to exorcise low-level curses.',
    grade: 'Rare',
  },
  {
    id: 'dragon-bone',
    name: 'Dragon-Bone',
    category: 'tool',
    statValue: 102,
    loreDescription:
      "A masterpiece crafted by Juzo Kumiya. It absorbs kinetic force and cursed energy, releasing it upon the user's command.",
    grade: 'Legendary',
  },
  {
    id: 'chain-of-a-thousand-miles',
    name: 'Chain of a Thousand Miles',
    category: 'tool',
    statValue: 102,
    loreDescription:
      'A chain that can extend infinitely as long as the user hides one of its ends.',
    grade: 'Legendary',
  },
  {
    id: 'black-rope',
    name: 'Black Rope',
    category: 'tool',
    statValue: 114,
    loreDescription:
      'A rare rope woven by African sorcerers over decades. It disrupts and nullifies cursed techniques it comes into contact with.',
    grade: 'Mythic',
  },
  {
    id: 'sukunas-fingers',
    name: "Sukuna's Fingers",
    category: 'tool',
    statValue: 120,
    loreDescription:
      "Indestructible fragments of the King of Curses' soul. They attract curses and grant immense power to any vessel capable of consuming them.",
    grade: 'Mythic',
  },
  {
    id: 'sword-of-extermination',
    name: 'Sword of Extermination',
    category: 'tool',
    statValue: 114,
    loreDescription:
      "A blade attached to Mahoraga's arm, coated entirely in positive energy. It is absolute poison to cursed spirits.",
    grade: 'Mythic',
  },
  {
    id: 'festering-life-sword',
    name: 'Festering Life Sword',
    category: 'tool',
    statValue: 102,
    loreDescription:
      'A blade wielded by Kurourushi that mixes life and death, firing insect eggs into the target that hatch and devour them.',
    grade: 'Legendary',
  },
  {
    id: 'nanamis-blunt-sword',
    name: "Nanami's Blunt Sword",
    category: 'tool',
    statValue: 96,
    loreDescription:
      'A blunt blade wrapped in cloth with a black splatter pattern. Used in conjunction with the Ratio Technique.',
    grade: 'Epic',
  },
  {
    id: 'g-warstaff',
    name: 'G-Warstaff',
    category: 'tool',
    statValue: 90,
    loreDescription:
      'A pen-like cursed tool used by Charles Bernard. It draws blood to fill an inkwell, allowing him to see the future.',
    grade: 'Epic',
  },
  {
    id: 'hand-sword',
    name: 'Hand Sword',
    category: 'tool',
    statValue: 84,
    loreDescription:
      'A sword with a hand-shaped guard used by Haruta Shigemo. It can move independently to protect its user.',
    grade: 'Rare',
  },
  {
    id: 'miwas-katana',
    name: "Miwa's Katana",
    category: 'tool',
    statValue: 78,
    loreDescription:
      'A standard katana used by Kasumi Miwa, often combined with New Shadow Style techniques.',
    grade: 'Rare',
  },
  {
    id: 'mei-meis-axe',
    name: "Mei Mei's Battle Axe",
    category: 'tool',
    statValue: 102,
    loreDescription:
      'A massive, heavy battle axe wielded by Mei Mei with incredible physical strength.',
    grade: 'Legendary',
  },
  {
    id: 'jet-black-sword',
    name: 'Jet Black Sword',
    category: 'tool',
    statValue: 96,
    loreDescription:
      'A sword wielded by Yuta Okkotsu, channeling his immense cursed energy into devastating slashes.',
    grade: 'Epic',
  },
  {
    id: 'mahoraga',
    name: 'Divine General Mahoraga',
    category: 'shikigami',
    statValue: 120,
    prerequisite: 'ten-shadows',
    loreDescription:
      'The most powerful shikigami of the Ten Shadows. It possesses the ability to adapt to any and all phenomena, making it nearly invincible.',
    grade: 'Mythic',
  },
  {
    id: 'agito',
    name: 'Merged Beast Agito',
    category: 'shikigami',
    statValue: 114,
    prerequisite: 'ten-shadows',
    loreDescription:
      'A chimera created by merging multiple Ten Shadows shikigami. Possesses immense physical strength and the ability to heal with Reverse Cursed Technique.',
    grade: 'Mythic',
  },
  {
    id: 'judgeman',
    name: 'Judgeman',
    category: 'shikigami',
    statValue: 108,
    prerequisite: 'deadly-sentencing',
    loreDescription:
      'A shikigami that acts as the judge in a deadly domain. It knows everything about everyone and dictates the rules of the trial.',
    grade: 'Legendary',
  },
  {
    id: 'nue',
    name: 'Nue',
    category: 'shikigami',
    statValue: 96,
    prerequisite: 'ten-shadows',
    loreDescription:
      'An owl-like shikigami that attacks from the sky, striking opponents with wings imbued with electricity.',
    grade: 'Epic',
  },
  {
    id: 'divine-dogs',
    name: 'Divine Dog: Totality',
    category: 'shikigami',
    statValue: 102,
    prerequisite: 'ten-shadows',
    loreDescription:
      'A powerful wolf shikigami formed from the fusion of the white and black Divine Dogs. Its claws can tear through special grade curses.',
    grade: 'Legendary',
  },
  {
    id: 'rika-shikigami',
    name: 'Rika',
    category: 'shikigami',
    statValue: 120,
    loreDescription:
      'The manifested husk of the Queen of Curses. Acts as an external storage for cursed energy and copied techniques.',
    grade: 'Mythic',
  },
  {
    id: 'garuda',
    name: 'Garuda',
    category: 'shikigami',
    statValue: 108,
    loreDescription:
      "Yuki Tsukumo's shikigami, which she has turned into a cursed tool. It can be imbued with imaginary mass.",
    grade: 'Legendary',
  },
  {
    id: 'great-serpent',
    name: 'Great Serpent',
    category: 'shikigami',
    statValue: 90,
    prerequisite: 'ten-shadows',
    loreDescription: 'A massive snake shikigami used for surprise attacks and binding opponents.',
    grade: 'Epic',
  },
  {
    id: 'demon-dogs',
    name: 'Demon Dogs',
    category: 'shikigami',
    statValue: 84,
    prerequisite: 'ten-shadows',
    loreDescription:
      'The twin wolf shikigami, one black and one white, given to a Ten Shadows user at the start of their training.',
    grade: 'Rare',
  },
  {
    id: 'toad',
    name: 'Toad',
    category: 'shikigami',
    statValue: 84,
    prerequisite: 'ten-shadows',
    loreDescription:
      'A large toad shikigami that uses its tongue to grapple opponents or rescue allies.',
    grade: 'Rare',
  },
  {
    id: 'max-elephant',
    name: 'Max Elephant',
    category: 'shikigami',
    statValue: 96,
    prerequisite: 'ten-shadows',
    loreDescription:
      'A massive elephant shikigami capable of crushing opponents and releasing torrents of water.',
    grade: 'Epic',
  },
  {
    id: 'rabbit-escape',
    name: 'Rabbit Escape',
    category: 'shikigami',
    statValue: 78,
    prerequisite: 'ten-shadows',
    loreDescription:
      'Summons a massive swarm of rabbits to distract and overwhelm the opponent, allowing for a quick escape.',
    grade: 'Rare',
  },
  {
    id: 'round-deer',
    name: 'Round Deer',
    category: 'shikigami',
    statValue: 102,
    prerequisite: 'ten-shadows',
    loreDescription:
      'A deer shikigami capable of outputting positive energy to heal the user and neutralize cursed energy.',
    grade: 'Legendary',
  },
  {
    id: 'piercing-ox',
    name: 'Piercing Ox',
    category: 'shikigami',
    statValue: 96,
    prerequisite: 'ten-shadows',
    loreDescription:
      'A bull shikigami that can only move in a straight line, but its power increases the further it charges.',
    grade: 'Epic',
  },
  {
    id: 'moon-dregs',
    name: 'Moon Dregs',
    category: 'shikigami',
    statValue: 96,
    loreDescription:
      "Junpei's jellyfish shikigami. It secretes a deadly poison and can alter its size to protect the user.",
    grade: 'Epic',
  },
  {
    id: 'rainbow-dragon',
    name: 'Rainbow Dragon',
    category: 'shikigami',
    statValue: 102,
    loreDescription:
      "The most durable cursed spirit in Geto's arsenal. Its skin is harder than any conventional material.",
    grade: 'Legendary',
  },
  {
    id: 'kuchisake-onna',
    name: 'Kuchisake-onna',
    category: 'shikigami',
    statValue: 96,
    loreDescription:
      'An imaginary vengeful spirit that binds its target with a simple domain before attacking with massive shears.',
    grade: 'Epic',
  },
  {
    id: 'dhruv-giant',
    name: "Dhruv's Giant Shikigami",
    category: 'shikigami',
    statValue: 102,
    prerequisite: 'dhruv',
    loreDescription:
      'Massive autonomous entities that leave tracks forming a circular domain in their path.',
    grade: 'Epic',
  },
  {
    id: 'gorilla-core',
    name: 'Cursed Corpse: Gorilla',
    category: 'shikigami',
    statValue: 90,
    loreDescription:
      "Panda's elder brother core. Grants explosive physical power and short-range dominance.",
    grade: 'Epic',
  },
  {
    id: 'triceratops-core',
    name: 'Cursed Corpse: Triceratops',
    category: 'shikigami',
    statValue: 90,
    loreDescription:
      "Panda's elder sister core. Optimized for defensive maneuvers and heavy impacts.",
    grade: 'Epic',
  },
  {
    id: 'smallpox-deity',
    name: 'Smallpox Deity',
    category: 'shikigami',
    statValue: 108,
    loreDescription:
      'A Special Grade disease curse that traps targets in a countdown toward certain death.',
    grade: 'Legendary',
  },
  {
    id: 'ganesha-curse',
    name: 'Ganesha-like Curse',
    category: 'shikigami',
    statValue: 108,
    loreDescription:
      "A powerful curse that 'removes obstacles' by using its massive weight and trunk to crush space.",
    grade: 'Legendary',
  },
  {
    id: 'crows',
    name: 'Cursed Crows',
    category: 'shikigami',
    statValue: 90,
    prerequisite: 'black-bird-manipulation',
    loreDescription:
      "Mei Mei's surveillance and attack force. They are capable of suicidal 'Bird Strike' impacts.",
    grade: 'Epic',
  },
  {
    id: 'six-eyes',
    name: 'Six Eyes',
    category: 'specialPower',
    statValue: 120,
    loreDescription:
      'A rare ocular trait that grants unparalleled cursed energy perception and perfect efficiency in technique execution.',
    grade: 'Mythic',
  },
  {
    id: 'rct',
    name: 'Reverse Cursed Technique',
    category: 'specialPower',
    statValue: 114,
    loreDescription:
      'The complex process of multiplying negative cursed energy to create positive energy, allowing for rapid healing.',
    grade: 'Mythic',
  },
  {
    id: 'black-flash',
    name: 'Black Flash',
    category: 'specialPower',
    statValue: 114,
    loreDescription:
      'A distortion in space that occurs when cursed energy is applied within 0.000001 seconds of a physical hit, multiplying its power.',
    grade: 'Mythic',
  },
  {
    id: 'heavenly-restriction',
    name: 'Heavenly Restriction',
    category: 'specialPower',
    statValue: 120,
    loreDescription:
      "A binding vow placed on a sorcerer's body at birth, trading cursed energy for superhuman physical prowess.",
    grade: 'Mythic',
  },
  {
    id: 'simple-domain',
    name: 'Simple Domain',
    category: 'specialPower',
    statValue: 102,
    loreDescription:
      'A barrier technique for the weak. It neutralizes the sure-hit effect of Domain Expansions by interfering with the barrier.',
    grade: 'Legendary',
  },
  {
    id: 'falling-blossom-emotion',
    name: 'Falling Blossom Emotion',
    category: 'specialPower',
    statValue: 102,
    loreDescription:
      'A secret anti-domain technique passed down in the Big Three Sorcerer Families. It automatically counters incoming cursed energy with equal force.',
    grade: 'Legendary',
  },
  {
    id: 'hollow-wicker-basket',
    name: 'Hollow Wicker Basket',
    category: 'specialPower',
    statValue: 96,
    loreDescription:
      'The predecessor to Simple Domain. A woven basket of cursed energy that neutralizes domain barriers, though it requires constant hand signs.',
    grade: 'Epic',
  },
  {
    id: 'domain-amplification',
    name: 'Domain Amplification',
    category: 'specialPower',
    statValue: 108,
    loreDescription:
      'A fluid, aura-like domain that neutralizes cursed techniques upon contact, allowing the user to bypass defensive abilities like Infinity.',
    grade: 'Legendary',
  },
  {
    id: 'binding-vow',
    name: 'Binding Vow',
    category: 'specialPower',
    statValue: 108,
    loreDescription:
      'A pact made with jujutsu itself. By sacrificing something or setting a strict condition, one can vastly multiply their power.',
    grade: 'Legendary',
  },
  {
    id: 'cursed-energy-trait',
    name: 'Cursed Energy Trait',
    category: 'specialPower',
    statValue: 102,
    loreDescription:
      "A rare mutation where a sorcerer's cursed energy possesses physical properties, such as electricity or extreme roughness.",
    grade: 'Legendary',
  },
  {
    id: 'the-bath',
    name: 'The Bath',
    category: 'specialPower',
    statValue: 108,
    loreDescription:
      "A dark ritual involving the prolonged submersion in a solution of concentrated cursed spirits, used to suppress a vessel's soul.",
    grade: 'Legendary',
  },
  {
    id: 'cursed-realm',
    name: 'Cursed Realm',
    category: 'specialPower',
    statValue: 108,
    loreDescription:
      'The space between dreams and reality where curses are born and souls linger. A metaphysical plane of existence.',
    grade: 'Legendary',
  },
  {
    id: 'death-painting-womb',
    name: 'Death Painting Womb',
    category: 'specialPower',
    statValue: 102,
    loreDescription:
      'Half-human, half-curse entities born from a horrific historical experiment. They possess unique physiologies and blood-based techniques.',
    grade: 'Legendary',
  },
  {
    id: 'cursed-corpse-core',
    name: 'Cursed Corpse Core',
    category: 'specialPower',
    statValue: 96,
    loreDescription:
      'The artificial soul of a cursed corpse. When three highly compatible souls observe each other, they generate self-sustaining cursed energy.',
    grade: 'Epic',
  },
  {
    id: 'supreme-martial-arts',
    name: 'Supreme Martial Arts',
    category: 'specialPower',
    statValue: 108,
    loreDescription:
      'Absolute mastery over hand-to-hand combat, turning the human body into a lethal weapon even without the use of cursed techniques.',
    grade: 'Legendary',
  },
  {
    id: 'soul-perception',
    name: 'Soul Perception',
    category: 'specialPower',
    statValue: 102,
    loreDescription:
      'The rare ability to perceive the contours of the soul, allowing the user to strike the core of any being and interact with souls directly.',
    grade: 'Epic',
  },
  {
    id: 'maximum-output',
    name: 'Maximum Cursed Output',
    category: 'specialPower',
    statValue: 108,
    loreDescription:
      'A advanced technique where the user pushes their cursed energy output to its absolute limit for a single, devastating move.',
    grade: 'Legendary',
  },
  {
    id: 'new-shadow-style',
    name: 'New Shadow Style',
    category: 'specialPower',
    statValue: 96,
    loreDescription:
      'A defensive school of jujutsu involving simple domains and sword techniques designed to counter domain expansions.',
    grade: 'Epic',
  },
  {
    id: 'curtain-mastery',
    name: 'Barrier Mastery',
    category: 'specialPower',
    statValue: 96,
    loreDescription:
      'Exceptional skill in erecting curtains and barriers, allowing for complex conditions and high durability.',
    grade: 'Epic',
  },
  {
    id: 'soul-info-perception',
    name: 'Soul Information Perception',
    category: 'specialPower',
    statValue: 114,
    loreDescription:
      'The ability to read the information stored within a soul, useful for both combat prediction and healing complex soul-damage.',
    grade: 'Mythic',
  },
  {
    id: 'human',
    name: 'Human',
    category: 'character',
    stats: { strength: 50, speed: 50, durability: 50, ce: 0, body: 50, iq: 50 },
    flavorText: 'Just a regular human.',
    loreDescription: 'The baseline for all other characters.',
    grade: 'Common',
  },
];

export const statLabels: Record<string, string> = {
  strength: 'Strength',
  speed: 'Speed',
  durability: 'Durability',
  ce: 'Cursed Energy',
  ct: 'Cursed Technique',
  body: 'Body',
  tool: 'Cursed Tool',
  specialPower1: 'Special Power 1',
  specialPower2: 'Special Power 2',
  shikigami: 'Shikigami',
  domainExpansion: 'Domain Expansion',
  iq: 'Battle IQ',
  bindingVow: 'Vow Pact',
};

export const statsList = Object.keys(statLabels);

export const statCategoryMap: Record<string, EntityCategory> = {
  strength: 'character',
  speed: 'character',
  durability: 'character',
  ce: 'character',
  ct: 'cursedTechnique',
  body: 'character',
  tool: 'tool',
  specialPower1: 'specialPower',
  specialPower2: 'specialPower',
  shikigami: 'shikigami',
  domainExpansion: 'domainExpansion',
  iq: 'character',
  bindingVow: 'bindingVow',
};

export const categoryLabels: Record<string, string> = {
  character: 'Character',
  cursedTechnique: 'Cursed Technique',
  domainExpansion: 'Domain Expansion',
  tool: 'Cursed Tool',
  specialPower: 'Special Power',
  shikigami: 'Shikigami',
  bindingVow: 'Binding Vow',
};

export const pairings: Pairing[] = [
  {
    id: 'honored-one',
    name: 'The Honored One',
    entities: ['gojo', 'limitless', 'six-eyes'],
    bonusStats: { speed: 22, ce: 12, iq: 12 },
    description: 'Gojo Satoru with Limitless and Six Eyes reaches his maximum potential.',
  },
  {
    id: 'king-of-curses',
    name: 'King of Curses',
    entities: ['sukuna', 'shrine', 'malevolent-shrine'],
    bonusStats: { strength: 12, durability: 12, ce: 12, iq: 18 },
    description: 'Sukuna with his full arsenal is truly the King of Curses.',
  },
  {
    id: 'potential-man',
    name: 'Potential Man',
    entities: ['megumi', 'ten-shadows', 'mahoraga'],
    bonusStats: { iq: 18, body: 18, strength: 12 },
    description: 'Megumi realizing his full potential with Mahoraga.',
  },
  {
    id: 'queen-of-curses',
    name: 'Queen of Curses',
    entities: ['yuta', 'rika-shikigami', 'copy'],
    bonusStats: { ce: 18, strength: 18 },
    description: 'Yuta fighting alongside fully manifested Rika and his innate technique.',
  },
  {
    id: 'sorcerer-killer',
    name: 'Sorcerer Killer',
    entities: ['toji', 'inverted-spear', 'heavenly-restriction'],
    bonusStats: { speed: 18, strength: 18 },
    description: 'Toji with his ultimate anti-sorcerer loadout.',
  },
  {
    id: 'demon-god',
    name: 'Demon God',
    entities: ['maki', 'split-soul-katana', 'heavenly-restriction'],
    bonusStats: { strength: 18, durability: 18 },
    description: 'Maki fully realized as a Heavenly Restricted warrior.',
  },
  {
    id: 'always-bet',
    name: 'Always Bet on Hakari',
    entities: ['hakari', 'idle-death-gamble'],
    bonusStats: { ce: 24, durability: 24 },
    description: 'Hakari hitting the jackpot.',
  },
  {
    id: 'cog',
    name: 'Cog in the Machine',
    entities: ['yuji', 'black-flash', 'sukunas-fingers'],
    bonusStats: { strength: 18, body: 18 },
    description: "Yuji utilizing Sukuna's power and Black Flash.",
  },
  {
    id: 'resonance',
    name: 'Resonance',
    entities: ['nobara', 'straw-doll', 'soul-resonance'],
    bonusStats: { iq: 18, ce: 18 },
    description: 'Nobara striking the soul directly.',
  },
  {
    id: 'big-brother',
    name: 'Big Brother',
    entities: ['choso', 'blood-manipulation', 'death-painting-womb'],
    bonusStats: { body: 12, durability: 12 },
    description: 'Choso fighting for his brothers.',
  },
  {
    id: 'guilty',
    name: 'Guilty',
    entities: ['higuruma', 'deadly-sentencing', 'executioners-sword'],
    bonusStats: { iq: 18, speed: 18 },
    description: 'Higuruma passing the death penalty.',
  },
  {
    id: 'god-of-lightning',
    name: 'God of Lightning',
    entities: ['kashimo', 'mythical-beast-amber'],
    bonusStats: { speed: 24, ce: 24 },
    description: 'Kashimo unleashing his one-time cursed technique.',
  },
  {
    id: 'disaster-curses',
    name: 'The Disaster Curses',
    entities: ['jogo', 'hanami', 'dagon', 'mahito'],
    bonusStats: { ce: 30, durability: 24, iq: 18 },
    description: 'The true humans born from the earth, forest, sea, and humanity.',
  },
  {
    id: 'best-friends',
    name: 'Best Friends',
    entities: ['yuji', 'megumi', 'nobara'],
    bonusStats: { iq: 18, strength: 12, speed: 12 },
    description: 'The unbreakable bond of the first-year students.',
  },
  {
    id: 'student-and-teacher',
    name: 'Student & Teacher',
    entities: ['gojo', 'yuji'],
    bonusStats: { iq: 12, body: 18 },
    description: 'The strongest sorcerer and his most resilient student.',
  },
  {
    id: 'zenin-clan',
    name: 'The Zenin Clan',
    entities: ['maki', 'naoya', 'naobito'],
    bonusStats: { speed: 30, strength: 18 },
    description: 'The pride and power of the Zenin family.',
  },
  {
    id: 'secret-vessel-awakened',
    name: 'The Fallen Awakened',
    entities: ['yuji', 'shrine', 'black-flash', 'sukunas-fingers', 'rct'],
    bonusStats: { strength: 72, speed: 60, ce: 78, body: 84, durability: 66 },
    description:
      "The ultimate evolution of the vessel. Mastering the King's shrine through the spark of Black Flash and automated healing.",
    isSecret: true,
  },
  {
    id: 'secret-honored-one',
    name: 'The Honored One (Unbound)',
    entities: ['gojo', 'limitless', 'six-eyes', 'unlimited-void', 'prison-realm'],
    bonusStats: { speed: 96, ce: 96, iq: 96, durability: 72 },
    description:
      'A sorcerer who has transcended the concepts of distance and information. Even sealing him is but a temporary delay.',
    isSecret: true,
  },
  {
    id: 'secret-shadow-sovereign',
    name: 'Shadow Sovereign',
    entities: ['sukuna', 'ten-shadows', 'mahoraga', 'malevolent-shrine', 'kamutoke'],
    bonusStats: { ce: 102, iq: 78, durability: 72, strength: 60, speed: 48 },
    description:
      'The King of Curses wielding the legendary Ten Shadows. Adaptation and absolute slaughter combined.',
    isSecret: true,
  },
  {
    id: 'secret-pure-love',
    name: 'Absolute Pure Love',
    entities: ['yuta', 'rika-shikigami', 'copy', 'authentic-mutual-love'],
    bonusStats: { ce: 84, strength: 60, iq: 54, durability: 54 },
    description:
      'A bond that transcends death. Boundless cursed energy coupled with the unconditional copying of all techniques.',
    isSecret: true,
  },
  {
    id: 'secret-brotherhood',
    name: 'Cursed Brotherhood',
    entities: ['yuji', 'choso', 'eso', 'kechizu'],
    bonusStats: { strength: 66, speed: 66, durability: 66, body: 72 },
    description:
      'The unbreakable bond of the Death Painting Wombs. Their collective blood screams for vengeance.',
    isSecret: true,
  },
  {
    id: 'secret-rejected-sovereigns',
    name: 'Heavenly Sovereigns',
    entities: ['toji', 'maki', 'heavenly-restriction', 'playful-cloud'],
    bonusStats: { strength: 78, speed: 78, body: 108, iq: 48 },
    description:
      'Those who left everything behind to gain everything. Absolute physical perfection achieved through the complete absence of cursed energy.',
    isSecret: true,
  },
  {
    id: 'secret-culling-mastermind',
    name: 'Mastermind of the Game',
    entities: ['kenjaku', 'geto', 'cursed-spirit-manipulation', 'womb-profusion', 'prison-realm'],
    bonusStats: { ce: 90, iq: 114, strength: 48, speed: 60, durability: 60 },
    description:
      'An ancient evil utilizing the perfect body and a millennium of planning to rewrite the laws of existence.',
    isSecret: true,
  },
];

export const bindingVows = [
  {
    id: 'revealing-hand',
    name: "Revealing One's Hand",
    description: '-10 Battle IQ, +15% to CT & Special Powers',
    loreDescription:
      "A vow that increases the efficacy of one's technique by explaining its mechanics to the opponent.",
    grade: 'Epic',
  },
  {
    id: 'life-gamble',
    name: 'Life Gamble',
    description: 'Durability drops to 1, Strength & Speed doubled',
    loreDescription:
      'A desperate pact that sacrifices all defensive cursed energy reinforcement for absolute offensive power.',
    grade: 'Mythic',
  },
  {
    id: 'simple-territory',
    name: 'Simple Territory',
    description: 'Forfeit Domain Expansion, +20 Durability vs DE users',
    loreDescription:
      'A technique from the Heian era to protect the weak, neutralizing the sure-hit effect of domains.',
    grade: 'Rare',
  },
  {
    id: 'overtime',
    name: 'Overtime',
    description: '-10 Cursed Energy, +20 to all Physical Stats',
    loreDescription:
      'A vow that restricts cursed energy output during normal hours, granting a massive surge when working past the limit.',
    grade: 'Epic',
  },
  {
    id: 'heavenly-pact',
    name: 'Heavenly Pact',
    description: '0 CE/CT/DE, +40 to all Physical Stats',
    loreDescription:
      'An artificial imitation of a Heavenly Restriction, sacrificing all jujutsu potential for raw, overwhelming physical might.',
    grade: 'Legendary',
  },
  {
    id: 'future-sacrifice',
    name: 'Future Sacrifice',
    description: '+50 Strength/Speed, -50 CE/CT',
    loreDescription:
      'Sacrificing all future potential and ability to ever swing a sword again for one ultimate, transcendent strike.',
    grade: 'Mythic',
  },
  {
    id: 'open-barrier',
    name: 'Open Barrier',
    description: '+20 Domain Expansion, -10 Durability',
    loreDescription:
      'Allowing an escape route in a Domain Expansion vastly increases its area of effect and lethal sure-hit range.',
    grade: 'Legendary',
  },
  {
    id: 'sacrificial-limb',
    name: 'Sacrificial Limb',
    description: '+20 Cursed Energy, -20 Body',
    loreDescription:
      "Permanently sacrificing a part of one's body to gain a sudden, massive surge in cursed energy output.",
    grade: 'Epic',
  },
];
