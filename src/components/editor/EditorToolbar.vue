<script lang="ts" setup>
import BaseButton from '@/components/common/BaseButton.vue';
import BaseSection from '@/components/common/BaseSection.vue';
import ColorPicker from './ColorPicker.vue';
import SizeSelector from './SizeSelector.vue';

defineProps<{
  imageUrl: string;
  drawingMode: boolean;
  rectangleColor: string;
  arrowColor: string;
  textColor: string;
  targetWidth: number | 'original';
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
  selectTargetWidth: [width: number | 'original'];
}>();
</script>

<template>
  <aside
    class="w-sidebar bg-dark-panel border-dark-border flex flex-col overflow-y-auto border-r p-4"
  >
    <BaseSection title="ファイル">
      <BaseButton color="primary" @click="emit('openImageSourceModal')">
        📁 画像を開く
      </BaseButton>

      <SizeSelector
        :model-value="targetWidth"
        @update:model-value="emit('selectTargetWidth', $event)"
      />

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
