import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('restTimer', {
  saveSettings: (times: { rest: number, work: number, tips: number }) =>
    ipcRenderer.send('SETTING_MESSAGE', times),
  closeRest: () => ipcRenderer.send('REST_MESSAGE', { type: 'CLOSE' }),
  restReady: () => ipcRenderer.send('REST_MESSAGE', { type: 'READY' }),
  closeTips: () => ipcRenderer.send('TIPS_MESSAGE', { type: 'CLOSE' }),
  stopTips: () => ipcRenderer.send('TIPS_MESSAGE', { type: 'STOP' }),
  resetTips: () => ipcRenderer.send('TIPS_MESSAGE', { type: 'RESET' }),
  onRestTick: (callback: (tick: unknown) => void) => {
    ipcRenderer.on('REST_MESSAGE', (_event, tick) => callback(tick))
  },
  onTipsTick: (callback: (tick: unknown) => void) => {
    ipcRenderer.on('TIPS_MESSAGE', (_event, tick) => callback(tick))
  }
})
