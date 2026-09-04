import WebSocket from 'file:///C:/Users/CarryWho/.dsh/profiles/web/node_modules/ws/wrapper.mjs'

const targets = await fetch('http://127.0.0.1:9354/json').then(r => r.json())
const page = targets.find(p => p.type === 'page' && p.url.includes('127.0.0.1:3080'))
if (!page) throw new Error('DSH page target not found')
const ws = new WebSocket(page.webSocketDebuggerUrl)
let seq = 0
const pending = new Map()
ws.on('message', raw => {
  const message = JSON.parse(String(raw))
  if (!message.id || !pending.has(message.id)) return
  const resolve = pending.get(message.id)
  pending.delete(message.id)
  resolve(message.result)
})
await new Promise(resolve => ws.once('open', resolve))
const send = (method, params = {}) => new Promise(resolve => {
  const id = ++seq
  pending.set(id, resolve)
  ws.send(JSON.stringify({ id, method, params }))
})
const evaluate = async expression => {
  const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text)
  return result.result.value
}
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
const snapshot = label => evaluate(`(() => ({
  label:${JSON.stringify(label)},
  marker:document.body.getAttribute('data-cutout-clash'),
  acid:document.body.getAttribute('data-acid-noir'),
  shared:localStorage.getItem('dsh.theme.preference.v1'),
  bg:getComputedStyle(document.body).getPropertyValue('--dsw-alias-bg-base').trim(),
  dialogs:[...document.querySelectorAll('[role="dialog"]')].map(x => (x.textContent || '').trim().slice(0,160)),
  buttons:[...document.querySelectorAll('button')].map(b => ({text:(b.textContent||'').trim().replace(/\\s+/g,' ').slice(0,100),aria:b.getAttribute('aria-label'),title:b.title})).filter(x=>x.text||x.aria||x.title)
}))()`)

await send('Runtime.enable')
console.log(JSON.stringify(await snapshot('initial'), null, 2))
await evaluate(`(() => {
  const button=[...document.querySelectorAll('button')].find(b=>/^(设置|Settings)$/.test((b.textContent||'').trim())||/设置|Settings/i.test(b.getAttribute('aria-label')||'')||/设置|Settings/i.test(b.title||''));
  if(!button) return false;
  button.click();return true
})()`)
await delay(700)
console.log(JSON.stringify(await snapshot('settings-open'), null, 2))
ws.close()
