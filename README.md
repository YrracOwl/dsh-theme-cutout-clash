# dsh-theme-cutout-clash

**Cutout Clash 0.5.5** is a standalone selectable DSH Web theme bundle built around original neo-brutalist and pop-art composition. It is a companion to `dsh-theme-acid-noir`; neither plugin replaces or patches the other.

## Visual system

The theme follows **Loud edge, calm center**:

- Sidebar, selection, Composer, Goal, and the transient theme transition carry the expressive geometry.
- Conversation text, Markdown, terminals, diffs, code metrics, scroll geometry, and streaming content remain level and quiet.
- Tool and Think surfaces use a narrow semantic state rail instead of a heavy shadow on every card.
- Semantic states cover Goal/Todo text, inline code, distinct workspace-expanded and active-session states, Subagent popup hover, task-management hover, Settings navigation, Composer command controls, and the context dialog without relying on CSS-module hash names.
- Settings content buttons retain their plugin-owned semantic foregrounds: a theme never flattens every dialog button to ordinary label text, so primary Save/Upgrade controls preserve the foreground paired with their fill token.
- Produced-file chips keep their own controls, but the row behind them is transparent so the deliverables line does not read as another selected state.
- Inline links are scoped to the conversation prose plane and use variant-specific, explicitly underlined link pairs: bright cyan/yellow on Night and deep blue/red on Pop. The explicit decoration line is required because DSH's base Markdown link style resets `text-decoration-line` to `none`; setting only decoration color and thickness does not render a highlight. Navigation, buttons, file chips, and plugin chrome are not recolored as prose links.
- DSH's official Markdown renderer automatically turns an inline-code token whose complete value is an absolute HTTP(S) URL into `<code><a></a></code>`, including inside tight or loose list items. The theme therefore pairs every `code:not(pre code) a[href]` with the code chip foreground without assuming a paragraph parent.
- When DSH's file-mention provider recognizes an inline-code path, the same renderer emits `<code><button type="button" title aria-label></button></code>`. The theme targets this stable semantic structure—not its CSS-module hash—so clickable file paths inherit the code chip foreground and retain an explicit underline in normal and hover states.
- The Composer never receives a transform on hover, so its native context dialog retains DSH's original containing block and placement.
- No external fonts, images, audio, network assets, game marks, or character assets are included.

## Install

```bash
dsh plugin --profile web add ./dsh-theme-cutout-clash
dsh web
```

Then open **Settings → General → Cutout Clash theme**.

Available choices:

- **Default appearance** — follow the DSH built-in appearance.
- **Cutout Clash** — warm paper, lime action, pink events, cyan signal.
- **Night Cutout** — ink-blue Voltage palette with yellow and cyan hierarchy; filled yellow controls use dark foregrounds, while dark selected navigation uses light text.
- **Pop Signal** — warm Press palette with print blue, red, and yellow.

## Motion and lifecycle

- DSH currently exposes no public `app/ready`, `shell/ready`, or `boot/ready` Client event. `shell.overlay` is declared by AppFrame and therefore cannot cover the frame before AppFrame's first render.
- A saved Cutout theme installs a small viewport-fixed early curtain as soon as the Client bundle script executes. The curtain is already present before `[data-dsh-frame]` mounts; after Theme Runtime restores the saved tokens and the official shell Slot is available, it reveals and removes itself.
- Ordinary theme switches keep an additive `shell.overlay` lifecycle anchor, while the visual Plate is mounted directly under `document.body`. At a normal `z-index: 90` it escapes AppFrame's stacking context and covers shell content, yet sits below DSH's popup bands (menus at `100`, dialogs at `1000`, toasts at `1100`), so menus, dialogs, toasts, and third-party overlays can cover the transition.
- Boot reveal cleanup has its own timer channel, so a simultaneous Theme Runtime event cannot cancel removal and leave an opaque curtain over the restored application. The pre-Cordis curtain also owns an independent 2.5-second watchdog that performs the same reveal and removal if any Client plugin load failure prevents the Cutout Fiber from applying.
- Two geometric plates and one registration band perform a short non-blocking cover/reveal sequence.
- The overlay is always `pointer-events: none`.
- A monotonically increasing generation cancels stale timers during rapid switching.
- Motion is selectable in Settings: **完整转场 / Full motion**, **跟随系统 / Follow system**, or **关闭转场 / Motion off**. Existing Cutout users default to Full motion so a browser-level reduced-motion flag does not silently hide the requested theme effect; users can choose Follow system at any time.
- `prefers-reduced-motion: reduce` is honored when Follow system is selected; Full motion is an explicit user override, and Motion off is synchronous.
- No transcript node, code line, terminal output, diff, or streamed token receives entrance motion.
- Theme registrations, Slot entries, style nodes, timers, and body markers all belong to the plugin lifecycle and are removed on stop/unload.

## Preference coordination

Acid Noir and Cutout Clash now share the versioned browser record `dsh.theme.preference.v1`. Legacy keys are read only for migration. A selected theme writes one record, and Default clears it, so a DSH restart has one unambiguous custom-theme owner instead of two competing restorers.

DSH's built-in appearance scope can re-emit its durable `light` / `dark` / `system` preference when any Settings section is saved. If that refresh transiently replaces an active Cutout theme, the plugin restores the still-selected custom preference on the next task without requiring F5. This administrative recovery path is explicitly silent: it cancels any pending Plate and never plays the cover/reveal animation. Only cold boot and an intentional theme change animate. An explicit click on a built-in appearance choice or either theme family's Default button clears the custom record first, so intentional switching is never fought.

The motion choice is stored separately as `dsh-theme-cutout-clash.motion`.
