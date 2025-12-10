<script lang="ts" setup>
import BaseButton from '@/components/BaseButton.vue';
import BaseSection from '@/components/BaseSection.vue';

defineProps<{
  imageUrl: string;
  drawingMode: boolean;
}>();

const emit = defineEmits<{
  uploadImage: [file: File];
  resizeImage: [];
  addRectangle: [];
  addArrow: [];
  toggleDrawingMode: [];
}>();

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    emit('uploadImage', file);
  }
};
</script>

<template>
  <aside
    class="w-sidebar bg-dark-panel border-dark-border overflow-y-auto border-r p-4"
  >
    <BaseSection title="ファイル">
      <input
        type="file"
        accept="image/*"
        @change="handleFileChange"
        id="file-input"
        class="hidden"
      />
      <label
        for="file-input"
        class="bg-dark-border mb-2 block w-full cursor-pointer rounded border-none px-4 py-2 text-center text-white transition-colors duration-200 hover:bg-[#4d4d4d]"
        >画像を開く</label
      >
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
    </BaseSection>
  </aside>
</template>
