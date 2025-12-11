<script lang="ts" setup>
import { ref, watch, computed } from 'vue';
import { VueFinalModal } from 'vue-final-modal';
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

const open = computed({
  get: () => props.isOpen,
  set: (value) => {
    if (!value) emit('close');
  },
});

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

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    handleSubmit();
  }
};
</script>

<template>
  <VueFinalModal
    v-model="open"
    class="flex items-center justify-center"
    content-class="bg-dark-panel border-dark-border w-full max-w-md rounded-lg border p-6 shadow-lg"
    overlay-transition="vfm-fade"
    content-transition="vfm-fade"
  >
    <h2 class="mb-4 text-xl font-bold text-white">テキストを入力</h2>

    <input
      ref="inputRef"
      v-model="inputText"
      type="text"
      class="bg-dark-bg border-dark-border focus:border-primary mb-6 w-full rounded border px-4 py-2 text-white outline-none"
      placeholder="テキストを入力してください"
      @keydown="handleKeydown"
    />

    <div class="flex gap-4">
      <BaseButton color="primary" @click="handleSubmit" class="flex-1">
        OK
      </BaseButton>

      <BaseButton color="tertiary" @click="open = false" class="flex-1">
        キャンセル
      </BaseButton>
    </div>
  </VueFinalModal>
</template>
