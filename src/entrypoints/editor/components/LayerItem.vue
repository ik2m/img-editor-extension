<script lang="ts" setup>
import { ref, computed } from 'vue';
import BaseButton from '@/components/BaseButton.vue';
import type { Shape } from '../types';
import { isRectShape, isArrowShape } from '../types';

const props = defineProps<{
  layer: Shape;
  selected: boolean;
  isFirst: boolean;
  isLast: boolean;
  editing: boolean;
  editingName: string;
}>();

const emit = defineEmits<{
  select: [id: string];
  moveUp: [id: string];
  moveDown: [id: string];
  delete: [id: string];
  startEdit: [layer: Shape];
  finishEdit: [];
  cancelEdit: [];
  updateEditingName: [name: string];
}>();

const layerColor = computed(() => {
  if (isRectShape(props.layer)) {
    return props.layer.fill;
  } else if (isArrowShape(props.layer)) {
    return props.layer.stroke;
  }
  return '#000000';
});

const layerNameInput = ref<HTMLInputElement | null>(null);
</script>

<template>
  <div
    :class="[
      'bg-dark-bg group cursor-pointer rounded border p-2 transition-all duration-200',
      selected
        ? 'bg-dark-elevated border-primary'
        : 'border-dark-border hover:bg-dark-elevated',
    ]"
    @click="emit('select', layer.id)"
  >
    <div class="flex items-center gap-2">
      <div
        class="border-dark-border h-5 w-5 flex-shrink-0 rounded-sm border"
        :style="{ backgroundColor: layerColor }"
      ></div>

      <span
        v-if="!editing"
        class="flex-1 overflow-hidden text-sm text-ellipsis whitespace-nowrap text-white"
        @dblclick="emit('startEdit', layer)"
      >
        {{ layer.name }}
      </span>
      <input
        v-else
        :value="editingName"
        @input="
          emit('updateEditingName', ($event.target as HTMLInputElement).value)
        "
        class="bg-dark-border border-primary flex-1 rounded border px-2 py-1 text-sm text-white outline-none"
        @blur="emit('finishEdit')"
        @keyup.enter="emit('finishEdit')"
        @keyup.esc="emit('cancelEdit')"
        ref="layerNameInput"
      />

      <div
        class="flex gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
      >
        <BaseButton
          variant="icon"
          :disabled="isLast"
          @click.stop="emit('moveUp', layer.id)"
          title="前面へ"
        >
          ↑
        </BaseButton>
        <BaseButton
          variant="icon"
          :disabled="isFirst"
          @click.stop="emit('moveDown', layer.id)"
          title="背面へ"
        >
          ↓
        </BaseButton>
        <BaseButton
          variant="icon"
          danger
          @click.stop="emit('delete', layer.id)"
          title="削除"
        >
          ×
        </BaseButton>
      </div>
    </div>
  </div>
</template>
