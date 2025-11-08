<template>
  <div class="profile-container">
    <el-card class="profile-card">
      <template #header>
        <div class="profile-header">
          <h2>个人中心</h2>
        </div>
      </template>
      
      <div class="profile-content">
        <!-- 个人信息编辑 -->
        <el-form :model="userForm" ref="userFormRef" :rules="userRules" label-width="100px">
          <div class="profile-avatar-section">
            <el-avatar :size="120" :src="userForm.avatar" class="profile-avatar">
              {{ userForm.username?.charAt(0) || 'U' }}
            </el-avatar>
            <el-button type="primary" @click="handleAvatarUpload" class="mt-2">更换头像</el-button>
            <input ref="avatarInput" type="file" accept="image/*" class="hidden" @change="onAvatarChange" />
          </div>
          
          <el-form-item label="用户名" prop="username">
            <el-input v-model="userForm.username" placeholder="请输入用户名" />
          </el-form-item>
          
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="userForm.email" type="email" placeholder="请输入邮箱" />
          </el-form-item>
          
          <el-form-item label="手机号" prop="phone">
            <el-input v-model="userForm.phone" placeholder="请输入手机号" />
          </el-form-item>
          
          <el-form-item label="昵称">
            <el-input v-model="userForm.nickname" placeholder="请输入昵称" />
          </el-form-item>
          
          <el-form-item label="个人简介">
            <el-input v-model="userForm.bio" type="textarea" :rows="3" placeholder="请输入个人简介" />
          </el-form-item>
          
          <el-form-item label="旅行偏好">
            <el-select v-model="userForm.preferences" multiple placeholder="请选择旅行偏好">
              <el-option label="自然风光" value="nature" />
              <el-option label="历史文化" value="culture" />
              <el-option label="美食探索" value="food" />
              <el-option label="城市观光" value="city" />
              <el-option label="户外探险" value="adventure" />
              <el-option label="休闲度假" value="relaxation" />
            </el-select>
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="handleSubmit">保存修改</el-button>
            <el-button @click="handleCancel">取消</el-button>
          </el-form-item>
        </el-form>
        
        <!-- 密码修改 -->
        <el-divider>修改密码</el-divider>
        <el-form :model="passwordForm" ref="passwordFormRef" :rules="passwordRules" label-width="100px">
          <el-form-item label="当前密码" prop="currentPassword">
            <el-input v-model="passwordForm.currentPassword" type="password" placeholder="请输入当前密码" />
          </el-form-item>
          
          <el-form-item label="新密码" prop="newPassword">
            <el-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码" />
          </el-form-item>
          
          <el-form-item label="确认新密码" prop="confirmPassword">
            <el-input v-model="passwordForm.confirmPassword" type="password" placeholder="请确认新密码" />
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="handlePasswordSubmit">修改密码</el-button>
          </el-form-item>
        </el-form>
        
        <!-- 账号安全 -->
        <el-divider>账号安全</el-divider>
        <div class="security-section">
          <el-alert :title="'账号安全等级: ' + securityLevel" :type="securityLevelType" show-icon />
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-card shadow="hover">
                <template #header>
                  <div class="card-header">
                    <span>第三方登录绑定</span>
                  </div>
                </template>
                <div class="third-party-bindings">
                  <el-button size="large" :icon="Lock" :disabled="!userStore.isAuthenticated">
                    微信
                    <el-tag v-if="isWechatBound" size="small" style="margin-left: 10px;">已绑定</el-tag>
                  </el-button>
                  <el-button size="large" :icon="Lock" :disabled="!userStore.isAuthenticated">
                    QQ
                    <el-tag v-if="isQQBound" size="small" style="margin-left: 10px;">已绑定</el-tag>
                  </el-button>
                </div>
              </el-card>
            </el-col>
            
            <el-col :span="12">
              <el-card shadow="hover">
                <template #header>
                  <div class="card-header">
                    <span>账号操作</span>
                  </div>
                </template>
                <div class="account-actions">
                  <el-button type="danger" @click="showDeleteConfirm" :disabled="!userStore.isAuthenticated">
                    注销账号
                  </el-button>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useUserStore } from '../stores/userStore';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Lock } from '@element-plus/icons-vue';
import { mockUser as mockUserData } from '../utils/mockData';

const userStore = useUserStore();
const userFormRef = ref();
const passwordFormRef = ref();
const avatarInput = ref();

// 用户信息表单
const userForm = reactive({
  username: '',
  email: '',
  phone: '',
  nickname: '',
  bio: '',
  avatar: '',
  preferences: [] as string[]
});

