<template>
  <div class="home-container">
    <!-- 欢迎区域 -->
    <div class="welcome-section">
      <el-row :gutter="20">
        <el-col :xs="24" :md="16">
          <div class="welcome-content">
            <h1>欢迎回来，{{ userName }}！</h1>
            <p class="welcome-message">
              开启你的下一次精彩旅程
            </p>
            <div class="quick-actions">
              <el-button type="primary" size="large" @click="createNewPlan">
                <el-icon><Plus /></el-icon> 创建新行程
              </el-button>
              <el-button size="large" @click="viewAllPlans">
                <el-icon><List /></el-icon> 查看所有行程
              </el-button>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :md="8">
          <div class="stats-card">
            <div class="stats-header">
              <h3>旅行统计</h3>
            </div>
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-value">{{ totalPlans }}</div>
                <div class="stat-label">总行程数</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ upcomingTrips }}</div>
                <div class="stat-label">即将到来</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ visitedCountries }}</div>
                <div class="stat-label">去过的国家</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ totalBudget }}k</div>
                <div class="stat-label">总预算（元）</div>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 最近行程 -->
    <el-card class="recent-plans-card">
      <template #header>
        <div class="card-header">
          <h3>最近行程</h3>
          <el-button type="text" @click="viewAllPlans">查看全部</el-button>
        </div>
      </template>
      
      <div v-if="recentPlans.length > 0" class="plans-grid">
        <el-card
          v-for="plan in recentPlans"
          :key="plan.id"
          class="plan-card"
          :body-style="{ padding: '0' }"
          shadow="hover"
          @click="viewPlanDetail(plan.id)"
        >
          <div class="plan-card-header">
            <img
              :src="getDestinationImage(plan.destination)"
              :alt="plan.destination"
              class="plan-image"
            />
            <div class="plan-overlay"></div>
            <div class="plan-title-container">
              <h4 class="plan-title">{{ plan.title || plan.destination }}</h4>
              <div class="plan-destination">{{ plan.destination }}</div>
            </div>
          </div>
          <div class="plan-card-body">
            <div class="plan-info">
              <div class="info-item">
                <el-icon><Calendar /></el-icon>
                <span>{{ formatDateRange(plan.startDate, plan.endDate) }}</span>
              </div>
              <div class="info-item">
                <el-icon><Timer /></el-icon>
                <span>{{ plan.days?.length || 0 }} 天</span>
              </div>
              <div class="info-item">
                <el-icon><Money /></el-icon>
                <span>¥{{ formatCurrency(plan.budget || 0) }}</span>
              </div>
            </div>
            <div class="plan-status">
              <el-tag :type="getStatusType(plan)">{{ getStatusText(plan) }}</el-tag>
            </div>
          </div>
        </el-card>
      </div>
      
      <div v-else class="empty-state">
        <el-empty description="暂无行程，创建你的第一次旅行计划吧！" :image-size="120">
          <el-button type="primary" @click="createNewPlan">
            <el-icon><Plus /></el-icon> 创建行程
          </el-button>
        </el-empty>
      </div>
    </el-card>

    <!-- 快速功能区 -->
    <div class="quick-features">
      <h3>快捷功能</h3>
      <div class="features-grid">
        <el-card
          class="feature-card"
          :body-style="{ padding: '0' }"
          shadow="hover"
          @click="navigateTo('/budget/analysis')"
        >
          <div class="feature-card-header">
            <div class="feature-icon expense-icon">
              <el-icon><Wallet /></el-icon>
            </div>
            <h4>预算分析</h4>
          </div>
          <div class="feature-card-body">
            <p>智能分析旅行预算，追踪消费记录</p>
          </div>
        </el-card>
        
        <el-card
          class="feature-card"
          :body-style="{ padding: '0' }"
          shadow="hover"
          @click="navigateTo('/map')"
        >
          <div class="feature-card-header">
            <div class="feature-icon map-icon">
              <el-icon><LocationFilled /></el-icon>
            </div>
            <h4>地图视图</h4>
          </div>
          <div class="feature-card-body">
            <p>直观查看行程路线，规划最佳路径</p>
          </div>
        </el-card>
        
        <el-card
          class="feature-card"
          :body-style="{ padding: '0' }"
          shadow="hover"
          @click="navigateTo('/expense/tracking')"
        >
          <div class="feature-card-header">
            <div class="feature-icon tracking-icon">
              <el-icon><Document /></el-icon>
            </div>
            <h4>费用记录</h4>
          </div>
          <div class="feature-card-body">
            <p>便捷记录旅行开销，支持语音输入</p>
          </div>
        </el-card>
        
        <el-card
          class="feature-card"
          :body-style="{ padding: '0' }"
          shadow="hover"
          @click="voiceAssistant"
        >
          <div class="feature-card-header">
            <div class="feature-icon voice-icon">
              <el-icon><Microphone /></el-icon>
            </div>
            <h4>语音助手</h4>
          </div>
          <div class="feature-card-body">
            <p>语音创建行程、记录费用，解放双手</p>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 推荐目的地 -->
    <el-card class="recommendations-card">
      <template #header>
        <div class="card-header">
          <h3>推荐目的地</h3>
          <el-button type="text" @click="exploreDestinations">探索更多</el-button>
        </div>
      </template>
      
      <div class="recommendations-slider">
        <div class="recommendation-item" v-for="destination in recommendedDestinations" :key="destination.id">
          <div class="destination-card">
            <img
              :src="destination.image"
              :alt="destination.name"
              class="destination-image"
            />
            <div class="destination-overlay"></div>
            <div class="destination-info">
              <h4 class="destination-name">{{ destination.name }}</h4>
              <p class="destination-description">{{ destination.description }}</p>
              <el-button size="small" type="primary" @click.stop="createPlanForDestination(destination.name)">
                创建行程
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 语音助手对话框 -->
    <el-dialog
      v-model="showVoiceDialog"
      title="语音助手"
      width="500px"
      :close-on-click-modal="false"
    >
      <div class="voice-assistant-dialog">
        <div class="voice-status" :class="{ 'listening': isListening }">
          <div class="voice-icon-large">
            <el-icon :size="48"><Microphone /></el-icon>
          </div>
          <div class="voice-message">{{ voiceMessage }}</div>
        </div>
        
        <div class="voice-commands">
          <h4>常用指令</h4>
          <div class="command-list">
            <div
              v-for="command in voiceCommands"
              :key="command.id"
              class="command-item"
              @click="useVoiceCommand(command.text)"
            >
              <el-icon><ArrowRight /></el-icon>
              <span>{{ command.text }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="stopVoiceRecognition">停止</el-button>
        <el-button type="primary" @click="startVoiceRecognition" :disabled="isListening">
          {{ isListening ? '正在聆听...' : '开始聆听' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useUserStore } from '../stores/userStore';
import { usePlanStore, type TravelPlan } from '../stores/planStore';
import {
  Plus,
  List,
  Calendar,
  Timer,
  Money,
  Wallet,
  LocationFilled,
  Document,
  Microphone,
  ArrowRight
} from '@element-plus/icons-vue';

const router = useRouter();
const userStore = useUserStore();
const planStore = usePlanStore();

// 语音助手状态
const showVoiceDialog = ref(false);
const isListening = ref(false);
const voiceMessage = ref('点击开始聆听，告诉我们你想做什么...');

// 推荐目的地数据
const recommendedDestinations = ref([
  {
    id: 1,
    name: '日本东京',
    image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    description: '探索现代与传统交融的大都市'
  },
  {
    id: 2,
    name: '法国巴黎',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    description: '浪漫之都，艺术与美食的天堂'
  },
  {
    id: 3,
    name: '意大利威尼斯',
    image: 'https://images.unsplash.com/photo-1514890284497-28e20215cc31?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    description: '水城中的千年历史与建筑奇迹'
  },
  {
    id: 4,
    name: '泰国普吉岛',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    description: '阳光沙滩，度假放松的完美选择'
  }
]);

// 语音指令
const voiceCommands = [
  { id: 1, text: '创建新的日本旅行计划' },
  { id: 2, text: '查看我的行程列表' },
  { id: 3, text: '记录今天的费用' },
  { id: 4, text: '分析旅行预算' }
];

// 计算属性
const userName = computed(() => {
  return userStore.user?.username || '旅行者';
});

const recentPlans = computed(() => {
  return planStore.plans.slice(0, 3);
});

const totalPlans = computed(() => {
  return planStore.plans.length;
});

const upcomingTrips = computed(() => {
  const now = new Date();
  return planStore.plans.filter(plan => {
    const startDate = new Date(plan.startDate);
    return startDate > now;
  }).length;
});

const visitedCountries = computed(() => {
  // 简化实现，实际应该从行程中提取去过的国家
  return new Set(planStore.plans.map(plan => plan.destination.split('，')[0])).size;
});

const totalBudget = computed(() => {
  const total = planStore.plans.reduce((sum, plan) => sum + (plan.budget || 0), 0);
  return Math.round(total / 1000);
});

// 方法
const getDestinationImage = (destination: string): string => {
  // 根据目的地返回对应的图片，这里使用默认图片
  const destinationMap: Record<string, string> = {
    '日本': 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    '法国': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    '意大利': 'https://images.unsplash.com/photo-1514890284497-28e20215cc31?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    '泰国': 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
  };
  
  for (const [key, value] of Object.entries(destinationMap)) {
    if (destination.includes(key)) {
      return value;
    }
  }
  
  return 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80';
};

const formatDateRange = (startDate: string, endDate: string): string => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const formatDate = (date: Date): string => {
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };
  
  return `${formatDate(start)} - ${formatDate(end)}`;
};

const formatCurrency = (value: number | undefined | null): string => {
  // 处理undefined或null值，确保安全调用toLocaleString
  if (value === undefined || value === null) {
    return '0.00';
  }
  return Number(value).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const getStatusType = (plan: TravelPlan): string => {
  const now = new Date();
  const startDate = new Date(plan.startDate);
  const endDate = new Date(plan.endDate);
  
  if (endDate < now) return 'info'; // 已结束
  if (startDate > now) return 'primary'; // 即将到来
  return 'success'; // 进行中
};

const getStatusText = (plan: TravelPlan): string => {
  const now = new Date();
  const startDate = new Date(plan.startDate);
  const endDate = new Date(plan.endDate);
  
  if (endDate < now) return '已结束';
  if (startDate > now) return '即将到来';
  return '进行中';
};

const createNewPlan = () => {
  router.push('/plan/create');
};

const viewAllPlans = () => {
  router.push('/plan/list');
};

const viewPlanDetail = (planId: string) => {
  router.push(`/plan/detail/${planId}`);
};

const navigateTo = (path: string) => {
  router.push(path);
};

const exploreDestinations = () => {
  ElMessage.info('更多目的地推荐功能开发中...');
};

const createPlanForDestination = (destination: string) => {
  router.push({
    path: '/plan/create',
    query: { destination }
  });
};

// 语音助手功能（临时禁用）
const voiceAssistant = () => {
  showVoiceDialog.value = true;
  ElMessage.warning('语音功能暂不可用');
};

const startVoiceRecognition = async () => {
  isListening.value = true;
  voiceMessage.value = '正在模拟语音识别...';
  
  try {
    // 模拟语音识别结果
    await new Promise(resolve => setTimeout(resolve, 1500));
    const mockResult = '创建新的旅行计划';
    voiceMessage.value = `识别结果: ${mockResult}`;
    
    // 处理语音命令
    await processVoiceCommand(mockResult);
  } catch (error) {
    voiceMessage.value = '识别失败，请重试';
  } finally {
    isListening.value = false;
  }
};

const stopVoiceRecognition = () => {
  isListening.value = false;
  voiceMessage.value = '点击开始聆听，告诉我们你想做什么...';
};

const useVoiceCommand = async (command: string) => {
  voiceMessage.value = `执行命令: ${command}`;
  await processVoiceCommand(command);
};

const processVoiceCommand = async (command: string) => {
  // 简单的命令处理逻辑
  const lowerCommand = command.toLowerCase();
  
  if (lowerCommand.includes('创建') || lowerCommand.includes('新建')) {
    if (lowerCommand.includes('行程') || lowerCommand.includes('计划')) {
      ElMessage.success('正在跳转到行程创建页面');
      createNewPlan();
    }
  } else if (lowerCommand.includes('查看') || lowerCommand.includes('列表')) {
    if (lowerCommand.includes('行程') || lowerCommand.includes('计划')) {
      ElMessage.success('正在跳转到行程列表页面');
      viewAllPlans();
    }
  } else if (lowerCommand.includes('预算') || lowerCommand.includes('分析')) {
    ElMessage.success('正在跳转到预算分析页面');
    navigateTo('/budget/analysis');
  } else if (lowerCommand.includes('记录') || lowerCommand.includes('费用')) {
    ElMessage.success('正在跳转到费用记录页面');
    navigateTo('/expense/tracking');
  } else if (lowerCommand.includes('地图')) {
    ElMessage.success('正在跳转到地图页面');
    navigateTo('/map');
  } else {
    ElMessage.info('抱歉，我无法理解这个命令，请尝试其他指令');
  }
};

// 加载行程数据
const loadData = async () => {
  // 使用正确的属性isAuthenticated
  if (userStore.isAuthenticated) {
    // 跳过对不存在的fetchUserPlans方法的调用
    // 也跳过预算分析相关的获取调用
    // planStore.plans 已经应该包含数据，不需要额外获取
    console.warn('User data and budget analysis loading skipped as fetch methods not available');
  }
};

// 组件挂载
onMounted(() => {
  loadData();
});
</script>

<style scoped>
.home-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

/* 欢迎区域 */
.welcome-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 40px;
  margin-bottom: 30px;
  color: white;
}

.welcome-content h1 {
  margin: 0 0 15px 0;
  font-size: 36px;
  font-weight: 600;
}

.welcome-message {
  font-size: 18px;
  opacity: 0.9;
  margin-bottom: 30px;
}

.quick-actions {
  display: flex;
  gap: 15px;
}

.quick-actions .el-button {
  padding: 12px 24px;
}

/* 统计卡片 */
.stats-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 25px;
  height: 100%;
}

