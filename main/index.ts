import { app, powerMonitor } from 'electron'
import { readDeepDir } from './utils'
import fs from 'fs'
import {initTray} from './tary'
export const isDev = process.env.NODE_ENV === 'development'
// 自动刷新
isDev && watchFile()

// 隐藏dock
app.dock.hide()
// Electron会在初始化完成并且准备好创建浏览器窗口时调用这个方法
app.whenReady().then(() => {
  const tray = initTray()
  // 系统挂起
  powerMonitor.on('suspend', () => {
    tray.send({
      type: 'stop'
    })
  })
  // 系统恢复
  powerMonitor.on('resume', () => {
    tray.send({
      type: 'run'
    })
  })
})
app.on('window-all-closed', () => {
  // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
  // 否则绝大部分应用及其菜单栏会保持激活。
  if (process.platform !== 'darwin') {
    app.quit()
  }
})


function watchFile() {
  let debounce: NodeJS.Timeout
  const reload = () => {
    clearTimeout(debounce)
    debounce = setTimeout(() => {
      // 当前应用退出，外部进程接收到之后重启应用
      // 之所以不使用relaunch，是因为一旦这里退出，就会导致外部程序退出，但是electron还是重启了，这次重启的electron进程就不再受控了
      // 退出外部程序不会导致这次的electron关闭
      app.exit(100)
    }, 300)
  }
  // watch并不稳定，使用watchFile进行监听
  // 对于新增情况，当有已监听的文件去引用他的时候，就会导致应用重启，然后重新监听所有新的文件，以此来解决
  const watcher = (path: string) => {
    fs.watchFile(path, reload)
  }
  readDeepDir(__dirname, watcher)
}
