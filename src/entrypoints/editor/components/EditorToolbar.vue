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
  <aside class="w-sidebar bg-dark-panel border-r border-dark-border p-4 overflow-y-auto">
    <div class="mb-8">
      <h3 class="mt-0 mb-4 text-base text-dark-text">ファイル</h3>
      <input
        type="file"
        accept="image/*"
        @change="handleFileChange"
        id="file-input"
        class="hidden"
      />
      <label for="file-input" class="block w-full py-2 px-4 mb-2 bg-dark-border text-white border-none rounded cursor-pointer text-center transition-colors duration-200 hover:bg-[#4d4d4d]">画像を開く</label>
    </div>

    <div class="mb-8">
      <h3 class="mt-0 mb-4 text-base text-dark-text">リサイズ</h3>
      <button
        class="block w-full py-2 px-4 mb-2 bg-primary text-white border-none rounded cursor-pointer text-center transition-colors duration-200 font-semibold hover:bg-primary-hover disabled:bg-dark-elevated disabled:text-dark-muted disabled:cursor-not-allowed"
        @click="emit('resizeImage')"
        :disabled="!imageUrl"
      >
        max-width: 840pxにリサイズ
      </button>
    </div>

    <div class="mb-8">
      <h3 class="mt-0 mb-4 text-base text-dark-text">図形</h3>
      <button
        class="block w-full py-2 px-4 mb-2 bg-dark-border text-white border-none rounded cursor-pointer text-center transition-colors duration-200 hover:bg-[#4d4d4d] disabled:bg-dark-elevated disabled:text-dark-muted disabled:cursor-not-allowed"
        @click="emit('addRectangle')"
        :disabled="!imageUrl"
      >
        矩形を追加
      </button>
    </div>

    <div class="mb-8">
      <h3 class="mt-0 mb-4 text-base text-dark-text">編集ツール</h3>
      <button class="block w-full py-2 px-4 mb-2 bg-dark-border text-white border-none rounded cursor-pointer text-center transition-colors duration-200 hover:bg-[#4d4d4d]">切り抜き</button>
      <button class="block w-full py-2 px-4 mb-2 bg-dark-border text-white border-none rounded cursor-pointer text-center transition-colors duration-200 hover:bg-[#4d4d4d]">リサイズ</button>
      <button class="block w-full py-2 px-4 mb-2 bg-dark-border text-white border-none rounded cursor-pointer text-center transition-colors duration-200 hover:bg-[#4d4d4d]">フィルター</button>
      <button class="block w-full py-2 px-4 mb-2 bg-dark-border text-white border-none rounded cursor-pointer text-center transition-colors duration-200 hover:bg-[#4d4d4d]">回転</button>
    </div>
  </aside>
</template>
