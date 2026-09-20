---
name: testing-jjk-stat-clash
description: How to run and end-to-end test JJK Stat Clash locally (Vite dev server, local draft flow, SearchableSelect quirks, binding vow mechanics)
---

# Testing JJK Stat Clash

## Dev server

- `npm run dev` from the repo root — Vite serves on **port 3000** (`vite --port=3000 --host=0.0.0.0`). Open http://localhost:3000.
- If the `npm`/`npx` Git Bash shims are broken on the machine, invoke Vite directly: `node node_modules/vite/bin/vite.js --port=3000 --host=0.0.0.0` (or use `npm.cmd`/`npx.cmd`).
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

## Vs-bot draft (/play/bot → BotDraft.tsx)

- Setup: /play → "Vs Bot" → difficulty card (Grade 4=easy, Grade 1=medium, Special Grade=hard) → "Standard" (normal draft) or "Cursed Lottery" (gamble: roll-pool config sliders → "Confirm Vow").
- Turn timer is `TURN_TIME_SECONDS = 30`; it ticks for BOTH players. On expiry `executeAutoTurn` fires once (auto-pick for human, auto-turn for bot) and passes turn exactly once — verify by counting filled stats before/after an expiry: a correct expiry is +1 stat for the expiring player, then the other side acts. If +2 stats appear for the human and the turn bounces back to them, the StrictMode double-fire bug is back.
- Bot picks ~1-3s after its turn starts ("BOT TURN" pill + "AI IS THINKING..." overlay on its card). A healthy bot turn never needs the full 30s.
- Fastest way to exercise the expiry path: just idle — each 30s expiry auto-picks and hands off cleanly; you can verify many cycles hands-free. Manual picks via SearchableSelect work too but tool round-trips often race the 30s clock.
- Gamble mode quirks: each stat row has ROLL/LUCKY buttons; a "Lock" button appears on the row while a roll is active; an "End Turn" button renders below System Protocol during the human's turn. When a player's roll pool hits 0 they have no rollable stats — their turns auto-skip in ~600ms (you'll see the turn ping-pong instantly) and `allSelected` treats them as done, so Clash! unlocks once both sides are exhausted even with stat rows still "Awaiting Roll...".
- **Known defect (verify before re-testing):** BotDraft does not pass `gambleConfig` to the human's `PlayerCard`, so the human's ROLL/LUCKY buttons render disabled — the human can only act via expiry auto-rolls and End Turn. If still unfixed, configure Global Roll Pool=10 (min) so auto-rolls exhaust quickly, and let expiries drive the draft.

## BanPhase (Sealing Protocol) quirks

- Renders per-player "Seal Entity N" selects, a "Seals Placed x / 2N" progress bar, and a seal registry strip once seals exist. In vs-bot the bot card is read-only ("AUTO" pill) and auto-mirrors the human's seals.
- `playerComplete` gates "Begin Draft" on `sealedBy(i) >= banCount` (fixed in db7c4c9). If you see it enabled at 0 seals with a "N seals remaining" label missing, the vacuous-`.every()` regression is back.
- Seal dropdowns open downward past the card edge and can overlap the Seal Registry strip. Hit-testing over the registry was fixed in 5cbf3db (card grid no longer z-caps `focus-within:z-50`). If a click on a visible option dismisses the dropdown without selecting, check `document.elementFromPoint` at the option's rect — if it returns a registry element instead of the option, the stacking regression is back. Natural top-down fill order should work.
- The seal SearchableSelect keeps its previous search text on reopen — clear the field (triple-click) before typing a new fragment or you'll get "No matches found" from the concatenated query.
- LocalDraft honors "Custom Rules" → "Bans per player" 1/2/3 — header text, per-player slot count, and the "/2N" progress total should all match the configured count.
