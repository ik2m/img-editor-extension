<script lang="ts" setup>
import ColorPicker from './ColorPicker.vue';

const props = withDefaults(
  defineProps<{
    label: string;
    value?: number;
    color?: string;
    unit?: string;
    decreaseTitle?: string;
    increaseTitle?: string;
    step?: number;
  }>(),
  {
    unit: 'px',
    decreaseTitle: '値を小さく',
    increaseTitle: '値を大きく',
    step: 2,
  }
);

const emit = defineEmits<{
  change: [delta: number];
  colorChange: [color: string];
}>();

const handleDecrease = () => {
  emit('change', -props.step);
};

const handleIncrease = () => {
  emit('change', props.step);
};

const handleColorChange = (color: string) => {
  emit('colorChange', color);
};
</script>

<template>
  <div class="fixed bottom-6 left-1/2 -translate-x-1/2 transform">
    <div
      class="bg-dark-elevated border-dark-border flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg"
    >
      <div class="text-dark-text text-xs font-semibold">{{ label }}</div>

      <!-- 数値コントロール -->
      <template v-if="value !== undefined">
        <button
          @click="handleDecrease"
          class="bg-dark-panel hover:bg-dark-elevated border-dark-border flex h-9 w-9 items-center justify-center rounded border transition-colors"
          :title="decreaseTitle"
        >
          <span class="text-lg">−</span>
        </button>
        <div class="text-dark-text min-w-[60px] text-center text-sm font-medium">
          {{ value }}{{ unit }}
        </div>
        <button
          @click="handleIncrease"
          class="bg-dark-panel hover:bg-dark-elevated border-dark-border flex h-9 w-9 items-center justify-center rounded border transition-colors"
          :title="increaseTitle"
        >
          <span class="text-lg">+</span>
        </button>
      </template>

      <!-- 色選択コントロール -->
      <template v-if="color !== undefined">
        <ColorPicker
          :selected-color="color"
          @select-color="handleColorChange"
        />
      </template>
    </div>
  </div>
</template>
