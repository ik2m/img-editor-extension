<script lang="ts" setup>
import BaseButton from '@/components/common/BaseButton.vue';
import BaseSection from '@/components/common/BaseSection.vue';

defineProps<{
  imageUrl: string;
  drawingMode: boolean;
  textMode: boolean;
}>();

const emit = defineEmits<{
  openImageSourceModal: [];
  resizeImage: [];
  saveImage: [];
  copyImage: [];
  addRectangle: [];
  addArrow: [];
  toggleDrawingMode: [];
  toggleTextMode: [];
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
      <BaseButton :disabled="!imageUrl" @click="emit('resizeImage')">
        🔍 リサイズ (840px)
      </BaseButton>
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
      <BaseButton
        :color="textMode ? 'primary' : 'tertiary'"
        :disabled="!imageUrl"
        @click="emit('toggleTextMode')"
      >
        A {{ textMode ? 'テキスト (ON)' : 'テキスト' }}
      </BaseButton>
      <BaseButton :disabled="!imageUrl" @click="emit('addRectangle')">
        ▭ 矩形
      </BaseButton>
      <BaseButton :disabled="!imageUrl" @click="emit('addArrow')">
        ➜ 矢印
      </BaseButton>
    </BaseSection>
  </aside>
</template>
