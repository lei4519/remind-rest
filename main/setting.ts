import { app } from 'electron'
import fs from 'fs'
import path from 'path'

const storePath = path.join(app.getPath('userData'), 'store.json')
const bundledSettings = path.join(__dirname, 'store.json')
export let {restTime, tipsTime, workTime} = get()

export function setTime(rest: number, work: number, tips: number) {
  restTime = rest
  tipsTime = tips
  workTime = work
  fs.mkdirSync(path.dirname(storePath), { recursive: true })
  fs.writeFileSync(storePath, JSON.stringify({restTime, tipsTime, workTime}, null, 2))
}

function get() {
  const store = fs.readFileSync(fs.existsSync(storePath) ? storePath : bundledSettings, 'utf-8')
  return JSON.parse(store)
}
