import fs from 'fs'

type callback = (name: string) => void
export function readDeepDir(path: string, fn: callback) {
  const _reader = (path: string) => {
    fs.readdirSync(path).forEach((name) => {
      if (!fs.statSync(path + '/' + name).isDirectory()) {
        return fn(path + '/' + name)
      }
      return _reader(path + '/' + name)
    })
  }
  return _reader(path)
}