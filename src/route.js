import {createRouter, createWebHashHistory} from 'vue-router'
import LockPage from './views/LockPage.vue'
import Tips from './views/Tips.vue'
import Setting from './views/Setting.vue'
export default createRouter(
  {
    history: createWebHashHistory(),
    routes: [
      {
        path: '/LockPage',
        name: 'LockPage',
        component: LockPage
      },
      {
        path: '/Tips',
        name: 'Tips',
        component: Tips
      },
      {
        path: '/Setting',
        name: 'Setting',
        component: Setting
      }
    ]
  }
)