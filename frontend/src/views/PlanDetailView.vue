<template>
  <div class="plan-detail-container">
    <el-card v-loading="planStore.loading" class="plan-detail-card">
      <template #header>
        <div class="card-header">
          <h2 class="plan-title">{{ plan?.title || '行程详情' }}</h2>
          <div class="plan-actions">
            <el-button @click="deletePlan" type="danger" size="small" :loading="planStore.loading">
              <el-icon><Delete /></el-icon> 删除
            </el-button>
          </div>
        </div>
      </template>
      
      <!-- 行程基本信息 -->
      <div class="plan-info" v-if="plan">
        <div class="info-grid">
          <div class="info-item">
            <el-icon class="info-icon"><location /></el-icon>
            <span class="info-label">目的地：</span>
            <span class="info-value">{{ plan.destination }}</span>
          </div>
          <div class="info-item">
            <el-icon class="info-icon"><Calendar /></el-icon>
            <span class="info-label">日期：</span>
            <span class="info-value">{{ formatDateRange(plan.startDate, plan.endDate) }}</span>
          </div>
          <div class="info-item">
            <el-icon class="info-icon"><User /></el-icon>
            <span class="info-label">人数：</span>
            <span class="info-value">{{ plan.people }}人</span>
          </div>
          <div class="info-item">
            <el-icon class="info-icon"><Money /></el-icon>
            <span class="info-label">预算：</span>
            <span class="info-value">¥{{ formatCurrency(plan.budget) }}</span>
          </div>
        </div>
        
        <div class="preferences">
          <span class="info-label">旅行偏好：</span>
          <el-tag v-for="pref in plan.preferences" :key="pref" type="primary" size="small" class="preference-tag">
            {{ pref }}
          </el-tag>
        </div>
      </div>
      
      <!-- 行程操作按钮 -->
      <div class="main-actions">
        <el-button @click="viewMap" type="primary" size="large">
          <el-icon><LocationFilled /></el-icon> 地图查看
        </el-button>
        <el-button @click="viewBudgetAnalysis" size="large">
          <el-icon><PieChart /></el-icon> 预算分析
        </el-button>
        <el-button @click="trackExpenses" size="large">
          <el-icon><Document /></el-icon> 费用记录
        </el-button>
      </div>
      
      <!-- 行程日程 -->
      <div class="plan-days" v-if="plan?.days && plan.days.length > 0">
        <h3 class="section-title">行程安排</h3>
        <el-timeline>
          <el-timeline-item
            v-for="day in plan.days"
            :key="day.id"
            :timestamp="`第 ${day.day} 天`"
            placement="top"
          >
            <el-card>
              <div class="day-header">
                <h4>第 {{ day.day }} 天行程</h4>
                <div class="day-actions">
                  <el-button type="text" @click="viewDayOnMap(day)">
                    <el-icon><MapLocation /></el-icon> 地图查看
                  </el-button>
                </div>
              </div>
              
              <div v-if="day.accommodation" class="accommodation-info">
                <el-icon class="item-icon"><HomeFilled /></el-icon>
                <span class="item-label">住宿：</span>
                <span class="item-value">{{ day.accommodation }}</span>
              </div>
              
              <div class="spots-list">
                <h5>景点安排：</h5>
                <div
                  v-for="(spot, index) in day.spots"
                  :key="spot.id"
                  class="spot-item"
                  @click="showSpotDetail(spot)"
                >
                  <div class="spot-header">
                    <el-icon class="spot-icon"><Collection /></el-icon>
                    <span class="spot-name">{{ index + 1 }}. {{ spot.name }}</span>
                    <el-tag v-if="spot.type" :type="getSpotTypeColor(spot.type)">{{ spot.type }}</el-tag>
                  </div>
                  <p class="spot-description">{{ spot.description }}</p>
                  <div class="spot-meta">
                    <span v-if="spot.openingHours" class="meta-item">
                      <el-icon><Timer /></el-icon> {{ spot.openingHours }}
                    </span>
                    <span v-if="spot.price !== undefined" class="meta-item">
                      <el-icon><Money /></el-icon> ¥{{ formatCurrency(spot.price) }}
                    </span>
                    <span v-if="spot.rating" class="meta-item">
                      <el-icon><Star /></el-icon> {{ spot.rating }}分
                    </span>
                  </div>
                </div>
              </div>
              
              <div v-if="day.notes" class="day-notes">
                <el-divider content-position="left">备注</el-divider>
                <p>{{ day.notes }}</p>
              </div>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </div>
      
      <!-- 加载中或空状态 -->
      <div v-else-if="!planStore.loading" class="empty-state">
        <el-empty description="暂无行程信息" />
      </div>
    </el-card>
    
    <!-- 景点详情对话框 -->
    <el-dialog
      v-model="showSpotDialog"
      :title="selectedSpot?.name || '景点详情'"
      width="600px"
    >
      <div v-if="selectedSpot" class="spot-detail">
        <div class="spot-photos">
          <el-image
            :src="`https://picsum.photos/600/400?random=${selectedSpot.id}`"
            fit="cover"
            class="main-photo"
          />
        </div>
        <div class="spot-detail-info">
          <h4>{{ selectedSpot.name }}</h4>
          <el-tag :type="getSpotTypeColor(selectedSpot.type)">{{ selectedSpot.type }}</el-tag>
          <div class="detail-meta">
            <div class="meta-row">
              <el-icon><Location /></el-icon>
              <span>{{ selectedSpot.lng }}, {{ selectedSpot.lat }}</span>
            </div>
            <div class="meta-row" v-if="selectedSpot.openingHours">
              <el-icon><Timer /></el-icon>
              <span>{{ selectedSpot.openingHours }}</span>
            </div>
            <div class="meta-row" v-if="selectedSpot.price !== undefined">
              <el-icon><Money /></el-icon>
              <span>¥{{ formatCurrency(selectedSpot.price) }}</span>
            </div>
            <div class="meta-row" v-if="selectedSpot.rating">
              <el-icon><Star /></el-icon>
              <span>{{ selectedSpot.rating }}分</span>
            </div>
          </div>
        </div>
        <el-divider />
        <div class="spot-detail-description">
          <h5>景点介绍</h5>
          <p>{{ selectedSpot.description }}</p>
        </div>
      </div>
      <template #footer>
        <el-button @click="showSpotDialog = false">关闭</el-button>
        <el-button type="primary" @click="navigateToSpot">导航</el-button>
      </template>
    </el-dialog>
    
    <!-- 错误提示 -->
    <el-alert
      v-if="errorMessage"
      :title="errorMessage"
      type="error"
      show-icon
      class="error-alert"
      :closable="true"
      @close="errorMessage = ''"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { usePlanStore, type TravelPlan, type Spot } from '../stores/planStore';
