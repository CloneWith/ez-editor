<template>
  <div class="login-container">
    <h2>登录</h2>
    <el-space direction="vertical" fill>
      <el-alert v-if="message" :type="alertType">{{ message }}</el-alert>
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
          {{ loading ? "请稍候..." : "登录" }}
        </el-button>
        <el-button :disabled="loading" :to="`/${RegisterUrl}`" tag="router-link">
          没有账号？去注册
        </el-button>

      </el-form>
    </el-space>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useUserStore } from "@/stores/user";
import { useRouter } from "vue-router";
import { RegisterUrl } from "@/config.ts";

const userStore = useUserStore();
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
    const success = await userStore.login(username.value, password.value);
    if (success) {
      // Get the redirect destination
      const redirectPath = router.currentRoute.value.query.redirect || "/";

      setTimeout(() => {
        alertType.value = "success";
        message.value = "登录成功！";
        router.push(redirectPath as string);
      }, 1000);
    } else {
      setTimeout(() => {
        alertType.value = "error";
        message.value = "用户名或密码错误";
        loading.value = false;
      }, 3000);
    }
  } catch (err) {
    alertType.value = "error";
    message.value = "登录失败，请重试";
    console.error(err);
    setTimeout(() => {
      loading.value = false;
    }, 3000);
  }
}
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
}
</style>