.stats-header h3 {
  margin: 0 0 20px 0;
  font-size: 20px;
  font-weight: 500;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.8;
}

/* 最近行程卡片 */
.recent-plans-card {
  margin-bottom: 30px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 500;
  color: #303133;
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.plan-card {
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
}

.plan-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.12);
}

.plan-card-header {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.plan-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.plan-card:hover .plan-image {
  transform: scale(1.1);
}

.plan-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
}

.plan-title-container {
  position: absolute;
  bottom: 0;
  left: 0;
  padding: 20px;
  color: white;
}

.plan-title {
  margin: 0 0 5px 0;
  font-size: 20px;
  font-weight: 600;
}

.plan-destination {
  font-size: 14px;
  opacity: 0.9;
}

.plan-card-body {
  padding: 20px;
}

.plan-info {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 15px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #606266;
  font-size: 14px;
}

.plan-status {
  display: flex;
  justify-content: flex-end;
}

.empty-state {
  padding: 60px 20px;
  text-align: center;
}

/* 快捷功能区 */
.quick-features {
  margin-bottom: 30px;
}

.quick-features h3 {
  margin: 0 0 20px 0;
  font-size: 20px;
  font-weight: 500;
  color: #303133;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.feature-card {
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  height: 100%;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.12);
}

.feature-card-header {
  padding: 30px 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.feature-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.expense-icon {
  background-color: #1890ff;
}

.map-icon {
  background-color: #52c41a;
}

.tracking-icon {
  background-color: #fa8c16;
}

.voice-icon {
  background-color: #722ed1;
}

.feature-card-header h4 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: #303133;
}

