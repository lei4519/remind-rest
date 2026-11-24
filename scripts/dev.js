const { spawn } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')
const root = path.resolve(__dirname, '..')
const output = path.join(root, 'dist/main')
const env = { ...process.env, NODE_ENV: 'development' }
const children = new Set()
let closing = false

function start(command, args, options = {}) {
  const child = spawn(command, args, { cwd: root, env, stdio: 'inherit', ...options })
  children.add(child)
  child.on('error', error => { console.error(error); stop(1) })
  child.on('exit', () => children.delete(child))
  return child
}

function stop(code) {
  if (closing) return
  closing = true
  for (const child of children) child.kill()
  process.exitCode = code
}

function launch() {
  const child = start(require('electron'), [root])
  child.on('exit', code => {
    if (closing) return
    if (code === 100) launch()
    else stop(code ?? 1)
  })
}

async function waitForRenderer() {
  for (let attempt = 0; attempt < 200 && !closing; attempt++) {
    try {
      const response = await fetch('http://127.0.0.1:3000/')
      if (response.ok) return launch()
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  if (!closing) { console.error('Renderer did not start on port 3000'); stop(1) }
}

fs.mkdirSync(output, { recursive: true })
fs.copyFileSync(path.join(root, 'main/store.json'), path.join(output, 'store.json'))
fs.cpSync(path.join(root, 'icon'), path.join(root, 'dist/icon'), { recursive: true })
start('vite', []).on('exit', code => stop(code ?? 1))
const compiler = start('tsc', ['--watch', '--preserveWatchOutput'], { stdio: ['ignore', 'pipe', 'inherit'] })
let starting = false
compiler.stdout.on('data', data => {
  process.stdout.write(data)
  if (!starting && data.toString().includes('Found 0 errors. Watching for file changes.')) {
    starting = true
    waitForRenderer().catch(error => { console.error(error); stop(1) })
  }
})
compiler.on('exit', code => stop(code ?? 1))
process.on('SIGINT', () => stop(0))
process.on('SIGTERM', () => stop(0))
