<template>
  <div class="plan-create-container">
    <el-card class="plan-create-card">
      <template #header>
        <div class="card-header">
          <span>智能行程规划</span>
        </div>
      </template>
      
      <!-- 语音输入区域 -->
      <div class="voice-input-section">
        <el-button
          type="primary"
          :icon="isListening ? 'CloseBold' : 'Microphone'"
          :loading="isListening"
          @click="toggleVoiceRecognition"
          class="voice-btn"
          size="large"
        >
          {{ isListening ? '停止说话' : '开始语音输入' }}
        </el-button>
        <p class="voice-hint">请描述您的旅行需求，例如："我想去日本，5天，预算1万元，喜欢美食和动漫，带孩子"</p>
      </div>
      
      <!-- 语音识别结果 -->
      <el-alert
        v-if="recognizedText"
        :title="'已识别: ' + recognizedText"
        type="info"
        show-icon
        :closable="true"
        @close="recognizedText = ''"
        class="recognition-alert"
      />
      
      <!-- 手动输入表单 -->
      <el-form :model="planForm" :rules="rules" ref="planFormRef" label-width="100px" class="plan-form">
        <el-form-item label="目的地" prop="destination">
          <el-input v-model="planForm.destination" placeholder="请输入目的地" />
        </el-form-item>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开始日期" prop="startDate">
              <el-date-picker
                v-model="planForm.startDate"
                type="date"
                placeholder="选择开始日期"
                style="width: 100%"
                :disabled-date="(time: any) => time.getTime() < Date.now() - 8.64e7"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束日期" prop="endDate">
              <el-date-picker
                v-model="planForm.endDate"
                type="date"
                placeholder="选择结束日期"
                style="width: 100%"
                :disabled-date="(time: any) => {
                  if (!planForm.startDate) return time.getTime() < Date.now() - 8.64e7;
                  return time.getTime() < new Date(planForm.startDate).getTime();
                }"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="预算（元）" prop="budget">
          <el-input-number
            v-model="planForm.budget"
            :min="1000"
            :max="1000000"
            :step="1000"
            placeholder="请输入预算"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="同行人数" prop="people">
          <el-input-number
            v-model="planForm.people"
            :min="1"
            :max="20"
            :step="1"
            placeholder="请输入人数"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="旅行偏好" prop="preferences">
          <el-select
            v-model="planForm.preferences"
            multiple
            collapse-tags
            placeholder="请选择旅行偏好"
            style="width: 100%"
          >
            <el-option label="美食" value="美食" />
            <el-option label="购物" value="购物" />
            <el-option label="自然风光" value="自然风光" />
            <el-option label="历史文化" value="历史文化" />
            <el-option label="艺术博物馆" value="艺术博物馆" />
            <el-option label="主题乐园" value="主题乐园" />
            <el-option label="休闲度假" value="休闲度假" />
            <el-option label="户外探险" value="户外探险" />
            <el-option label="亲子游" value="亲子游" />
            <el-option label="蜜月旅行" value="蜜月旅行" />
            <el-option label="摄影" value="摄影" />
            <el-option label="夜生活" value="夜生活" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="特殊需求">
          <el-input
            v-model="planForm.specialRequests"
            type="textarea"
            :rows="3"
            placeholder="请输入特殊需求或备注信息"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="generatePlan" :loading="planStore.creating">
            生成行程
          </el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
      
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
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { usePlanStore } from '../stores/planStore';
import { Microphone, CloseBold } from '@element-plus/icons-vue';

const router = useRouter();
const planStore = usePlanStore();
const planFormRef = ref();
const isListening = ref(false);
const recognizedText = ref('');
const errorMessage = ref('');

// 行程表单数据
const planForm = reactive({
  destination: '',
  startDate: '',
  endDate: '',
  budget: null as number | null,
  people: 1,
  preferences: [] as string[],
  specialRequests: ''
});

// 表单验证规则
const rules = {
  destination: [
    { required: true, message: '请输入目的地', trigger: 'blur' }
  ],
  startDate: [
    { required: true, message: '请选择开始日期', trigger: 'change' }
  ],
  endDate: [
    { required: true, message: '请选择结束日期', trigger: 'change' }
  ],
  budget: [
    { required: true, message: '请输入预算', trigger: 'blur' }
  ],
  people: [
    { required: true, message: '请输入人数', trigger: 'blur' }
  ],
  preferences: [
    { required: true, message: '请至少选择一项旅行偏好', trigger: 'change' }
  ]
};

// 切换语音识别
const toggleVoiceRecognition = () => {
  if (isListening.value) {
    stopVoiceRecognition();
  } else {
    startVoiceRecognition();
  }
};

