import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import vm from 'node:vm'
const read = p => readFile(new URL(p, import.meta.url), 'utf8')

test('standalone 0.5 bundle contract', async () => {
  const pkg = JSON.parse(await read('../package.json'))
  assert.equal(pkg.name, 'dsh-theme-cutout-clash')
  assert.equal(pkg.version, '0.5.10')
  assert.equal(pkg.dsh.bundle.patch, './cordis.patch.yml')
  assert.equal(pkg.dsh.client.platform, 'web')
  assert.equal(pkg.dsh.client.immediately, true)
  assert.ok(pkg.dsh.client.inject.includes('@deepseek-ai/dsh-client-ui-theme'))
  assert.equal(pkg.exports['./client'], './lib/client.js')
})

test('registers three themes and both additive slots', async () => {
  const source = await read('../lib/client.js')
  assert.match(source, /window\.__ModuleLoader__\.load/)
  assert.match(source, /ctx\.theme\.register/)
  assert.match(source, /settings\.general\.item/)
  assert.match(source, /shell\.overlay/)
  assert.match(source, /id:PLATE_SLOT_ID/)
  for (const id of ['cutout-clash', 'cutout-clash-night', 'cutout-clash-pop']) assert.match(source, new RegExp(id))
})

test('mount preserves current theme and restores a saved choice later', async () => {
  const source = await read('../lib/client.js')
  const start = source.indexOf('function apply(ctx)')
  const restore = source.indexOf('const saved=readSaved()', start)
  assert.doesNotMatch(source.slice(start, restore), /ctx\.theme\.setTheme/)
  assert.match(source, /window\.setTimeout\(\(\)=>\{if\(readSaved\(\)===saved/)
})

test('settings refresh recovers a selected custom theme without fighting explicit built-in choices', async () => {
  const source = await read('../lib/client.js')
  assert.match(source, /const preferred=readSaved\(\)/)
  assert.match(source, /preferred===previous/)
  assert.match(source, /Promise\.resolve\(\)\.then/)
  assert.match(source, /ticket===recoveryGeneration/)
  assert.match(source, /ctx\.theme\.setTheme\(preferred\)/)
  assert.match(source, /silentPreference=preferred/)
  assert.match(source, /snapshot\.preference===silentPreference/)
  assert.match(source, /generation\+\+;clearTimers\(\);plateState\(null/)
  assert.match(source, /isBuiltinChoice/)
  assert.match(source, /document\.addEventListener\('click',onBuiltinChoice,true\)/)
  assert.match(source, /writeSaved\(DEFAULT_SKIN\)/)
})

test('plate transition is cancellation-safe and lifecycle-owned', async () => {
  const source = await read('../lib/client.js')
  assert.match(source, /const ticket=\+\+generation/)
  assert.match(source, /if\(ticket!==generation\)return/)
  assert.match(source, /clearTimers\(\)/)
  assert.match(source, /createPlateComponent/)
  assert.match(source, /runtimeRoot\?\.remove\(\)/)
  assert.match(source, /plateReady=false/)
  assert.match(source, /pointer-events:none/)
  assert.match(source, /prefers-reduced-motion: reduce/)
  assert.match(source, /if\(style\)style\.remove\(\)/)
  assert.match(source, /removeAttribute\('data-cutout-clash'\)/)
  assert.match(source, /const SHARED_KEY = 'dsh\.theme\.preference\.v1'/)
  assert.match(source, /const MOTION_KEY = 'dsh-theme-cutout-clash\.motion'/)
  assert.match(source, /owner:'dsh-theme-cutout-clash'/)
  assert.match(source, /mode==='full'\|\|\(mode==='system'/)
})

test('dark filled states define deliberate foreground contrast', async () => {
  const source = await read('../lib/client.js')
  assert.match(source, /'--dsw-alias-label-primary-foreground': '#111'/)
  assert.match(source, /'--dsw-alias-label-primary-foreground': '#111318'/)
  assert.match(source, /'--dsw-alias-brand-primary-invert': '#111318'/)
  assert.match(source, /'--dsw-alias-interactive-bg-active': '#39351e'/)
  assert.match(source, /'--dsw-specific-sidebar-nav-item-active': '#39351e'/)
  assert.match(source, /const Plate=createPlateComponent\(\(\)=>\{plateReady=true;ensureRuntimeRoot\(\);const current=ctx\.theme\.getTheme\(\)\.preference/)
  assert.match(source, /'--dsw-alias-interactive-bg-hover': '#2b3543'/)
  assert.match(source, /'--dsw-alias-button-floating-hover': '#2b3543'/)
  assert.match(source, /const scheduleStartup=variant=>/)
  assert.match(source, /startupTimer=window\.setTimeout/)
  assert.match(source, /const known=skin===DEFAULT_SKIN\|\|SKINS\.some/)
  assert.match(source, /--cc-shadow:#05070a/)
  assert.match(source, /'--dsw-alias-markdown-code-block': '#fffdf7'/)
  assert.match(source, /background:var\(--dsw-alias-markdown-code-block\); color:var\(--dsw-alias-label-primary\)/)
})

/**
 * Relative luminance and WCAG contrast from a `#rgb`/`#rrggbb` literal — the
 * same arithmetic the browser performs on the computed colors.
 */
function luminance(hex) {
  let body = String(hex).replace('#', '')
  if (body.length === 3) body = body.split('').map(c => c + c).join('')
  const value = parseInt(body, 16)
  const channels = [(value >> 16) & 255, (value >> 8) & 255, value & 255].map(c => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
}

function contrast(fg, bg) {
  const a = luminance(fg)
  const b = luminance(bg)
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}

/** Read one `const NAME = { ... }` token table, following a `...BASE` spread. */
function tokenTable(source, name) {
  const head = new RegExp(`const\\s+${name}\\s*=\\s*\\{`).exec(source)
  if (head === null) throw new Error(`token table ${name} not found`)
  const open = source.indexOf('{', head.index)
  let depth = 0
  let end = open
  for (let i = open; i < source.length; i++) {
    if (source[i] === '{') depth += 1
    else if (source[i] === '}') {
      depth -= 1
      if (depth === 0) { end = i; break }
    }
  }
  const body = source.slice(open + 1, end)
  const tokens = {}
  const spread = /\.\.\.([A-Z][A-Z0-9_]*)/.exec(body)
  if (spread !== null) Object.assign(tokens, tokenTable(source, spread[1]))
  const pair = /'(--[a-z0-9-]+)'\s*:\s*'(#[0-9a-fA-F]{3,8})'/g
  let match
  while ((match = pair.exec(body)) !== null) tokens[match[1]] = match[2]
  return tokens
}

test('queued-message dock and composer attachment button stay legible in every variant', async () => {
  const source = await read('../lib/client.js')

  // The built-in queue banner renders div[data-queue-dock] > div[panel]. The
  // earlier [data-dsh-part="queue-dock"] selector matched nothing, so the panel
  // kept whatever surface color the active variant happened to inherit.
  assert.match(source, /\[data-queue-dock\] > div \{/)
  assert.doesNotMatch(source, /data-dsh-part="queue-dock"/)

  const variants = [
    { label: 'cutout-clash', table: 'COMMON', body: "body\\[data-cutout-clash\\] \\{", scheme: 'light' },
    { label: 'cutout-clash-night', table: 'NIGHT', body: 'body\\[data-cutout-clash="night"\\] \\{', scheme: 'dark' },
    { label: 'cutout-clash-pop', table: 'POP', body: 'body\\[data-cutout-clash="pop"\\] \\{', scheme: 'light' },
  ]

  for (const variant of variants) {
    const tokens = tokenTable(source, variant.table)

    // `--cc-ink` is declared in the CSS layer's body rule, not in the token
    // table: read the literal the rule actually paints with.
    const rule = new RegExp(variant.body).exec(source)
    assert.ok(rule, `${variant.label}: body rule missing`)
    const inkMatch = /--cc-ink\s*:\s*(#[0-9a-fA-F]{3,8})/.exec(source.slice(rule.index, rule.index + 200))
    assert.ok(inkMatch, `${variant.label}: --cc-ink missing from the body rule`)
    const ink = inkMatch[1]

    // The night variant inherits COMMON, so an unset override leaves the light
    // cream surfaces under the light night text — that was the live bug. Tie
    // each surface's lightness to the variant's declared color scheme instead
    // of pinning hex literals, so palette edits stay free.
    const surfaces = [
      ['attachment button surface', tokens['--dsw-specific-selector']],
      ['queue banner surface', tokens['--dsw-specific-tip']],
    ]
    for (const [what, surface] of surfaces) {
      assert.ok(typeof surface === 'string', `${variant.label}: ${what} is undefined`)
      const l = luminance(surface)
      if (variant.scheme === 'dark') {
        assert.ok(l < 0.2, `${variant.label}: ${what} ${surface} is too bright for a dark variant (luminance ${l.toFixed(3)})`)
      } else {
        assert.ok(l > 0.6, `${variant.label}: ${what} ${surface} is too dark for a light variant (luminance ${l.toFixed(3)})`)
      }
    }

    const pairs = [
      ['queue banner count/rows', tokens['--dsw-alias-label-primary'], tokens['--dsw-specific-tip']],
      ['queue banner lead icon', tokens['--dsw-alias-label-tertiary'], tokens['--dsw-specific-tip']],
      ['queue banner status', tokens['--dsw-alias-label-caption'] ?? tokens['--dsw-alias-label-tertiary'], tokens['--dsw-specific-tip']],
      ['attachment button glyph', tokens['--dsw-alias-label-primary'], tokens['--dsw-specific-selector']],
      ['attachment button hover glyph', tokens['--dsw-alias-bg-layer-1'], ink],
    ]
    for (const [what, fg, bg] of pairs) {
      const ratio = contrast(fg, bg)
      assert.ok(ratio >= 4.5, `${variant.label}: ${what} is ${ratio.toFixed(2)}:1 (${fg} on ${bg})`)
    }
  }
})

test('transition uses an early viewport curtain and shell-covering plates that stay under popups', async () => {
  const source = await read('../lib/client.js')
  assert.match(source, /dsh-cutout-transition-root/)
  assert.doesNotMatch(source, /214748/)
  assert.match(source, /position:fixed;inset:0;z-index:90;pointer-events:none;overflow:hidden;background:#111318/)
  assert.match(source, /\.cc-plate \{ position:fixed; inset:0; z-index:90; pointer-events:none; overflow:hidden; contain:strict; visibility:hidden; opacity:0;/)
  assert.match(source, /const revealBoot=/)
  assert.match(source, /bootRoot\?\.remove\(\)/)
  assert.match(source, /const RUNTIME_PLATE_ID = 'dsh-cutout-runtime-transition-root'/)
  assert.match(source, /document\.body\.append\(runtimeRoot\)/)
  assert.match(source, /#dsh-cutout-runtime-transition-root \{ position:fixed; inset:0; z-index:90; pointer-events:none; \}/)
  assert.match(source, /let bootTimer=null/)
  assert.match(source, /if\(bootTimer!==null\)window\.clearTimeout\(bootTimer\)/)
})

test('boot curtain has a pre-Cordis failure watchdog', async () => {
  const source = await read('../lib/client.js')
  const prelude = source.slice(0, source.indexOf('window.__ModuleLoader__.load'))
  const timers = []
  const removed = []
  const animations = []
  const makeChild = () => ({ animate:(frames,options)=>animations.push({frames,options}) })
  const body = { append(node) { node.isConnected=true } }
  const document = {
    body,
    getElementById:()=>null,
    createElement:()=>({
      style:{}, dataset:{}, children:[makeChild(),makeChild(),makeChild()],
      setAttribute(){}, remove(){this.isConnected=false;removed.push(this)},
      set innerHTML(_value) {},
    }),
  }
  const context = {
    document,
    localStorage:{
      getItem:key=>key==='dsh.theme.preference.v1'?JSON.stringify({version:1,theme:'cutout-clash'}):key==='dsh-theme-cutout-clash.motion'?'full':null,
    },
    matchMedia:()=>({matches:false}),
    window:{
      setTimeout(callback,delay){timers.push({callback,delay,cancelled:false});return timers.length-1},
      clearTimeout(id){if(timers[id])timers[id].cancelled=true},
    },
  }
  vm.runInNewContext(prelude,context)
  assert.equal(timers[0].delay,2500)
  timers[0].callback()
  assert.equal(animations.length,3)
  assert.equal(timers[1].delay,270)
  timers[1].callback()
  assert.equal(removed.length,1)
})

test('Night state fixes use stable semantic selectors and preserve popup geometry', async () => {
  const source = await read('../lib/client.js')
  for (const selector of ['code:not(pre code)', '[data-testid="todo-panel"]', '[data-pane="sidebar"] [role="treeitem"][aria-selected="true"]', '[data-pane="sidebar"] [role="treeitem"][aria-expanded="true"]', '[data-pane="sidebar"] [role="treeitem"]:hover', '[role="tree"][aria-label="子代理会话"] [role="treeitem"]:hover', 'button[title="任务管理"]:hover', '[data-composer-card] button[aria-haspopup="listbox"]', '[data-composer-card] [role="dialog"]']) {
    assert.ok(source.includes(selector), `missing ${selector}`)
  }
  assert.doesNotMatch(source, /\[data-composer-card\]:hover \{[^}]*transform:/)
  assert.doesNotMatch(source, /\[data-composer-card\] \[role="dialog"\] \{[^}]*inset:/)
  assert.match(source, /\[aria-expanded="true"\]:not\(\[aria-selected="true"\]\)/)
  assert.match(source, /\[aria-selected="true"\].*background:var\(--dsw-alias-interactive-bg-hover-accent\)/)
  assert.match(source, /\[data-produced-files-row\] \{ background:transparent/)
  assert.match(source, /\[data-chat-flow\] a\[href\],body\[data-cutout-clash\] \[data-chat-flow\] a\[href\]:visited/)
  assert.match(source, /a\[href\]:visited \{[^}]*text-decoration-line:underline/)
  assert.match(source, /text-decoration-thickness:1\.5px/)
  assert.match(source, /text-underline-offset:3px/)
  assert.match(source, /--cc-link:#78ddff; --cc-link-hover:#ffe074/)
  assert.match(source, /--cc-link:#163f9f; --cc-link-hover:#9b2724/)
  assert.match(source, /code:not\(pre code\) a\[href\].*color:var\(--dsw-alias-brand-primary-invert\)/)
  assert.match(source, /code:not\(pre code\) > button\[type="button"\]\[title\]\[aria-label\]/)
  assert.match(source, /button\[type="button"\]\[title\]\[aria-label\] \{ color:inherit; background:transparent; border:0; padding:0; font:inherit; text-decoration-line:underline/)
  assert.doesNotMatch(source, /_fileMention_|fileMention_1nba0/)
  assert.doesNotMatch(source, /body\[data-cutout-clash\] \[data-chat-flow\] p code:not\(pre code\) a\[href\]/)
  assert.match(source, /\[data-cutout-choice\]:hover/)
  assert.match(source, /\[role="dialog"\]\[aria-modal="true"\] button\[aria-current="true"\]/)
  assert.doesNotMatch(source, /\[role="dialog"\] button[^\{]*\{[^}]*color:var\(--dsw-alias-label-primary\)/)
})

test('calm center avoids transcript animation and unrelated plugins', async () => {
  const source = await read('../lib/client.js')
  for (const selector of ['[data-composer-card]', '[data-tool]', '[data-variant="think"]', '[data-goal-bar]', '[data-conversation-scroll]', '[data-terminal]', '[data-diff]', '[data-queue-dock]']) {
    assert.ok(source.includes(selector), `missing ${selector}`)
  }
  assert.doesNotMatch(source, /\[data-chat-flow-key\][^{]*\{[^}]*animation:/s)
  assert.doesNotMatch(source, /dsh-mcp-pill|data-dsh-plugin="ssh"|data-dsh-plugin="pet"/)
  assert.doesNotMatch(source, /Persona 5|Atlus|Phantom Thieves|Cyberpunk 2077|JetBrains Mono|font-family:\s*Impact/)
})


