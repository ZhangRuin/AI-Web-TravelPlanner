import axios from 'axios';

// API基础配置
const API_BASE_URL = 'http://localhost:8081/api'; // 后端服务地址

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API请求错误:', error);
    if (error.response?.status === 401) {
      // 处理未授权错误，例如清除token并重定向到登录页
      localStorage.removeItem('auth_token');
      // router.push('/login');
    }
    return Promise.reject(error);
  }
);

// 行程规划相关API
export const planApi = {
  // 创建行程规划 - 调用AI生成接口
  createPlan: async (planData: any) => {
    return await apiClient.post('/ai/generate', planData);
  },
  
  // 保存行程到数据库
  savePlan: async (planData: any, userId: number) => {
    return await apiClient.post(`/plan/save?userId=${userId}`, planData);
  },
  
  // 获取用户的所有行程
  getUserPlans: async (userId: number) => {
    return await apiClient.get(`/plan/list/${userId}`);
  },
  
  // 获取行程详情
  getPlanDetail: async (planId: string) => {
    return await apiClient.get(`/plan/detail/${planId}`);
  },
  
  // 更新行程
  updatePlan: async (planId: string, planData: any) => {
    return await apiClient.put(`/plan/update/${planId}`, planData);
  },
  
  // 删除行程
  deletePlan: async (planId: string) => {
    return await apiClient.delete(`/plan/delete/${planId}`);
  },
};

// 预算管理相关API
export const budgetApi = {
  // 分析预算
  analyzeBudget: async (planData: any) => {
    return await apiClient.post('/ai/budget/analyze', planData);
  },
  
  // 添加费用记录
  addExpense: async (expenseData: any) => {
    return await apiClient.post('/budget/add', expenseData);
  },
  
  // 获取费用记录列表
  getExpenses: async (planId: string) => {
    return await apiClient.get(`/budget/list/${planId}`);
  },
  
  // 删除费用记录
  deleteExpense: async (expenseId: string) => {
    return await apiClient.delete(`/budget/delete/${expenseId}`);
  },
};

// 用户管理相关API
export const userApi = {
  // 用户注册
  register: async (userData: any) => {
    return await apiClient.post(`/user/register?username=${encodeURIComponent(userData.username)}&password=${encodeURIComponent(userData.password)}`);
  },
  
  // 用户登录
  login: async (credentials: { username: string; password: string }) => {
    return await apiClient.post(`/user/login?username=${encodeURIComponent(credentials.username)}&password=${encodeURIComponent(credentials.password)}`);
  },
  
  // 获取用户信息
  getUserInfo: async () => {
    return await apiClient.get('/user/info');
  },
  
  // 更新用户信息
  updateUserInfo: async (userData: any) => {
    return await apiClient.put('/user/update', userData);
  },
  
  // 退出登录
  logout: async () => {
    return await apiClient.post('/user/logout');
  },
};

// 地图和位置相关API
export const mapApi = {
  // 获取景点列表
  getSpots: async (planId: string) => {
    return await apiClient.get(`/spot/list/${planId}`);
  },
};

export default apiClient;