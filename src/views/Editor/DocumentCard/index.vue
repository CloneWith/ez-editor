<template>
  <div
    :class="{ 'active-card': props.currentDocument === props.text }"
    class="document-card"
    @click="handleClick"
  >
    <div class="card-content">
      <el-icon v-if="icon">
        <component :is="icon"/>
      </el-icon>
      <span>{{ text }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
  text: string
  icon?: string
  level?: number
  currentDocument?: string
}>();

const emit = defineEmits<{
  (e: "click", text: string): void
}>();


const handleClick = () => {
  emit("click", props.text);
};
</script>

<style lang="scss" scoped>
.document-card {
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
  border-radius: 0.5rem;
  background: rgba(white, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;

  &:hover,
  &.active-card {
    background: rgba(white, 0.2);
    border-color: var(--el-color-primary);
  }

  &.active-card {
    background: rgba(var(--el-color-primary-rgb), 0.3);
  }

  .card-content {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
}
</style>
