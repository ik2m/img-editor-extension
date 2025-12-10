<script lang="ts" setup>
defineProps<{
  modelValue: number | 'original';
}>();

const emit = defineEmits<{
  'update:modelValue': [value: number | 'original'];
}>();

const sizeOptions = [
  { label: '↔ 元画像', value: 'original' },
  { label: '↔ 640px', value: 640 },
  { label: '↔ 1080px', value: 1080 },
  { label: '↔ 1920px', value: 1920 },
];
</script>

<template>
  <select
    :value="modelValue"
    @change="
      emit(
        'update:modelValue',
        ($event.target as HTMLSelectElement).value === 'original'
          ? 'original'
          : Number(($event.target as HTMLSelectElement).value)
      )
    "
    class="border-dark-border bg-dark-panel hover:bg-dark-hover rounded border px-2 py-2 text-sm transition-colors"
  >
    <option v-for="option in sizeOptions" :key="String(option.value)" :value="option.value">
      {{ option.label }}
    </option>
  </select>
</template>
