<template>
  <div class="plan-list-container">
    <el-card class="plan-list-card">
      <template #header>
        <div class="card-header">
          <h2 class="page-title">我的旅行计划</h2>
          <el-button @click="createNewPlan" type="primary" size="large">
            <el-icon><Plus /></el-icon> 新建行程
          </el-button>
        </div>
      </template>
      
      <!-- 筛选和搜索 -->
      <div class="filter-section">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-input
              v-model="searchQuery"
              placeholder="搜索目的地或行程名称"
              clearable
              prefix-icon="el-icon-search"
              @input="handleSearch"
            />
          </el-col>
          <el-col :span="6">
            <el-select
              v-model="dateFilter"
              placeholder="按日期筛选"
              clearable
              @change="handleFilter"
            >
              <el-option label="即将开始" value="upcoming" />
              <el-option label="过去的行程" value="past" />
              <el-option label="进行中" value="ongoing" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select
              v-model="budgetFilter"
              placeholder="按预算筛选"
              clearable
              @change="handleFilter"
            >
              <el-option label="1000元以下" value="low" />
              <el-option label="1000-5000元" value="medium" />
              <el-option label="5000元以上" value="high" />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-button @click="resetFilters" type="info">重置筛选</el-button>
          </el-col>
        </el-row>
      </div>
      
      <!-- 行程列表 -->
      <div class="plans-grid">
        <el-card
          v-for="plan in filteredPlans"
          :key="plan.id"
          class="plan-card"
          :body-style="{ padding: '0' }"
          @click="viewPlanDetail(plan.id)"
        >
          <div class="plan-card-image">
            <el-image
              :src="getPlanImage(plan)"
              fit="cover"
              class="plan-image"
            />
            <div class="plan-date-badge">
              <span>{{ getDateRangeText(plan) }}</span>
            </div>
          </div>
          
          <div class="plan-card-content">
            <h3 class="plan-card-title">{{ plan.title || `未命名行程 - ${plan.destination}` }}</h3>
            
            <div class="plan-card-info">
              <div class="info-item">
                <el-icon class="info-icon"><Location /></el-icon>
                <span>{{ plan.destination }}</span>
              </div>
              <div class="info-item">
                <el-icon class="info-icon"><User /></el-icon>
                <span>{{ plan.people }}人</span>
              </div>
              <div class="info-item">
                <el-icon class="info-icon"><Money /></el-icon>
                <span>¥{{ formatCurrency(plan.budget) }}</span>
              </div>
              <div class="info-item">
                <el-icon class="info-icon"><Calendar /></el-icon>
                <span>{{ getDuration(plan) }}天</span>
              </div>
            </div>
            
            <div class="plan-preferences">
              <el-tag
                v-for="pref in plan.preferences.slice(0, 3)"
                :key="pref"
                size="small"
                type="info"
                effect="plain"
              >
                {{ pref }}
              </el-tag>
              <span v-if="plan.preferences.length > 3" class="more-prefs">+{{ plan.preferences.length - 3 }}</span>
            </div>
            
            <div class="plan-card-footer">
              <span class="plan-status" :class="getPlanStatusClass(plan)">{{ getPlanStatus(plan) }}</span>
              <div class="plan-actions">
                <el-button type="text" @click.stop="deletePlan(plan.id)" class="delete-btn">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
          </div>
        </el-card>
      </div>
      
      <!-- 空状态 -->
      <div v-if="filteredPlans.length === 0 && !planStore.loading" class="empty-state">
        <el-empty description="暂无旅行计划" :image-size="200">
          <template #description>
            <p>您还没有创建任何旅行计划</p>
            <el-button @click="createNewPlan" type="primary" style="margin-top: 20px;">
              <el-icon><Plus /></el-icon> 创建第一个旅行计划
            </el-button>
          </template>
        </el-empty>
      </div>
      
      <!-- 加载状态 -->
      <div v-if="planStore.loading" class="loading-state">
        <el-skeleton :rows="3" animated />
      </div>
      
      <!-- 分页 -->
      <div v-if="filteredPlans.length > 0 && !planStore.loading" class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[6, 12, 24]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="filteredPlans.length"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
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
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { mockPlans } from '../utils/mockData';
import { usePlanStore, type TravelPlan } from '../stores/planStore';
import {
  Plus,
  Delete,
  Location,
  User,
  Money,
  Calendar
} from '@element-plus/icons-vue';

