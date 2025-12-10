<script lang="ts" setup>
import BaseButton from '@/components/common/BaseButton.vue';
import BaseSection from '@/components/common/BaseSection.vue';
import ColorPicker from './ColorPicker.vue';

defineProps<{
  imageUrl: string;
  drawingMode: boolean;
  rectangleColor: string;
  arrowColor: string;
  textColor: string;
  targetWidth: number | null;
}>();

const emit = defineEmits<{
  openImageSourceModal: [];
  saveImage: [];
  copyImage: [];
  addRectangle: [];
  addArrow: [];
  toggleDrawingMode: [];
  addText: [];
  selectRectangleColor: [color: string];
  selectArrowColor: [color: string];
  selectTextColor: [color: string];
  selectTargetWidth: [width: number | null];
}>();

const sizeOptions = [
  { label: '元画像', value: null },
  { label: '640px', value: 640 },
  { label: '1080px', value: 1080 },
  { label: '1920px', value: 1920 },
];
</script>

<template>
  <aside
    class="w-sidebar bg-dark-panel border-dark-border flex flex-col overflow-y-auto border-r p-4"
  >
    <BaseSection title="ファイル">
      <BaseButton color="primary" @click="emit('openImageSourceModal')">
        📁 画像を開く
      </BaseButton>

      <div class="grid grid-cols-2 gap-1">
        <button
          v-for="option in sizeOptions"
          :key="option.value"
          @click="emit('selectTargetWidth', option.value)"
          class="border-dark-border rounded border px-2 py-1 text-xs transition-colors"
          :class="
            targetWidth === option.value
              ? 'bg-primary text-white'
              : 'bg-dark-panel hover:bg-dark-hover'
          "
        >
          {{ option.label }}
        </button>
      </div>

      <div class="flex gap-2">
        <BaseButton :disabled="!imageUrl" @click="emit('saveImage')">
          💾 保存
        </BaseButton>
        <BaseButton
          :disabled="!imageUrl"
          @click="emit('copyImage')"
          title="クリップボードにコピー"
        >
          📋
        </BaseButton>
      </div>
    </BaseSection>

    <BaseSection title="お絵描き">
      <BaseButton
        :color="drawingMode ? 'primary' : 'tertiary'"
        :disabled="!imageUrl"
        @click="emit('toggleDrawingMode')"
      >
        🖊️ {{ drawingMode ? 'ペン (ON)' : 'ペン' }}
      </BaseButton>
    </BaseSection>

    <BaseSection title="図形・テキスト">
      <div class="flex items-center gap-2">
        <BaseButton
          :disabled="!imageUrl || drawingMode"
          @click="emit('addText')"
          class="flex-1"
        >
          A テキスト
        </BaseButton>
        <ColorPicker
          :selected-color="textColor"
          @select-color="emit('selectTextColor', $event)"
        />
      </div>
      <div class="flex items-center gap-2">
        <BaseButton
          :disabled="!imageUrl || drawingMode"
          @click="emit('addRectangle')"
          class="flex-1"
        >
          ▭ 矩形
        </BaseButton>
        <ColorPicker
          :selected-color="rectangleColor"
          @select-color="emit('selectRectangleColor', $event)"
        />
      </div>
      <div class="flex items-center gap-2">
        <BaseButton
          :disabled="!imageUrl || drawingMode"
          @click="emit('addArrow')"
          class="flex-1"
        >
          ➜ 矢印
        </BaseButton>
        <ColorPicker
          :selected-color="arrowColor"
          @select-color="emit('selectArrowColor', $event)"
        />
      </div>
    </BaseSection>
  </aside>
</template>
