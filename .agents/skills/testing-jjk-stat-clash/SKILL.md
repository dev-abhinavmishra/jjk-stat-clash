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

## Machine quirks (this Windows box)

- **Always pass `workdir` on `exec` calls** — the default session cwd (`/home/ubuntu`) does not exist on this Windows machine; every shell command without an explicit workdir fails immediately.
- **Only Microsoft Edge is installed** (no Chrome) — the `browser_console` and `read_dom` computer-tool actions do NOT work. For tab-title assertions use screenshots + `zoom` on the tab bar region; Edge's first-run wizard may also need a one-time click-through.
- For deterministic title/head checks, open Edge DevTools (F12, allow the permission prompt once) and eval `document.title` in the Console — the tab label can lag behind or race short-lived branches, while `document.title` and `document.querySelectorAll('title')` are ground truth. You can navigate via `location.href=...` in the console when it holds keyboard focus.
- **PartyKit cannot run locally** — `partykit dev` crashes on Miniflare (`MiniflareCoreError: ERR_RUNTIME_FAILURE`), so real multiplayer gameplay (`/play/multiplayer` room joins, synced drafts) is untestable on this box. The draft-room route `/play/multiplayer/draft/:roomId` still renders its loading/error branches without a server (a ~5s no-socket timer flips it to the Connection Error screen) — enough for page-title checks, not gameplay.

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

## Binding Vow mechanics (Vow Pact row — current PR design)

- The last stat row (`bindingVow`) is a dedicated **"Vow Pact"** selector with a **"Vow Covenant"** detail panel beneath it — NOT a generic special-power select.
- **Gating:** the row is locked ("Requires 'Binding Vow' Special Power") until the 'Binding Vow' special-power entity is drafted into Special Power 1 or 2. Unpowered players keep the locked state.
- The select lists only the 8 vow entities (Revealing One's Hand, Life Gamble, Simple Territory, Overtime, Heavenly Pact, Future Sacrifice, Open Barrier, Sacrificial Limb) — searching a non-vow name (e.g. "gojo") returns "No matches found". Binding a vow writes its name onto the card row; the Covenant panel shows name/grade/effect/lore.
- The vow slot is **optional** — Finish Draft enables at 12/12 required stats with the vow empty. In the clash ledger the VOW PACT round resolves as a DRAW by design (vow entities carry no statValue); the vow _names_ still render in the clash row ("Open Barrier" vs "-" when the opponent never bound one).
- **Gamble mode:** a powered player's Vow Pact row shows a "Soul Roll" button + RollingScrambler instead of the select. Soul Roll is a **free action** — it does not end the turn and does not consume the global roll pool (watch the ROLLS counter stay fixed while "N/rollsPerStat VOW ROLLS (FREE)" increments). Re-rolling replaces the bound vow. Soul Roll is disabled while another stat roll is in progress; the turn ends only via a stat roll's green ✓ Lock or the End Turn button.

## Gamble-mode practical notes

- **'binding-vow' cannot be LUCKY-rolled** — the lucky pool is the top ~30% of special powers by statValue and binding-vow (statValue ~108) falls below the cutoff. Fish for it with normal ROLL (~1/21 chance per roll); generous pool config (Rolls/Stat high) gives more attempts.
- Turn indicator + **End Turn** button render in a row **below the two player cards** (next to the DraftTimer) — scroll to the card bottoms to find it. End Turn is only visible when no stat roll is in progress, and it lets a player pass without rolling (useful to force "last player standing" scenarios).
- After "Finish Draft" the comparison page's **versus splash is just the header** — the red "INITIATE EXPANSION" button sits mid-page below the CONFIRMED LORE BONDS section. Scroll to it; then "Yes, Expand!" starts the ~13 auto-resolving rounds (~2s each) → WINNER banner + grade cards + ROUND LEDGER.
- A powered player's bound vow appears as a badge under their name on the versus splash and as a "SYNERGY DETECTED" metric chip.

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
