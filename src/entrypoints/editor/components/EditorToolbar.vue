<script lang="ts" setup>
defineProps<{
  imageUrl: string;
}>();

const emit = defineEmits<{
  uploadImage: [file: File];
  resizeImage: [];
  addRectangle: [];
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
    <div class="mb-8">
      <h3 class="text-dark-text mt-0 mb-4 text-base">ファイル</h3>
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
    </div>

    <div class="mb-8">
      <h3 class="text-dark-text mt-0 mb-4 text-base">リサイズ</h3>
      <button
        class="bg-primary hover:bg-primary-hover disabled:bg-dark-elevated disabled:text-dark-muted mb-2 block w-full cursor-pointer rounded border-none px-4 py-2 text-center font-semibold text-white transition-colors duration-200 disabled:cursor-not-allowed"
        @click="emit('resizeImage')"
        :disabled="!imageUrl"
      >
        max-width: 840pxにリサイズ
      </button>
    </div>

    <div class="mb-8">
      <h3 class="text-dark-text mt-0 mb-4 text-base">図形</h3>
      <button
        class="bg-dark-border disabled:bg-dark-elevated disabled:text-dark-muted mb-2 block w-full cursor-pointer rounded border-none px-4 py-2 text-center text-white transition-colors duration-200 hover:bg-[#4d4d4d] disabled:cursor-not-allowed"
        @click="emit('addRectangle')"
        :disabled="!imageUrl"
      >
        矩形を追加
      </button>
    </div>
  </aside>
</template>
