import { BrowserWindow, screen, Rectangle} from 'electron'
import { REST_MESSAGE, TIPS_MESSAGE, SETTING_MESSAGE } from './tary'
import path from 'path'
import { pathToFileURL } from 'url'

function resolveUrl(route: string) {
  const url = process.env.NODE_ENV === 'development'
    ? new URL('http://127.0.0.1:3000')
    : pathToFileURL(path.resolve(__dirname, '../renderer/index.html'))
  url.hash = route
  return url.href
}

const preload = path.join(__dirname, 'preload.js')

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

        preload
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
      preload
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

      preload
    }
  })
  // 并且为你的应用加载index.html
  win.loadURL(resolveUrl(`/Setting?type=${SETTING_MESSAGE}&rest=${restTime}&tips=${tipsTime}&work=${workTime}`))
  return win
}
