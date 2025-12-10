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
    return props.layer.stroke;
  } else if (isTextShape(props.layer)) {
    return props.layer.fill;
  }
  return '#000000';
});
</script>

<template>
  <div
    :class="[
      'bg-dark-bg group rounded border p-2 transition-all duration-200',
      selected
        ? 'bg-dark-elevated border-primary'
        : 'border-dark-border hover:bg-dark-elevated',
      isBeingDragged ? 'opacity-50' : 'opacity-100',
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
        class="border-dark-border h-5 w-5 flex-shrink-0 rounded-sm border"
        :style="{ backgroundColor: layerColor }"
      ></div>

      <span
        class="flex-1 overflow-hidden text-sm text-ellipsis whitespace-nowrap text-white"
      >
        {{ layer.name }}
      </span>

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