.feature-card-body {
  padding: 0 20px 30px;
  text-align: center;
}

.feature-card-body p {
  margin: 0;
  color: #606266;
  line-height: 1.6;
}

/* 推荐目的地 */
.recommendations-card {
  margin-bottom: 30px;
}

.recommendations-slider {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  padding: 20px 0;
  scrollbar-width: thin;
  scrollbar-color: #dcdfe6 #f0f2f5;
}

.recommendations-slider::-webkit-scrollbar {
  height: 6px;
}

.recommendations-slider::-webkit-scrollbar-track {
  background: #f0f2f5;
  border-radius: 3px;
}

.recommendations-slider::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 3px;
}

.recommendation-item {
  flex: 0 0 300px;
}

.destination-card {
  position: relative;
  height: 200px;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.destination-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.12);
}

.destination-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.destination-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
}

.destination-info {
  position: absolute;
  bottom: 0;
  left: 0;
  padding: 20px;
  color: white;
}

.destination-name {
  margin: 0 0 10px 0;
  font-size: 20px;
  font-weight: 600;
}

.destination-description {
  margin: 0 0 15px 0;
  font-size: 14px;
  opacity: 0.9;
  line-height: 1.4;
}

/* 语音助手对话框 */
.voice-assistant-dialog {
  padding: 20px 0;
}

.voice-status {
  text-align: center;
  padding: 30px 0;
  transition: all 0.3s ease;
}

.voice-status.listening {
  background-color: #f0f9ff;
  border-radius: 12px;
  margin: 0 -10px 30px;
}

.voice-icon-large {
  margin-bottom: 20px;
  color: #1890ff;
}

.voice-message {
  font-size: 16px;
  color: #606266;
  line-height: 1.6;
}

.voice-commands h4 {
  margin: 0 0 15px 0;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.command-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.command-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background-color: #f5f7fa;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  color: #606266;
}

.command-item:hover {
  background-color: #e6f7ff;
  color: #1890ff;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .home-container {
    padding: 10px;
  }
  
  .welcome-section {
    padding: 30px 20px;
  }
  
  .welcome-content h1 {
    font-size: 28px;
  }
  
  .quick-actions {
    flex-direction: column;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .plans-grid {
    grid-template-columns: 1fr;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .recommendation-item {
    flex: 0 0 260px;
  }
}
</style>