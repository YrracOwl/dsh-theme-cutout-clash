import WebSocket from 'file:///C:/Users/CarryWho/.dsh/profiles/web/node_modules/ws/wrapper.mjs'

const page = (await fetch('http://127.0.0.1:9355/json').then(r => r.json())).find(p => p.type === 'page' && p.url.includes('127.0.0.1:3080'))
if (!page) throw new Error('page missing')
const ws = new WebSocket(page.webSocketDebuggerUrl)
let seq = 0
const pending = new Map()
ws.on('message', raw => {
  const message = JSON.parse(String(raw))
  if (message.id && pending.has(message.id)) {
    pending.get(message.id)(message.result)
    pending.delete(message.id)
  }
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
const click = (text, attribute) => evaluate(`(() => {
  const button=[...document.querySelectorAll('button')].find(button => ${attribute ? `(button.getAttribute(${JSON.stringify(attribute)})||'').includes(${JSON.stringify(text)})` : `(button.textContent||'').trim().replace(/\\s+/g,' ')===${JSON.stringify(text)}`});
  if(!button)return false;button.click();return true
})()`)
const openTerminal = async () => {
  await click('插件')
  await delay(200)
  const expanded = await evaluate(`!![...document.querySelectorAll('button')].find(button => (button.getAttribute('aria-label')||'').includes('收起设置: 终端'))`)
  if (!expanded) await click('展开设置: 终端', 'aria-label')
  await delay(200)
}
const setInput = value => evaluate(`(() => {
  const input=document.querySelector('[role="dialog"] input');if(!input)return false;
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,${JSON.stringify(value)});
  input.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertText',data:${JSON.stringify(value)}}));
  input.dispatchEvent(new Event('change',{bubbles:true}));return true
})()`)

await send('Page.enable')
await send('Page.reload', { ignoreCache: true })
await delay(1600)
if (!(await evaluate(`!!document.querySelector('[role="dialog"]')`))) {
  await click('设置')
  await delay(400)
}
await click('通用设置')
await delay(200)
await click('Night Cutout')
for (let attempt=0;attempt<20;attempt+=1) {
  await delay(100)
  const stage=await evaluate(`document.querySelector('#dsh-cutout-runtime-transition-root .cc-plate')?.getAttribute('data-stage')||null`)
  if(stage===null)break
}
await openTerminal()
const originalValue = await evaluate(`document.querySelector('[role="dialog"] input')?.value||null`)
if (!originalValue) throw new Error('terminal input missing')
const changedValue = originalValue === '120000' ? '120001' : '120000'
await evaluate(`(() => {
  window.__ccStages=[];
  const plate=document.querySelector('#dsh-cutout-runtime-transition-root .cc-plate');
  if(!plate)return false;
  window.__ccObserver=new MutationObserver(()=>window.__ccStages.push({time:performance.now(),stage:plate.getAttribute('data-stage')}));
  window.__ccObserver.observe(plate,{attributes:true,attributeFilter:['data-stage']});return true
})()`)
await setInput(changedValue)
await delay(120)
if (!(await click('保存'))) throw new Error('save unavailable')
await delay(700)
const saved = await evaluate(`(() => {
  window.__ccObserver?.disconnect();
  return {stages:window.__ccStages||[],marker:document.body.getAttribute('data-cutout-clash'),background:getComputedStyle(document.body).backgroundColor,plate:document.querySelector('#dsh-cutout-runtime-transition-root .cc-plate')?.getAttribute('data-stage')||null}
})()`)
await openTerminal()
await setInput(originalValue)
await delay(120)
if (!(await click('保存'))) throw new Error('restore save unavailable')
await delay(500)
console.log(JSON.stringify({ originalValue, changedValue, saved }, null, 2))
if (saved.marker !== 'night' || saved.background !== 'rgb(14, 17, 23)') throw new Error('theme recovery failed')
if (saved.stages.some(item => item.stage === 'cover' || item.stage === 'reveal')) throw new Error('administrative recovery animated')
ws.close()
