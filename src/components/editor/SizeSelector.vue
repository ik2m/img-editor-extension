<script lang="ts" setup>
import { computed } from 'vue';
import { Dropdown } from 'floating-vue';
import BaseButton from '@/components/common/BaseButton.vue';

const props = defineProps<{
  modelValue: number | 'original';
}>();

const emit = defineEmits<{
  'update:modelValue': [value: number | 'original'];
}>();

const sizeOptions = [
  { label: '元画像', value: 'original' as const },
  { label: '640px', value: 640 },
  { label: '1080px', value: 1080 },
  { label: '1920px', value: 1920 },
];

const selectedLabel = computed(() => {
  const option = sizeOptions.find((opt) => opt.value === props.modelValue);
  return option ? option.label : '元画像';
});

const handleSelect = (value: number | 'original', hide: () => void) => {
  emit('update:modelValue', value);
  hide();
};
</script>

<template>
  <Dropdown :distance="6" :popper-triggers="['click']">
    <BaseButton color="tertiary">
      <div class="flex items-center justify-between gap-2">
        <span>{{ selectedLabel }}</span>
        <span class="text-dark-muted text-xs">▼</span>
      </div>
    </BaseButton>

    <template #popper="{ hide }">
      <div
        class="bg-dark-elevated border-dark-border flex flex-col overflow-hidden rounded border shadow-lg"
      >
        <button
          v-for="option in sizeOptions"
          :key="String(option.value)"
          @click="handleSelect(option.value, hide)"
          class="px-4 py-2.5 text-left text-sm transition-colors whitespace-nowrap"
          :class="
            modelValue === option.value
              ? 'bg-dark-hover font-medium text-white'
              : 'text-dark-muted hover:bg-dark-hover/50 hover:text-white'
          "
        >
          {{ option.label }}
        </button>
      </div>
    </template>
  </Dropdown>
</template>