// 开始语音识别
const startVoiceRecognition = () => {
  // 检查浏览器是否支持语音识别
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    isListening.value = true;
    ElMessage.success('请开始说话...');
    
    // 创建语音识别实例
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    
    // 配置语音识别
    recognition.lang = 'zh-CN';
    recognition.continuous = false;
    recognition.interimResults = false;
    
    // 处理识别结果
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      recognizedText.value = transcript;
      parseVoiceInput(transcript);
      ElMessage.success('语音识别完成');
      isListening.value = false;
    };
    
    // 处理错误
    recognition.onerror = (event: any) => {
      console.error('语音识别错误:', event.error);
      let errorMsg = '语音识别失败';
      
      switch (event.error) {
        case 'not-allowed':
          errorMsg = '浏览器不允许使用麦克风，请检查权限设置';
          break;
        case 'no-speech':
          errorMsg = '没有检测到语音，请重试';
          break;
        case 'audio-capture':
          errorMsg = '未找到麦克风设备';
          break;
      }
      
      ElMessage.error(errorMsg);
      isListening.value = false;
    };
    
    // 处理结束事件
    recognition.onend = () => {
      if (isListening.value) {
        isListening.value = false;
        ElMessage.info('语音识别已结束');
      }
    };
    
    // 保存识别实例以便后续停止
    (window as any).recognition = recognition;
    
    // 开始识别
    recognition.start();
  } else {
    ElMessage.warning('您的浏览器不支持语音识别功能，请使用Chrome或Edge浏览器');
    // 降级到模拟模式
    startMockVoiceRecognition();
  }
};

// 停止语音识别
const stopVoiceRecognition = () => {
  const recognition = (window as any).recognition;
  if (recognition && 'stop' in recognition) {
    recognition.stop();
  }
  isListening.value = false;
  ElMessage.info('已停止语音识别');
};

// 模拟语音识别（用于不支持Web Speech API的浏览器）
const startMockVoiceRecognition = () => {
  isListening.value = true;
  ElMessage.info('正在使用模拟语音识别...');
  
  // 模拟语音识别结果
  setTimeout(() => {
    const mockText = '我想去日本东京，5天，预算1万元，喜欢美食和动漫';
    recognizedText.value = mockText;
    parseVoiceInput(mockText);
    ElMessage.success('语音识别模拟完成');
    isListening.value = false;
  }, 2000);
};

// 解析语音输入
const parseVoiceInput = (text: string) => {
  // 去除多余空格和特殊字符，确保文本格式规范
  const cleanText = text.replace(/\s+/g, '').replace(/[,，]/g, '');
  
  // 提取目的地
  const destinationPatterns = [
    /去([^的了呢啊哦吧]*)/,
    /想去([^的了呢啊哦吧]*)/,
    /到([^的了呢啊哦吧]*)/,
    /前往([^的了呢啊哦吧]*)/,
    /目的地是([^的了呢啊哦吧]*)/,
    /去旅游的地方是([^的了呢啊哦吧]*)/
  ];
  
  let destinationFound = false;
  for (const pattern of destinationPatterns) {
    const match = cleanText.match(pattern);
    if (match && match[1]) {
      planForm.destination = match[1].trim();
      destinationFound = true;
      break;
    }
  }
  
  // 提取天数
  const daysPatterns = [
    /(\d+)天/,
    /大约(\d+)天/,
    /需要(\d+)天/,
    /停留(\d+)天/,
    /游玩(\d+)天/
  ];
  
  for (const pattern of daysPatterns) {
    const match = cleanText.match(pattern);
    if (match && match[1]) {
      const days = parseInt(match[1]);
      if (!isNaN(days) && days > 0) {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        if (todayStr) planForm.startDate = todayStr;
        const endDate = new Date();
        endDate.setDate(today.getDate() + days - 1);
        const endDateStr = endDate.toISOString().split('T')[0];
        if (endDateStr) planForm.endDate = endDateStr;
      }
      break;
    }
  }
  
  // 提取预算
  const budgetPatterns = [
    /预算([\d.]+)[万千]?元?/,
    /大约([\d.]+)[万千]?元?/,
    /花费([\d.]+)[万千]?元?/,
    /费用([\d.]+)[万千]?元?/,
    /准备([\d.]+)[万千]?元?/,
    /([\d.]+)[万千]?元?预算/,
    /([\d.]+)[万千]?元?费用/
  ];
  
  for (const pattern of budgetPatterns) {
    const match = cleanText.match(pattern);
    if (match && match[1]) {
      let budget = parseFloat(match[1]);
      if (!isNaN(budget)) {
        // 处理万元、千元、块等单位
        if (cleanText.includes('万元') || cleanText.includes('万块')) {
          budget *= 10000;
        } else if (cleanText.includes('千元') || cleanText.includes('千块')) {
          budget *= 1000;
        } else if (cleanText.includes('百块') || cleanText.includes('百元')) {
          budget *= 100;
        }
        
        // 确保预算在有效范围内
        budget = Math.round(budget);
        if (budget < 1000) budget = 1000; // 最低预算1000元
        if (budget > 1000000) budget = 1000000; // 最高预算100万元
        planForm.budget = budget;
      }
      break;
    }
  }
  
  // 提取人数
  const peoplePatterns = [
    /(\d+)人/,
    /(\d+)个人/,
    /(\d+)位/,
    /(\d+)位游客/,
    /和(\d+)个朋友/,
    /和(\d+)位朋友/
  ];
  
  for (const pattern of peoplePatterns) {
    const match = cleanText.match(pattern);
    if (match && match[1]) {
      const people = parseInt(match[1]);
      if (!isNaN(people) && people > 0 && people < 21) {
        planForm.people = people;
      }
      break;
    }
  }
  
  // 提取偏好
  const preferences: string[] = [];
  const preferenceKeywords = {
    '美食': ['美食', '吃', '餐厅', '美食节', '小吃', '特色菜'],
    '购物': ['购物', '商场', '逛街', '买东西', '购物中心', '商业街'],
    '自然风光': ['自然', '风景', '山水', '自然风景', '自然景观', '风景区'],
    '历史文化': ['历史', '文化', '古迹', '博物馆', '文物', '历史遗迹', '古建筑'],
    '艺术博物馆': ['艺术', '博物馆', '美术馆', '展览', '画展'],
    '主题乐园': ['乐园', '主题', '迪士尼', '欢乐谷', '游乐场'],
    '休闲度假': ['休闲', '度假', '放松', '休息', '度假村'],
    '户外探险': ['户外', '探险', '登山', '徒步', '露营', '攀岩'],
    '亲子游': ['孩子', '亲子', '带孩子', '儿童', '家庭'],
    '蜜月旅行': ['蜜月', '新婚', '结婚纪念'],
    '摄影': ['拍照', '摄影', '照片', '相机', '拍照打卡'],
    '夜生活': ['夜生活', '夜市', '夜景', '晚上'],
    '动漫': ['动漫', '动画', '漫画', '二次元', 'cosplay']
  };
  
  // 提取所有匹配的偏好
  Object.entries(preferenceKeywords).forEach(([key, keywords]) => {
    if (keywords.some(keyword => cleanText.includes(keyword))) {
      // 避免重复添加
      if (!preferences.includes(key)) {
        preferences.push(key);
      }
    }
  });
  
  // 特殊处理一些常见表达
  if (cleanText.includes('带孩子') || cleanText.includes('亲子')) {
    if (!preferences.includes('亲子游')) {
      preferences.push('亲子游');
    }
  }
  
  if (cleanText.includes('动漫') || cleanText.includes('二次元')) {
    if (!preferences.includes('动漫')) {
      preferences.push('动漫');
    }
  }
  
  // 如果没有检测到偏好，提供一些默认建议
  if (preferences.length === 0) {
    if (cleanText.includes('美食') || cleanText.includes('吃')) {
      preferences.push('美食');
    } else {
      // 默认添加一个通用偏好
      preferences.push('自然风光');
    }
  }
  
  // 应用偏好
  planForm.preferences = preferences;
  
  // 提取特殊需求
  const specialRequestsPatterns = [
    /特殊需求(.*)/,
    /有什么(.*)需求/,
    /备注(.*)/,
    /其他(.*)/
  ];
  
  for (const pattern of specialRequestsPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      planForm.specialRequests = match[1].trim();
      break;
    }
  }
  
  // 如果解析成功，给用户一个友好的提示
  if (destinationFound) {
    ElMessage.info(`已解析您的需求：前往${planForm.destination}`);
  }
};

