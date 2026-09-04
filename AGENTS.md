# dsh-theme-cutout-clash Maintenance Guide

## Purpose

Expressive neo-brutalist/pop theme family with calm reading surfaces:

- `cutout-clash`
- `cutout-clash-night`
- `cutout-clash-pop`

The visual direction is original. Do not add copied game logos, characters, screenshots, fonts, audio, icons, or extracted assets.

## Key Files

- `lib/client.js`: token tables (`COMMON`, `NIGHT`, `POP`), semantic CSS table, Settings UI, shared preference recovery, boot/runtime transitions.
- `lib/index.js`: Host bundle anchor only.
- `test/package.test.mjs`: release and invariant guard suite.
- `test/*.mjs`: manual CDP/render audits; many require a dedicated debug browser and the real `3080` GUI.
- `artifacts/`: render evidence and dedicated Edge profiles; excluded from package publication and potentially very large.
- `DESIGN.md`, `README.md`: design/lifecycle contract.

## Styling Strategy

1. Prefer semantic DSH Theme tokens.
2. Add narrow CSS only when a component owns additional styles.
3. Use stable attributes/ARIA/roles and actual renderer structure.
4. Never ship CSS-module hashes.
5. Verify normal, visited, hover, selected, disabled, and dark/light variant states as relevant.

Markdown has distinct surfaces:

- ordinary link: `a[href]`
- absolute URL inline code: `code > a[href]`
- recognized file path: `code > button[type=button][title][aria-label]`

Do not assume all clickable prose is an anchor. DSH base styles may set `text-decoration-line:none`; color/thickness alone do not create a visible underline.

## Theme and Transition Invariants

- Shared custom preference key: `dsh.theme.preference.v1`; motion key: `dsh-theme-cutout-clash.motion`.
- Administrative recovery after unrelated Settings saves is silent. Only cold boot and intentional theme changes animate.
- `silentPreference`, generation tickets, and separate boot/runtime timers prevent stale or accidental Plate animation.
- The pre-Cordis boot curtain must retain an independent failure watchdog; do not make its final reveal depend solely on the Cutout Fiber applying, because another Client plugin can fail first.
- Runtime Plate is decorative, `pointer-events:none`, lifecycle-owned, and removed on unload.
- Do not globally style dialogs or all dialog buttons; plugin-owned primary button foreground pairs must survive.
- Keep conversation, terminal, diff, code metrics, and streaming content free of transforms/filters and repeated entrance motion.

## Validation

```powershell
npm run check
npm pack --dry-run
```

For Web behavior:

1. Use the existing `http://127.0.0.1:3080` server.
2. Start a dedicated Edge CDP profile only for inspection; track and close it.
3. Navigate to a real long session and load older history when needed.
4. Select Night and Pop through rendered Settings, not localStorage assumptions alone.
5. Read `getComputedStyle()` and real `:hover` state.
6. Restore settings changed to trigger Save behavior.

## Pitfalls

- A new debug profile starts with no custom theme, so `data-cutout-clash=null` until a theme is selected.
- Offscreen history links cannot be hovered until scrolled into view; overlays can intercept input.
- A `reveal` without a preceding observed `cover` may be the tail of an earlier intentional switch; wait for Plate idle before auditing Save behavior.
- Settings Host adoption can transiently change preference; recovery must not produce a transition.
- The project contains multi-gigabyte Edge profiles under `artifacts/`. Move within the same volume; do not copy them casually.
- New executable audit scripts should resolve artifact output relative to `import.meta.url`; old hard-coded paths are technical debt to update when touched.
