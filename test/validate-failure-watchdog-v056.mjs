import { readFile } from 'node:fs/promises'

const port = Number(process.env.DSH_CDP_PORT || 9356)
const pages = await fetch(`http://127.0.0.1:${port}/json`).then(response => response.json())
const page = pages.find(entry => entry.type === 'page' && entry.url.includes('127.0.0.1:3080'))
if (!page) throw new Error(`No DSH Web page found on CDP port ${port}`)

const source = await readFile(new URL('../lib/client.js', import.meta.url), 'utf8')
const prelude = source.slice(0, source.indexOf('window.__ModuleLoader__.load'))
const failedBundle = `${prelude}\nthrow new Error('intentional Cutout load failure for watchdog validation')\n`
const ws = new WebSocket(page.webSocketDebuggerUrl)
let sequence = 0
const pending = new Map()
let intercepted = false
ws.addEventListener('message', event => {
  const message = JSON.parse(String(event.data))
  if (message.id && pending.has(message.id)) {
    const task = pending.get(message.id)
    pending.delete(message.id)
    message.error ? task.reject(new Error(message.error.message)) : task.resolve(message.result)
    return
  }
  if (message.method !== 'Fetch.requestPaused') return
  const { requestId, request } = message.params
  if (request.url.includes('dsh-theme-cutout-clash')) {
    intercepted = true
    void send('Fetch.fulfillRequest', {
      requestId,
      responseCode: 200,
      responseHeaders: [{ name:'Content-Type', value:'application/javascript; charset=utf-8' }],
      body: Buffer.from(failedBundle).toString('base64'),
    })
  } else {
    void send('Fetch.continueRequest', { requestId })
  }
})
await new Promise((resolve, reject) => {
  ws.addEventListener('open', resolve, { once: true })
  ws.addEventListener('error', reject, { once: true })
})
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++sequence
  pending.set(id, { resolve, reject })
  ws.send(JSON.stringify({ id, method, params }))
})
const evaluate = async expression => {
  const response = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
  if (response.exceptionDetails) throw new Error(response.exceptionDetails.exception?.description || response.exceptionDetails.text)
  return response.result.value
}

await send('Runtime.enable')
await send('Page.enable')
await send('Fetch.enable', { patterns:[{ urlPattern:'*dsh-theme-cutout-clash*', requestStage:'Request' }] })
await evaluate(`localStorage.setItem('dsh.theme.preference.v1',JSON.stringify({version:1,theme:'cutout-clash-night',owner:'dsh-theme-cutout-clash'}));localStorage.setItem('dsh-theme-cutout-clash.motion','full')`)
await send('Page.reload', { ignoreCache: true })
await new Promise(resolve => setTimeout(resolve, 3400))
const result = await evaluate(`(()=>({
  frame:!!document.querySelector('[data-dsh-frame]'),
  curtain:!!document.getElementById('dsh-cutout-transition-root'),
  cutoutStyle:!!document.getElementById('dsh-theme-cutout-clash/styles'),
  bodyText:(document.body.innerText||'').slice(0,200)
}))()`)
await send('Fetch.disable')
await send('Page.reload', { ignoreCache:true })
await new Promise(resolve => setTimeout(resolve, 1800))
const normalRecovered = await evaluate(`!!document.querySelector('[data-dsh-frame]') && !document.getElementById('dsh-cutout-transition-root')`)
console.log(JSON.stringify({ intercepted, ...result, normalRecovered }, null, 2))
ws.close()
if (!intercepted || result.curtain || result.cutoutStyle || !result.bodyText.includes('Failed to load plugins') || !normalRecovered) process.exitCode = 1
