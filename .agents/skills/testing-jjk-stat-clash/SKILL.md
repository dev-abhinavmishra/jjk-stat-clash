---
name: testing-jjk-stat-clash
description: How to run and end-to-end test JJK Stat Clash locally (Vite dev server, local draft flow, SearchableSelect quirks, binding vow mechanics)
---

# Testing JJK Stat Clash

## Dev server

- `npm run dev` from the repo root — Vite serves on **port 3000** (`vite --port=3000 --host=0.0.0.0`). Open http://localhost:3000.
- Local mode (`/play` → Standard Protocol) needs **no backend**. Ignore Firebase/leaderboard warnings in the console — they are expected offline noise.
- Console in dev only logs Vite HMR + Vercel Analytics debug lines; any real `error`/`warning` entry is a genuine finding.

## Local draft flow (manual — no auto-fill button exists)

- `LocalDraft.tsx` has a `handleAutoFill` function but it is **dead code** — there is no auto-fill/random button in the UI. Drafts must be filled manually.
- Flow: /play → mode select → optional ban phase (default 2 bans each) → "Begin Draft" → fill **13 stat rows per player** → "Finish Draft" (header button, enabled only when every player shows 13/13) → "Initiate Expansion" → "Yes, Expand!" confirm modal → 13 rounds resolve at ~2s each (~30s total) → WINNER panel → Post-Clash Analysis report below.
- Player name is a plain text input at the top of each card (placeholder "Player N").

## SearchableSelect interactions

- Click the select → dropdown opens **below** it with an autofocused search box → type a name fragment → the first matching option sits ~118-121px below the select's center.
- **Prerequisite-gated entities return "No matches found"** until their prerequisite entity is drafted. Known gates: Limitless, Divine General Mahoraga + most Ten Shadows shikigami (Nue, Toad, Divine Dogs, Max Elephant, Rabbit Escape, Round Deer, Piercing Ox, Great Serpent, Agito), Deadly Sentencing (needs higuruma), Judgeman, Modulo Yuji / Black Box.
- Ungated shikigami that always work: Rika, Garuda, Moon Dregs, Rainbow Dragon, Kuchisake-onna, Cursed Corpse Gorilla/Triceratops, Smallpox Deity, Ganesha-like Curse.
- Ungated domains: Unlimited Void, Malevolent Shrine, Authentic Mutual Love, Womb Profusion, Chimera Shadow Garden, Self-Embodiment of Perfection, Coffin of the Iron Mountain, Ceremonial Sea of Light, Horizon of the Captivating Skandha, Threefold Affliction, Time Cell Moon Palace, Idle Death Gamble, Graveyard Domain, Shadow Realm, Empty Barrier.
- Dropdown options near the bottom of the viewport can hide behind the Windows taskbar — scroll the page so the select is mid-screen before opening.
- Picks are unique per player pair except `binding-vow` (both players may draft it).

## Binding Vow mechanics (needed for the vow ledger row)

- To make the "Binding Vow" stat row resolve as a 0-0 DRAW: draft the **"Binding Vow" entity** (specialPower category) into Special Power 1 or 2 → this unlocks a separate "Binding Vow (Optional)" picker → pick a real vow (e.g. Revealing One's Hand, Life Gamble). Real vow ids are not in `characters`, so `getStatValue` returns 0 → DRAW.
- Note: the stats map ALSO renders a "Binding Vow" row (a specialPower select bound to the same `draft.bindingVow` field). It stays visually unfilled ("Select Special Power...") even after the vow picker sets the field — cosmetic quirk, doesn't block 13/13.

## Black flashes

- Draft the **"Black Flash"** special power to enable a boosted 8% chance plus a pity system guaranteeing >=1 flash for that player.

## Achievements

- Stored in `localStorage["jjk-achievements"]` as an array of ids; match history in `jjk-player-stats`. Check via browser console when the Achievements modal is unreachable (bottom nav can sit under the OS taskbar at some window sizes).
- The 'sweep' check uses `roundWins` (per-player **series** win counts, all zeros at first clash end) — may false-positive "Perfect Sweep" on any first-match win.

## Version labels

- Home page footer shows the build label (`Build: Production X.Y.Z`); `GameFooter` on the /play start screen has its own copy — check both match.
