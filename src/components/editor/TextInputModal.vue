<script lang="ts" setup>
import { ref, watch } from 'vue';
import BaseButton from '@/components/common/BaseButton.vue';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  close: [];
  submit: [text: string];
}>();

const inputText = ref('');
const inputRef = ref<HTMLInputElement | null>(null);

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      inputText.value = 'テキスト';
      setTimeout(() => {
        inputRef.value?.focus();
        inputRef.value?.select();
      }, 100);
    }
  }
);

const handleSubmit = () => {
  if (inputText.value.trim()) {
    emit('submit', inputText.value);
    emit('close');
  }
};

const handleCancel = () => {
  emit('close');
};

const handleBackdropClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    emit('close');
  }
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    handleSubmit();
  } else if (event.key === 'Escape') {
    handleCancel();
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
      <h2 class="mb-4 text-xl font-bold text-white">テキストを入力</h2>

      <input
        ref="inputRef"
        v-model="inputText"
        type="text"
        class="bg-dark-bg border-dark-border mb-6 w-full rounded border px-4 py-2 text-white outline-none focus:border-primary"
        placeholder="テキストを入力してください"
        @keydown="handleKeydown"
      />

      <div class="flex gap-4">
        <BaseButton color="primary" @click="handleSubmit" class="flex-1">
          OK
        </BaseButton>

        <BaseButton color="tertiary" @click="handleCancel" class="flex-1">
          キャンセル
        </BaseButton>
      </div>
    </div>
  </div>
</template>
