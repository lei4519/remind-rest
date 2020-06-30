import { Menu, Tray as ElectronTary, BrowserWindow, ipcMain, IpcMainEvent, MenuItem } from 'electron'
import path from 'path'
import { fork, ChildProcess } from 'child_process'
import {ReceiveMsg, SendMsg} from './countDown'
import { createRestWindow, createTipsWindow, createSettingWindows } from './browserWindow'
import { restTime, tipsTime, workTime, setTime } from './setting'


type TimeType = 'REST' | 'WORK'

export const REST_MESSAGE = 'REST_MESSAGE'
export const TIPS_MESSAGE = 'TIPS_MESSAGE'
export const SETTING_MESSAGE = 'SETTING_MESSAGE'

interface RestMsgData {
  type: 'CLOSE' | 'READY'
  data?: any
}
interface TipsMsgData {
  type: 'CLOSE' | 'RESET' | 'STOP'
}
interface SettingMsgData {
  rest: number
  work: number
  tips: number
}
class Tary {
  private timeType: TimeType = 'WORK'
  private tray: ElectronTary = new ElectronTary(
    path.resolve(__dirname, '../icon/img.png')
  )
  private menu: Menu | null = null
  private restWindows: BrowserWindow[] | null = null
  private tipsWindow: BrowserWindow | null = null
  private countDown: ChildProcess = fork(path.resolve(__dirname, './countDown'))
  constructor() {
    this.setContextMenu()
    this.handleTimeChange()
    this.startWorkTime()
  }
  private startWorkTime() {
    this.send([
    {
      type: 'setTime',
      data: workTime,
    },
    {
      type: 'run',
    },
  ])
  }
  private startRestTime = () => {
    this.send([
      {
        type: 'setTime',
        data: restTime
      },
      {
        type: 'run'
      }
    ])
  }
  private handleTimeChange() {
    this.countDown.on('message', (data: SendMsg) => {
    if (this.timeType === 'WORK') {
        this.handleWorkTimeChange(data)
      } else {
        this.handleRestTimeChange(data)
      }
    })
  }
  private handleWorkTimeChange({ time: {h, m, s}, ms, done }: SendMsg) {
    this.tray.setTitle(`${h}:${m}:${s}`)
    if (ms <= tipsTime) {
      this.handleTipsTime(s, done)
    } else if (this.tipsWindow) {
      this.closeTipsWindow()
    }
    if (done) {
      this.toggleRest()
    }
  }
  private handleRestTimeChange({ time, done }: SendMsg) {
    this.restWindows?.[0].webContents.send(REST_MESSAGE, {
      time,
      done
    })
    if (done) {
      this.toggleWork()
    }
  }
  private toggleWork() {
    this.timeType = 'WORK'
    ipcMain.removeListener(REST_MESSAGE, this.handleRestMsg)
    this.restWindows?.forEach(win => {
      win.close()
    })
    this.restWindows = null
    this.startWorkTime()
  }
  private toggleRest() {
    this.timeType = 'REST'
    this.closeTipsWindow()
    ipcMain.on(REST_MESSAGE, this.handleRestMsg)
    this.restWindows = createRestWindow()
  }
  private closeTipsWindow() {
    if (this.tipsWindow) {
      ipcMain.removeListener(TIPS_MESSAGE, this.handleTipsMsg)
      this.tipsWindow.close()
      this.tipsWindow = null
    }
  }
  private handleTipsTime(s: string, done: boolean) {
    if (!this.tipsWindow) {
      ipcMain.on(TIPS_MESSAGE, this.handleTipsMsg)
      this.tipsWindow = createTipsWindow(this.tray.getBounds(), s)
    } else {
      this.tipsWindow.webContents.send(TIPS_MESSAGE, {
        s,
        done
      })
    }
  }
  private handleTipsMsg = (event: IpcMainEvent, {type}: TipsMsgData) => {
    if (type === 'CLOSE') {
      this.closeTipsWindow()
    } else if (type === 'RESET') {
      this.closeTipsWindow()
      this.send({
        type: 'resetTime'
      })
    } else if (type === 'STOP'){
      this.closeTipsWindow()
      this.stop(this.menu?.getMenuItemById('pause')!)
    }
  }
  private handleRestMsg = (event: IpcMainEvent, data: RestMsgData) => {
    if (data.type === 'READY') {
      this.startRestTime()
    } else if (data.type === 'CLOSE') {
      this.toggleWork()
    }
  }
  private setContextMenu() {
    this.menu = Menu.buildFromTemplate([
      {
        label: '偏好设置',
        accelerator: 'CmdOrCtrl+,',
        click: () => {
          const win = createSettingWindows(restTime, tipsTime, workTime)
          const handleSettingMsg = (event: IpcMainEvent, {rest, work, tips}: SettingMsgData) => {
            setTime(rest, work, tips)
            win.close()
          }
          win.on('close', () => {
            ipcMain.removeListener(SETTING_MESSAGE, handleSettingMsg)
          })
          ipcMain.on(SETTING_MESSAGE, handleSettingMsg)
        },
      },
      {
        type: 'separator',
      },
      {
        id: 'play',
        label: '继续',
        accelerator: 'CmdOrCtrl+p',
        visible: false,
        click: (menuItem) => {
          this.send({
            type: 'run'
          })
          menuItem.menu.getMenuItemById('pause').visible = true
          menuItem.visible = false
        },
      },
      {
        id: 'pause',
        label: '暂停',
        accelerator: 'CmdOrCtrl+s',
        visible: true,
        click: (menuItem) => {
          this.stop(menuItem)
        },
      },
      {
        label: '重置',
        accelerator: 'CmdOrCtrl+r',
        click: (menuItem) => {
          menuItem.menu.getMenuItemById('play').visible = false
          menuItem.menu.getMenuItemById('pause').visible = true
          this.startWorkTime()
        },
      },
      {
        type: 'separator',
      },
      { label: '退出', role: 'quit' },
    ])
    this.tray.setContextMenu(this.menu)
  }
  private stop(menuItem: MenuItem) {
    this.send({
      type: 'stop'
    })
    menuItem.menu.getMenuItemById('play').visible = true
    menuItem.visible = false
  }
  send(message: ReceiveMsg | ReceiveMsg[]) {
    this.countDown.send(message)
  }
}

export function initTray(): Tary {
  return new Tary()
}
