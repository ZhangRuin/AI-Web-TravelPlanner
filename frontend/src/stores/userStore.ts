import { defineStore } from 'pinia';
import { userApi } from '../services/apiService';

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null as User | null,
    isAuthenticated: false,
    loading: false,
    error: null as string | null,
  }),
  
  actions: {
    // 用户登录
    async login(username: string, password: string) {
      this.loading = true;
      this.error = null;
      try {
        console.log('登录API调用开始:', { username });
        const response = await userApi.login({ username, password });
        // 添加类型断言，确保TypeScript知道这是我们期望的响应数据格式
        const responseData = (response || {}) as any;
        console.log('登录API返回响应:', responseData);
        
        // 检查登录是否成功（基于code）
        const isLoginSuccessful = responseData.code === 1;
        console.log('登录是否成功:', isLoginSuccessful);
        
        if (isLoginSuccessful) {
          // 从responseData中提取用户信息
          if (responseData) {
            console.log('从responseData中提取用户信息:', responseData);
            this.user = {
              id: String(responseData.id || responseData.data?.id || ''),
              username: responseData.username || responseData.data?.username || '',
              email: responseData.email || responseData.data?.email || '',
              avatar: responseData.avatar || responseData.data?.avatar || undefined,
              createdAt: responseData.createdAt || responseData.data?.createdAt || new Date().toISOString()
            };
            console.log('设置用户信息:', this.user);
          }
          
          // 即使没有token，只要登录成功就设置为已认证
          this.isAuthenticated = true;
          console.log('设置认证状态为已登录');
          
          // 尝试查找token（如果有）
          if (responseData.token) {
            console.log('找到token，存储到localStorage');
            localStorage.setItem('auth_token', responseData.token);
          } else if (responseData.data?.token) {
            console.log('从responseData.data中找到token，存储到localStorage');
            localStorage.setItem('auth_token', responseData.data.token);
          } else {
            console.warn('响应中没有token字段，但登录成功');
          }
        } else {
          // 登录失败
          console.error('登录失败，code不为1:', responseData.code);
          this.isAuthenticated = false;
          this.user = null;
          this.error = responseData.msg || '登录失败，请检查用户名和密码';
        }
        
        return response;
      } catch (error: any) {
        console.error('登录失败异常:', error);
        this.error = error.response?.data?.message || '登录失败，请检查用户名和密码';
        // 确保登录失败时认证状态为false
        this.isAuthenticated = false;
        this.user = null;
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 用户注册
    async register(userData: { username: string; email: string; password: string }) {
      this.loading = true;
      this.error = null;
      try {
        const response = await userApi.register(userData);
        return response;
      } catch (error: any) {
        this.error = error.response?.data?.message || '注册失败，请稍后再试';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 获取用户信息
    async fetchUserInfo() {
      this.loading = true;
      this.error = null;
      try {
        const response = await userApi.getUserInfo();
        const userData = response.data || {};
        this.user = userData;
        this.isAuthenticated = true;
        return userData;
      } catch (error) {
        this.isAuthenticated = false;
        this.user = null;
        localStorage.removeItem('auth_token');
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 更新用户信息
    updateUser(userData: Partial<User>) {
      if (this.user) {
        this.user = { ...this.user, ...userData };
      }
    },
    
    // 退出登录
    async logout() {
      try {
        await userApi.logout();
      } catch (error) {
        console.error('登出失败:', error);
      } finally {
        this.user = null;
        this.isAuthenticated = false;
        localStorage.removeItem('auth_token');
      }
    },
    
    // 清除错误信息
    clearError() {
      this.error = null;
    },
  },
});