<script lang="ts" setup>
import { ref } from 'vue';
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

const layerNameInput = ref<HTMLInputElement | null>(null);
</script>

<template>
  <aside class="w-sidebar bg-dark-panel border-l border-dark-border p-4 overflow-y-auto flex flex-col">
    <div class="flex justify-between items-center mb-4">
      <h3 class="m-0 text-base text-dark-text">レイヤー</h3>
      <button
        @click="emit('addRectangle')"
        :disabled="!imageUrl"
        class="py-1 px-3 text-xl leading-none block w-full py-2 px-4 mb-2 bg-primary text-white border-none rounded cursor-pointer text-center transition-colors duration-200 font-semibold hover:bg-primary-hover disabled:bg-dark-elevated disabled:text-dark-muted disabled:cursor-not-allowed"
      >+</button>
    </div>

    <div class="flex flex-col gap-1">
      <div v-if="rects.length === 0" class="text-center text-dark-muted py-8 px-4 text-sm">
        レイヤーなし<br>
        <small class="text-xs">矩形を追加してください</small>
      </div>

      <div
        v-for="r in [...rects].reverse()"
        :key="r.id"
        :class="[
          'p-2 bg-dark-bg border rounded cursor-pointer transition-all duration-200 group',
          selectedShapeId === r.id
            ? 'bg-dark-elevated border-primary'
            : 'border-dark-border hover:bg-dark-elevated'
        ]"
        @click="emit('selectLayer', r.id)"
      >
        <div class="flex items-center gap-2">
          <div
            class="w-5 h-5 border border-dark-border rounded-sm flex-shrink-0"
            :style="{ backgroundColor: r.fill }"
          ></div>

          <span
            v-if="editingLayerId !== r.id"
            class="flex-1 text-white text-sm overflow-hidden text-ellipsis whitespace-nowrap"
            @dblclick="emit('startEditName', r)"
          >
            {{ r.name }}
          </span>
          <input
            v-else
            :value="editingLayerName"
            @input="emit('updateEditingName', ($event.target as HTMLInputElement).value)"
            class="flex-1 bg-dark-border text-white border border-primary rounded px-2 py-1 text-sm outline-none"
            @blur="emit('finishEditName')"
            @keyup.enter="emit('finishEditName')"
            @keyup.esc="emit('cancelEditName')"
            ref="layerNameInput"
          />

          <div class="flex gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <button
              @click.stop="emit('moveLayerUp', r.id)"
              :disabled="rects[rects.length - 1].id === r.id"
              class="py-1 px-2 bg-dark-border text-white border-none rounded-sm cursor-pointer text-xs transition-colors duration-200 hover:bg-[#4d4d4d] disabled:opacity-30 disabled:cursor-not-allowed"
              title="前面へ"
            >
              ↑
            </button>
            <button
              @click.stop="emit('moveLayerDown', r.id)"
              :disabled="rects[0].id === r.id"
              class="py-1 px-2 bg-dark-border text-white border-none rounded-sm cursor-pointer text-xs transition-colors duration-200 hover:bg-[#4d4d4d] disabled:opacity-30 disabled:cursor-not-allowed"
              title="背面へ"
            >
              ↓
            </button>
            <button
              @click.stop="emit('deleteLayer', r.id)"
              class="py-1 px-2 bg-dark-border text-danger border-none rounded-sm cursor-pointer text-xs transition-colors duration-200 hover:bg-danger hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              title="削除"
            >
              ×
            </button>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>
