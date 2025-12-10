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
  addRectangle: [];
  addArrow: [];
  toggleDrawingMode: [];
  toggleTextMode: [];
  copyImage: [];
}>();
</script>

<template>
  <aside
    class="w-sidebar bg-dark-panel border-dark-border overflow-y-auto border-r p-4"
  >
    <BaseSection title="ファイル">
      <BaseButton variant="primary" @click="emit('openImageSourceModal')">
        画像を開く
      </BaseButton>
    </BaseSection>

    <BaseSection title="リサイズ">
      <BaseButton
        variant="primary"
        :disabled="!imageUrl"
        @click="emit('resizeImage')"
      >
        max-width: 840pxにリサイズ
      </BaseButton>
    </BaseSection>

    <BaseSection title="図形">
      <BaseButton
        variant="secondary"
        :disabled="!imageUrl"
        @click="emit('addRectangle')"
      >
        矩形を追加
      </BaseButton>
      <BaseButton
        variant="secondary"
        :disabled="!imageUrl"
        @click="emit('addArrow')"
      >
        矢印を追加
      </BaseButton>
      <BaseButton
        :variant="drawingMode ? 'primary' : 'secondary'"
        :disabled="!imageUrl"
        @click="emit('toggleDrawingMode')"
      >
        {{ drawingMode ? '描画中...' : 'ペンツール' }}
      </BaseButton>
      <BaseButton
        :variant="textMode ? 'primary' : 'secondary'"
        :disabled="!imageUrl"
        @click="emit('toggleTextMode')"
      >
        {{ textMode ? 'テキスト入力中...' : 'テキストツール' }}
      </BaseButton>
    </BaseSection>

    <BaseSection title="エクスポート">
      <BaseButton
        variant="primary"
        :disabled="!imageUrl"
        @click="emit('copyImage')"
      >
        クリップボードにコピー
      </BaseButton>
    </BaseSection>
  </aside>
</template>
