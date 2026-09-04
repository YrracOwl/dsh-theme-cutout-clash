# Cutout Clash 0.2 design system

## Direction

An original collision of neo-brutalist editorial layout, pop-art signal colors, and rigid game-menu motion. It does not reproduce a named game, trademark, screen composition, font, character, audio cue, or visual asset.

## Loud edge, calm center

Expressive treatment is limited to shell chrome, selection, Composer framing, semantic state rails, Goal framing, Settings previews, and the transient transition Slot. The reading plane remains orthogonal and low-noise.

Never change conversation width, scroll gutter, Markdown/code font metrics, Diff geometry, Shiki token colors, terminal layout, or DSH’s built-in running shimmer.

## Palettes

- **Cutout Clash:** warm paper with lime, pink, and cyan signals.
- **Night Cutout / Voltage:** `#0e1117` canvas, `#171c25` surface, `#ffd33d` primary, `#39d6ff` signal, `#ff5d9e` hot accent.
- **Pop Signal / Press:** `#eee5d6` canvas, `#fff8ea` surface, `#2356d8` primary, `#d43a34` urgency, `#f2be2e` highlight.

One accent owns one component state. The center remains mostly neutral.

## Shadow budget

- Tier 0: transcript, Markdown, code, terminal, Diff — flat.
- Tier 1: Tool/Think — no offset shadow; 4px semantic rail.
- Tier 2: Goal and selected Settings choice — one 3–5px zero-blur offset.
- Tier 3: Composer focus — one visible 5px zero-blur offset.

No permanent filter, glow, particle, film grain, scanline, or canvas loop.

## Transition contract

Ordinary switches retain an original lifecycle anchor in the official `shell.overlay` list Slot, but the visual Plate is a package-owned viewport-fixed node directly under `document.body`. This escapes AppFrame's `z-index: 20` stacking context and sits at a normal `z-index: 90`: above all shell content, yet below DSH's popup bands (menus, banners, and hover cards at `100`, modal dialogs at `1000`, toasts at `1100`), so menus, dialogs, toasts, and third-party overlays can cover the transition. It is decorative (`aria-hidden`) and click-through. Theme Runtime remains the only preference authority; the Plate visually masks an already-emitted `theme/change` and does not claim an atomic React commit.

DSH exposes no public shell-ready event, and `shell.overlay` only exists after AppFrame renders. Cold restoration therefore uses one package-owned early curtain inserted synchronously by the Client bundle before its Cordis factory executes. It covers the pre-frame interval, then the running Fiber reveals and disposes it once both the saved theme and shell registration are ready. Because a Client plugin load error can prevent that Fiber from ever applying, the prelude owns an independent one-shot watchdog that reveals and removes the curtain without Cordis. The Fiber cancels that watchdog on normal reveal and also removes a stale curtain during stop/HMR.

Rapid changes increment a generation, clear the ordinary Plate timers, reset the active stage, and render only the newest cover/reveal. Boot-curtain removal uses a separate lifecycle-owned timer so an overlapping theme event cannot cancel the final reveal cleanup. Motion is an explicit three-state preference: full, system, or off. The system state honors `prefers-reduced-motion`; full is an intentional user override; off bypasses the visual sequence synchronously.

Semantic contrast is token-paired rather than dynamically guessed from arbitrary pixels. Light code surfaces use dark normal text and explicit syntax variables; Voltage surfaces use light text with dark filled-control foregrounds. Stable DSH semantic containers cover Goal, produced files, code headers, hover buttons, menus, and the Subagent tree. No whole-document color scanner or MutationObserver is used.

## Acceptance

- Default and Acid Noir leave no Cutout Clash body marker or active plate stage.
- 150+ messages and 40+ Tool rows remain readable and horizontally stable.
- 375px, 760px, desktop, 200% zoom, reduced motion, and rapid five-click switching are checked.
- Stop/unload removes Slot entry, style node, timers, registrations, and body marker.
