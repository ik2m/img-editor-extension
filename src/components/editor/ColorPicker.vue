<script lang="ts" setup>
import { Dropdown } from 'floating-vue';

defineProps<{
  selectedColor: string;
}>();

const emit = defineEmits<{
  selectColor: [color: string];
}>();

const colors = [
  { name: '赤', value: '#ff0000' },
  { name: '青', value: '#0000ff' },
  { name: '緑', value: '#00ff00' },
];
</script>

<template>
  <Dropdown :distance="6">
    <button
      class="border-dark-border h-6 w-6 rounded-full border transition-all duration-200 hover:scale-110"
      :style="{ backgroundColor: selectedColor }"
      title="色を選択"
    ></button>

    <template #popper="{ hide }">
      <div class="flex gap-2 p-2">
        <button
          v-for="color in colors"
          :key="color.value"
          @click="emit('selectColor', color.value); hide()"
          class="border-dark-border h-6 w-6 rounded-full border transition-all duration-200 hover:scale-110"
          :class="{ 'ring-2 ring-primary': selectedColor === color.value }"
          :style="{ backgroundColor: color.value }"
          :title="color.name"
        ></button>
      </div>
    </template>
  </Dropdown>
</template>
