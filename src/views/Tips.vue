<template>
  <div class="wrap">
    <div class="progress">
      <div class="inner" :style="style"></div>
      <div class="text">{{time}}s</div>
    </div>
    <div class="btns">
      <div @click="stop" class="stop">
        <svg t="1593422358724" class="icon" fill="#fff" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4131" width="28" height="28"><path d="M279.272727 384v256c0 53.527273 41.890909 95.418182 95.418182 95.418182s95.418182-41.890909 95.418182-95.418182v-256c0-53.527273-41.890909-95.418182-95.418182-95.418182S279.272727 330.472727 279.272727 384z m144.290909 0v256c0 27.927273-20.945455 48.872727-48.872727 48.872727s-48.872727-20.945455-48.872727-48.872727v-256c0-27.927273 20.945455-48.872727 48.872727-48.872727s48.872727 20.945455 48.872727 48.872727zM553.890909 384v256c0 53.527273 41.890909 95.418182 95.418182 95.418182s95.418182-41.890909 95.418182-95.418182v-256c0-53.527273-41.890909-95.418182-95.418182-95.418182s-95.418182 41.890909-95.418182 95.418182z m144.290909 0v256c0 27.927273-20.945455 48.872727-48.872727 48.872727s-48.872727-20.945455-48.872727-48.872727v-256c0-27.927273 20.945455-48.872727 48.872727-48.872727s48.872727 20.945455 48.872727 48.872727z" p-id="4128"></path><path d="M923.927273 209.454545c-6.981818-9.309091-23.272727-11.636364-32.581818-4.654545-9.309091 6.981818-11.636364 23.272727-4.654546 32.581818C947.2 316.509091 977.454545 411.927273 977.454545 512c0 256-209.454545 465.454545-465.454545 465.454545S46.545455 768 46.545455 512 256 46.545455 512 46.545455c100.072727 0 195.490909 30.254545 274.618182 90.763636 9.309091 6.981818 25.6 4.654545 32.581818-4.654546s4.654545-25.6-4.654545-32.581818C726.109091 34.909091 621.381818 0 512 0 230.4 0 0 230.4 0 512s230.4 512 512 512 512-230.4 512-512c0-109.381818-34.909091-214.109091-100.072727-302.545455z" fill="" p-id="4133"></path></svg>
      </div>
      <div @click="reset" class="reset">
        <svg t="1593422333376" class="icon" fill="#fff" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3878" width="28" height="28"><path d="M186.368 800.768c-65.536-81.92-102.4-182.272-102.4-288.768 0-253.952 206.848-460.8 460.8-460.8s460.8 206.848 460.8 460.8-206.848 460.8-460.8 460.8c-10.24 0-20.48-8.192-20.48-20.48 0-10.24 8.192-20.48 20.48-20.48 231.424 0 419.84-188.416 419.84-421.888s-188.416-421.888-419.84-421.888-419.84 188.416-419.84 421.888c0 98.304 32.768 190.464 94.208 264.192v-151.552c0-10.24 8.192-20.48 20.48-20.48s20.48 8.192 20.48 20.48v196.608c0 6.144-2.048 10.24-6.144 14.336-4.096 4.096-8.192 6.144-14.336 6.144h-196.608c-10.24 0-20.48-8.192-20.48-20.48 0-10.24 8.192-20.48 20.48-20.48h143.36z" p-id="3879"></path></svg>
      </div>
    </div>
  </div>
</template>

<script>
import {ref, computed, nextTick, reactive} from 'vue'
import {useRoute} from 'vue-router'
const { ipcRenderer } = require('electron')

export default {
  setup() {
    const {query} = useRoute()
    const time = ref(query.s)
    const style = reactive({
      'transition-duration': (Number(query.s) || 60) + 's',
      transform: 'none'
    })
    setTimeout(() => {
      style.transform = 'translateX(-100%)'
    })
    const close = () => {
      ipcRenderer.send(query.type, {type: 'CLOSE'})
    }
    const stop = () => {
      ipcRenderer.send(query.type, {type: 'STOP'})
    }
    const reset = () => {
      ipcRenderer.send(query.type, {type: 'RESET'})
    }
    ipcRenderer.on(query.type, (ipc, {s, done}) => {
      time.value = s
      if (done) close()
    })
    return {
      time,
      stop,
      reset,
      style
    }
  }
}
</script>

<style scoped>
  .wrap {
    height: 100%;
    color: #fff;
    text-align: center;
    overflow: hidden;
  }
  .progress {
    transition: all .5s;
    position: relative;
    margin-top: 6px;
    transform: translateY(18px);
    height: 12px;
    width: 100%;
    background: rgba(255, 255, 255, .3);
    border-radius: 8px;
    overflow: hidden;
  }
  .inner {
    height: 100%;
    border-radius: 8px;
    background: linear-gradient(to right, #12c2e9, #c471ed, #f64f59);
    transition-property: all;
    transition-timing-function: linear;
    transform: none;
  }
  .text {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    margin: 0 auto;
    font-size: 12px;
    line-height: 12px;;
  }
  .btns {
    display: flex;
    justify-content: space-around;
    font-size: 40px;
  }
  .wrap:hover .progress,
  .wrap:hover .stop,
  .wrap:hover .reset {
    transform: none;
    opacity: 1;
  }
  .stop,
  .reset {
    transition: all .5s;
    cursor: pointer;
    opacity: 0;
    transform: translateY(100%) rotateZ(90deg);
  }
</style>