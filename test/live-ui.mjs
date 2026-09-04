import fs from 'node:fs/promises'
import WebSocket from 'file:///C:/Users/CarryWho/.dsh/profiles/web/node_modules/ws/wrapper.mjs'
const pages=await fetch('http://127.0.0.1:9351/json').then(r=>r.json())
const page=pages.find(p=>p.type==='page'&&p.url.includes('127.0.0.1:3080'))
if(!page)throw new Error('No debuggable DSH page')
const ws=new WebSocket(page.webSocketDebuggerUrl);let seq=0;const pending=new Map()
ws.on('message',raw=>{const m=JSON.parse(String(raw));if(!m.id)return;const p=pending.get(m.id);if(!p)return;pending.delete(m.id);m.error?p.reject(new Error(m.error.message)):p.resolve(m.result)})
await new Promise((resolve,reject)=>{ws.once('open',resolve);ws.once('error',reject)})
const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}))})
const ev=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw new Error(r.exceptionDetails.text);return r.result.value}
const wait=ms=>new Promise(r=>setTimeout(r,ms))
await send('Runtime.enable');await send('Page.enable');await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});await send('Page.navigate',{url:'http://127.0.0.1:3080/'});await wait(3200)
await ev(`localStorage.removeItem('dsh-theme-acid-noir.skin');localStorage.removeItem('dsh-theme-cutout-clash.skin')`)
await send('Page.reload',{ignoreCache:true});await wait(2600)
const initial=await ev(`(()=>({boot:window.__DSH_BOOT__?.entries?.filter(e=>e.id.includes('cutout-clash')),style:!!document.getElementById('dsh-theme-cutout-clash/styles'),attr:document.body.getAttribute('data-cutout-clash'),plate:!!document.querySelector('[data-shell-overlay] .cc-plate')}))()`)
await ev(`document.querySelector('[aria-label="打开侧边栏"]')?.click()`);await wait(350)
await ev(`(()=>{const b=[...document.querySelectorAll('button')].find(x=>(x.textContent||'').trim()==='设置');b?.click()})()`);await wait(900)
const settings=await ev(`(()=>({row:document.body.innerText.includes('Cutout Clash 主题'),buttons:[...document.querySelectorAll('button')].filter(b=>/默认外观|Cutout Clash|Night Cutout|Pop Signal/.test((b.textContent||'').trim())).map(b=>({text:(b.textContent||'').trim(),pressed:b.getAttribute('aria-pressed')})),overlayParent:document.querySelector('.cc-plate')?.parentElement?.parentElement?.hasAttribute('data-shell-overlay')}))()`)
const clickNow=label=>ev(`(()=>{const bs=[...document.querySelectorAll('button')].filter(x=>(x.textContent||'').trim()===${JSON.stringify(label)});const b=bs.at(-1);b?.click();return !!b})()`)
const state=()=>ev(`(()=>{const body=getComputedStyle(document.body),composer=document.querySelector('[data-composer-card]'),tool=document.querySelector('[data-tool]'),plate=document.querySelector('.cc-plate'),code=document.querySelector('.md-code-block,pre'),scroll=document.querySelector('[data-conversation-scroll]');const c=composer?getComputedStyle(composer):null,t=tool?getComputedStyle(tool):null,p=plate?getComputedStyle(plate):null,k=code?getComputedStyle(code):null,s=scroll?getComputedStyle(scroll):null;return{saved:localStorage.getItem('dsh-theme-cutout-clash.skin'),acidSaved:localStorage.getItem('dsh-theme-acid-noir.skin'),attr:document.body.getAttribute('data-cutout-clash'),style:!!document.getElementById('dsh-theme-cutout-clash/styles'),bodyBg:body.backgroundColor,plate:plate?{stage:plate.getAttribute('data-stage'),generation:plate.getAttribute('data-generation'),pointer:p.pointerEvents,visible:p.visibility}:null,composer:c?{border:c.border,shadow:c.boxShadow}:null,tool:t?{border:t.border,shadow:t.boxShadow}:null,code:k?{shadow:k.boxShadow,transform:k.transform}:null,scroll:s?{transform:s.transform,filter:s.filter}:null,overflow:document.documentElement.scrollWidth>innerWidth+1}})()`)
await clickNow('Cutout Clash');await wait(70);const cover=await state();await wait(190);const reveal=await state();await wait(260);const base=await state()
await clickNow('Night Cutout');await wait(520);const night=await state()
await clickNow('Pop Signal');await wait(520);const pop=await state()
for(const label of ['Cutout Clash','Night Cutout','Pop Signal','Night Cutout','Pop Signal']){await clickNow(label);await wait(28)}await wait(540);const rapid=await state()
const defaultButtons=await ev(`(()=>[...document.querySelectorAll('button')].filter(x=>(x.textContent||'').trim()==='默认外观').length)()`);await clickNow('默认外观');await wait(520);const reset=await state();reset.defaultButtons=defaultButtons
await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await clickNow('Cutout Clash');await wait(30);const reduced=await state();reduced.match=await ev(`matchMedia('(prefers-reduced-motion: reduce)').matches`);await wait(360);await clickNow('默认外观');await wait(80);await send('Emulation.setEmulatedMedia',{features:[]})
const report={initial,settings,cover,reveal,base,night,pop,rapid,reset,reduced}
await fs.mkdir('D:/Resources/DSH_PRJ/DevPlugins/dsh-theme-cutout-clash/artifacts',{recursive:true});await fs.writeFile('D:/Resources/DSH_PRJ/DevPlugins/dsh-theme-cutout-clash/artifacts/live-ui-0.2.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));ws.close()
