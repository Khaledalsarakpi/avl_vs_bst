<!-- src/components/TreeVisualizer.vue -->
<template>
  <div class="tree-container">
    <div v-if="!props.root">فارغة</div>
    <div v-else class="tree-node">
      <TreeNodeView :node="props.root" />
    </div>
  </div>
</template>

<script lang="ts" setup>

import TreeNodeView from './TreeNodeView.vue';


const props = defineProps({
  root: {
    type: Object as () => any,
    required: true
  }
});
</script>

<style scoped>
.tree-container {
  min-height: 200px;
  padding: 1rem;
  background: #f8f8f8;
  border-radius: 8px;
  overflow-x: auto;
}
</style>
