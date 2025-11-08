import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import 'element-plus/dist/index.css';
import 'leaflet/dist/leaflet.css';

import App from './App.vue';
import router from './router';
import { useUserStore } from './stores/userStore';
import { usePlanStore } from './stores/planStore';

// 创建Vue应用
const app = createApp(App);

// 注册Pinia状态管理
app.use(createPinia());

// 注册Element Plus组件库
app.use(ElementPlus);

// 注册Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

// 注册路由
app.use(router);

// 挂载应用
app.mount('#app');

// 应用挂载后，检查用户登录状态
const userStore = useUserStore();
const token = localStorage.getItem('auth_token');
if (token && !userStore.isAuthenticated) {
  // 尝试获取用户信息
  userStore.fetchUserInfo().catch(error => {
    console.error('用户验证失败:', error);
    // 清除无效token
    localStorage.removeItem('auth_token');
  });
}

// 初始化planStore，优先从后端数据库加载行程数据
const planStore = usePlanStore();
async function initApp() {
  try {
    await planStore.initializeStore();
    console.log('应用初始化完成，已加载行程数据');
  } catch (error) {
    console.error('应用初始化失败:', error);
  }
}

// 执行初始化
initApp();
