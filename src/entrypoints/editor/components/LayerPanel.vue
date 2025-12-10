<script lang="ts" setup>
import BaseButton from '@/components/BaseButton.vue';
import LayerItem from './LayerItem.vue';
import type { Shape } from '../types';

const props = defineProps<{
  shapes: Shape[];
  selectedShapeId: string;
  imageUrl: string;
  editingLayerId: string;
  editingLayerName: string;
}>();

const emit = defineEmits<{
  addRectangle: [];
  selectLayer: [id: string];
  moveLayerUp: [id: string];
  moveLayerDown: [id: string];
  deleteLayer: [id: string];
  startEditName: [layer: Shape];
  finishEditName: [];
  cancelEditName: [];
  updateEditingName: [name: string];
}>();
</script>

<template>
  <aside
    class="w-sidebar bg-dark-panel border-dark-border flex flex-col overflow-y-auto border-l p-4"
  >
    <div class="mb-4">
      <h3 class="text-dark-text m-0 text-base">レイヤー</h3>
    </div>

    <div class="flex flex-col gap-1">
      <div
        v-if="shapes.length === 0"
        class="text-dark-muted px-4 py-8 text-center text-sm"
      >
        レイヤーなし<br />
        <small class="text-xs">図形を追加してください</small>
      </div>

      <LayerItem
        v-for="s in [...shapes].reverse()"
        :key="s.id"
        :layer="s"
        :selected="selectedShapeId === s.id"
        :is-first="shapes[0].id === s.id"
        :is-last="shapes[shapes.length - 1].id === s.id"
        :editing="editingLayerId === s.id"
        :editing-name="editingLayerName"
        @select="emit('selectLayer', $event)"
        @move-up="emit('moveLayerUp', $event)"
        @move-down="emit('moveLayerDown', $event)"
        @delete="emit('deleteLayer', $event)"
        @start-edit="emit('startEditName', $event)"
        @finish-edit="emit('finishEditName')"
        @cancel-edit="emit('cancelEditName')"
        @update-editing-name="emit('updateEditingName', $event)"
      />

      <!-- 画像レイヤー（表示のみ） -->
      <div
        v-if="imageUrl"
        class="bg-dark-bg border-dark-border cursor-default rounded border p-2 opacity-60"
      >
        <div class="flex items-center gap-2">
          <div
            class="border-dark-border h-5 w-5 flex-shrink-0 rounded-sm border bg-white"
          ></div>
          <span class="text-dark-text flex-1 text-sm">画像</span>
          <div class="text-dark-muted text-xs">🔒</div>
        </div>
      </div>
    </div>
  </aside>
</template>
