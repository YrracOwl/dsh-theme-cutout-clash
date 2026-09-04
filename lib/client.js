// Cutout Clash — original neo-brutalist / pop-art DSH Web theme bundle.
// No game logos, characters, fonts, images, audio, or network assets are used.
// Install the saved-theme boot curtain before the Cordis module factory runs, so
// the DSH shell never paints an unthemed frame before Cutout restores.
;(() => {
  try {
    const shared = JSON.parse(localStorage.getItem('dsh.theme.preference.v1') || 'null')
    const legacy = localStorage.getItem('dsh-theme-cutout-clash.skin')
    const theme = shared?.theme || legacy
    const motion = localStorage.getItem('dsh-theme-cutout-clash.motion') || 'full'
    if (!/^cutout-clash(?:-night|-pop)?$/.test(theme || '') || motion === 'off') return
    if (motion === 'system' && matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (document.getElementById('dsh-cutout-transition-root')) return
    const root = document.createElement('div')
    root.id = 'dsh-cutout-transition-root'
    root.dataset.stage = 'boot'
    root.setAttribute('aria-hidden', 'true')
    root.style.cssText = 'position:fixed;inset:0;z-index:90;pointer-events:none;overflow:hidden;background:#111318;'
    const accent = theme === 'cutout-clash-night' ? '#ffd33d' : theme === 'cutout-clash-pop' ? '#2356d8' : '#e9f45f'
    root.innerHTML = '<i style="position:absolute;inset:0;background:' + accent + ';clip-path:polygon(0 0,100% 0,100% 62%,0 78%)"></i><i style="position:absolute;inset:0;background:#111318;clip-path:polygon(0 62%,100% 48%,100% 100%,0 100%)"></i><b style="position:absolute;left:-2%;right:-2%;top:50%;height:38px;display:grid;place-items:center;transform:translateY(-50%) skewY(-2deg);background:#fff8ea;color:#111;border-block:2px solid #111;font:900 11px/1 ui-monospace,monospace;letter-spacing:.18em">CUTOUT // SHIFT</b>'
    document.body.append(root)
    // The curtain runs before Cordis. If this or another Client plugin prevents the
    // Cutout Fiber from applying, no lifecycle callback exists to reveal it. Give
    // the prelude an independent one-shot watchdog so startup errors cannot leave
    // the GUI permanently covered.
    let finished = false
    const finish = () => {
      if (finished) return
      finished = true
      window.clearTimeout(timer)
      root.style.background = 'transparent'
      root.dataset.stage = 'fallback-reveal'
      const [top, bottom, band] = root.children
      if (typeof top?.animate === 'function') {
        top.animate([{ clipPath:'polygon(0 0,100% 0,100% 100%,0 100%)' },{ clipPath:'polygon(100% 0,100% 0,100% 100%,100% 100%)' }],{ duration:220,easing:'cubic-bezier(.22,1,.36,1)',fill:'both' })
        bottom.animate([{ clipPath:'polygon(0 0,100% 0,100% 100%,0 100%)' },{ clipPath:'polygon(0 0,0 0,0 100%,0 100%)' }],{ duration:220,delay:26,easing:'cubic-bezier(.22,1,.36,1)',fill:'both' })
        band.animate([{ transform:'translateY(-50%) skewY(-2deg) scaleY(1)',opacity:1 },{ transform:'translateY(-50%) skewY(-2deg) scaleY(0)',opacity:0 }],{ duration:130,easing:'ease-out',fill:'both' })
      } else {
        root.style.transition = 'opacity 220ms ease-out'
        root.style.opacity = '0'
      }
      window.setTimeout(()=>root.remove(),270)
    }
    const timer = window.setTimeout(finish,2500)
    root.__dshCutoutCurtain = { finish, cancel:()=>{finished=true;window.clearTimeout(timer)} }
  } catch (_) {}
})()
window.__ModuleLoader__.load({
  id: 'dsh-theme-cutout-clash',
  factory: (require) => {
    const module = { exports: {} }
    const React = require('react')
    // DSH compatibility layer: Client Store replaced the old runtime export in
    // 0.1.2; retain the legacy module for older RC hosts.
    let runtime
    try { runtime = require('@deepseek-ai/dsh-client-store') } catch { runtime = require('@deepseek-ai/dsh-client-runtime/client') }
    const SETTINGS_NS = 'settings.cutout-clash'
    const STORAGE_KEY = 'dsh-theme-cutout-clash.skin'
    const DEFAULT_SKIN = 'system'
    const STYLE_ID = 'dsh-theme-cutout-clash/styles'
    const PLATE_SLOT_ID = 'cutout-clash-transition'
    const RUNTIME_PLATE_ID = 'dsh-cutout-runtime-transition-root'

    const COMMON = {
      '--dsw-alias-bg-base': '#f3eee4', '--dsw-alias-bg-layer-1': '#fffdf7', '--dsw-alias-bg-layer-2': '#e8e0d2', '--dsw-alias-bg-layer-3': '#d7ccbc', '--dsw-alias-bg-overlay': '#fffdf7', '--dsw-alias-bg-module-platform': '#eee6d8', '--dsw-alias-bg-multi-select': '#e9f45f', '--dsw-alias-bg-skeleton': 'rgba(15,15,15,.08)', '--dsw-alias-border-l1': '#161616', '--dsw-alias-border-l2-darkmode-thin': '#161616', '--dsw-alias-border-l2': '#161616', '--dsw-alias-border-l3': '#161616', '--dsw-alias-border-l4': '#161616', '--dsw-alias-brand-primary': '#e9f45f', '--dsw-alias-brand-primary-invert': '#111', '--dsw-alias-brand-text': '#111', '--dsw-alias-button-primary-fill': '#e9f45f', '--dsw-alias-button-primary-hover': '#f5ff89', '--dsw-alias-button-primary-dimmed': '#b9c13d', '--dsw-alias-button-info-fill': '#4ed7e8', '--dsw-alias-button-info-hover': '#79e7f1', '--dsw-alias-button-elevated-fill': '#fffdf7', '--dsw-alias-button-floating-fill': '#fffdf7', '--dsw-alias-button-floating-hover': '#e8e0d2', '--dsw-alias-button-ghost-active-border': '#161616', '--dsw-alias-button-ghost-active-fill': '#e9f45f', '--dsw-alias-button-ghost-active-hover': '#f5ff89', '--dsw-alias-interactive-bg-active': '#e9f45f', '--dsw-alias-interactive-bg-hover-accent': '#4ed7e8', '--dsw-alias-interactive-bg-hover-danger': '#ff4d6d', '--dsw-alias-interactive-bg-hover-solid': '#161616', '--dsw-alias-interactive-bg-hover': '#e8e0d2', '--dsw-alias-label-primary': '#111', '--dsw-alias-label-primary-bluish': '#111', '--dsw-alias-label-primary-dimmed': '#333', '--dsw-alias-label-primary-foreground': '#111', '--dsw-alias-label-primary-inverted': '#fffdf7', '--dsw-alias-label-secondary': '#3d3933', '--dsw-alias-label-tertiary': '#6d655b', '--dsw-alias-label-caption': '#6d655b', '--dsw-alias-label-dimmed': '#91877a', '--dsw-alias-markdown-code-block': '#fffdf7', '--dsw-alias-markdown-code-block-banner': '#e8e0d2', '--dsw-alias-markdown-inline-code': '#e9f45f', '--dsw-alias-markdown-placeholder': '#e8e0d2', '--dsw-alias-markdown-tag': '#ff4d6d', '--dsw-alias-scrollbar-bg-l1': '#b5aa9b', '--dsw-alias-scrollbar-bg-l2': '#161616', '--dsw-alias-scrollbar-hover-l1': '#ff4d6d', '--dsw-alias-scrollbar-hover-l2': '#e9f45f', '--dsw-alias-state-business-primary': '#4b52e8', '--dsw-alias-state-business-tertiary': '#dfe0ff', '--dsw-alias-state-success-primary': '#16836d', '--dsw-alias-state-success-secondary': '#1f9d82', '--dsw-alias-state-success-tertiary': '#d9f2e9', '--dsw-alias-state-warn-label': '#bd6100', '--dsw-alias-state-warn-primary': '#ffb000', '--dsw-alias-state-warn-secondary': '#ffd166', '--dsw-alias-state-warn-tertiary': '#fff0c2', '--dsw-alias-state-error-primary': '#ff4d6d', '--dsw-alias-state-error-secondary': '#ff7c91', '--dsw-alias-toast-bg': '#161616', '--dsw-alias-tooltip-bg': '#161616', '--dsw-specific-bubble': '#fffdf7', '--dsw-specific-bubble-highlight': '#e8e0d2', '--dsw-specific-input-major': '#fffdf7', '--dsw-specific-login-input': '#fffdf7', '--dsw-specific-menu': '#fffdf7', '--dsw-specific-selector': '#fffdf7', '--dsw-specific-sidebar-fill': '#e8e0d2', '--dsw-specific-sidebar-nav-item-active-accent': '#e9f45f', '--dsw-specific-sidebar-nav-item-active': '#e9f45f', '--dsw-specific-sidebar-nav-item-hover': '#4ed7e8', '--dsw-specific-tip': '#fff0c2'
    }
    const NIGHT = { ...COMMON, '--dsw-alias-bg-base': '#0e1117', '--dsw-alias-bg-layer-1': '#171c25', '--dsw-alias-bg-layer-2': '#222a36', '--dsw-alias-bg-layer-3': '#2b3543', '--dsw-alias-bg-overlay': '#171c25', '--dsw-alias-bg-module-platform': '#121720', '--dsw-alias-label-primary': '#f7f2e7', '--dsw-alias-label-primary-bluish': '#f7f2e7', '--dsw-alias-label-primary-dimmed': '#d9dde4', '--dsw-alias-label-secondary': '#acb4c1', '--dsw-alias-label-tertiary': '#8e97a8', '--dsw-alias-label-caption': '#8e97a8', '--dsw-alias-label-dimmed': '#697384', '--dsw-alias-label-primary-foreground': '#111318', '--dsw-alias-label-primary-inverted': '#111318', '--dsw-alias-brand-primary': '#ffd33d', '--dsw-alias-brand-primary-invert': '#111318', '--dsw-alias-brand-text': '#ffd33d', '--dsw-alias-button-primary-fill': '#ffd33d', '--dsw-alias-button-primary-hover': '#ffe074', '--dsw-alias-button-primary-dimmed': '#5f5522', '--dsw-alias-button-info-fill': '#39d6ff', '--dsw-alias-button-info-hover': '#70e4ff', '--dsw-alias-button-ghost-active-fill': '#39351e', '--dsw-alias-button-ghost-active-hover': '#484328', '--dsw-alias-interactive-bg-active': '#39351e', '--dsw-alias-interactive-bg-hover-accent': '#173845', '--dsw-alias-interactive-bg-hover-solid': '#2b3543', '--dsw-alias-state-business-primary': '#39d6ff', '--dsw-alias-state-success-primary': '#6bdd8e', '--dsw-alias-state-error-primary': '#ff6957', '--dsw-alias-button-elevated-fill': '#222a36', '--dsw-alias-button-floating-fill': '#222a36', '--dsw-alias-button-floating-hover': '#2b3543', '--dsw-alias-interactive-bg-hover': '#2b3543', '--dsw-specific-bubble': '#171c25', '--dsw-specific-input-major': '#171c25', '--dsw-specific-sidebar-fill': '#121720', '--dsw-specific-sidebar-nav-item-active': '#39351e', '--dsw-specific-sidebar-nav-item-active-accent': '#ffd33d', '--dsw-specific-sidebar-nav-item-hover': '#173845', '--dsw-alias-markdown-code-block': '#0b0e13', '--dsw-alias-markdown-code-block-banner': '#222a36' }
    const POP = { ...COMMON, '--dsw-alias-bg-base': '#eee5d6', '--dsw-alias-bg-layer-1': '#fff8ea', '--dsw-alias-bg-layer-2': '#e4d8c5', '--dsw-alias-bg-layer-3': '#d7cab6', '--dsw-alias-brand-primary': '#2356d8', '--dsw-alias-brand-primary-invert': '#fff8ea', '--dsw-alias-brand-text': '#2356d8', '--dsw-alias-label-primary-foreground': '#fff8ea', '--dsw-alias-label-primary-inverted': '#fff8ea', '--dsw-alias-button-primary-fill': '#2356d8', '--dsw-alias-button-primary-hover': '#376bea', '--dsw-alias-button-primary-dimmed': '#7892d8', '--dsw-alias-button-info-fill': '#d43a34', '--dsw-alias-button-info-hover': '#e65a52', '--dsw-alias-interactive-bg-active': '#f2be2e', '--dsw-alias-interactive-bg-hover-accent': '#dce5ff', '--dsw-alias-state-business-primary': '#2356d8', '--dsw-alias-state-success-primary': '#14724a', '--dsw-alias-state-error-primary': '#b9282b', '--dsw-alias-state-warn-primary': '#f2be2e', '--dsw-alias-border-l3': '#2356d8' }
    const SKINS = [
      { id: 'cutout-clash', colorScheme: 'light', tokens: COMMON },
      { id: 'cutout-clash-night', colorScheme: 'dark', tokens: NIGHT },
      { id: 'cutout-clash-pop', colorScheme: 'light', tokens: POP },
    ]

    const CSS = `
body[data-cutout-clash] { --cc-ink:#17181e; --cc-shadow:#17181e; --cc-paper:var(--dsw-alias-bg-base); --cc-primary:#e9f45f; --cc-hot:#ff4d6d; --cc-signal:#4ed7e8; --cc-link:#164dba; --cc-link-hover:#944500; background-color:var(--cc-paper); background-image:radial-gradient(circle at 8% 10%,rgba(255,77,109,.09),transparent 22%),radial-gradient(circle at 88% 88%,rgba(78,215,232,.08),transparent 25%); }
body[data-cutout-clash="night"] { --cc-ink:#f7f2e7; --cc-shadow:#05070a; --cc-paper:#0e1117; --cc-primary:#ffd33d; --cc-hot:#ff5d9e; --cc-signal:#39d6ff; --cc-link:#78ddff; --cc-link-hover:#ffe074; background-image:radial-gradient(circle at 14% 7%,rgba(255,211,61,.07),transparent 24%); }
body[data-cutout-clash="pop"] { --cc-ink:#17181e; --cc-shadow:#17181e; --cc-paper:#eee5d6; --cc-primary:#2356d8; --cc-hot:#d43a34; --cc-signal:#f2be2e; --cc-link:#163f9f; --cc-link-hover:#9b2724; background-image:radial-gradient(circle at 86% 10%,rgba(35,86,216,.11),transparent 24%),radial-gradient(circle at 10% 90%,rgba(212,58,52,.07),transparent 25%); }
body[data-cutout-clash] [data-pane="sidebar"] { border-inline-end:2px solid var(--cc-ink); background-image:repeating-linear-gradient(135deg,transparent 0 16px,color-mix(in srgb,var(--cc-ink) 4%,transparent) 16px 18px); }
body[data-cutout-clash] [data-composer-card] { border:2px solid var(--cc-ink); border-radius:4px; box-shadow:4px 4px 0 var(--cc-shadow); }
body[data-cutout-clash] [data-composer-card]:focus-within { border-color:var(--cc-hot); box-shadow:5px 5px 0 var(--cc-hot); }
body[data-cutout-clash] [data-dsh-part="queue-dock"] { background:var(--dsw-alias-bg-layer-1); color:var(--dsw-alias-label-primary); }
body[data-cutout-clash] [data-tool],body[data-cutout-clash] [data-variant="think"] { border:1px solid var(--dsw-alias-border-l2); border-inline-start:4px solid var(--cc-ink); border-radius:4px; background:var(--dsw-alias-bg-layer-1); box-shadow:none; }
body[data-cutout-clash] [data-tool][data-state="ok"] { border-inline-start-color:var(--dsw-alias-state-success-primary); }
body[data-cutout-clash] [data-tool][data-state="error"] { border-inline-start-color:var(--dsw-alias-state-error-primary); }
body[data-cutout-clash] [data-tool][data-state="running"],body[data-cutout-clash] [data-tool][data-state="ongoing"] { border-inline-start-color:var(--cc-signal); }
body[data-cutout-clash] [data-goal-bar] > * { border:2px solid var(--cc-ink); border-radius:4px; background:var(--cc-primary); color:var(--dsw-alias-brand-primary-invert); box-shadow:3px 3px 0 var(--cc-shadow); }
body[data-cutout-clash] .md-code-block,body[data-cutout-clash] pre { border:1px solid var(--dsw-alias-border-l2); border-radius:4px; box-shadow:none; transform:none; background:var(--dsw-alias-markdown-code-block); color:var(--dsw-alias-label-primary); --shiki-background:var(--dsw-alias-markdown-code-block); --shiki-foreground:var(--dsw-alias-label-primary); --shiki-token-keyword:var(--cc-syntax-keyword); --shiki-token-constant:var(--cc-syntax-constant); --shiki-token-string-expression:var(--cc-syntax-string); --shiki-token-punctuation:var(--cc-syntax-punctuation); }
body[data-cutout-clash] .md-code-block > div:first-child > div:first-child { background:var(--dsw-alias-markdown-code-block-banner); color:var(--dsw-alias-label-primary); }
body[data-cutout-clash] .md-code-block > div:first-child > div:first-child button { color:var(--dsw-alias-label-primary); background:var(--dsw-alias-bg-layer-2); }
body[data-cutout-clash] { --cc-syntax-keyword:#164dba; --cc-syntax-constant:#944500; --cc-syntax-string:#116b45; --cc-syntax-punctuation:#17181e; }
body[data-cutout-clash="night"] { --cc-syntax-keyword:#54dbff; --cc-syntax-constant:#ffd75a; --cc-syntax-string:#79e39a; --cc-syntax-punctuation:#f7f2e7; }
body[data-cutout-clash] [data-chat-flow] a[href],body[data-cutout-clash] [data-chat-flow] a[href]:visited { color:var(--cc-link); text-decoration-line:underline; text-decoration-color:color-mix(in srgb,var(--cc-link) 72%,transparent); text-decoration-thickness:1.5px; text-underline-offset:3px; }
body[data-cutout-clash] [data-chat-flow] a[href]:hover { color:var(--cc-link-hover); text-decoration-color:currentColor; }
body[data-cutout-clash] [data-chat-flow] code:not(pre code) a[href],body[data-cutout-clash] [data-chat-flow] code:not(pre code) a[href]:visited,body[data-cutout-clash] [data-chat-flow] code:not(pre code) a[href]:hover { color:var(--dsw-alias-brand-primary-invert); text-decoration-color:currentColor; text-decoration-thickness:2px; }
body[data-cutout-clash] [data-chat-flow] code:not(pre code) > button[type="button"][title][aria-label] { color:inherit; background:transparent; border:0; padding:0; font:inherit; text-decoration-line:underline; text-decoration-color:currentColor; text-decoration-thickness:2px; text-underline-offset:3px; }
body[data-cutout-clash] [data-chat-flow] code:not(pre code) > button[type="button"][title][aria-label]:hover { color:inherit; background:transparent; text-decoration-color:currentColor; text-decoration-thickness:2px; }
body[data-cutout-clash] [data-conversation-scroll],body[data-cutout-clash] [data-chat-flow],body[data-cutout-clash] [data-terminal],body[data-cutout-clash] [data-diff],body[data-cutout-clash] [data-read] { transform:none; filter:none; }
body[data-cutout-clash] :focus-visible { outline:3px solid var(--cc-hot); outline-offset:3px; }
.cc-plate { position:fixed; inset:0; z-index:90; pointer-events:none; overflow:hidden; contain:strict; visibility:hidden; opacity:0; --cc-plate-a:#ff4d6d; --cc-plate-b:#e9f45f; --cc-plate-ink:#17181e; }
#dsh-cutout-transition-root,#dsh-cutout-runtime-transition-root { contain:strict; }
#dsh-cutout-runtime-transition-root { position:fixed; inset:0; z-index:90; pointer-events:none; }
#dsh-cutout-transition-root[data-stage="reveal"] > i:first-child { animation:cc-reveal-a 220ms cubic-bezier(.22,1,.36,1) both; }
#dsh-cutout-transition-root[data-stage="reveal"] > i:nth-child(2) { animation:cc-reveal-b 220ms 26ms cubic-bezier(.22,1,.36,1) both; }
#dsh-cutout-transition-root[data-stage="reveal"] > b { animation:cc-band-out 130ms ease-out both; }
.cc-plate[data-stage] { visibility:visible; opacity:1; }
.cc-plate__a,.cc-plate__b,.cc-plate__band { position:absolute; pointer-events:none; }
.cc-plate__a,.cc-plate__b { inset:0; transform:translateZ(0); }
.cc-plate__a { background:var(--cc-plate-a); clip-path:polygon(0 0,100% 0,100% 0,0 0); }
.cc-plate__b { background:var(--cc-plate-b); clip-path:polygon(0 100%,100% 100%,100% 100%,0 100%); }
.cc-plate__band { left:-2%; right:-2%; top:50%; height:38px; display:grid; place-items:center; border-block:2px solid #111; background:#fff8ea; color:#111; font:900 11px/1 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace; letter-spacing:.18em; transform:translateY(-50%) skewY(-2deg) scaleY(0); opacity:0; }
.cc-plate[data-stage="cover"] .cc-plate__a { animation:cc-cover-a 180ms cubic-bezier(.16,1,.3,1) both; }
.cc-plate[data-stage="cover"] .cc-plate__b { animation:cc-cover-b 180ms 28ms cubic-bezier(.16,1,.3,1) both; }
.cc-plate[data-stage="cover"] .cc-plate__band { animation:cc-band-in 150ms 42ms cubic-bezier(.16,1,.3,1) both; }
.cc-plate[data-stage="reveal"] .cc-plate__a { animation:cc-reveal-a 220ms cubic-bezier(.22,1,.36,1) both; }
.cc-plate[data-stage="reveal"] .cc-plate__b { animation:cc-reveal-b 220ms 26ms cubic-bezier(.22,1,.36,1) both; }
.cc-plate[data-stage="reveal"] .cc-plate__band { animation:cc-band-out 130ms ease-out both; }
@media (prefers-reduced-motion:no-preference) {
 body[data-cutout-clash] [data-tool],body[data-cutout-clash] [data-variant="think"],body[data-cutout-clash] [data-composer-card] { transition:transform 120ms ease,box-shadow 120ms ease,border-color 120ms ease; }
 body[data-cutout-clash] [data-tool]:hover,body[data-cutout-clash] [data-variant="think"]:hover { border-color:var(--cc-hot); }
 body[data-cutout-clash] [data-composer-card]:hover { box-shadow:5px 5px 0 var(--cc-signal); }
}
@keyframes cc-cover-a { to { clip-path:polygon(0 0,100% 0,100% 62%,0 78%); } }
@keyframes cc-cover-b { to { clip-path:polygon(0 62%,100% 48%,100% 100%,0 100%); } }
@keyframes cc-band-in { to { transform:translateY(-50%) skewY(-2deg) scaleY(1); opacity:1; } }
@keyframes cc-reveal-a { from { clip-path:polygon(0 0,100% 0,100% 100%,0 100%); } to { clip-path:polygon(100% 0,100% 0,100% 100%,100% 100%); } }
@keyframes cc-reveal-b { from { clip-path:polygon(0 0,100% 0,100% 100%,0 100%); } to { clip-path:polygon(0 0,0 0,0 100%,0 100%); } }
@keyframes cc-band-out { from { transform:translateY(-50%) skewY(-2deg) scaleY(1); opacity:1; } to { transform:translateY(-50%) skewY(-2deg) scaleY(0); opacity:0; } }
@media (prefers-reduced-motion:reduce) { body[data-cutout-clash] [data-tool],body[data-cutout-clash] [data-variant="think"],body[data-cutout-clash] [data-composer-card] { transition:none; } }
body[data-cutout-clash] [role="tree"][aria-label="子代理会话"],body[data-cutout-clash] [role="dialog"],body[data-cutout-clash] [role="menu"],body[data-cutout-clash] [role="listbox"] { color:var(--dsw-alias-label-primary); background:var(--dsw-alias-bg-overlay); border-color:var(--dsw-alias-border-l2); }
body[data-cutout-clash] [role="tree"][aria-label="子代理会话"] [role="treeitem"],body[data-cutout-clash] [role="menu"] button,body[data-cutout-clash] [role="listbox"] button { color:var(--dsw-alias-label-primary); }
body[data-cutout-clash] [data-goal-bar] > * *,body[data-cutout-clash] [data-goal-bar] code button { color:var(--dsw-alias-brand-primary-invert)!important; }
body[data-cutout-clash] [data-produced-files-row] { background:transparent; color:var(--dsw-alias-label-primary); }
body[data-cutout-clash] [data-produced-files-row] button { color:var(--dsw-alias-label-primary); background:var(--dsw-alias-bg-layer-1); }
body[data-cutout-clash] [data-produced-files-row] button:hover { color:var(--dsw-alias-label-primary); background:var(--dsw-alias-bg-layer-3); }
body[data-cutout-clash] .md-code-block button,body[data-cutout-clash] pre button { color:var(--dsw-alias-label-primary); background:var(--dsw-alias-bg-layer-2); }
body[data-cutout-clash] .md-code-block button:hover,body[data-cutout-clash] pre button:hover { color:var(--dsw-alias-label-primary); background:var(--dsw-alias-bg-layer-3); }
body[data-cutout-clash] code:not(pre code) { color:var(--dsw-alias-brand-primary-invert); background:var(--dsw-alias-brand-primary); border:1px solid color-mix(in srgb,var(--dsw-alias-brand-primary-invert) 28%,transparent); }
body[data-cutout-clash] [data-testid="todo-panel"] { color:var(--dsw-alias-label-primary); background:var(--dsw-alias-bg-layer-1); border:1px solid var(--dsw-alias-border-l2); border-radius:4px; }
body[data-cutout-clash] [data-testid="todo-panel"] button,body[data-cutout-clash] [data-testid="todo-panel"] button *,body[data-cutout-clash] [data-testid="todo-panel"] [data-status] { color:var(--dsw-alias-label-primary); }
body[data-cutout-clash] [data-testid="todo-panel"] [data-status="pending"],body[data-cutout-clash] [data-testid="todo-panel"] [data-status="completed"],body[data-cutout-clash] [data-testid="todo-panel"] [data-status="pending"] *,body[data-cutout-clash] [data-testid="todo-panel"] [data-status="completed"] * { color:var(--dsw-alias-label-secondary); }
body[data-cutout-clash] [data-pane="sidebar"] [role="treeitem"][aria-expanded="true"]:not([aria-selected="true"]) { color:var(--dsw-alias-label-primary); background:var(--dsw-specific-sidebar-nav-item-active); box-shadow:inset 3px 0 0 var(--dsw-specific-sidebar-nav-item-active-accent); }
body[data-cutout-clash] [data-pane="sidebar"] [role="treeitem"][aria-selected="true"] { color:var(--dsw-alias-label-primary); background:var(--dsw-alias-interactive-bg-hover-accent); box-shadow:inset 3px 0 0 var(--dsw-alias-state-business-primary); }
body[data-cutout-clash] [data-pane="sidebar"] [role="treeitem"][aria-selected="true"] *,body[data-cutout-clash] [data-pane="sidebar"] [role="treeitem"][aria-expanded="true"] * { color:inherit; }
body[data-cutout-clash] [data-pane="sidebar"] [role="treeitem"]:hover,body[data-cutout-clash] [role="tree"][aria-label="子代理会话"] [role="treeitem"]:hover,body[data-cutout-clash] button[title="任务管理"]:hover,body[data-cutout-clash] button[title="Task management"]:hover,body[data-cutout-clash] [data-pane="sidebar"] button[aria-haspopup="dialog"]:hover { color:var(--dsw-alias-label-primary); background:var(--dsw-alias-bg-layer-3); }
body[data-cutout-clash] [data-pane="sidebar"] [role="treeitem"]:hover *,body[data-cutout-clash] [role="tree"][aria-label="子代理会话"] [role="treeitem"]:hover *,body[data-cutout-clash] button[title="任务管理"]:hover *,body[data-cutout-clash] button[title="Task management"]:hover * { color:inherit; }
body[data-cutout-clash] [role="dialog"][aria-modal="true"] button[aria-current="true"] { color:var(--dsw-alias-label-primary); background:var(--dsw-specific-sidebar-nav-item-active); box-shadow:inset 3px 0 0 var(--dsw-specific-sidebar-nav-item-active-accent); }
body[data-cutout-clash] [data-cutout-choice]:hover { color:var(--dsw-alias-label-primary)!important; background:var(--dsw-alias-bg-layer-3)!important; }
body[data-cutout-clash] [data-composer-card] button[aria-haspopup="listbox"] { color:var(--dsw-alias-label-primary); background:var(--dsw-alias-bg-layer-2); }
body[data-cutout-clash] [data-composer-card] button[aria-haspopup="listbox"]:hover,body[data-cutout-clash] [data-composer-card] button[aria-haspopup="listbox"][aria-expanded="true"] { color:var(--dsw-alias-label-primary); background:var(--dsw-alias-bg-layer-3); }
body[data-cutout-clash] [data-composer-card] button[aria-haspopup="dialog"] { color:var(--dsw-alias-label-secondary); }
body[data-cutout-clash] [data-composer-card] [role="dialog"] { z-index:100; max-width:min(320px,calc(100vw - 32px)); color:var(--dsw-alias-label-primary); background:var(--dsw-alias-bg-overlay); }
@media (max-width:760px) { body[data-cutout-clash] { background-image:none; } body[data-cutout-clash] [data-composer-card] { box-shadow:3px 3px 0 var(--cc-ink); } .cc-plate__band { font-size:9px; letter-spacing:.1em; } }
`
    const zh = { title:'Cutout Clash 主题', caption:'粗野主义 × 波普构成', default:'默认外观', 'cutout-clash':'Cutout Clash', 'cutout-clash-night':'Night Cutout', 'cutout-clash-pop':'Pop Signal', motion:'主题转场', 'motion-full':'完整转场', 'motion-system':'跟随系统', 'motion-off':'关闭转场' }
    const en = { title:'Cutout Clash theme', caption:'Neo-brutalist pop composition', default:'Default appearance', 'cutout-clash':'Cutout Clash', 'cutout-clash-night':'Night Cutout', 'cutout-clash-pop':'Pop Signal', motion:'Theme motion', 'motion-full':'Full motion', 'motion-system':'Follow system', 'motion-off':'Motion off' }
    const SHARED_KEY = 'dsh.theme.preference.v1'
    const MOTION_KEY = 'dsh-theme-cutout-clash.motion'
    const readShared = () => { try { const raw=localStorage.getItem(SHARED_KEY);const value=raw?JSON.parse(raw):null;return value&&value.version===1&&typeof value.theme==='string'?value:null } catch (_) { return null } }
    const readSaved = () => { try { const shared=readShared();if(shared?.theme)return shared.theme;const legacy=localStorage.getItem(STORAGE_KEY)||localStorage.getItem('dsh-theme-acid-noir.skin');return legacy||null } catch (_) { return null } }
    const writeSaved = id => { try { if(id===DEFAULT_SKIN){localStorage.removeItem(SHARED_KEY);localStorage.removeItem(STORAGE_KEY);localStorage.removeItem('dsh-theme-acid-noir.skin')}else{localStorage.setItem(SHARED_KEY,JSON.stringify({version:1,theme:id,owner:'dsh-theme-cutout-clash'}));localStorage.removeItem(STORAGE_KEY);localStorage.removeItem('dsh-theme-acid-noir.skin')} } catch (_) {} }
    const readMotion = () => { try { const value=localStorage.getItem(MOTION_KEY);return value==='system'||value==='off'||value==='full'?value:'full' } catch (_) { return 'full' } }
    const writeMotion = value => { try { localStorage.setItem(MOTION_KEY,value) } catch (_) {} }
    const isBuiltinChoice = target => { const button=target?.closest?.('button');if(!button||button.hasAttribute('data-cutout-choice')||button.hasAttribute('data-acid-choice'))return false;const label=(button.textContent||'').trim().replace(/\s+/g,' ').toLowerCase();return ['浅色','深色','跟随系统','light','dark','follow system'].includes(label) }
    const createStore = () => runtime.defineStore({ init:()=>({ skin:DEFAULT_SKIN, motion:readMotion(), revision:-1 }), actions:{ sync:(d,skin,revision)=>{ if(revision>d.revision){d.skin=skin;d.revision=revision} }, setMotion:(d,motion)=>{d.motion=motion} } })
    const rowStyle = { root:{display:'flex',flexDirection:'column',gap:8,padding:'16px 0',borderBottom:'2px solid var(--dsw-alias-border-l2)'}, title:{color:'var(--dsw-alias-label-primary)',fontSize:14,fontWeight:800}, caption:{color:'var(--dsw-alias-label-tertiary)',fontSize:12}, choices:{display:'flex',flexWrap:'wrap',gap:8}, button:{width:126,padding:8,border:'2px solid var(--dsw-alias-border-l2)',borderRadius:0,background:'var(--dsw-alias-bg-layer-1)',color:'var(--dsw-alias-label-primary)',cursor:'pointer',font:'inherit',boxShadow:'3px 3px 0 var(--dsw-alias-border-l2)'}, selected:{borderColor:'var(--dsw-alias-brand-primary)',transform:'translate(-2px,-2px)',boxShadow:'5px 5px 0 var(--dsw-alias-border-l2)'}, swatch:{height:34,display:'grid',gridTemplateColumns:'1fr 1fr 1fr',overflow:'hidden',marginBottom:6}, label:{fontSize:12,fontWeight:800} }
    function Choice({id,active,label,colors,setSkin}) { return React.createElement('button',{type:'button','data-cutout-choice':'theme','aria-pressed':active,onClick:()=>setSkin(id),style:{...rowStyle.button,...(active?rowStyle.selected:{})}},React.createElement('span',{style:rowStyle.swatch},...colors.map((color,i)=>React.createElement('i',{key:i,style:{background:color}}))),React.createElement('span',{style:rowStyle.label},label)) }
    function SkinRow({t,setSkin,setMotion,useStore}) { const skin=useStore(s=>s.skin);const motion=useStore(s=>s.motion);const known=skin===DEFAULT_SKIN||SKINS.some(x=>x.id===skin);const current=known?skin:null;const motionButton=value=>React.createElement('button',{type:'button','data-cutout-choice':'motion','aria-pressed':motion===value,onClick:()=>setMotion(value),style:{...rowStyle.button,width:112,...(motion===value?rowStyle.selected:{})}},React.createElement('span',{style:rowStyle.label},t('motion-'+value)));return React.createElement('div',{style:rowStyle.root},React.createElement('div',{style:rowStyle.title},t('title')),React.createElement('div',{style:rowStyle.caption},t('caption')),React.createElement('div',{style:rowStyle.choices},React.createElement(Choice,{id:DEFAULT_SKIN,active:current===DEFAULT_SKIN,label:t('default'),colors:['#fffdf7','#e9f45f','#161616'],setSkin}),React.createElement(Choice,{id:'cutout-clash',active:current==='cutout-clash',label:t('cutout-clash'),colors:['#fffdf7','#e9f45f','#ff4d6d'],setSkin}),React.createElement(Choice,{id:'cutout-clash-night',active:current==='cutout-clash-night',label:t('cutout-clash-night'),colors:['#0e1117','#ffd33d','#39d6ff'],setSkin}),React.createElement(Choice,{id:'cutout-clash-pop',active:current==='cutout-clash-pop',label:t('cutout-clash-pop'),colors:['#eee5d6','#2356d8','#d43a34'],setSkin})),React.createElement('div',{style:{...rowStyle.caption,marginTop:4}},t('motion')),React.createElement('div',{style:rowStyle.choices},motionButton('full'),motionButton('system'),motionButton('off'))) }
    function createPlateComponent(bind) { return function Plate() { React.useEffect(()=>bind(),[]); return null } }
    const inject = ['slots','locale','theme']
    function apply(ctx) {
      const disposers=SKINS.map(s=>ctx.theme.register(s)); ctx.effect(()=>()=>disposers.forEach(d=>d()),'cutout-clash: registrations')
      let style=document.createElement('style');style.id=STYLE_ID;style.dataset.plugin='dsh-theme-cutout-clash';style.textContent=CSS;document.head.append(style);ctx.effect(()=>()=>{if(style)style.remove();style=null},'cutout-clash: package styles')
      const saved=readSaved();let bootRoot=document.getElementById('dsh-cutout-transition-root');let runtimeRoot=document.getElementById(RUNTIME_PLATE_ID);let plateReady=false;let generation=0;let timers=[];let bootTimer=null;let startupTimer=null;let startupScheduled=false;let recoveryGeneration=0;let silentPreference=null;let lastPreference=ctx.theme.getTheme().preference;let activeVariant=null
      const clearTimers=()=>{for(const id of timers)window.clearTimeout(id);timers=[]}
      const variantOf=id=>id?.endsWith('-night')?'night':id?.endsWith('-pop')?'pop':'base'
      const paletteOf=variant=>variant==='night'?['#ff5d9e','#ffd33d']:variant==='pop'?['#d43a34','#2356d8']:['#ff4d6d','#e9f45f']
      const ensureRuntimeRoot=()=>{if(runtimeRoot?.isConnected)return runtimeRoot;runtimeRoot=document.createElement('div');runtimeRoot.id=RUNTIME_PLATE_ID;runtimeRoot.setAttribute('aria-hidden','true');runtimeRoot.innerHTML='<div class="cc-plate"><i class="cc-plate__a"></i><i class="cc-plate__b"></i><div class="cc-plate__band">CUTOUT // SHIFT</div></div>';document.body.append(runtimeRoot);return runtimeRoot}
      const removeMarker=()=>{activeVariant=null;document.body.removeAttribute('data-cutout-clash')}
      const plateState=(stage,ticket,variant)=>{if(!plateReady&&stage)return;const root=ensureRuntimeRoot();const plate=root.firstElementChild;if(!plate)return;const palette=paletteOf(variant);plate.style.setProperty('--cc-plate-a',palette[0]);plate.style.setProperty('--cc-plate-b',palette[1]);plate.dataset.generation=String(ticket);if(stage)plate.dataset.stage=stage;else plate.removeAttribute('data-stage')}
      const shouldAnimate=()=>{const mode=readMotion();return mode==='full'||(mode==='system'&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches)}
      const playPlate=variant=>{const ticket=++generation;clearTimers();if(!shouldAnimate()){plateState(null,ticket,variant);return}plateState('cover',ticket,variant);timers.push(window.setTimeout(()=>{if(ticket!==generation)return;plateState('reveal',ticket,variant);timers.push(window.setTimeout(()=>{if(ticket===generation)plateState(null,ticket,variant)},250))},210))}
      const revealBoot=()=>{if(!bootRoot)return;bootRoot.__dshCutoutCurtain?.cancel?.();bootRoot.style.background='transparent';bootRoot.dataset.stage='reveal';if(bootTimer!==null)window.clearTimeout(bootTimer);bootTimer=window.setTimeout(()=>{bootRoot?.remove();bootRoot=null;bootTimer=null},270)}
      const scheduleStartup=variant=>{if(startupScheduled||!saved||saved!==lastPreference||!plateReady)return;startupScheduled=true;startupTimer=window.setTimeout(()=>{startupTimer=null;if(ctx.theme.getTheme().preference===saved){if(bootRoot)revealBoot();else playPlate(variant)}},32)}
      const sync=snapshot=>{const active=SKINS.find(s=>s.id===snapshot.preference);const previous=lastPreference;lastPreference=snapshot.preference;if(active){activeVariant=variantOf(active.id);document.body.setAttribute('data-cutout-clash',activeVariant);if(snapshot.preference===silentPreference){silentPreference=null;generation++;clearTimers();plateState(null,generation,activeVariant);return}if(snapshot.preference!==previous){if(saved===snapshot.preference&&!startupScheduled)scheduleStartup(activeVariant);else playPlate(activeVariant)}}else{const preferred=readSaved();if(SKINS.some(s=>s.id===previous)&&SKINS.some(s=>s.id===preferred)&&preferred===previous){generation++;clearTimers();plateState(null,generation,activeVariant||variantOf(preferred));const ticket=++recoveryGeneration;silentPreference=preferred;Promise.resolve().then(()=>{if(ticket===recoveryGeneration&&readSaved()===preferred&&!SKINS.some(s=>s.id===ctx.theme.getTheme().preference))ctx.theme.setTheme(preferred);else if(silentPreference===preferred)silentPreference=null});return}if(SKINS.some(s=>s.id===previous))playPlate(activeVariant||'base');removeMarker()}}
      ctx.effect(()=>()=>{generation++;clearTimers();if(bootTimer!==null)window.clearTimeout(bootTimer);if(startupTimer!==null)window.clearTimeout(startupTimer);recoveryGeneration++;silentPreference=null;bootRoot?.__dshCutoutCurtain?.cancel?.();bootRoot?.remove();bootRoot=null;runtimeRoot?.remove();runtimeRoot=null;plateReady=false;removeMarker()},'cutout-clash: transition lifecycle')
      ctx.effect(()=>ctx.on('theme/change',sync),'cutout-clash: theme sync')
      ctx.effect(()=>{const onBuiltinChoice=event=>{if(isBuiltinChoice(event.target))writeSaved(DEFAULT_SKIN)};document.addEventListener('click',onBuiltinChoice,true);return()=>document.removeEventListener('click',onBuiltinChoice,true)},'cutout-clash: built-in preference intent')
      const Plate=createPlateComponent(()=>{plateReady=true;ensureRuntimeRoot();const current=ctx.theme.getTheme().preference;if(saved===current)scheduleStartup(variantOf(current));else if(SKINS.some(s=>s.id===current))playPlate(variantOf(current));return()=>{plateReady=false}})
      ctx.slots.inject('shell.overlay',()=>ctx.slots.register({name:'shell.overlay',id:PLATE_SLOT_ID,order:95},Plate))
      const store=createStore();let bound;ctx.effect(()=>ctx.on('theme/change',s=>bound?.sync(s.preference,s.revision)),'cutout-clash: store sync')
      let restoreTimer=null;if(saved&&SKINS.some(s=>s.id===saved))restoreTimer=window.setTimeout(()=>{if(readSaved()===saved&&ctx.theme.getTheme().preference!==saved)ctx.theme.setTheme(saved)},300);ctx.effect(()=>()=>{if(restoreTimer!==null)window.clearTimeout(restoreTimer)},'cutout-clash: preference restore timer')
      sync(ctx.theme.getTheme());ctx.effect(()=>ctx.locale.register(SETTINGS_NS,{zh,en}),'cutout-clash: locale')
      ctx.slots.inject('settings.general.item',()=>ctx.slots.register({name:'settings.general.item',id:'cutout-clash-theme',order:20,store,locale:SETTINGS_NS,inject:actions=>{bound=actions;const snapshot=ctx.theme.getTheme();actions.sync(snapshot.preference,snapshot.revision);return{setSkin:id=>{writeSaved(id);ctx.theme.setTheme(id)},setMotion:value=>{writeMotion(value);actions.setMotion(value)}}}},SkinRow))
    }
    module.exports={DEFAULT_SKIN,SKINS,inject,apply}
    return module.exports
  }
})
