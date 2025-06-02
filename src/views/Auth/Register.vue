<template>
  <div class="register-container">
    <h2>注册</h2>
    <el-space direction="vertical" fill>
      <el-alert v-if="message" :type="alertType" show-icon>{{ message }}</el-alert>
      <el-form @submit.prevent="handleSubmit">
        <el-form-item label="用户名">
          <el-input
            id="username"
            v-model="username"
            required
            type="text"
          />
        </el-form-item>
        <el-form-item label="密码">
          <el-input
            id="password"
            v-model="password"
            required
            show-password
            type="password"
          />
        </el-form-item>
        <el-button :disabled="loading" :loading="loading" native-type="submit" type="primary">
          {{ loading ? "请稍候..." : "注册" }}
        </el-button>
        <el-button :disabled="loading" :to="`/${LoginUrl}`" tag="router-link">
          已有账号？去登录
        </el-button>
      </el-form>
    </el-space>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { LoginUrl, UserAddUrl } from "@/config";
import api from "@/utils/api.ts";

const router = useRouter();

const username = ref("");
const password = ref("");
const loading = ref(false);
const alertType = ref("error");
const message = ref("");

async function handleSubmit() {
  try {
    loading.value = true;
    message.value = "";

    const response = await api.postForm(UserAddUrl, {
      username: username.value,
      password: password.value,
    });

    if (response.data.success) {
      alertType.value = "success";
      message.value = "注册成功，转到登录界面...";
      setTimeout(async () => {
        await router.push(`/${LoginUrl}`);
      }, 1000);
    }
    else
    {
      alertType.value = "error";
      message.value = `注册失败：${response.data.message}`;
      setTimeout(() => {
        loading.value = false;
      }, 3000);
    }
  } catch (err) {
    alertType.value = "error";
    message.value = "注册失败，请重试";
    console.error(err);
    setTimeout(() => {
      loading.value = false;
    }, 3000);
  }
}
</script>

<style scoped>
.register-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
}
</style>
