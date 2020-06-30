// 2小时10分10秒
// var time = H * 2 + M * 10 + S * 10
// 反推
// h = time / H | 0
// m = time / M % 60 | 0
// s = time / S % 60 | 0
export const SECONDS = 1000
export const BASE_UNIT = 60
export const MINUTES = SECONDS * BASE_UNIT
export const HOURS = MINUTES * BASE_UNIT

type hasData = 'setTime'
interface ReceiveMsgNoData {
  type: Exclude<keyof CountDown, hasData>
}
interface ReceiveMsgHasData {
  type: hasData
  data: number
}
export type ReceiveMsg = ReceiveMsgNoData | ReceiveMsgHasData | Array<ReceiveMsgNoData | ReceiveMsgHasData>
interface Msg {
  time: {
    h: string
    m: string
    s: string
  },
  ms: number
}
export interface SendMsg {
  time: {
    h: string
    m: string
    s: string
  },
  ms: number
  done: boolean
}

class CountDown {
  private time = 0
  private _time = 0
  private timer?: NodeJS.Timeout
  static formatTimeByMs(ms: number) {
    return {
      h: String((ms / HOURS) | 0).padStart(2, '0'),
      m: String((ms / MINUTES) % BASE_UNIT | 0).padStart(2, '0'),
      s: String((ms / SECONDS) % BASE_UNIT | 0).padStart(2, '0'),
    }
  }
  resetTime() {
    this.time = this._time
    this.send({
      time: CountDown.formatTimeByMs(this.time),
      ms: this.time
    })
    return this
  }
  setTime(ms: number) {
    this.stop()
    this.time = this._time = ms
    return this
  }
  run() {
    this.send({
      time: CountDown.formatTimeByMs(this.time),
      ms: this.time
    })
    this.timer = setInterval(() => {
      this.send({
        time: CountDown.formatTimeByMs(this.time -= SECONDS),
        ms: this.time
      })
      if (this.time <= 0) this.stop()
    }, SECONDS)
  }
  private send(msg: Msg) {
    process.send!({...msg, done: msg.ms <= 0})
  }
  stop() {
    this.timer && clearInterval(this.timer)
  }
}
const c = new CountDown()
process.on('message', (message: ReceiveMsg) => {
  if (!Array.isArray(message)) {
    message = [message]
  }
  message.forEach((msg) => {
    if (msg.type === 'setTime') {
      c[msg.type](msg.data)
    } else {
      c[msg.type]()
    }
  })
})
