<script lang="ts" setup>
import { ref, computed } from 'vue';
import LayerItem from './LayerItem.vue';
import { isDrawingShape, isTextShape } from './types';
import useLayerStore from '@/stores/useLayerStore';
import useImageStore from '@/stores/useImageStore';
import useDrawingStore from '@/stores/useDrawingStore';

// Stores
const {
  shapes,
  selectedShapeId,
  selectLayer,
  moveLayerUp,
  moveLayerDown,
  deleteLayer,
  reorderLayers,
  updateTextFontSize,
} = useLayerStore();
const { imageUrl } = useImageStore();
const { drawingMode } = useDrawingStore();

// お絵描きレイヤー以外のレイヤーをフィルタ
const editableLayers = computed(() => {
  return shapes.value.filter((s) => !isDrawingShape(s));
});

// お絵描きレイヤーの存在チェック
const drawingLayer = computed(() => {
  return shapes.value.find(isDrawingShape);
});

// 選択されたテキストレイヤーを取得
const selectedTextLayer = computed(() => {
  const shape = shapes.value.find((s) => s.id === selectedShapeId.value);
  return shape && isTextShape(shape) ? shape : null;
});

const draggedIndex = ref<number | null>(null);

const handleFontSizeChange = (delta: number) => {
  if (!selectedTextLayer.value) return;
  const newSize = Math.max(8, Math.min(200, selectedTextLayer.value.fontSize + delta));
  updateTextFontSize(selectedTextLayer.value.id, newSize);
};

const handleDragStart = (index: number) => {
  draggedIndex.value = index;
};

const handleDragOver = (event: DragEvent, index: number) => {
  event.preventDefault();
  if (draggedIndex.value === null || draggedIndex.value === index) return;
};

const handleDrop = (index: number) => {
  if (draggedIndex.value === null || draggedIndex.value === index) return;
  reorderLayers(draggedIndex.value, index);
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

    <!-- テキストのフォントサイズ変更 -->
    <div
      v-if="selectedTextLayer"
      class="bg-dark-elevated border-dark-border mb-3 rounded border p-3"
    >
      <div class="text-dark-text mb-2 text-xs font-semibold">フォントサイズ</div>
      <div class="flex items-center gap-2">
        <button
          @click="handleFontSizeChange(-2)"
          class="bg-dark-panel hover:bg-dark-elevated border-dark-border flex h-8 w-8 items-center justify-center rounded border transition-colors"
          title="サイズを小さく"
        >
          <span class="text-lg">−</span>
        </button>
        <div class="text-dark-text flex-1 text-center text-sm">
          {{ selectedTextLayer.fontSize }}px
        </div>
        <button
          @click="handleFontSizeChange(2)"
          class="bg-dark-panel hover:bg-dark-elevated border-dark-border flex h-8 w-8 items-center justify-center rounded border transition-colors"
          title="サイズを大きく"
        >
          <span class="text-lg">+</span>
        </button>
      </div>
    </div>

    <div class="flex flex-col gap-1">
      <div
        v-if="editableLayers.length === 0"
        class="text-dark-muted py-6 text-center text-xs"
      >
        レイヤーなし
      </div>

      <LayerItem
        v-for="(s, reversedIndex) in [...editableLayers].reverse()"
        :key="s.id"
        :layer="s"
        :selected="selectedShapeId === s.id"
        :is-first="editableLayers[0].id === s.id"
        :is-last="editableLayers[editableLayers.length - 1].id === s.id"
        :is-being-dragged="draggedIndex === editableLayers.length - 1 - reversedIndex"
        :disabled="drawingMode"
        @select="selectLayer"
        @move-up="moveLayerUp"
        @move-down="moveLayerDown"
        @delete="deleteLayer"
        @drag-start="handleDragStart(editableLayers.length - 1 - reversedIndex)"
        @drag-over="handleDragOver($event, editableLayers.length - 1 - reversedIndex)"
        @drop="handleDrop(editableLayers.length - 1 - reversedIndex)"
        @drag-end="handleDragEnd"
      />

      <!-- お絵描きレイヤー（表示のみ） -->
      <div
        v-if="drawingLayer"
        class="bg-dark-elevated border-dark-border cursor-default rounded border p-2"
      >
        <div class="flex items-center gap-2">
          <div
            class="border-dark-border h-4 w-4 flex-shrink-0 rounded-sm border bg-black"
          ></div>
          <span class="text-dark-muted flex-1 text-xs">🖊️ {{ drawingLayer.name }}</span>
          <div class="text-dark-muted text-xs">🔒</div>
        </div>
      </div>

      <!-- 画像レイヤー（表示のみ） -->
      <div
        v-if="imageUrl"
        class="bg-dark-elevated border-dark-border cursor-default rounded border p-2"
      >
        <div class="flex items-center gap-2">
          <div
            class="border-dark-border h-4 w-4 flex-shrink-0 rounded-sm border bg-white opacity-50"
          ></div>
          <span class="text-dark-muted flex-1 text-xs">🖼️ 背景画像</span>
          <div class="text-dark-muted text-xs">🔒</div>
        </div>
      </div>
    </div>
  </aside>
</template>