// 密码修改表单
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// 表单验证规则
const userRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入正确的手机号格式',
      trigger: 'blur'
    }
  ]
};

const passwordRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: Function) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
};

// 安全等级相关
const securityLevel = ref('中等');
const securityLevelType = ref('warning');
const isWechatBound = ref(false);
const isQQBound = ref(false);

// 初始化用户数据
onMounted(() => {
  // 在实际应用中，这里应该从后端获取用户数据
  // 这里使用模拟数据
  if (userStore.isAuthenticated) {
    // 使用模拟用户数据填充表单
    const user = {
      ...mockUserData,
      phone: '',
      nickname: '',
      bio: '',
      preferences: [],
      passwordLastChanged: false,
      wechatBound: false,
      qqBound: false
    };
    userForm.username = user.username;
    userForm.email = user.email;
    userForm.phone = user.phone || '';
    userForm.nickname = user.nickname || '';
    userForm.bio = user.bio || '';
    userForm.avatar = user.avatar || '';
    userForm.preferences = user.preferences || [];
    
    // 模拟安全状态
    securityLevel.value = user.passwordLastChanged ? '高' : '中等';
    securityLevelType.value = user.passwordLastChanged ? 'success' : 'warning';
    isWechatBound.value = user.wechatBound || false;
    isQQBound.value = user.qqBound || false;
  }
});

// 头像上传处理
const handleAvatarUpload = () => {
  avatarInput.value?.click();
};

const onAvatarChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    // 在实际应用中，这里应该上传文件到服务器
    // 这里使用FileReader模拟本地预览
    const reader = new FileReader();
    reader.onload = (e) => {
      userForm.avatar = e.target?.result as string;
    };
    reader.readAsDataURL(file);
    
    // 清空input，允许重新选择同一个文件
    target.value = '';
  }
};

// 保存用户信息
const handleSubmit = async () => {
  if (!userFormRef.value) return;
  
  try {
    await userFormRef.value.validate();
    // 在实际应用中，这里应该调用API保存用户信息
    
    // 模拟保存成功
    ElMessage.success('个人信息更新成功');
    // 更新用户状态
    userStore.updateUser(userForm);
  } catch (error) {
    console.error('表单验证失败:', error);
  }
};

// 取消编辑
const handleCancel = () => {
  if (!userFormRef.value) return;
  userFormRef.value.resetFields();
  // 重新加载用户数据
    if (userStore.isAuthenticated) {
      const user = {
        ...mockUserData,
        phone: '',
        nickname: '',
        bio: '',
        preferences: []
      };
      Object.assign(userForm, {
        username: user.username,
        email: user.email,
        phone: '',
        nickname: '',
        bio: '',
        avatar: user.avatar || '',
        preferences: []
      });
    }
};

// 修改密码
const handlePasswordSubmit = async () => {
  if (!passwordFormRef.value) return;
  
  try {
    await passwordFormRef.value.validate();
    // 在实际应用中，这里应该调用API修改密码
    
    // 模拟修改成功
    ElMessage.success('密码修改成功，请重新登录');
    passwordFormRef.value.resetFields();
    // 这里可以选择登出用户
  } catch (error) {
    console.error('密码修改验证失败:', error);
  }
};

// 注销账号确认
const showDeleteConfirm = () => {
  ElMessageBox.confirm(
    '注销账号后，您的所有数据将被删除且无法恢复，确定要继续吗？',
    '账号注销确认',
    {
      confirmButtonText: '确定注销',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(() => {
      // 在实际应用中，这里应该调用API注销账号
      ElMessage.success('账号注销成功');
      userStore.logout();
      // 跳转到登录页
      window.location.href = '/login';
    })
    .catch(() => {
      ElMessage.info('已取消注销');
    });
};
</script>

<style scoped>
.profile-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.profile-card {
  margin-bottom: 20px;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.profile-content {
  padding: 20px 0;
}

.profile-avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
}

.profile-avatar {
  cursor: pointer;
  transition: transform 0.3s;
}

.profile-avatar:hover {
  transform: scale(1.05);
}

.hidden {
  display: none;
}

.security-section {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.third-party-bindings {
  display: flex;
  gap: 20px;
  padding: 10px 0;
}

.account-actions {
  padding: 10px 0;
}

@media (max-width: 768px) {
  .profile-container {
    padding: 10px;
  }
  
  .third-party-bindings {
    flex-direction: column;
    gap: 10px;
  }
  
  .el-col {
    width: 100% !important;
    margin-bottom: 20px;
  }
}
</style>