const router = useRouter();
const planStore = usePlanStore();
const searchQuery = ref('');
const dateFilter = ref('');
const budgetFilter = ref('');
const currentPage = ref(1);
const pageSize = ref(6);
const errorMessage = ref('');

// 根据搜索和筛选条件过滤行程
const filteredPlans = computed(() => {
  let result = [...planStore.plans];
  
  // 搜索筛选
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(plan => 
      plan.destination.toLowerCase().includes(query) ||
      (plan.title && plan.title.toLowerCase().includes(query))
    );
  }
  
  // 日期筛选
  if (dateFilter.value) {
    const now = new Date();
    result = result.filter(plan => {
      const startDate = new Date(plan.startDate);
      const endDate = new Date(plan.endDate);
      
      switch (dateFilter.value) {
        case 'upcoming':
          return startDate > now;
        case 'past':
          return endDate < now;
        case 'ongoing':
          return startDate <= now && endDate >= now;
        default:
          return true;
      }
    });
  }
  
  // 预算筛选
  if (budgetFilter.value) {
    result = result.filter(plan => {
      switch (budgetFilter.value) {
        case 'low':
          return (plan.budget || 0) < 1000;
    case 'medium':
      return (plan.budget || 0) >= 1000 && (plan.budget || 0) <= 5000;
    case 'high':
      return (plan.budget || 0) > 5000;
        default:
          return true;
      }
    });
  }
  
  return result;
});

// 分页显示的行程
const paginatedPlans = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredPlans.value.slice(start, end);
});

// 生成默认行程图片
const getPlanImage = (plan: TravelPlan): string => {
  // 在实际应用中，这里可以根据目的地或行程类型返回不同的默认图片
  // 或者使用API获取目的地的实际图片
  const defaultImages = [
    'https://picsum.photos/seed/travel1/600/400',
    'https://picsum.photos/seed/travel2/600/400',
    'https://picsum.photos/seed/travel3/600/400',
    'https://picsum.photos/seed/travel4/600/400',
  ];
  // 安全地获取索引，防止空字符串或无效ID
  const index = plan.id && plan.id.length > 0 ? plan.id.charCodeAt(0) % defaultImages.length : 0;
  return (defaultImages[index] || defaultImages[0]) as string;
};

// 格式化日期范围文本
const getDateRangeText = (plan: TravelPlan): string => {
  const start = new Date(plan.startDate);
  const end = new Date(plan.endDate);
  return `${start.getMonth() + 1}月${start.getDate()}日 - ${end.getMonth() + 1}月${end.getDate()}日`;
};

// 计算行程天数
const getDuration = (plan: TravelPlan): number => {
  const start = new Date(plan.startDate);
  const end = new Date(plan.endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1; // 包含开始和结束日期
};

// 格式化货币
const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) return '0';
  return value.toLocaleString();
};

// 获取行程状态
const getPlanStatus = (plan: TravelPlan): string => {
  const now = new Date();
  const startDate = new Date(plan.startDate);
  const endDate = new Date(plan.endDate);
  
  if (startDate > now) return '即将开始';
  if (endDate < now) return '已完成';
  return '进行中';
};

// 获取行程状态样式类
const getPlanStatusClass = (plan: TravelPlan): string => {
  const now = new Date();
  const startDate = new Date(plan.startDate);
  const endDate = new Date(plan.endDate);
  
  if (startDate > now) return 'status-upcoming';
  if (endDate < now) return 'status-completed';
  return 'status-ongoing';
};

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1; // 重置到第一页
};

