<template>
  <div class="login-container">
    <div class="login-form-wrapper">
      <h2 class="form-title">用户登录</h2>
      <el-form :model="loginForm" :rules="rules" ref="loginFormRef" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            prefix-icon="User"
          />
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleLogin" :loading="userStore.loading">
            登录
          </el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
        
        <div class="register-link">
          <span>还没有账号？</span>
          <router-link to="/register">立即注册</router-link>
        </div>
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useUserStore } from '../stores/userStore';
// speechRecognitionService removed temporarily
import { User, Lock } from '@element-plus/icons-vue';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const loginFormRef = ref();

const errorMessage = ref('');

// 登录表单数据
const loginForm = reactive({
  username: '',
  password: ''
});

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为 6 个字符', trigger: 'blur' }
  ]
};

// 处理登录
const handleLogin = async () => {
    console.log('开始登录流程，表单数据:', { username: loginForm.username, password: '****' });
    if (!loginFormRef.value) {
      console.error('登录表单引用不存在');
      return;
    }
    
    try {
      console.log('开始验证表单...');
      await loginFormRef.value.validate();
      console.log('表单验证成功，调用userStore.login...');
      
      // 简化登录调用，不再过度验证响应对象
      await userStore.login(loginForm.username, loginForm.password);
      console.log('登录后userStore状态:', { 
        isAuthenticated: userStore.isAuthenticated, 
        user: userStore.user,
        error: userStore.error 
      });
      
      // 只检查认证状态作为成功标志
      if (userStore.isAuthenticated) {
        console.log('认证状态验证成功：已登录');
        ElMessage.success('登录成功');
        
        // 直接跳转到我的行程页面
        console.log('登录成功，跳转到我的行程页面');
        router.push('/plan/list');
      } else {
        console.error('登录失败：认证状态未正确设置');
        errorMessage.value = '登录失败，请重试';
      }
    } catch (error: any) {
      console.error('登录异常捕获:', { 
        errorType: typeof error, 
        errorMessage: error.message, 
        errorName: error.name,
        userStoreError: userStore.error
      });
      // 用户主动取消的验证错误不需要显示
      if (error.name !== 'ValidationError') {
        errorMessage.value = userStore.error || '登录失败，请稍后重试';
        console.log('显示错误信息:', errorMessage.value);
      }
    }
  };

// 重置表单
const resetForm = () => {
  if (loginFormRef.value) {
    loginFormRef.value.resetFields();
  }
  errorMessage.value = '';
};



// 组件挂载时清除错误信息
onMounted(() => {
  userStore.clearError();
  errorMessage.value = '';
});
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 60px);
  background-color: #f0f2f5;
  padding: 20px;
}

.login-form-wrapper {
  width: 100%;
  max-width: 400px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 30px;
}

.form-title {
  text-align: center;
  margin-bottom: 30px;
  color: #303133;
  font-size: 24px;
  font-weight: 500;
}

.el-form-item {
  margin-bottom: 24px;
}

.register-link {
  text-align: center;
  margin-top: 20px;
  color: #606266;
}

.register-link a {
  color: #1890ff;
  text-decoration: none;
  margin-left: 5px;
}

.register-link a:hover {
  color: #40a9ff;
}

.error-alert {
  margin-bottom: 20px;
}

:deep(.el-icon--right) {
  margin-left: 5px;
}



/* 响应式调整 */
@media (max-width: 768px) {
  .login-form-wrapper {
    padding: 20px;
  }
}
</style>