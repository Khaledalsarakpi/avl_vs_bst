<!-- src/components/PerformanceStats.vue -->
<template>
  <div class="q-mt-sm text-subtitle2">
    زمن الإدخال: {{ time.toFixed(3) }} مللي ثانية
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  time: number
  label: string
}>()
</script>
