<script lang="ts" setup>
import BaseButton from '@/components/BaseButton.vue';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  close: [];
  openFile: [];
  openClipboard: [];
}>();

const handleOpenFile = () => {
  emit('openFile');
  emit('close');
};

const handleOpenClipboard = () => {
  emit('openClipboard');
  emit('close');
};

const handleBackdropClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    emit('close');
  }
};
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    @click="handleBackdropClick"
  >
    <div
      class="bg-dark-panel border-dark-border w-full max-w-md rounded-lg border p-6 shadow-lg"
    >
      <h2 class="mb-6 text-xl font-bold text-white">画像を読み込む</h2>

      <div class="flex flex-col gap-4">
        <BaseButton variant="primary" @click="handleOpenFile">
          ファイルから画像を開く
        </BaseButton>

        <BaseButton variant="secondary" @click="handleOpenClipboard">
          クリップボードの画像を開く
        </BaseButton>

        <BaseButton variant="secondary" @click="emit('close')">
          キャンセル
        </BaseButton>
      </div>
    </div>
  </div>
</template>
