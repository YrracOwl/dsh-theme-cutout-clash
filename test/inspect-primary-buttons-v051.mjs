import WebSocket from 'file:///C:/Users/CarryWho/.dsh/profiles/web/node_modules/ws/wrapper.mjs'
const page=(await fetch('http://127.0.0.1:9353/json').then(r=>r.json())).find(p=>p.type==='page'&&p.url.includes('3080'))
const ws=new WebSocket(page.webSocketDebuggerUrl);let seq=0,pending=new Map()
ws.on('message',raw=>{const m=JSON.parse(String(raw));if(m.id&&pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(new Error(m.error.message)):p.resolve(m.result)}})
await new Promise((resolve,reject)=>{ws.once('open',resolve);ws.once('error',reject)})
const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}))})
const ev=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true});if(r.exceptionDetails)throw new Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value}
await send('Runtime.enable')
const out=await ev(`(()=>{const info=e=>{const c=getComputedStyle(e),r=e.getBoundingClientRect();return{text:(e.textContent||'').replace(/\\s+/g,' ').trim(),color:c.color,bg:c.backgroundColor,opacity:c.opacity,disabled:e.disabled,visible:r.width>0&&r.height>0,cls:String(e.className),html:e.outerHTML.slice(0,1200)}};return{theme:document.body.getAttribute('data-cutout-clash'),tokens:Object.fromEntries(['--dsw-alias-button-primary-fill','--dsw-alias-button-primary-hover','--dsw-alias-label-primary-foreground','--dsw-alias-label-primary-inverted','--dsw-alias-button-info-fill','--dsw-alias-button-info-hover'].map(k=>[k,getComputedStyle(document.body).getPropertyValue(k).trim()])),buttons:[...document.querySelectorAll('[role="dialog"][aria-modal="true"] button')].map(info).filter(x=>x.visible&&(/保存|升级|save|upgrade/i.test(x.text)||x.bg!=='rgba(0, 0, 0, 0)'))}})()`)
console.log(JSON.stringify(out,null,2));ws.close()
