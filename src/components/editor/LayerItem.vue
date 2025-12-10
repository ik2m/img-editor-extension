<script lang="ts" setup>
import { computed } from 'vue';
import BaseButton from '@/components/common/BaseButton.vue';
import type { Shape } from './types';
import { isRectShape, isArrowShape, isDrawingShape, isTextShape } from './types';

const props = defineProps<{
  layer: Shape;
  selected: boolean;
  isFirst: boolean;
  isLast: boolean;
  isBeingDragged: boolean;
}>();

const emit = defineEmits<{
  select: [id: string];
  moveUp: [id: string];
  moveDown: [id: string];
  delete: [id: string];
  dragStart: [];
  dragOver: [event: DragEvent];
  drop: [];
  dragEnd: [];
}>();

const layerColor = computed(() => {
  if (isRectShape(props.layer)) {
    return props.layer.fill;
  } else if (isArrowShape(props.layer)) {
    return props.layer.stroke;
  } else if (isDrawingShape(props.layer)) {
    return props.layer.lines[0]?.stroke || '#000000';
  } else if (isTextShape(props.layer)) {
    return props.layer.fill;
  }
  return '#000000';
});
</script>

<template>
  <div
    :class="[
      'group rounded border p-2 transition-all duration-150',
      selected
        ? 'bg-dark-elevated border-primary shadow-sm'
        : 'bg-dark-bg border-dark-border hover:bg-dark-elevated hover:border-[#4d4d4d]',
      isBeingDragged ? 'opacity-40 scale-95' : 'opacity-100 scale-100',
      'cursor-move',
    ]"
    draggable="true"
    @click="emit('select', layer.id)"
    @dragstart="emit('dragStart')"
    @dragover="emit('dragOver', $event)"
    @drop="emit('drop')"
    @dragend="emit('dragEnd')"
  >
    <div class="flex items-center gap-2">
      <div
        class="border-dark-border h-4 w-4 flex-shrink-0 rounded-sm border"
        :style="{ backgroundColor: layerColor }"
      ></div>

      <span
        class="flex-1 overflow-hidden text-xs text-ellipsis whitespace-nowrap text-white"
      >
        {{ layer.name }}
      </span>

      <div
        class="flex gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
      >
        <BaseButton
          size="sm"
          color="tertiary"
          :disabled="isLast"
          @click.stop="emit('moveUp', layer.id)"
          title="前面へ"
        >
          ↑
        </BaseButton>
        <BaseButton
          size="sm"
          color="tertiary"
          :disabled="isFirst"
          @click.stop="emit('moveDown', layer.id)"
          title="背面へ"
        >
          ↓
        </BaseButton>
        <BaseButton
          size="sm"
          color="danger"
          @click.stop="emit('delete', layer.id)"
          title="削除"
        >
          ×
        </BaseButton>
      </div>
    </div>
  </div>
</template>
