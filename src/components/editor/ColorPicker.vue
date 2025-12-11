<script lang="ts" setup>
import { Dropdown } from 'floating-vue';

defineProps<{
  selectedColor: string;
}>();

const emit = defineEmits<{
  selectColor: [color: string];
}>();

const colors = [
  { name: '赤', value: '#FF3333' },
  { name: '青', value: '#213FFF' },
  { name: '緑', value: '#33FF33' },
];
</script>

<template>
  <Dropdown :distance="6">
    <button
      class="h-8 w-8 rounded-full border-2 border-white shadow-lg transition-all duration-200 hover:scale-110"
      :style="{ backgroundColor: selectedColor }"
      title="色を選択"
    ></button>

    <template #popper="{ hide }">
      <div class="flex gap-2 p-2">
        <button
          v-for="color in colors"
          :key="color.value"
          @click="emit('selectColor', color.value); hide()"
          class="h-8 w-8 rounded-full border-2 border-white shadow-lg transition-all duration-200 hover:scale-110"
          :class="{ 'ring-2 ring-offset-2 ring-white': selectedColor === color.value }"
          :style="{ backgroundColor: color.value }"
          :title="color.name"
        ></button>
      </div>
    </template>
  </Dropdown>
</template>
