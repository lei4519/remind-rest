<template>
  <div v-if="isMainScreen" class="wrap">
    <div class="time">{{time}}</div>
    <div class="btn" @click="close">X</div>
  </div>
</template>

<script>
import {ref, watch, computed} from 'vue'
import {useRoute} from 'vue-router'
const { ipcRenderer } = require('electron')

export default {
  setup() {
    const {query} = useRoute()
    const time = ref('')
    const close = () => {
      ipcRenderer.send(query.type, {type: 'CLOSE'})
    }
    const isMainScreen = ref(!!query.isMainScreen)
    if (isMainScreen) {
      ipcRenderer.send(query.type, {type: 'READY'})
      ipcRenderer.on(query.type, (ipc, {time: {h, m, s}, done}) => {
        time.value = `${h}:${m}:${s}`
        if (done) close()
      })
    }
    return {
      isMainScreen,
      time,
      close
    }
  }
}
</script>

<style scoped>
.wrap {
  position: relative;
  height: 100%;
  user-select: none;
}

.time {
  position: absolute;
  top: 25%;
  left: 50%;
  transform: translateX(-50%);
  font-size: 200px;
  font-weight: bold;
  background: linear-gradient(to right, #a8ff78, #78ffd6);
  -webkit-background-clip: text;
  color: transparent;
}
.btn {
  position: absolute;
  font-size: 50px;
  line-height: 50px;
  text-align: center;
  width: 50px;
  height: 50px;
  bottom: 10%;
  left: 50%;
  margin-left: -25px;
  background: linear-gradient(to right, #a8ff78, #78ffd6);
  -webkit-background-clip: text;
  color: transparent;
  cursor: pointer;
}
.btn::before {
  transition: all .4s;
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  border-radius: 50%;
  border: 4px solid #a8ff78;
  transform: scale(0);
}

.btn:hover::before {
  transform: scale(1);
}
</style>