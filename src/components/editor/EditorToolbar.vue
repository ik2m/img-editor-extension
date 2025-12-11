<script lang="ts" setup>
import { computed } from 'vue';
import BaseButton from '@/components/common/BaseButton.vue';
import BaseSection from '@/components/common/BaseSection.vue';
import ColorPicker from './ColorPicker.vue';
import SizeSelector from './SizeSelector.vue';
import useImageStore from '@/stores/useImageStore';
import useSettingsStore from '@/stores/useSettingsStore';
import useDrawingStore from '@/stores/useDrawingStore';

const emit = defineEmits<{
  openImageSourceModal: [];
  saveImage: [];
  copyImage: [];
  addRectangle: [];
  addArrow: [];
  addText: [];
}>();

// Stores
const { imageUrl } = useImageStore();
const {
  rectangleColor,
  arrowColor,
  textColor,
  targetWidth,
  setRectangleColor,
  setArrowColor,
  setTextColor,
  setTargetWidth,
} = useSettingsStore();
const { drawingMode, toggleDrawingMode } = useDrawingStore();

const targetWidthModel = computed({
  get: () => targetWidth.value,
  set: (value: number | 'original') => setTargetWidth(value),
});
</script>

<template>
  <aside
    class="w-sidebar bg-dark-panel border-dark-border flex flex-col overflow-y-auto border-r p-4"
  >
    <BaseSection title="ファイル">
      <BaseButton color="primary" @click="emit('openImageSourceModal')">
        📁 画像を開く
      </BaseButton>

      <SizeSelector v-model="targetWidthModel" />

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
        @click="toggleDrawingMode"
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
        <ColorPicker :selected-color="textColor" @select-color="setTextColor" />
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
          @select-color="setRectangleColor"
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
        <ColorPicker :selected-color="arrowColor" @select-color="setArrowColor" />
      </div>
    </BaseSection>
  </aside>
</template>
