import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import vm from 'node:vm'
const read = p => readFile(new URL(p, import.meta.url), 'utf8')

test('standalone 0.5 bundle contract', async () => {
  const pkg = JSON.parse(await read('../package.json'))
  assert.equal(pkg.name, 'dsh-theme-cutout-clash')
  assert.equal(pkg.version, '0.5.7')
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
  for (const selector of ['[data-composer-card]', '[data-tool]', '[data-variant="think"]', '[data-goal-bar]', '[data-conversation-scroll]', '[data-terminal]', '[data-diff]', '[data-dsh-part="queue-dock"]']) {
    assert.ok(source.includes(selector), `missing ${selector}`)
  }
  assert.doesNotMatch(source, /\[data-chat-flow-key\][^{]*\{[^}]*animation:/s)
  assert.doesNotMatch(source, /dsh-mcp-pill|data-dsh-plugin="ssh"|data-dsh-plugin="pet"/)
  assert.doesNotMatch(source, /Persona 5|Atlus|Phantom Thieves|Cyberpunk 2077|JetBrains Mono|font-family:\s*Impact/)
})


