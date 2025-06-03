<template>
  <div class="tree-node" :style="{ width: width + 'px' }">
    <div class="circle">{{ node.value }}</div>

    <div class="children" v-if="hasChildren">
      <svg :width="width" height="40" class="connectors" xmlns="http://www.w3.org/2000/svg">
        <line :x1="width / 2" y1="0" :x2="width / 2" y2="20" stroke="#1976d2" stroke-width="2" />
        <line v-if="node.left && node.right" x1="20" y1="20" :x2="width - 20" y2="20" stroke="#1976d2"
          stroke-width="2" />
      </svg>

      <div class="children-nodes">
        <TreeNodeView v-if="node.left" :node="node.left" :width="width / 2" :key="node.left.value" />
        <div v-else class="empty-branch" :style="{ width: width / 2 + 'px' }"></div>

        <TreeNodeView v-if="node.right" :node="node.right" :width="width / 2" :key="node.right.value" />
        <div v-else class="empty-branch" :style="{ width: width / 2 + 'px' }"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { AVLNode } from 'src/composables/useAVLTree';
import { computed } from 'vue';

const props = defineProps({
  node: {
    type: Object as () => AVLNode<any>,
    required: true
  },
  width: {
    type: Number,
    default: 200
  }
});

const hasChildren = computed(() => props.node.left || props.node.right);
</script>

<style scoped>
.tree-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  margin: 1rem 0;
}

.circle {
  width: 50px;
  height: 50px;
  background: linear-gradient(145deg, #1e88e5, #1565c0);
  border-radius: 50%;
  color: white;
  font-weight: 700;
  line-height: 50px;
  text-align: center;
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.3),
    inset 0 -3px 6px rgba(255, 255, 255, 0.3);
  user-select: none;
  transition: transform 0.3s ease;
}

.circle:hover {
  transform: scale(1.1);
  box-shadow:
    0 6px 12px rgba(0, 0, 0, 0.5),
    inset 0 -3px 6px rgba(255, 255, 255, 0.5);
  cursor: pointer;
}

.children {
  position: relative;
  width: 100%;
  margin-top: 10px;
}

.connectors {
  position: absolute;
  top: 0;
  left: 0;
  overflow: visible;
  z-index: 0;
}

.children-nodes {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.empty-branch {
  width: 50%;
}
</style>
