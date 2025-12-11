<script lang="ts" setup>
import { computed } from 'vue';
import BaseButton from '@/components/common/BaseButton.vue';
import BaseSection from '@/components/common/BaseSection.vue';
import ColorPicker from './ColorPicker.vue';
import SizeSelector from './SizeSelector.vue';
import useImageStore from '@/stores/useImageStore';
import { useShapeColor } from '@/composables/editor/useShapeColor';
import { useDrawingMode } from '@/composables/editor/useDrawingMode';
import { useSettings } from '@/composables/editor/useSettings';

const emit = defineEmits<{
  openImageSourceModal: [];
  saveImage: [];
  copyImage: [];
  addRectangle: [];
  addArrow: [];
  addText: [];
}>();

// Stores and composables
const { imageUrl } = useImageStore();
const { rectangleColor, arrowColor, textColor, setRectangleColor, setArrowColor, setTextColor } =
  useShapeColor();
const { drawingMode, toggleDrawingMode } = useDrawingMode();
const { settings, updateSetting } = useSettings();

const targetWidth = computed({
  get: () => settings.value.targetWidth,
  set: (value: number | 'original') => updateSetting('targetWidth', value),
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

      <SizeSelector v-model="targetWidth" />

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
