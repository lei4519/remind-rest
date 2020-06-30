import { BrowserWindow, screen, Rectangle} from 'electron'
import { REST_MESSAGE, TIPS_MESSAGE, SETTING_MESSAGE } from './tary'
import { isDev } from '.'
import path from 'path'
import url from 'url'
import http from 'http'
import fs from 'fs'

let productPort: number = 0
if (!isDev) {
  // 检测端口是否被占用
  const portIsOccupied = (port: number): Promise<number> => {
    return new Promise(r => {
      const validate = (p: number) => {
        const server: http.Server = http
          .createServer()
          .listen(p)
          .on('listening', () => {
            server.close()
            r(p)
          })
          .on('error', (err: any) => {
            if (err.code === 'EADDRINUSE') {
              server.close()
              validate(p += 1)
            }
          })
      }
      validate(port)
    })
  }
  // 执行
  portIsOccupied(8981)
    .then((p) => {
      productPort = p
      http.createServer((req, res) => {
        if (req.url === '/') {
          // content-type: application/javascript
          return fs.readFile(path.resolve(__dirname, '..', 'renderer/index.html'), (err, data) => {
            if (err) return
            res.setHeader('content-type', 'text/html; charset=utf-8')
            res.end(data)
          })
        } else {
          return fs.readFile(path.resolve(__dirname, '..', 'renderer' + req.url), (err, data) => {
            if (err) return
            if (req.url!.endsWith('.js')) {
              res.setHeader('content-type', 'application/javascript')
            } else if (req.url!.endsWith('.css')) {
              res.setHeader('content-type', 'text/css')
            }
            // 缓存7天
            res.setHeader('cache-control', 'max-age=604800')
            res.end(data)
          })
        }
      })
      .listen(p)
    })

}

const resolveUrl = (address: string) => `http://localhost:${isDev ? 3000 : productPort}/#${address}`

export function createRestWindow(): BrowserWindow[] {
  return screen.getAllDisplays().map((display, i) => {
    // 创建浏览器窗口
    const win = new BrowserWindow({
      x: display.bounds.x + 50,
      y: display.bounds.y + 50,
      fullscreen: true, // 全屏
      alwaysOnTop: true, // 窗口是否应始终位于其他窗口的顶部
      // closable: false, // 窗口是否可关闭
      kiosk: true,
      transparent: true,
      vibrancy: 'fullscreen-ui', // 动画效果
      webPreferences: {
        devTools: false,
        webSecurity: false,
        nodeIntegration: true // 将node注入到渲染进程
      }
    })
    // 并且为你的应用加载index.html
    win.loadURL(resolveUrl(`/LockPage?type=${REST_MESSAGE}${i === 0 ? '&isMainScreen=1' : ''}`))
    return win
  })
}

export function createTipsWindow(rect: Rectangle, s: string): BrowserWindow {
  const win = new BrowserWindow({
    x: rect.x,
    y: rect.y,
    width: 300,
    height: 56,
    alwaysOnTop: true,
    frame: false,
    resizable: false,
    transparent: true,
    webPreferences: {
      devTools: false, // 是否开启 DevTools
      nodeIntegration: true // 将node注入到渲染进程
    }
  })
  // 并且为你的应用加载index.html
  win.loadURL(resolveUrl(`/Tips?type=${TIPS_MESSAGE}&s=${s}`))
  return win
}

export function createSettingWindows(restTime: number, tipsTime: number, workTime: number) {
  const win = new BrowserWindow({
    width: 400,
    maximizable: false,
    minimizable: false,
    resizable: false,
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true // 将node注入到渲染进程
    }
  })
  // 并且为你的应用加载index.html
  win.loadURL(resolveUrl(`/Setting?type=${SETTING_MESSAGE}&rest=${restTime}&tips=${tipsTime}&work=${workTime}`))
  return win
}
