<template>
  <div class="expense-tracking-container">
    <el-card v-loading="budgetStore.loading" class="tracking-card">
      <template #header>
        <div class="card-header">
          <h2 class="page-title">费用记录 - {{ planInfo?.title || '未命名行程' }}</h2>
          <div class="header-actions">
            <el-button @click="backToPlan" size="small">
              <el-icon><ArrowLeft /></el-icon> 返回行程
            </el-button>
            <el-button @click="viewAnalysis" type="primary" size="small">
              <el-icon><PieChart /></el-icon> 预算分析
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
            <span class="info-value">¥{{ formatCurrency(planInfo.budget) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">已花费：</span>
            <span class="info-value spent-amount">¥{{ formatCurrency(totalSpent) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">剩余预算：</span>
            <span class="info-value" :class="totalRemaining < 0 ? 'over-budget' : ''">
              ¥{{ formatCurrency(totalRemaining) }}
            </span>
          </div>
        </div>
      </div>
      
      <!-- 语音记录区域 -->
      <div class="voice-section">
        <el-card class="voice-card" shadow="hover">
          <div class="voice-content">
            <div class="voice-icon-container" :class="{ 'recording': isRecording }">
              <el-icon :class="isRecording ? 'recording-icon' : ''">
                <Microphone />
              </el-icon>
            </div>
            <div class="voice-controls">
              <h3 class="voice-title">语音记录费用</h3>
              <p class="voice-hint">点击开始按钮，清晰说出：类别 金额 元 描述</p>
              <div class="voice-actions">
                <el-button
                  v-if="!isRecording"
                  @click="startVoiceRecording"
                  type="primary"
                  size="large"
                  :disabled="!speechSupported"
                >
                  <el-icon><Microphone /></el-icon> 开始录音
                </el-button>
                <el-button
                  v-else
                  @click="stopVoiceRecording"
                  type="danger"
                  size="large"
                >
                  <el-icon><Stop /></el-icon> 停止录音
                </el-button>
                <el-button v-if="!speechSupported" disabled type="info" size="large">
                  <el-icon><WarningFilled /></el-icon> 浏览器不支持
                </el-button>
              </div>
              <div v-if="voiceResult" class="voice-result">
                <h4>识别结果：</h4>
                <p>{{ voiceResult }}</p>
                <div v-if="parsedExpense" class="parsed-result">
                  <p>解析结果：</p>
                  <ul>
                    <li>类别：{{ parsedExpense.category }}</li>
                    <li>金额：¥{{ parsedExpense.amount }}</li>
                    <li>描述：{{ parsedExpense.description }}</li>
                  </ul>
                  <div class="result-actions">
                    <el-button @click="confirmVoiceResult" type="primary" size="small">确认</el-button>
                    <el-button @click="clearVoiceResult" size="small">重新录音</el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </div>
      
      <!-- 手动添加费用区域 -->
      <div class="manual-section">
        <el-card class="manual-card">
          <template #header>
            <div class="manual-header">
              <h3>手动添加费用</h3>
            </div>
          </template>
          
          <el-form
            :model="expenseForm"
            ref="expenseFormRef"
            :rules="expenseFormRules"
            label-width="100px"
          >
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="费用类别" prop="category">
                  <el-select v-model="expenseForm.category" placeholder="请选择类别">
                    <el-option label="餐饮" value="餐饮" />
                    <el-option label="交通" value="交通" />
                    <el-option label="住宿" value="住宿" />
                    <el-option label="景点门票" value="景点门票" />
                    <el-option label="购物" value="购物" />
                    <el-option label="其他" value="其他" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="金额（元）" prop="amount">
                  <el-input
                    v-model.number="expenseForm.amount"
                    placeholder="请输入金额"
                    type="number"
                    min="0"
                    step="0.01"
                    prefix-icon="el-icon-money"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="描述" prop="description">
                  <el-input
                    v-model="expenseForm.description"
                    placeholder="请输入费用描述"
                    type="textarea"
                    rows="2"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="日期" prop="expense_date">
                  <el-date-picker
                    v-model="expenseForm.expense_date"
                    type="date"
                    placeholder="选择日期"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="支付方式" prop="paymentMethod">
                  <el-select v-model="expenseForm.paymentMethod" placeholder="请选择支付方式">
                    <el-option label="现金" value="现金" />
                    <el-option label="信用卡" value="信用卡" />
                    <el-option label="支付宝" value="支付宝" />
                    <el-option label="微信" value="微信" />
                    <el-option label="其他" value="其他" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item>
                  <div class="form-actions">
                    <el-button @click="resetForm" type="info">重置</el-button>
                    <el-button @click="saveExpense" type="primary">保存</el-button>
                  </div>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-card>
      </div>
      
      <!-- 近期费用记录 -->
      <div class="recent-section">
        <el-card class="recent-card">
          <template #header>
            <div class="recent-header">
              <h3>近期费用记录</h3>
              <el-button @click="viewAllExpenses" type="text">
                {{ showAllExpenses ? '收起' : '查看全部' }}
              </el-button>
            </div>
          </template>
          
          <div class="expense-list">
            <div
              v-for="expense in recentExpenses"
              :key="expense.id"
              class="expense-item"
            >
              <div class="expense-info">
                <div class="expense-header">
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
          </div>
          
          <div v-if="recentExpenses.length === 0 && !budgetStore.loading" class="empty-state">
            <el-empty description="暂无费用记录" />
          </div>
        </el-card>
      </div>
    </el-card>
    
    <!-- 编辑功能已移除 - 后端未提供更新预算的接口 -->
    
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
// SpeechRecognitionService removed temporarily
import {
  ArrowLeft,
  PieChart,
  Microphone,
  Top as Stop, // 使用Top代替不存在的Stop
  WarningFilled,
  Delete
} from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();
const planStore = usePlanStore();
const budgetStore = useBudgetStore();
// speechService instance removed temporarily

// 路由参数 - 使用正确的参数名planId
const planId = computed(() => route.params.planId as string);

// 表单引用和数据
const expenseFormRef = ref();

// 费用表单
const expenseForm = ref({
  id: '',
  amount: 0,
  category: '',
  description: '',
  expense_date: new Date(),
  paymentMethod: ''
});

// 编辑功能已移除 - 后端未提供更新预算的接口

// 表单验证规则
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
  expense_date: [
    { required: true, message: '请选择日期', trigger: 'change' }
  ]
};

// 语音识别相关
const isRecording = ref(false);
const voiceResult = ref('');
const parsedExpense = ref<any>(null);
const speechSupported = ref(false);
const errorMessage = ref('');

// 获取行程信息
const planInfo = computed((): TravelPlan | undefined => {
  const foundPlan = planStore.plans.find(plan => plan.id === planId.value);
  return foundPlan || (planStore.currentPlan || undefined);
});

// 组件加载时初始化数据
onMounted(async () => {
  // 验证planId是否存在
  console.log('当前路由参数planId:', planId.value);
  
  // 如果有planId，获取相关费用数据
  if (planId.value) {
    try {
      await budgetStore.fetchExpenses(planId.value);
    } catch (error) {
      console.error('获取费用记录失败:', error);
      errorMessage.value = '获取费用记录失败';
    }
  } else {
    console.error('未找到行程ID');
    errorMessage.value = '未找到行程ID，请返回重试';
  }
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

// 控制显示模式的响应式变量
const showAllExpenses = ref(false);

// 近期费用记录（最多显示10条或全部）
const recentExpenses = computed(() => {
  const sortedExpenses = [...budgetStore.expenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // 如果显示全部，则返回所有费用；否则返回最多10条
  return showAllExpenses.value ? sortedExpenses : sortedExpenses.slice(0, 5);
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

// 查看预算分析
const viewAnalysis = () => {
  router.push(`/budget/analysis/${planId.value}`);
};

// 切换查看全部/收起功能
const viewAllExpenses = () => {
  showAllExpenses.value = !showAllExpenses.value;
};

// 重置表单
const resetForm = () => {
  expenseForm.value = {
    id: '',
    amount: 0,
    category: '',
    description: '',
    expense_date: new Date(),
    paymentMethod: ''
  };
  expenseFormRef.value?.resetFields();
};

// 保存费用
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
      description: expenseForm.value.description,
      planId: currentPlanId,
      expense_date: expenseForm.value.expense_date.toISOString().split('T')[0] // 使用expense_date字段名，匹配后端期望格式
    };
    
    // 输出提交的表单数据
    console.log('提交的表单数据:', expenseData);
    
    await budgetStore.addExpense(expenseData);
    
    ElMessage.success('费用记录添加成功');
    resetForm();
    
    // 不再需要手动刷新页面，依赖响应式更新
  } catch (error: any) {
    console.error('保存费用失败:', error);
    errorMessage.value = error.message || '添加失败，请稍后重试';
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
  } catch (error) {
    if (error !== 'cancel') {
      errorMessage.value = '删除失败，请稍后重试';
    }
  }
};

// 开始语音录音
const startVoiceRecording = () => {
  if (!speechSupported.value) {
    ElMessage.error('您的浏览器不支持语音识别功能');
    return;
  }
  
  isRecording.value = true;
  ElMessage.info('语音识别中，请说话...');
  voiceResult.value = '正在识别...';
  
  try {
    // 使用Web Speech API实现语音识别
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'zh-CN'; // 设置为中文
    recognition.interimResults = false;
    // 移除不存在的maxAlternatives属性
    
    // 保存recognition实例到全局变量以便可以停止
    if (window.webkitSpeechRecognition) {
      window.currentRecognition = recognition;
    }
    
    recognition.onresult = (event) => {
      if (event.results && event.results[0] && event.results[0][0]) {
        const speechResult = event.results[0][0].transcript;
        voiceResult.value = speechResult;
        parseVoiceResult(speechResult);
        ElMessage.success('语音识别完成');
      } else {
        ElMessage.warning('无法识别语音内容');
      }
      isRecording.value = false;
    };
    
    recognition.onerror = (event) => {
      console.error('语音识别错误:', event.error);
      if (event.error === 'not-allowed') {
        ElMessage.error('语音识别权限被拒绝，请在浏览器设置中允许使用麦克风');
      } else if (event.error === 'no-speech') {
        ElMessage.warning('未检测到语音输入，请尝试重新开始');
      } else {
        ElMessage.error('语音识别失败: ' + event.error);
      }
      voiceResult.value = '';
      isRecording.value = false;
    };
    
    recognition.onend = () => {
      isRecording.value = false;
      if (voiceResult.value === '正在识别...') {
        ElMessage.warning('语音识别超时，请尝试重新开始');
        voiceResult.value = '';
      }
    };
    
    recognition.start();
  } catch (error) {
    console.error('语音识别初始化失败:', error);
    ElMessage.error('语音识别初始化失败，请稍后重试');
    isRecording.value = false;
    voiceResult.value = '';
  }
};

// 停止语音录音
const stopVoiceRecording = () => {
  try {
    if (window.currentRecognition && window.currentRecognition.stop) {
      window.currentRecognition.stop();
    }
    isRecording.value = false;
    ElMessage.info('语音识别已停止');
  } catch (error) {
    console.error('停止语音识别错误:', error);
    isRecording.value = false;
  }
};

// 解析语音结果
const parseVoiceResult = (text: string) => {
  // 清洗文本，去除多余空格和换行
  const cleanedText = text.trim().replace(/\s+/g, ' ');
  
  // 扩展的语音解析规则，支持多种输入格式
  const patterns = [
    // 格式1: 类别 金额 元 描述
    { regex: /(餐饮|交通|住宿|景点门票|购物|其他)\s*(\d+(\.\d+)?)\s*元\s*(.*)/i, category: 1, amount: 2, desc: 4 },
    // 格式2: 金额 元 类别 描述
    { regex: /(\d+(\.\d+)?)\s*元\s*(餐饮|交通|住宿|景点门票|购物|其他)\s*(.*)/i, category: 3, amount: 1, desc: 4 },
    // 格式3: 类别 金额 描述
    { regex: /(餐饮|交通|住宿|景点门票|购物|其他)\s*(\d+(\.\d+)?)\s*(.*)/i, category: 1, amount: 2, desc: 4 },
    // 格式4: 金额 类别 描述
    { regex: /(\d+(\.\d+)?)\s*(餐饮|交通|住宿|景点门票|购物|其他)\s*(.*)/i, category: 3, amount: 1, desc: 4 }
  ];
  
  // 尝试所有模式匹配
  for (const pattern of patterns) {
    const match = cleanedText.match(pattern.regex);
    if (match) {
      parsedExpense.value = {
        category: match[pattern.category],
        amount: parseFloat(match[pattern.amount]),
        description: match[pattern.desc]?.trim() || `${match[pattern.category]}支出`
      };
      return;
    }
  }
  
  // 如果无法匹配，尝试关键词匹配
  const categoryKeywords: Record<string, string> = {
    '饭|吃|餐|午餐|晚餐|早餐|夜宵|餐厅|饭店|小吃|快餐': '餐饮',
    '车|打车|公交|地铁|高铁|火车|飞机|机票|船|船票': '交通',
    '酒店|旅馆|民宿|住宿|房费|住宿': '住宿',
    '票|门票|景点|景区|博物馆|展览|演出|电影|影院': '景点门票',
    '买|购物|商店|商场|超市|衣服|鞋|包|礼物|纪念品': '购物'
  };
  
  // 尝试提取金额
    const amountMatch = cleanedText.match(/(\d+(\.\d+)?)/);
    if (amountMatch) {
      const amount = parseFloat(amountMatch[1]);
      let category = '其他';
      let matchedKeywords = '';
      
      // 尝试匹配类别关键词
      for (const [keywords, cat] of Object.entries(categoryKeywords)) {
        const regex = new RegExp(keywords, 'i');
        if (regex.test(cleanedText)) {
          category = cat;
          matchedKeywords = keywords;
          break;
        }
      }
      
      // 去除已匹配的内容，剩余作为描述
      let description = cleanedText;
      if (matchedKeywords) {
        description = description.replace(new RegExp(matchedKeywords, 'gi'), '');
      }
      if (amountMatch[0]) {
        description = description.replace(amountMatch[0], '');
      }
      description = description.trim() || `${category}支出`;
    
    parsedExpense.value = {
      category,
      amount,
      description
    };
    ElMessage.warning('已尝试智能识别，请确认结果是否正确');
    return;
  }
  
  ElMessage.warning('无法解析您的语音，请尝试使用标准格式：类别 金额 元 描述');
};

// 确认语音识别结果
const confirmVoiceResult = async () => {
  if (!parsedExpense.value) return;
  
  try {
    await budgetStore.addExpense({
        category: parsedExpense.value.category,
        amount: parsedExpense.value.amount,
        description: parsedExpense.value.description,
        planId: planId.value,
        expense_date: new Date().toISOString().split('T')[0] // 使用expense_date字段名，匹配后端期望格式
      });
    
    ElMessage.success('费用记录添加成功');
    clearVoiceResult();
    
    // 不再需要手动刷新页面，依赖响应式更新
  } catch (error) {
    errorMessage.value = '添加失败，请稍后重试';
  }
};

// 清除语音识别结果
const clearVoiceResult = () => {
  voiceResult.value = '';
  parsedExpense.value = null;
};

// 加载数据
const loadData = async () => {
  try {
    // 检查浏览器是否支持语音识别
    window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    speechSupported.value = !!window.SpeechRecognition;
    
    // 如果没有行程信息，先获取行程详情
    if (!planInfo.value) {
      await planStore.fetchPlanDetail(planId.value);
    }
    
    // 获取费用数据
    // 跳过对不存在的fetchBudgetAnalysis方法的调用
    console.warn('Budget analysis loading skipped as method not available');
  } catch (error) {
    errorMessage.value = budgetStore.error || '加载费用数据失败';
  }
};

// 组件挂载
onMounted(() => {
  loadData();
});
</script>

<style scoped>
.expense-tracking-container {
  max-width: 1200px;
  margin: 0 auto;
}

.tracking-card {
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
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 6px;
}

.info-label {
  color: #606266;
  font-size: 14px;
}

.info-value {
  color: #303133;
  font-weight: 500;
  font-size: 16px;
}

.spent-amount {
  color: #52c41a;
}

.over-budget {
  color: #ff4d4f;
}

.voice-section {
  margin: 30px 0;
}

.voice-card {
  border-radius: 12px;
  overflow: hidden;
}

.voice-content {
  display: flex;
  align-items: center;
  gap: 30px;
  padding: 30px;
}

.voice-icon-container {
  position: relative;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #e6f7ff;
  border-radius: 50%;
  transition: all 0.3s;
  flex-shrink: 0;
  overflow: hidden;
}

.voice-icon-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.voice-icon-container:hover::before {
  opacity: 1;
}

.voice-icon-container.recording {
  background-color: #fff2f0;
  animation: pulse 1.5s infinite;
  border: 2px solid #ff4d4f;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 77, 79, 0.6);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 0 15px rgba(255, 77, 79, 0.3);
    transform: scale(1.05);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 77, 79, 0);
    transform: scale(1);
  }
}

.voice-icon-container .el-icon {
  font-size: 48px;
  color: #1890ff;
  transition: all 0.3s ease;
  z-index: 1;
}

.voice-icon-container.recording .el-icon {
  color: #ff4d4f;
  animation: bounce 1.5s infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

.voice-icon-container:hover .el-icon {
  transform: scale(1.1);
}

.voice-controls {
  flex: 1;
}

.voice-title {
  margin: 0 0 10px 0;
  color: #303133;
  font-size: 20px;
}

.voice-hint {
  margin: 0 0 20px 0;
  color: #606266;
  font-size: 14px;
}

.voice-actions {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.voice-result {
  margin-top: 20px;
  padding: 20px;
  background-color: #f0f9ff;
  border-radius: 8px;
}

.voice-result h4 {
  margin: 0 0 10px 0;
  color: #303133;
}

.voice-result p {
  margin: 0 0 15px 0;
  color: #606266;
  word-break: break-all;
}

.parsed-result {
  background-color: #e6f7ff;
  padding: 15px;
  border-radius: 6px;
  margin-top: 15px;
}

.parsed-result p {
  margin: 0 0 10px 0;
  font-weight: 500;
  color: #303133;
}

.parsed-result ul {
  margin: 0 0 15px 0;
  padding-left: 20px;
}

.parsed-result li {
  margin-bottom: 5px;
  color: #606266;
}

.result-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.manual-section {
  margin: 30px 0;
}

.manual-card {
  border-radius: 12px;
}

.manual-header h3 {
  margin: 0;
  color: #303133;
  font-size: 18px;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.recent-section {
  margin: 30px 0;
}

.recent-card {
  border-radius: 12px;
}

.recent-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.recent-header h3 {
  margin: 0;
  color: #303133;
  font-size: 18px;
}

.expense-list {
  max-height: 600px;
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

.expense-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
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

.empty-state {
  padding: 40px 0;
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
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .voice-content {
    flex-direction: column;
    padding: 20px;
  }
  
  .voice-icon-container {
    width: 100px;
    height: 100px;
  }
  
  .voice-icon-container .el-icon {
    font-size: 36px;
  }
  
  .voice-actions {
    flex-direction: column;
  }
  
  .expense-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
}
</style>