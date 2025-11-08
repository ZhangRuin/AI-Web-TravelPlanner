<template>
  <div class="budget-analysis-container">
    <el-card v-loading="budgetStore.loading" class="analysis-card">
      <template #header>
        <div class="card-header">
          <h2 class="page-title">预算分析 - {{ planInfo?.title || '未命名行程' }}</h2>
          <div class="header-actions">
            <el-button @click="backToPlan" size="small">
              <el-icon><ArrowLeft /></el-icon> 返回行程
            </el-button>
            <el-button @click="trackExpense" type="primary" size="small">
              <el-icon><Plus /></el-icon> 添加费用
            </el-button>
            <el-button @click="analyzeBudget" type="success" size="small" :loading="analyzing">
              <el-icon><DataAnalysis /></el-icon> 智能分析
            </el-button>
          </div>
        </div>
      </template>
      
      <!-- 行程基本信息 -->
      <div v-if="planInfo" class="plan-basic-info">
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">目的地：</span>
            <span class="info-value">{{ planInfo.destination }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">预算总额：</span>
            <span class="info-value budget-total">¥{{ formatCurrency(planInfo.budget) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">已花费：</span>
            <span class="info-value spent-total">¥{{ formatCurrency(totalSpent) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">剩余预算：</span>
            <span class="info-value remaining-total" :class="totalRemaining < 0 ? 'over-budget' : ''">
              ¥{{ formatCurrency(totalRemaining) }}
            </span>
          </div>
        </div>
      </div>
      
      <!-- 智能分析结果区域 -->
      <div v-if="analysisResult" class="analysis-result-section">
        <el-card class="analysis-result-card">
          <template #header>
            <div class="result-header">
              <h3>智能分析结果</h3>
              <span class="result-time">{{ formatDateTime(new Date()) }}</span>
            </div>
          </template>
          
          <!-- 消费趋势 -->
          <div class="analysis-item">
            <h4 class="analysis-title">
              <el-icon class="title-icon"><TrendCharts /></el-icon>
              消费趋势分析
            </h4>
            <p class="analysis-content">{{ analysisResult.consumptionTrend }}</p>
          </div>
          
          <!-- 预算优化建议 -->
          <div class="analysis-item">
            <h4 class="analysis-title">
              <el-icon class="title-icon"><DataAnalysis /></el-icon>
              预算优化建议
            </h4>
            <ul class="suggestion-list">
              <li v-for="(suggestion, index) in analysisResult.suggestions" :key="index" class="suggestion-item">
                {{ suggestion }}
              </li>
            </ul>
          </div>
          
          <!-- 预算总结 -->
          <div class="analysis-item">
            <h4 class="analysis-title">
              <el-icon class="title-icon"><Document /></el-icon>
              预算总结
            </h4>
            <p class="analysis-content">{{ analysisResult.budgetSummary }}</p>
          </div>
          
          <!-- 风险警告 -->
          <div v-if="analysisResult.riskWarning" class="analysis-item risk-warning">
            <h4 class="analysis-title">
              <el-icon class="title-icon"><WarningFilled /></el-icon>
              风险警告
            </h4>
            <p class="analysis-content">{{ analysisResult.riskWarning }}</p>
          </div>
        </el-card>
      </div>
      
      <!-- 费用明细 -->
      <div class="expense-list-section">
        <el-card class="expense-list-card">
          <template #header>
            <div class="expense-list-header">
              <h3>费用明细</h3>
            </div>
          </template>
          
          <div class="expense-filter">
            <el-select
              v-model="expenseCategoryFilter"
              placeholder="按类别筛选"
              clearable
              @change="filterExpenses"
            >
              <el-option
                v-for="category in expenseCategories"
                :key="category.name"
                :label="category.name"
                :value="category.name"
              />
            </el-select>
          </div>
          
          <div class="expense-list">
            <div
              v-for="expense in filteredExpenses"
              :key="expense.id"
              class="expense-item"
            >
              <div class="expense-info">
                <div class="expense-main">
                  <el-tag :type="getCategoryColor(expense.category)" size="small">{{ expense.category }}</el-tag>
                  <span class="expense-description">{{ expense.description }}</span>
                </div>
                <div class="expense-meta">
                  <span class="expense-date">{{ formatDate(expense.date) }}</span>
                  <span class="expense-amount">¥{{ formatCurrency(expense.amount) }}</span>
                </div>
              </div>
              <div class="expense-actions">
                <el-button type="text" @click="deleteExpense(expense.id)" class="delete-btn">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
            
            <div v-if="filteredExpenses.length === 0 && !budgetStore.loading" class="empty-expenses">
              <el-empty description="暂无费用记录" />
            </div>
          </div>
        </el-card>
      </div>
      
      <!-- 预算建议 -->
      <el-card class="suggestion-card">
        <template #header>
          <div class="suggestion-header">
            <h3>预算建议</h3>
          </div>
        </template>
        <div class="suggestions">
          <div v-for="(suggestion, index) in budgetSuggestions" :key="index" class="suggestion-item">
            <el-icon class="suggestion-icon"><ChatDotRound /></el-icon>
            <p>{{ suggestion }}</p>
          </div>
        </div>
      </el-card>
    </el-card>
    
    <!-- 添加/编辑费用对话框 -->
    <el-dialog
      v-model="showExpenseDialog"
      title="添加费用"
      width="500px"
    >
      <el-form
        :model="expenseForm"
        ref="expenseFormRef"
        :rules="expenseFormRules"
        label-width="80px"
      >
        <el-form-item label="金额" prop="amount">
          <el-input
            v-model.number="expenseForm.amount"
            placeholder="请输入金额"
            prefix-icon="el-icon-money"
            type="number"
            min="0"
            step="0.01"
          />
        </el-form-item>
        
        <el-form-item label="类别" prop="category">
          <el-select
            v-model="expenseForm.category"
            placeholder="请选择费用类别"
          >
            <el-option label="餐饮" value="餐饮"></el-option>
            <el-option label="交通" value="交通"></el-option>
            <el-option label="住宿" value="住宿"></el-option>
            <el-option label="景点门票" value="景点门票"></el-option>
            <el-option label="购物" value="购物"></el-option>
            <el-option label="其他" value="其他"></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="expenseForm.description"
            placeholder="请输入费用描述"
            type="textarea"
          />
        </el-form-item>
        
        <el-form-item label="日期" prop="date">
          <el-date-picker
            v-model="expenseForm.date"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showExpenseDialog = false">取消</el-button>
        <el-button type="primary" @click="saveExpense">确认添加</el-button>
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
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { usePlanStore, type TravelPlan } from '../stores/planStore';
import { useBudgetStore, type Expense } from '../stores/budgetStore';
import {
  ArrowLeft,
  Plus,
  Microphone,
  Delete,
  ChatDotRound,
  DataAnalysis,
  TrendCharts,
  WarningFilled
} from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();
const planStore = usePlanStore();
const budgetStore = useBudgetStore();

// 路由参数 - 使用正确的参数名planId
const planId = computed(() => route.params.planId as string);

// 费用表单
const showExpenseDialog = ref(false);
// const editingExpense = ref(false); // 已移除编辑功能
const expenseFormRef = ref();
const expenseForm = ref({
  id: '',
  amount: 0,
  category: '',
  description: '',
  date: new Date()
});
const expenseFormRules = {
  amount: [
    { required: true, message: '请输入金额', trigger: 'blur' },
    { type: 'number', min: 0, message: '金额不能为负数', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择费用类别', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请输入费用描述', trigger: 'blur' }
  ],
  date: [
    { required: true, message: '请选择日期', trigger: 'change' }
  ]
};

// 筛选条件
const expenseCategoryFilter = ref('');
const errorMessage = ref('');
const analyzing = ref(false);
const analysisResult = ref<any>(null);

// 分析预算
const analyzeBudget = async () => {
  if (!planInfo.value) return;
  
  analyzing.value = true;
  try {
    // 准备请求数据
    const requestData = {
      planId: planId.value,
      destination: planInfo.value.destination,
      days: planInfo.value.days || 1,
      budget: planInfo.value.budget,
      expenses: budgetStore.expenses
    };
    
    // 调用后端分析接口
    const result = await budgetStore.analyzeBudget(requestData);
    analysisResult.value = result;
    
    ElMessage.success('预算分析成功');
  } catch (error: any) {
    ElMessage.error(error.message || '预算分析失败');
    errorMessage.value = error.message || '预算分析失败';
  } finally {
    analyzing.value = false;
  }
};

// 格式化日期时间
const formatDateTime = (date: Date) => {
  if (!date) return '';
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

// 获取行程信息
const planInfo = computed((): TravelPlan | undefined => {
    const foundPlan = planStore.plans.find(plan => plan.id === planId.value);
    return foundPlan || (planStore.currentPlan || undefined);
  });

// 总花费
const totalSpent = computed((): number => {
  return budgetStore.expenses.reduce((sum, expense) => sum + expense.amount, 0);
});

// 剩余预算
const totalRemaining = computed((): number => {
  if (!planInfo.value) return 0;
  return planInfo.value.budget - totalSpent.value;
});

// 费用分类统计
const expenseCategories = computed(() => {
  const categories: Record<string, number> = {};
  budgetStore.expenses.forEach(expense => {
    categories[expense.category] = (categories[expense.category] || 0) + expense.amount;
  });
  
  return Object.entries(categories)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
});

// 每日消费趋势
const dailySpending = computed(() => {
  const daily: Record<string, number> = {};
  budgetStore.expenses.forEach((expense: Expense) => {
    if (expense.date && typeof expense.date === 'string') {
      const date = expense.date.split('T')[0];
      daily[date] = (daily[date] || 0) + expense.amount;
    }
  });
  
  return Object.entries(daily)
    .map((entry: [string, number]) => ({
      date: entry[0] || '',
      amount: entry[1] || 0
    }))
    .sort((a, b) => {
      if (!a.date || !b.date) return 0;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
});

// 过滤后的费用
const filteredExpenses = computed(() => {
  let expenses = [...budgetStore.expenses];
  
  if (expenseCategoryFilter.value) {
    expenses = expenses.filter(expense => expense.category === expenseCategoryFilter.value);
  }
  
  // 按日期倒序排序
  return expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
});

// 预算建议
const budgetSuggestions = computed(() => {
  const suggestions: any[] = [];
  if (!planInfo.value) return suggestions;
  
  const percentageSpent = (totalSpent.value / planInfo.value.budget) * 100;
  
  if (percentageSpent > 100) {
    suggestions.push(`您当前已超出预算 ${Math.round(percentageSpent - 100)}%，建议控制后续支出。`);
  } else if (percentageSpent > 80) {
    suggestions.push(`您已使用预算的 ${Math.round(percentageSpent)}%，请注意控制后续支出。`);
  } else {
    suggestions.push(`您已使用预算的 ${Math.round(percentageSpent)}%，预算使用情况良好。`);
  }
  
  // 根据费用类别提供建议
  const highestCategory = expenseCategories.value[0];
  if (highestCategory && highestCategory.value > totalSpent.value * 0.5) {
    suggestions.push(`您在「${highestCategory.name}」上的支出占比较高，可以考虑优化该类别支出。`);
  }
  
  return suggestions;
});

// 格式化货币
const formatCurrency = (value: number | undefined | null): string => {
  // 处理undefined或null值，确保安全调用toLocaleString
  if (value === undefined || value === null) {
    return '0.00';
  }
  return Number(value).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// 格式化日期
const formatDate = (dateString: string | undefined | null): string => {
  // 检查日期是否有效
  if (!dateString) {
    return '无日期';
  }
  
  const date = new Date(dateString);
  // 验证日期是否有效
  if (isNaN(date.getTime())) {
    return '无日期';
  }
  
  return date.toLocaleDateString('zh-CN');
};

// 根据类别获取标签颜色
const getCategoryColor = (category: string): string => {
  const colorMap: Record<string, string> = {
    '餐饮': 'primary',
    '交通': 'success',
    '住宿': 'warning',
    '景点门票': 'info',
    '购物': 'danger',
    '其他': 'default'
  };
  return colorMap[category] || 'default';
};

// 返回行程详情
const backToPlan = () => {
  router.push(`/plan/detail/${planId.value}`);
};

// 跳转到费用记录页面
const trackExpense = () => {
  router.push(`/budget/tracking/${planId.value}`);
};

// 语音记录费用（临时禁用）
const recordByVoice = async () => {
  try {
    ElMessage.warning('语音功能暂不可用');
    
    // 模拟一个示例
    setTimeout(() => {
      const mockResult = '餐饮 100 元 午餐';
      
      // 简单的语音解析示例
      const regex = /(餐饮|交通|住宿|景点门票|购物|其他)\s*(\d+(\.\d+)?)\s*元\s*(.*)/;
      const match = mockResult.match(regex);
      
      if (match) {
        expenseForm.value = {
          id: '',
          category: match[1] || '',
          amount: match[2] ? parseFloat(match[2]) : 0,
          description: match[4] || `${match[1]}支出`,
          date: new Date()
        };
        showExpenseDialog.value = true;
      }
    }, 500);
  } catch (error) {
    errorMessage.value = '语音识别失败，请稍后重试';
  }
};

// 编辑功能已移除 - 后端未提供更新预算的接口

// 删除费用
const deleteExpense = async (expenseId: string) => {
  try {
    await ElMessageBox.confirm('确定要删除这条费用记录吗？', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    
    await budgetStore.deleteExpense(expenseId);
    ElMessage.success('费用记录删除成功');
  } catch (error: any) {
    if (error !== 'cancel') {
      errorMessage.value = '删除失败，请稍后重试';
    }
  }
};

// 保存费用（仅添加功能）
const saveExpense = async () => {
  try {
    await expenseFormRef.value.validate();
    
    // 明确获取planId并记录
    const currentPlanId = planId.value;
    console.log('即将使用的planId:', currentPlanId);
    
    if (!currentPlanId) {
      throw new Error('行程ID不存在');
    }
    
    const expenseData = {
      category: expenseForm.value.category,
      amount: expenseForm.value.amount,
      description: expenseForm.value.description || '',
      planId: currentPlanId,
      date: expenseForm.value.date.toISOString().split('T')[0] // 使用正确的字段名
    };
    
    // 输出提交的表单数据
    console.log('提交的表单数据:', expenseData);
    
    await budgetStore.addExpense(expenseData);
    ElMessage.success('费用记录添加成功');
    
    showExpenseDialog.value = false;
    resetExpenseForm();
  } catch (error: any) {
    console.error('保存费用失败:', error);
    errorMessage.value = error.message || '添加失败，请稍后重试';
  }
};

// 加载数据
const loadData = async () => {
  try {
    // 验证planId是否存在
    console.log('当前路由参数planId:', planId.value);
    
    if (!planId.value) {
      throw new Error('未找到行程ID');
    }
    
    // 如果没有行程信息，先获取行程详情
    if (!planInfo.value) {
      await planStore.fetchPlanDetail(planId.value);
    }
    
    // 获取费用数据
    await budgetStore.fetchExpenses(planId.value);
  } catch (error: any) {
    console.error('加载数据失败:', error);
    errorMessage.value = error.message || '加载数据失败';
  }
};

// 重置费用表单
const resetExpenseForm = () => {
  expenseForm.value = {
    id: '',
    amount: 0,
    category: '',
    description: '',
    date: new Date()
  };
  expenseFormRef.value?.resetFields();
  // editingExpense.value = false; // 已移除编辑功能
};

// 筛选费用
const filterExpenses = () => {
  // 筛选逻辑已通过计算属性实现
};



// 在组件挂载时加载数据
onMounted(() => {
  loadData();
});

// 在组件卸载时清理事件监听器
// onUnmounted(() => {
//   // 组件卸载时的清理工作
// });
</script>

<style scoped>
.budget-analysis-container {
  max-width: 1400px;
  margin: 0 auto;
}

.analysis-card {
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

.header-actions {
  display: flex;
  gap: 10px;
}

.plan-basic-info {
  margin: 20px 0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 8px;
  text-align: center;
}

.info-label {
  color: #606266;
  font-size: 14px;
  margin-bottom: 8px;
}

.info-value {
  color: #303133;
  font-size: 20px;
  font-weight: 600;
}

.budget-total {
  color: #1890ff;
}

.spent-total {
  color: #52c41a;
}

.remaining-total {
  color: #1890ff;
}

.over-budget {
  color: #ff4d4f;
}

.analysis-result-section {
  margin-top: 30px;
}

.analysis-result-card {
  background-color: #fafafa;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.result-header h3 {
  margin: 0;
  color: #303133;
  font-size: 18px;
}

.result-time {
  color: #909399;
  font-size: 14px;
}

.analysis-item {
  margin-top: 20px;
  padding: 15px;
  background-color: #ffffff;
  border-radius: 8px;
  border-left: 4px solid #1890ff;
}

.analysis-item.risk-warning {
  border-left-color: #ff4d4f;
  background-color: #fff2f0;
}

.analysis-title {
  display: flex;
  align-items: center;
  margin: 0 0 10px 0;
  color: #303133;
  font-size: 16px;
}

.title-icon {
  margin-right: 8px;
  color: #1890ff;
}

.analysis-item.risk-warning .title-icon {
  color: #ff4d4f;
}

.analysis-content {
  margin: 0;
  color: #606266;
  line-height: 1.6;
  font-size: 14px;
}

.suggestion-list {
  margin: 0;
  padding-left: 20px;
}

.suggestion-item {
  margin: 5px 0;
  color: #606266;
  line-height: 1.6;
  font-size: 14px;
}

.expense-list-section {
  margin-top: 30px;
}

.expense-list-card {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.expense-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.expense-list-header h3 {
  margin: 0;
  color: #303133;
  font-size: 16px;
}

.expense-filter {
  margin: 15px 0;
}

.expense-list {
  max-height: 400px;
  overflow-y: auto;
}

.expense-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #ebeef5;
}

.expense-item:last-child {
  border-bottom: none;
}

.expense-info {
  flex: 1;
}

.expense-main {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 5px;
}

.expense-description {
  color: #303133;
  font-weight: 500;
}

.expense-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.expense-date {
  color: #909399;
  font-size: 14px;
}

.expense-amount {
  color: #ff4d4f;
  font-weight: 600;
  font-size: 16px;
}

.expense-actions {
  display: flex;
  gap: 10px;
}

.delete-btn {
  color: #ff4d4f;
}

.empty-expenses {
  padding: 40px 0;
}

.suggestion-card {
  margin-top: auto;
}

.suggestion-header h3 {
  margin: 0;
  color: #303133;
  font-size: 16px;
}

.suggestion-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 10px;
  padding: 10px;
  background-color: #f0f9ff;
  border-radius: 6px;
}

.suggestion-icon {
  color: #1890ff;
  font-size: 18px;
  margin-top: 2px;
}

.suggestion-item p {
  margin: 0;
  color: #606266;
  line-height: 1.5;
}

.error-alert {
  margin-top: 20px;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .analysis-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .expense-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
  
  .chart-container {
    height: 250px;
  }
}
</style>