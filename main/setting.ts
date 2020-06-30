import fs from 'fs'
import path from 'path'

const storePath = path.resolve(__dirname, './store.json')
export let {restTime, tipsTime, workTime} = get()

export function setTime(rest: number, work: number, tips: number) {
  restTime = rest
  tipsTime = tips
  workTime = work
  fs.writeFileSync(storePath, JSON.stringify({restTime, tipsTime, workTime}, null, 2))
}

function get() {
  const store = fs.readFileSync(storePath, 'utf-8')
  return JSON.parse(store)
}
