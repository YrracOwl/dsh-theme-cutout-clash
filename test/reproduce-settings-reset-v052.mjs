import WebSocket from 'file:///C:/Users/CarryWho/.dsh/profiles/web/node_modules/ws/wrapper.mjs'
const targets=await fetch('http://127.0.0.1:9354/json').then(r=>r.json())
const page=targets.find(p=>p.type==='page'&&p.url.includes('127.0.0.1:3080'))
if(!page)throw new Error('page not found')
const ws=new WebSocket(page.webSocketDebuggerUrl);let seq=0;const pending=new Map()
ws.on('message',raw=>{const m=JSON.parse(String(raw));if(m.id&&pending.has(m.id)){pending.get(m.id)(m.result);pending.delete(m.id)}})
await new Promise(r=>ws.once('open',r))
const send=(method,params={})=>new Promise(r=>{const id=++seq;pending.set(id,r);ws.send(JSON.stringify({id,method,params}))})
const evaluate=async expression=>{const out=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(out.exceptionDetails)throw new Error(out.exceptionDetails.text);return out.result.value}
const delay=ms=>new Promise(r=>setTimeout(r,ms))
const state=label=>evaluate(`(()=>({label:${JSON.stringify(label)},time:performance.now(),cutout:document.body.getAttribute('data-cutout-clash'),acid:document.body.getAttribute('data-acid-noir'),shared:localStorage.getItem('dsh.theme.preference.v1'),bg:getComputedStyle(document.documentElement).getPropertyValue('--dsw-alias-bg-base').trim(),pressed:[...document.querySelectorAll('button[aria-pressed="true"]')].map(b=>(b.textContent||'').trim().replace(/\\s+/g,' ')).filter(Boolean)}))()`)
const clickText=async text=>evaluate(`(()=>{const candidates=[...document.querySelectorAll('button')];const b=candidates.find(b=>(b.textContent||'').trim().replace(/\\s+/g,' ')===${JSON.stringify(text)});if(!b)return {ok:false,sample:candidates.map(x=>(x.textContent||'').trim()).filter(Boolean).slice(0,80)};b.click();return {ok:true,text:(b.textContent||'').trim()}})()`)
await send('Runtime.enable')
if(!(await evaluate(`!!document.querySelector('[role="dialog"]')`))){await clickText('设置');await delay(500)}
console.log(JSON.stringify(await state('before-theme'),null,2))
console.log('click Night',JSON.stringify(await clickText('Night Cutout')))
for(const ms of [0,50,350]){await delay(ms);console.log(JSON.stringify(await state('night+'+ms),null,2))}
console.log('click queue',JSON.stringify(await clickText('排队发送')))
for(const ms of [0,50,200,500,1200]){await delay(ms);console.log(JSON.stringify(await state('queue+'+ms),null,2))}
ws.close()
