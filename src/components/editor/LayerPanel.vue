<script lang="ts" setup>
import { ref } from 'vue';
import BaseButton from '@/components/common/BaseButton.vue';
import LayerItem from './LayerItem.vue';
import type { Shape } from './types';

const props = defineProps<{
  shapes: Shape[];
  selectedShapeId: string;
  imageUrl: string;
}>();

const emit = defineEmits<{
  addRectangle: [];
  selectLayer: [id: string];
  moveLayerUp: [id: string];
  moveLayerDown: [id: string];
  deleteLayer: [id: string];
  reorderLayers: [fromIndex: number, toIndex: number];
}>();

const draggedIndex = ref<number | null>(null);

const handleDragStart = (index: number) => {
  draggedIndex.value = index;
};

const handleDragOver = (event: DragEvent, index: number) => {
  event.preventDefault();
  if (draggedIndex.value === null || draggedIndex.value === index) return;
};

const handleDrop = (index: number) => {
  if (draggedIndex.value === null || draggedIndex.value === index) return;
  emit('reorderLayers', draggedIndex.value, index);
  draggedIndex.value = null;
};

const handleDragEnd = () => {
  draggedIndex.value = null;
};
</script>

<template>
  <aside
    class="w-sidebar bg-dark-panel border-dark-border flex flex-col overflow-y-auto border-l p-3"
  >
    <div class="mb-3">
      <h3 class="text-dark-text m-0 text-sm font-semibold">レイヤー</h3>
    </div>

    <div class="flex flex-col gap-1">
      <div
        v-if="shapes.length === 0"
        class="text-dark-muted py-6 text-center text-xs"
      >
        レイヤーなし
      </div>

      <LayerItem
        v-for="(s, reversedIndex) in [...shapes].reverse()"
        :key="s.id"
        :layer="s"
        :selected="selectedShapeId === s.id"
        :is-first="shapes[0].id === s.id"
        :is-last="shapes[shapes.length - 1].id === s.id"
        :is-being-dragged="draggedIndex === shapes.length - 1 - reversedIndex"
        @select="emit('selectLayer', $event)"
        @move-up="emit('moveLayerUp', $event)"
        @move-down="emit('moveLayerDown', $event)"
        @delete="emit('deleteLayer', $event)"
        @drag-start="handleDragStart(shapes.length - 1 - reversedIndex)"
        @drag-over="handleDragOver($event, shapes.length - 1 - reversedIndex)"
        @drop="handleDrop(shapes.length - 1 - reversedIndex)"
        @drag-end="handleDragEnd"
      />

      <!-- 画像レイヤー（表示のみ） -->
      <div
        v-if="imageUrl"
        class="bg-dark-elevated border-dark-border cursor-default rounded border p-2"
      >
        <div class="flex items-center gap-2">
          <div
            class="border-dark-border h-5 w-5 flex-shrink-0 rounded-sm border bg-white opacity-50"
          ></div>
          <span class="text-dark-muted flex-1 text-xs">🖼️ 背景画像</span>
          <div class="text-dark-muted text-xs">🔒</div>
        </div>
      </div>
    </div>
  </aside>
</template>
