<template>
  <el-container class="app-container">
    <!-- 顶部导航栏 -->
    <el-header height="60px" class="app-header">
      <div class="header-content">
        <div class="logo">
          <router-link to="/">
            <el-icon size="32"><LocationFilled /></el-icon>
            <span class="logo-text">TravelAI</span>
          </router-link>
        </div>
        
        <div class="nav-menu" v-if="userStore.isAuthenticated">
          <router-link to="/plan/list" class="nav-link">我的行程</router-link>
          <router-link to="/plan/create" class="nav-link">创建行程</router-link>
          <router-link to="/map" class="nav-link">地图视图</router-link>
        </div>
        
        <div class="user-info">
          <template v-if="userStore.isAuthenticated">
            <el-dropdown>
              <span class="user-name">
                {{ userStore.user?.username }}
                <el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item><router-link to="/profile">个人中心</router-link></el-dropdown-item>
                  <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          <template v-else>
            <router-link to="/login" class="login-btn">登录</router-link>
            <router-link to="/register" class="register-btn">注册</router-link>
          </template>
        </div>
      </div>
    </el-header>
    
    <!-- 主内容区域 -->
    <el-container>
      <!-- 侧边栏（仅在登录后显示） -->
      <el-aside width="240px" class="app-aside" v-if="userStore.isAuthenticated">
        <el-menu
          :default-active="activeMenu"
          class="el-menu-vertical"
          router
          background-color="#545c64"
          text-color="#fff"
          active-text-color="#ffd04b"
        >
          <el-menu-item index="/plan/list">
            <el-icon><Collection /></el-icon>
            <span>我的行程</span>
          </el-menu-item>
          <el-menu-item index="/plan/create">
            <el-icon><Plus /></el-icon>
            <span>创建行程</span>
          </el-menu-item>
          <el-menu-item index="/map">
            <el-icon><Location /></el-icon>
            <span>地图视图</span>
          </el-menu-item>
          <el-menu-item index="/profile">
            <el-icon><User /></el-icon>
            <span>个人中心</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      
      <!-- 主内容 -->
      <el-main class="app-main">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from './stores/userStore';
import {
  LocationFilled,
  Collection,
  Plus,
  Location,
  User,
  ArrowDown
} from '@element-plus/icons-vue';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

// 计算当前激活的菜单
const activeMenu = computed(() => {
  const path = route.path;
  // 处理带有参数的路由
  const mainPath = path.split('/')[1] ? `/${path.split('/')[1]}` : '/';
  return mainPath === '/plan' ? '/plan/list' : mainPath;
});

// 处理退出登录
const handleLogout = async () => {
  try {
    await userStore.logout();
    router.push('/');
  } catch (error) {
    console.error('退出登录失败:', error);
  }
};

// 检查用户登录状态
onMounted(() => {
  const token = localStorage.getItem('auth_token');
  if (token && !userStore.isAuthenticated) {
    userStore.fetchUserInfo().catch(() => {
      // 忽略错误
    });
  }
});
</script>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  height: 100%;
}

.app-container {
  height: 100%;
  background-color: #f0f2f5;
}

/* 头部样式 */
.app-header {
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 100;
  padding: 0;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 20px;
}

.logo {
  display: flex;
  align-items: center;
  text-decoration: none;
}

.logo-text {
  margin-left: 10px;
  font-size: 20px;
  font-weight: bold;
  color: #1890ff;
}

.nav-menu {
  display: flex;
  gap: 20px;
}

.nav-link {
  color: #606266;
  text-decoration: none;
  padding: 5px 10px;
  border-radius: 4px;
  transition: all 0.3s;
}

.nav-link:hover {
  color: #1890ff;
  background-color: #f0f9ff;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-name {
  cursor: pointer;
  color: #606266;
  padding: 5px 10px;
  border-radius: 4px;
  transition: all 0.3s;
}

.user-name:hover {
  background-color: #f5f7fa;
}

.login-btn, .register-btn {
  padding: 6px 16px;
  border-radius: 4px;
  text-decoration: none;
  transition: all 0.3s;
}

.login-btn {
  color: #1890ff;
  border: 1px solid #d9d9d9;
}

.login-btn:hover {
  color: #40a9ff;
  border-color: #40a9ff;
}

.register-btn {
  color: #fff;
  background-color: #1890ff;
  border: 1px solid #1890ff;
}

.register-btn:hover {
  background-color: #40a9ff;
  border-color: #40a9ff;
}

/* 侧边栏样式 */
.app-aside {
  background-color: #545c64;
  overflow: hidden;
}

.el-menu-vertical {
  height: 100%;
  border-right: none;
}

/* 主内容区域样式 */
.app-main {
  padding: 20px;
  background-color: #f0f2f5;
}

/* 过渡动画 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .nav-menu {
    display: none;
  }
  
  .app-aside {
    display: none;
  }
  
  .app-main {
    padding: 10px;
  }
}
</style>
