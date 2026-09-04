import WebSocket from 'file:///C:/Users/CarryWho/.dsh/profiles/web/node_modules/ws/wrapper.mjs'

const page=(await fetch('http://127.0.0.1:9354/json').then(r=>r.json())).find(p=>p.type==='page'&&p.url.includes('127.0.0.1:3080'))
if(!page)throw new Error('DSH page not found')
const ws=new WebSocket(page.webSocketDebuggerUrl);let seq=0;const pending=new Map()
ws.on('message',raw=>{const m=JSON.parse(String(raw));if(m.id&&pending.has(m.id)){pending.get(m.id)(m.result);pending.delete(m.id)}})
await new Promise(r=>ws.once('open',r))
const send=(method,params={})=>new Promise(r=>{const id=++seq;pending.set(id,r);ws.send(JSON.stringify({id,method,params}))})
const e=async expression=>{const out=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(out.exceptionDetails)throw new Error(out.exceptionDetails.text);return out.result.value}
const delay=ms=>new Promise(r=>setTimeout(r,ms))
const click=(text,attr)=>e(`(()=>{const b=[...document.querySelectorAll('button')].find(b=>${attr?`(b.getAttribute(${JSON.stringify(attr)})||'').includes(${JSON.stringify(text)})`:`(b.textContent||'').trim().replace(/\\s+/g,' ')===${JSON.stringify(text)}`});if(!b)return false;b.click();return true})()`)
const state=label=>e(`(()=>({label:${JSON.stringify(label)},cutout:document.body.getAttribute('data-cutout-clash'),acid:document.body.getAttribute('data-acid-noir'),shared:localStorage.getItem('dsh.theme.preference.v1'),scheme:document.documentElement.style.colorScheme,background:getComputedStyle(document.body).backgroundColor,cutoutVersion:window.__DSH_BOOT__?.entries?.find(x=>x.id==='dsh-theme-cutout-clash')?.version||null,acidVersion:window.__DSH_BOOT__?.entries?.find(x=>x.id==='dsh-theme-acid-noir')?.version||null}))()`)
const openTerminal=async()=>{await click('插件');await delay(250);if(!(await e(`!![...document.querySelectorAll('button')].find(b=>(b.getAttribute('aria-label')||'').includes('收起设置: 终端'))`)))await click('展开设置: 终端','aria-label');await delay(200)}
const changeFirstInput=()=>e(`(()=>{const x=document.querySelector('[role="dialog"] input');if(!x)return null;const original=x.value;const next=original==='120000'?'120001':'120000';Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(x,next);x.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertText',data:next}));x.dispatchEvent(new Event('change',{bubbles:true}));return {original,next}})()`)
const saveAndObserve=async label=>{if(!(await click('保存')))throw new Error('Save not available');await delay(80);const result=await state(label);await delay(300);return result}

await send('Runtime.enable');await send('Page.enable');await send('Page.reload',{ignoreCache:true});await delay(1800)
if(!(await e(`!!document.querySelector('[role="dialog"]')`))){if(!(await click('设置')))throw new Error('Settings button not found');await delay(500)}
await click('通用设置');await delay(250)
if(!(await click('Night Cutout')))throw new Error('Night Cutout button not found');await delay(250)
await openTerminal();const first=await changeFirstInput();if(!first)throw new Error('Terminal input missing')
const cutout=await saveAndObserve('cutout-after-save')
await changeFirstInput();await saveAndObserve('cutout-after-restore-setting')
await click('通用设置');await delay(250);if(!(await click('Acid Noir')))throw new Error('Acid Noir button not found');await delay(250)
await openTerminal();const second=await changeFirstInput();if(!second)throw new Error('Terminal input missing for Acid Noir')
const acid=await saveAndObserve('acid-after-save')
await changeFirstInput();await saveAndObserve('acid-after-restore-setting')
const final=await state('final')
console.log(JSON.stringify({first,cutout,second,acid,final},null,2))
if(cutout.cutout!=='night'||cutout.background!=='rgb(14, 17, 23)')throw new Error('Cutout did not recover after Settings save')
if(acid.acid!=='base'||acid.background!=='rgb(8, 10, 15)')throw new Error('Acid Noir did not recover after Settings save')
ws.close()
