<template>
<el-tabs>
  <el-tab-pane label="Login">
    <Login/>
  </el-tab-pane>
  <el-tab-pane label="Register">
    <Register/>
  </el-tab-pane>
</el-tabs>
</template>

<script setup lang="ts">

import Login from "@/views/Auth/Login.vue";
import Register from "@/views/Auth/Register.vue";
</script>

<style scoped>

</style>
