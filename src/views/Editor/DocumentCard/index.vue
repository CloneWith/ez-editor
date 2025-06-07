<template>
  <div
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
}>();

const emit = defineEmits<{
  (e: 'click', text: string): void
}>();

const handleClick = () => {
  console.log("Clicked document:", props.text);
  emit('click', props.text);
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

  &:hover {
    background: rgba(white, 0.2);
    border-color: var(--el-color-primary);
    box-shadow: 0 0 0 1px var(--el-color-primary);
  }

  .card-content {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
}
</style>
