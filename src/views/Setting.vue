<template>
  <div class="wrap">
    <div class="content">
      <div class="input-wrap">
        <div class="label">工作时间</div>
        <input
          type="number"
          v-model="work"
        >分钟
      </div>
      <div class="input-wrap">
        <div class="label">休息时间</div>
        <input
          type="number"
          v-model="rest"
        >分钟
      </div>
      <div class="input-wrap">
        <div class="label">提示时间</div>
        <input
          type="number"
          v-model="tips"
        >秒
      </div>
      <div class="btns">
        <button @click="save">保存</button>
        <button @click="reset">重置</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
const { ipcRenderer } = require('electron')

const BASE_UNIT = 60
const SECONDS = 1000
const MINUTES = SECONDS * BASE_UNIT
export default {
  setup() {
    const { query } = useRoute()
    const rest = ref(+query.rest / MINUTES)
    const work = ref(+query.work / MINUTES)
    const tips = ref(+query.tips / SECONDS)
    const save = () => {
      ipcRenderer.send(query.type, {
        rest: rest.value * MINUTES,
        work: work.value * MINUTES,
        tips: tips.value * SECONDS
      })
    }
    const reset = () => {
      rest.value = +query.rest / MINUTES
      work.value = +query.work / MINUTES
      tips.value = +query.tips / SECONDS
    }
    return {
      rest,
      work,
      tips,
      save,
      reset
    }
  }
}
</script>

<style scoped>
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}

input {
  padding: 2px 4px;
  background: none;
  outline: none;
  border: none;
  background: linear-gradient(to right, #74ebd5, #acb6e5);
  -webkit-background-clip: text;
  color: transparent;
  caret-color: #fff;
  font-size: 16px;
}

.wrap {
  display: flex;
  width: 100vw;
  height: 100vh;
  background: url(../assets/bg.jpg) no-repeat center / cover;
}
.content {
  position: relative;
  margin: auto;
  color: #fff;
  padding: 20px;
  text-align: center;
  font-size: 12px;
  border-radius: 5px;
  box-shadow: 1px 1px 6px 3px rgba(0, 0, 0, .8);
  background-color: rgba(0, 0, 0, .5);
  overflow: hidden;
}
.content::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  filter: blur(10px);
  margin: -30px;
  /* background-attachment: fixed; */
  z-index: -1;
}
.input-wrap {
  position: relative;
  margin-bottom: 20px;
  padding-bottom: 4px;
  background: linear-gradient(to right, #74ebd5, #acb6e5);
  -webkit-background-clip: text;
  color: transparent;
}
.input-wrap::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(to right, #36d1dc, #5b86e5);
}
.label {
  text-align: left;
  margin-bottom: 8px;
}
.btns {
  display: flex;
  align-items: center;
  justify-content: space-around;
}
button {
  background: linear-gradient(to right, #36d1dc, #5b86e5);
  border: none;
  outline: none;
  width: 45%;
  padding: 4px 8px;
  color: #fff;
  border-radius: 4px;
  cursor: pointer;
}
</style>