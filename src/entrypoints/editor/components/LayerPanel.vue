<script lang="ts" setup>
import BaseButton from '@/components/BaseButton.vue';
import LayerItem from './LayerItem.vue';
import type { RectShape } from '../types';

const props = defineProps<{
  rects: RectShape[];
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
  startEditName: [layer: RectShape];
  finishEditName: [];
  cancelEditName: [];
  updateEditingName: [name: string];
}>();
</script>

<template>
  <aside
    class="w-sidebar bg-dark-panel border-dark-border flex flex-col overflow-y-auto border-l p-4"
  >
    <div class="mb-4 flex items-center justify-between">
      <h3 class="text-dark-text m-0 text-base">レイヤー</h3>
      <BaseButton
        variant="primary"
        :disabled="!imageUrl"
        @click="emit('addRectangle')"
        class="text-xl leading-none"
      >
        +
      </BaseButton>
    </div>

    <div class="flex flex-col gap-1">
      <div
        v-if="rects.length === 0"
        class="text-dark-muted px-4 py-8 text-center text-sm"
      >
        レイヤーなし<br />
        <small class="text-xs">矩形を追加してください</small>
      </div>

      <LayerItem
        v-for="r in [...rects].reverse()"
        :key="r.id"
        :layer="r"
        :selected="selectedShapeId === r.id"
        :is-first="rects[0].id === r.id"
        :is-last="rects[rects.length - 1].id === r.id"
        :editing="editingLayerId === r.id"
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
    </div>
  </aside>
</template>
