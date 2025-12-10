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
    </div>
  </aside>
</template>
