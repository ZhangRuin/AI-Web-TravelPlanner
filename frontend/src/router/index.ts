import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import { useUserStore } from '../stores/userStore';

// 懒加载路由组件
const Home = () => import('../views/HomeView.vue');
const Login = () => import('../views/LoginView.vue');
const Register = () => import('../views/RegisterView.vue');
const PlanCreate = () => import('../views/PlanCreateView.vue');
const PlanDetail = () => import('../views/PlanDetailView.vue');
const PlanList = () => import('../views/PlanListView.vue');
const BudgetAnalysis = () => import('../views/BudgetAnalysisView.vue');
const ExpenseTracking = () => import('../views/ExpenseTrackingView.vue');
const MapView = () => import('../views/MapView.vue');
const Profile = () => import('../views/ProfileView.vue');

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: Home,
    meta: { requiresAuth: false, title: '智能旅行规划' },
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: { requiresAuth: false, title: '登录' },
  },
  {
    path: '/register',
    name: 'register',
    component: Register,
    meta: { requiresAuth: false, title: '注册' },
  },
  {
    path: '/plan/create',
    name: 'planCreate',
    component: PlanCreate,
    meta: { requiresAuth: true, title: '创建行程' },
  },
  {
    path: '/plan/detail/:id',
    name: 'planDetail',
    component: PlanDetail,
    props: true,
    meta: { requiresAuth: true, title: '行程详情' },
  },
  {
    path: '/plan/list',
    name: 'planList',
    component: PlanList,
    meta: { requiresAuth: true, title: '我的行程' },
  },
  {
    path: '/budget/analysis/:planId',
    name: 'budgetAnalysis',
    component: BudgetAnalysis,
    props: true,
    meta: { requiresAuth: true, title: '预算分析' },
  },
  {
    path: '/budget/tracking/:planId',
    name: 'expenseTracking',
    component: ExpenseTracking,
    props: true,
    meta: { requiresAuth: true, title: '费用记录' },
  },
  {
    path: '/map/:planId?',
    name: 'map',
    component: MapView,
    props: true,
    meta: { requiresAuth: true, title: '地图视图' },
  },
  {
    path: '/profile',
    name: 'profile',
    component: Profile,
    meta: { requiresAuth: true, title: '个人中心' },
  },
  // 404页面
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = `${to.meta.title || '智能旅行规划'} - TravelAI`;
  
  const userStore = useUserStore();
  const requiresAuth = to.meta.requiresAuth === true;
  const isAuthenticated = userStore.isAuthenticated;
  
  // 未登录访问需要认证的页面，重定向到登录
  if (requiresAuth && !isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } });
  }
  // 已登录访问登录/注册页面，重定向到首页
  else if ((to.name === 'login' || to.name === 'register') && isAuthenticated) {
    next({ name: 'home' });
  }
  else {
    next();
  }
});

export default router;
