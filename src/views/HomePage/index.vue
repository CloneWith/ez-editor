<template>
  <div class="home-container">
    <div class="welcome-content">
      <h1 class="welcome-title">欢迎使用EZ Editor</h1>
      <p class="welcome-subtitle">简单易用的在线文档编辑工具</p>
      
      <div class="action-buttons">
        <el-button 
          type="primary" 
          size="large"
          @click="navigateToLogin"
          v-if="!userStore.isLoggedIn"
        >
          登录
        </el-button>
        <el-button 
          type="success" 
          size="large"
          @click="navigateToRegister"
          v-if="!userStore.isLoggedIn"
        >
          注册
        </el-button>
        <el-button 
          type="primary" 
          size="large"
          @click="navigateToEditor"
          v-if="userStore.isLoggedIn"
        >
          开始编辑
        </el-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const navigateToLogin = () => {
  router.push('/login')
}

const navigateToRegister = () => {
  router.push('/register')
}

const navigateToEditor = () => {
  router.push('/editor')
}
</script>

<style scoped>
.home-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.welcome-content {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.welcome-title {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.welcome-subtitle {
  font-size: 1.2rem;
  color: #7f8c8d;
  margin-bottom: 2rem;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}
</style>
