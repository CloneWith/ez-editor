<template>
  <el-button
    class="menu-item"
    :class="{ 'is-active': props.isActive ? props.isActive() : null }"
    @click="props.action"
    :title="props.title"
  >
    <svg class="remix">
       <use :xlink:href="`${remixiconUrl}#ri-${props.icon}`"/>
    </svg>
  </el-button>
</template>

<script setup lang="ts">
import remixiconUrl from 'remixicon/fonts/remixicon.symbol.svg'

const props = defineProps<{
  icon?: string
  title?: string
  action?: Function
  isActive?: Function
}>()
</script>

<style lang="scss">
.menu-item {
  background: transparent;
  border: none;
  border-radius: 0.4rem;
  height: 28px;
  width: 28px;

  svg {
    fill: currentColor;
    height: 24px;
    width: 24px;
  }
}
</style>
