const createShell = require('./createShell')

const runElectron = () => {
  createShell('cross-env NODE_ENV=development electron ./dist/main/index.js')
    .on('exit', (code) => {
      if (code === 100) runElectron()
      // 使用kill而不是exit，不然会导致子进程无法全部退出
      if (code === 0) process.kill(0)
    })
}
const runViteAndTsc = () => new Promise((reslove) => {
  createShell('npx vite & rm -rf ./dist/main && mkdir dist/main && cp -r main/store.json dist/main/store.json && tsc -w').stdout.on('data', buffer => {
    console.log(buffer.toString())
    if (buffer.toString().includes('Watching for file changes')) {
      reslove()
    }
  })
})

runViteAndTsc()
  .then(runElectron)
