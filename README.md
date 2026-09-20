<div align="center">

# ⚔️ JJK Stat Clash

**Draft your ultimate Jujutsu Kaisen sorcerer and clash against friends.**

A stat-drafting battle game featuring 80+ characters, techniques, tools, and domains from the Jujutsu Kaisen universe.

![JJK Stat Clash](public/clash.gif)

[![MIT License](https://img.shields.io/badge/license-MIT-red.svg)](LICENSE)
[![Built with Vite](https://img.shields.io/badge/built%20with-Vite-646CFF.svg)](https://vitejs.dev)
[![React 19](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev)

</div>

---

## 🎮 How It Works

JJK Stat Clash is a local multiplayer drafting game where 2–8 players build their ideal sorcerer by selecting entities across **11 stat categories**, then clash to see whose build is stronger.

### Game Phases

| Phase              | Description                                                                                                                                                   |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **🚫 Ban Phase**   | Each player bans 2 entities from the global pool                                                                                                              |
| **📋 Draft Phase** | Players fill 11 slots: Character stats (Strength, Speed, Durability, CE, Body, IQ), Cursed Technique, Tool, Shikigami, Domain Expansion, and 2 Special Powers |
| **⚡ Clash**       | Stats are compared head-to-head with synergy bonuses, Black Flash crits, Binding Vow modifiers, and Heavenly Restriction interactions                         |

### Game Modes

- **Normal Protocol** — Free selection from the entity database
- **Gamble Mode (Cursed Lottery)** — Roll for random entities with a limited number of spins and lucky rolls

---

## ✨ Features

- **100+ entities** — Characters, Cursed Techniques, Domain Expansions, Tools, Shikigami, and Special Powers
- **Rarity system** — Common → Uncommon → Rare → Epic → Legendary → Mythic
- **Synergy pairings** — Draft entities from the same lore lineage for stat bonuses (e.g., Gojo + Limitless + Six Eyes)
- **Secret synergies** — Hidden pairings that grant massive bonuses when discovered
- **Binding Vows** — Optional risk/reward modifiers (e.g., Life Gamble: 1 Durability, 2× Strength/Speed)
- **Black Flash** — Random critical hits that multiply a stat by 2.5×
- **Heavenly Restriction** — Zero CE/CT/DE but massive physical stat bonuses and domain immunity
- **Domain Refinement** — IQ and CE contribute hidden bonuses to Domain Expansion clashes
- **Match history** — Series tracking with win counters across multiple rounds
- **Post-clash analysis** — Sorcerer grade evaluations, round ledger, and match highlights after every clash
- **Cinematic transitions** — Full-screen phase transitions with kanji animations
- **2–8 players** — Add or remove challengers dynamically
- **Auto-fill** — Randomly populate empty slots for quick games

---

## 🛠️ Tech Stack

| Technology                                   | Purpose                  |
| -------------------------------------------- | ------------------------ |
| [React 19](https://react.dev)                | UI framework             |
| [TypeScript](https://www.typescriptlang.org) | Type safety              |
| [Vite](https://vitejs.dev)                   | Build tool & dev server  |
| [Tailwind CSS v4](https://tailwindcss.com)   | Utility-first styling    |
| [Motion](https://motion.dev) (Framer Motion) | Animations & transitions |
| [Lucide React](https://lucide.dev)           | Icon library             |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) ≥ 20

### Installation

```bash
# Clone the repository
git clone https://github.com/website-deployer/jjk-stat-clash.git
cd jjk-stat-clash

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at **http://localhost:3000**

### Build for Production

```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
jjk-stat-clash/
├── public/
│   ├── clash.gif          # Demo animation
│   └── favicon.svg        # App favicon
├── src/
│   ├── components/
│   │   ├── ClashRow.tsx              # Individual stat comparison row
│   │   ├── Comparison.tsx            # Full clash results view
│   │   ├── CursedConvergenceTransition.tsx  # Clash transition animation
│   │   ├── ErrorBoundary.tsx         # Error fallback UI
│   │   ├── HelpPage.tsx              # System archives / help modal
│   │   ├── PhaseTransition.tsx       # Phase change animations
│   │   └── PlayerCard.tsx            # Draft card with searchable selects
│   ├── data/
│   │   └── characters.ts            # Entity database & synergy pairings
│   ├── App.tsx                       # Main application
│   ├── index.css                     # Global styles & Tailwind config
│   └── main.tsx                      # Entry point
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🎯 Game Mechanics Reference

<details>
<summary><strong>Stat Categories (11 Slots)</strong></summary>

| Slot             | Category        | Source           |
| ---------------- | --------------- | ---------------- |
| Strength         | Character stat  | Character        |
| Speed            | Character stat  | Character        |
| Durability       | Character stat  | Character        |
| Cursed Energy    | Character stat  | Character        |
| Body             | Character stat  | Character        |
| Battle IQ        | Character stat  | Character        |
| Cursed Technique | Technique power | Cursed Technique |
| Cursed Tool      | Tool power      | Tool             |
| Shikigami        | Summon power    | Shikigami        |
| Domain Expansion | Domain power    | Domain Expansion |
| Special Power ×2 | Ability power   | Special Power    |

</details>

<details>
<summary><strong>Rarity Tiers</strong></summary>

| Grade     | Tier | Typical Stats |
| --------- | ---- | ------------- |
| Mythic    | S    | 120+          |
| Legendary | A    | 100–115       |
| Epic      | B    | 85–95         |
| Rare      | C    | 70–80         |
| Uncommon  | D    | 55–65         |
| Common    | E    | <50           |

</details>

<details>
<summary><strong>Special Mechanics</strong></summary>

- **Black Flash** — 2.5× multiplier on physical stats (rare chance, boosted by Body stat and the Black Flash special power)
- **Domain Refinement** — 10% of IQ + 5% of CE added as hidden bonus to Domain Expansion
- **Heavenly Restriction** — CE/CT/DE forced to 0, +25 to Speed/Durability/IQ, +35 Durability vs. DE users
- **Binding Vows** — 8 different vows with unique risk/reward tradeoffs
- **Synergy Bonuses** — 14 public pairings + 7 secret pairings with massive stat bonuses

</details>

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

**Disclaimer:** Jujutsu Kaisen is created by Gege Akutami. This is a fan project and is not affiliated with or endorsed by Shueisha, MAPPA, or any official Jujutsu Kaisen entities. All character names and references are used under fair use for fan-made, non-commercial purposes.
