<script lang="ts" setup>
import { ref, watch } from 'vue';
import BaseButton from '@/components/common/BaseButton.vue';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  close: [];
  openFile: [];
  openClipboardImage: [blob: Blob];
}>();

interface ClipboardImageItem {
  blob: Blob;
  url: string;
}

const clipboardImages = ref<ClipboardImageItem[]>([]);
const isLoadingClipboard = ref(false);

watch(
  () => props.isOpen,
  async (isOpen) => {
    if (isOpen) {
      await loadClipboardImages();
    } else {
      // Clean up URLs when modal closes
      clipboardImages.value.forEach((item) => URL.revokeObjectURL(item.url));
      clipboardImages.value = [];
    }
  }
);

const loadClipboardImages = async () => {
  isLoadingClipboard.value = true;
  clipboardImages.value = [];

  try {
    const clipboardItems = await navigator.clipboard.read();
    for (const item of clipboardItems) {
      const imageTypes = item.types.filter((type) => type.startsWith('image/'));
      for (const imageType of imageTypes) {
        const blob = await item.getType(imageType);
        const url = URL.createObjectURL(blob);
        clipboardImages.value.push({ blob, url });
      }
    }
  } catch (error) {
    console.error('クリップボードの読み込みに失敗しました:', error);
  } finally {
    isLoadingClipboard.value = false;
  }
};

const handleOpenFile = () => {
  emit('openFile');
  emit('close');
};

const handleSelectClipboardImage = (item: ClipboardImageItem) => {
  emit('openClipboardImage', item.blob);
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
      class="bg-dark-panel border-dark-border w-full max-w-2xl rounded-lg border p-6 shadow-lg"
    >
      <h2 class="mb-6 text-xl font-bold text-white">画像を読み込む</h2>

      <div class="flex flex-col gap-6">
        <!-- File button -->
        <div>
          <BaseButton color="primary" @click="handleOpenFile" class="w-full">
            ファイルから画像を開く
          </BaseButton>
        </div>

        <!-- Clipboard images section -->
        <div>
          <div class="mb-3 flex items-center justify-between">
            <h3 class="text-dark-text text-sm font-semibold">
              クリップボードから選択
            </h3>
            <button
              @click="loadClipboardImages"
              :disabled="isLoadingClipboard"
              class="hover:bg-dark-elevated text-dark-text disabled:opacity-50 rounded px-3 py-1 text-xs transition-colors duration-200 hover:text-white disabled:cursor-not-allowed"
              title="クリップボードを再読み込み"
            >
              🔄 リロード
            </button>
          </div>

          <div v-if="isLoadingClipboard" class="text-dark-text py-8 text-center">
            読み込み中...
          </div>

          <div
            v-else-if="clipboardImages.length === 0"
            class="text-dark-text border-dark-border rounded border border-dashed py-8 text-center text-sm"
          >
            クリップボードに画像がありません
          </div>

          <div v-else class="grid grid-cols-3 gap-3">
            <button
              v-for="(item, index) in clipboardImages"
              :key="index"
              @click="handleSelectClipboardImage(item)"
              class="border-dark-border hover:border-primary aspect-square overflow-hidden rounded border transition-all duration-200 hover:scale-105"
            >
              <img
                :src="item.url"
                :alt="`クリップボード画像 ${index + 1}`"
                class="h-full w-full object-cover"
              />
            </button>
          </div>
        </div>

        <!-- Cancel button -->
        <BaseButton color="tertiary" @click="emit('close')" class="w-full">
          キャンセル
        </BaseButton>
      </div>
    </div>
  </div>
</template>