import {
  Delete,
  LocationFilled,
  PieChart,
  Document,
  Calendar,
  User,
  Money,
  Location,
  HomeFilled,
  Collection,
  Timer,
  Star,
  MapLocation
} from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();
const planStore = usePlanStore();
const showSpotDialog = ref(false);
const selectedSpot = ref<Spot | null>(null);
const errorMessage = ref('');

// 获取路由参数中的行程ID
const planId = computed(() => route.params.id as string);

// 获取当前行程 - 优先从本地状态查找，确保数据可靠性
const plan = computed(() => {
  // 首先尝试从plans数组中查找匹配的行程
  const foundInPlans = planStore.plans.find(p => p.id === planId.value);
  // 如果在plans数组中找到，直接返回
  if (foundInPlans) {
    return foundInPlans;
  }
  // 否则返回currentPlan（可能是新创建但尚未加入plans数组的行程）
  return planStore.currentPlan;
});

// 格式化日期范围
const formatDateRange = (startDate: string, endDate: string): string => {
  const start = new Date(startDate).toLocaleDateString();
  const end = new Date(endDate).toLocaleDateString();
  return `${start} 至 ${end}`;
};

// 格式化货币
const formatCurrency = (value: number | undefined | null): string => {
  // 处理undefined或null值，确保安全调用toLocaleString
  if (value === undefined || value === null) {
    return '0.00';
  }
  return Number(value).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// 根据景点类型获取颜色
const getSpotTypeColor = (type: string): string => {
  const colorMap: Record<string, string> = {
    '景点': 'primary',
    '餐厅': 'success',
    '购物': 'warning',
    '住宿': 'info',
    '交通': 'danger'
  };
  return colorMap[type] || 'info';
};

// 查看地图
const viewMap = () => {
  router.push(`/map/${planId.value}`);
};

// 查看预算分析
const viewBudgetAnalysis = () => {
  router.push(`/budget/analysis/${planId.value}`);
};

// 费用记录
const trackExpenses = () => {
  router.push(`/budget/tracking/${planId.value}`);
};

// 编辑功能已移除

// 删除行程
const deletePlan = async () => {
  try {
    await ElMessageBox.confirm('确定要删除这个行程吗？此操作不可撤销。', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    
    await planStore.deletePlan(planId.value);
    ElMessage.success('行程删除成功');
    router.push('/plan/list');
  } catch (error) {
    // 用户取消删除不显示错误
    if (error !== 'cancel') {
      errorMessage.value = '删除失败，请稍后重试';
    }
  }
};

// 查看某天的地图
const viewDayOnMap = (day: any) => {
  // 可以传递更多参数来高亮显示当天的景点
  router.push(`/map/${planId.value}?day=${day.day}`);
};

// 显示景点详情
const showSpotDetail = (spot: Spot) => {
  selectedSpot.value = spot;
  showSpotDialog.value = true;
};

// 导航到景点
const navigateToSpot = () => {
  if (selectedSpot.value) {
    // 这里可以调用地图API进行导航
    ElMessage.success(`开始导航到${selectedSpot.value.name}`);
  }
};

// 加载行程详情
const loadPlanDetail = async () => {
  try {
    await planStore.fetchPlanDetail(planId.value);
  } catch (error) {
    errorMessage.value = planStore.error || '加载行程详情失败';
  }
};

// 组件挂载时加载数据
onMounted(() => {
  loadPlanDetail();
});
</script>

<style scoped>
.plan-detail-container {
  max-width: 1200px;
  margin: 0 auto;
}

.plan-detail-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.plan-title {
  margin: 0;
  color: #303133;
  font-size: 24px;
  font-weight: 500;
}

.plan-actions {
  display: flex;
  gap: 10px;
}

.plan-info {
  margin: 20px 0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.info-icon {
  color: #1890ff;
  font-size: 18px;
}

.info-label {
  color: #606266;
  font-size: 14px;
}

.info-value {
  color: #303133;
  font-weight: 500;
}

.preferences {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  padding: 10px;
  background-color: #f0f9ff;
  border-radius: 4px;
}

.preference-tag {
  margin-bottom: 5px;
}

.main-actions {
  display: flex;
  gap: 15px;
  margin: 30px 0;
  flex-wrap: wrap;
}

.plan-days {
  margin-top: 30px;
}

.section-title {
  color: #303133;
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e0e0e0;
}

.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.day-header h4 {
  margin: 0;
  color: #303133;
}

.accommodation-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 15px;
  padding: 10px;
  background-color: #f0f9ff;
  border-radius: 4px;
}

.item-icon {
  color: #1890ff;
}

.item-label {
  color: #606266;
}

.item-value {
  color: #303133;
  font-weight: 500;
}

.spots-list h5 {
  margin: 0 0 15px 0;
  color: #303133;
}

.spot-item {
  padding: 15px;
  margin-bottom: 15px;
  background-color: #fafafa;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.spot-item:hover {
  background-color: #f0f9ff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.spot-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.spot-icon {
  color: #1890ff;
}

.spot-name {
  color: #303133;
  font-weight: 500;
  flex: 1;
}

.spot-description {
  color: #606266;
  margin-bottom: 10px;
  line-height: 1.6;
}

.spot-meta {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #909399;
  font-size: 14px;
}

.day-notes {
  margin-top: 15px;
  color: #606266;
}

.empty-state {
  padding: 50px 0;
}

.error-alert {
  margin-top: 20px;
}

/* 景点详情对话框样式 */
.spot-detail {
  max-height: 500px;
  overflow-y: auto;
}

.spot-detail-header {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.spot-image {
  width: 200px;
  height: 150px;
  border-radius: 6px;
}

.spot-detail-info {
  flex: 1;
}

.spot-detail-info h4 {
  margin: 0 0 10px 0;
}

.detail-meta {
  margin-top: 10px;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 5px;
  color: #606266;
}

.spot-detail-description h5 {
  margin: 0 0 10px 0;
  color: #303133;
}

.spot-detail-description p {
  color: #606266;
  line-height: 1.6;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .main-actions {
    flex-direction: column;
  }
  
  .spot-detail-header {
    flex-direction: column;
  }
  
  .spot-image {
    width: 100%;
  }
}
</style>