// 处理筛选
const handleFilter = () => {
  currentPage.value = 1; // 重置到第一页
};

// 重置筛选条件
const resetFilters = () => {
  searchQuery.value = '';
  dateFilter.value = '';
  budgetFilter.value = '';
  currentPage.value = 1;
};

// 分页大小改变
const handleSizeChange = (newSize: number) => {
  pageSize.value = newSize;
  currentPage.value = 1;
};

// 当前页改变
const handleCurrentChange = (newPage: number) => {
  currentPage.value = newPage;
};

// 创建新行程
const createNewPlan = () => {
  router.push('/plan/create');
};

// 查看行程详情
const viewPlanDetail = (planId: string) => {
  router.push(`/plan/detail/${planId}`);
};

// 编辑功能已移除

// 删除行程
const deletePlan = async (planId: string) => {
  try {
    await ElMessageBox.confirm('确定要删除这个行程吗？此操作不可撤销。', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    
    await planStore.deletePlan(planId);
    ElMessage.success('行程删除成功');
  } catch (error) {
    // 用户取消删除不显示错误
    if (error !== 'cancel') {
      errorMessage.value = '删除失败，请稍后重试';
    }
  }
};

// 加载用户的所有行程
const loadPlans = async () => {
  try {
    // 从后端获取实际行程数据
    await planStore.fetchAllPlans();
  } catch (error) {
    errorMessage.value = planStore.error || '加载行程列表失败';
    console.error('加载行程失败:', error);
  }
};

// 监听筛选条件变化
watch(filteredPlans, () => {
  if (currentPage.value > Math.ceil(filteredPlans.value.length / pageSize.value)) {
    currentPage.value = 1;
  }
});

// 组件挂载时加载数据
onMounted(() => {
  loadPlans();
});
</script>

<style scoped>
.plan-list-container {
  max-width: 1400px;
  margin: 0 auto;
}

.plan-list-card {
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

.page-title {
  margin: 0;
  color: #303133;
  font-size: 24px;
  font-weight: 500;
}

.filter-section {
  margin: 20px 0;
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 25px;
  margin: 30px 0;
}

.plan-card {
  transition: all 0.3s ease;
  cursor: pointer;
  border-radius: 12px;
  overflow: hidden;
}

.plan-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.plan-card-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.plan-image {
  width: 100%;
  height: 100%;
  transition: transform 0.3s ease;
}

.plan-card:hover .plan-image {
  transform: scale(1.05);
}

.plan-date-badge {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  color: white;
  padding: 10px;
  font-size: 14px;
  text-align: center;
}

.plan-card-content {
  padding: 20px;
}

.plan-card-title {
  margin: 0 0 15px 0;
  font-size: 18px;
  font-weight: 500;
  color: #303133;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.plan-card-info {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 15px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #606266;
}

.info-icon {
  color: #1890ff;
  font-size: 16px;
}

.plan-preferences {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 15px;
}

.more-prefs {
  font-size: 12px;
  color: #909399;
}

.plan-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
  border-top: 1px solid #ebeef5;
}

.plan-status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-upcoming {
  background-color: #e6f7ff;
  color: #1890ff;
}

.status-ongoing {
  background-color: #f0f9ff;
  color: #52c41a;
}

.status-completed {
  background-color: #f5f5f5;
  color: #909399;
}

.plan-actions {
  display: flex;
  gap: 8px;
}

.delete-btn {
  color: #ff4d4f;
}

.empty-state {
  padding: 60px 0;
}

.loading-state {
  padding: 40px 0;
}

.pagination {
  margin-top: 30px;
  display: flex;
  justify-content: center;
}

.error-alert {
  margin-top: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .filter-section .el-row {
    flex-direction: column;
    gap: 15px;
  }
  
  .filter-section .el-col {
    width: 100% !important;
  }
  
  .plans-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 1200px) {
  .plans-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}
</style>