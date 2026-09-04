import fs from 'node:fs/promises'
import WebSocket from 'file:///C:/Users/CarryWho/.dsh/profiles/web/node_modules/ws/wrapper.mjs'
const targets = await fetch('http://127.0.0.1:9352/json').then(r => r.json())
const page = targets.find(p => p.type === 'page' && p.url.includes('127.0.0.1:3080'))
const ws = new WebSocket(page.webSocketDebuggerUrl)
let seq = 0
const pending = new Map()
ws.on('message', raw => {
  const message = JSON.parse(String(raw))
  if (!message.id) return
  const item = pending.get(message.id)
  if (!item) return
  pending.delete(message.id)
  message.error ? item.reject(new Error(message.error.message)) : item.resolve(message.result)
})
await new Promise((resolve, reject) => { ws.once('open', resolve); ws.once('error', reject) })
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++seq
  pending.set(id, { resolve, reject })
  ws.send(JSON.stringify({ id, method, params }))
})
const evaluate = async expression => {
  const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text)
  return result.result.value
}
const wait = ms => new Promise(resolve => setTimeout(resolve, ms))
await send('Runtime.enable')
await evaluate(`(()=>{localStorage.removeItem('dsh-theme-acid-noir.skin');localStorage.setItem('dsh-theme-cutout-clash.skin','cutout-clash-night');location.reload();return true})()`)
await wait(1600)
await evaluate(`(()=>{const b=[...document.querySelectorAll('button')].find(b=>(b.textContent||'').trim()==='关闭');if(b)b.click();return true})()`)
await wait(500)
await evaluate(`(()=>{document.querySelector('[aria-label="打开侧边栏"]')?.click();return true})()`)
await wait(350)
await evaluate(`(()=>{const needle='开发 Persona 5 风格 DSH 主题';const t=[...document.querySelectorAll('*')].find(el=>(el.textContent||'').trim()===needle);t?.closest('[role="treeitem"]')?.click();return !!t})()`)
await wait(2500)
const report = await evaluate(`(()=>{
  const info=q=>{const el=document.querySelector(q);if(!el)return null;const c=getComputedStyle(el),r=el.getBoundingClientRect();return{color:c.color,bg:c.backgroundColor,border:c.border,shadow:c.boxShadow,transform:c.transform,rect:{w:r.width,h:r.height}}}
  const plate=document.querySelector('.cc-plate')
  return {
    theme:document.body.getAttribute('data-cutout-clash'),
    counts:{messages:document.querySelectorAll('[data-chat-flow-key]').length,tools:document.querySelectorAll('[data-tool]').length,think:document.querySelectorAll('[data-variant="think"]').length,goals:document.querySelectorAll('[data-goal-bar]').length,codes:document.querySelectorAll('.md-code-block,pre').length},
    tool:info('[data-tool]'),think:info('[data-variant="think"]'),goal:info('[data-goal-bar] > *'),code:info('.md-code-block,pre'),composer:info('[data-composer-card]'),scroll:info('[data-conversation-scroll]'),
    overflow:document.documentElement.scrollWidth>innerWidth+1,
    plate:{stage:plate?.getAttribute('data-stage')||null,visible:plate?getComputedStyle(plate).visibility:null}
  }
})()`)
await fs.writeFile('D:/Resources/DSH_PRJ/DevPlugins/dsh-theme-cutout-clash/artifacts/long-session-audit-0.2.1.json', JSON.stringify(report, null, 2))
console.log(JSON.stringify(report, null, 2))
ws.close()