// 生成行程
const generatePlan = async () => {
  if (!planFormRef.value) return;
  
  try {
    await planFormRef.value.validate();
    
    // 计算旅行天数
    const startDate = new Date(planForm.startDate);
    const endDate = new Date(planForm.endDate);
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    const planData = {
      destination: planForm.destination,
      startDate: planForm.startDate,
      endDate: planForm.endDate,
      budget: planForm.budget!,
      people: planForm.people,
      preferences: planForm.preferences,
      title: `${planForm.destination} ${days}日游`,
      specialRequests: planForm.specialRequests
    };
    
    const newPlan = await planStore.createPlan(planData);
    
    ElMessage.success('行程生成成功！');
    
    // 跳转到行程详情页
    // 直接使用返回的plan对象
    const newPlanId = newPlan?.id || 'new-plan';
    router.push(`/plan/detail/${newPlanId}`);
  } catch (error: any) {
    // 用户主动取消的验证错误不需要显示
    if (error.name !== 'ValidationError') {
      errorMessage.value = planStore.error || '行程生成失败，请稍后重试';
    }
  }
};

// 重置表单
const resetForm = () => {
  if (planFormRef.value) {
    planFormRef.value.resetFields();
  }
  recognizedText.value = '';
  errorMessage.value = '';
};

// 组件挂载时清除错误信息
onMounted(() => {
  planStore.clearError();
  errorMessage.value = '';
});
</script>

<style scoped>
.plan-create-container {
  max-width: 800px;
  margin: 0 auto;
}

.plan-create-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.voice-input-section {
  text-align: center;
  margin-bottom: 30px;
  padding: 20px;
  background-color: #f0f9ff;
  border-radius: 8px;
}

.voice-btn {
  margin-bottom: 15px;
}

.voice-hint {
  color: #606266;
  font-size: 14px;
  margin: 0;
}

.recognition-alert,
.error-alert {
  margin-bottom: 20px;
}

.plan-form {
  margin-top: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .plan-create-container {
    padding: 0;
  }
  
  .voice-input-section {
    padding: 15px;
  }
}
</style>