<script lang="ts" setup>
import { ref } from 'vue';
import BaseButton from '@/components/BaseButton.vue';
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

      <div
        v-for="r in [...rects].reverse()"
        :key="r.id"
        :class="[
          'bg-dark-bg group cursor-pointer rounded border p-2 transition-all duration-200',
          selectedShapeId === r.id
            ? 'bg-dark-elevated border-primary'
            : 'border-dark-border hover:bg-dark-elevated',
        ]"
        @click="emit('selectLayer', r.id)"
      >
        <div class="flex items-center gap-2">
          <div
            class="border-dark-border h-5 w-5 flex-shrink-0 rounded-sm border"
            :style="{ backgroundColor: r.fill }"
          ></div>

          <span
            v-if="editingLayerId !== r.id"
            class="flex-1 overflow-hidden text-sm text-ellipsis whitespace-nowrap text-white"
            @dblclick="emit('startEditName', r)"
          >
            {{ r.name }}
          </span>
          <input
            v-else
            :value="editingLayerName"
            @input="
              emit(
                'updateEditingName',
                ($event.target as HTMLInputElement).value
              )
            "
            class="bg-dark-border border-primary flex-1 rounded border px-2 py-1 text-sm text-white outline-none"
            @blur="emit('finishEditName')"
            @keyup.enter="emit('finishEditName')"
            @keyup.esc="emit('cancelEditName')"
            ref="layerNameInput"
          />

          <div
            class="flex gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          >
            <BaseButton
              variant="icon"
              :disabled="rects[rects.length - 1].id === r.id"
              @click.stop="emit('moveLayerUp', r.id)"
              title="前面へ"
            >
              ↑
            </BaseButton>
            <BaseButton
              variant="icon"
              :disabled="rects[0].id === r.id"
              @click.stop="emit('moveLayerDown', r.id)"
              title="背面へ"
            >
              ↓
            </BaseButton>
            <BaseButton
              variant="icon"
              danger
              @click.stop="emit('deleteLayer', r.id)"
              title="削除"
            >
              ×
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>
