<script lang="ts" setup>
import { ref } from 'vue';

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

const isOpen = ref(false);

const togglePicker = () => {
  isOpen.value = !isOpen.value;
};

const selectColor = (color: string) => {
  emit('selectColor', color);
  isOpen.value = false;
};

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (!target.closest('.color-picker-container')) {
    isOpen.value = false;
  }
};
</script>

<template>
  <div class="color-picker-container relative" @click.stop>
    <button
      @click="togglePicker"
      class="border-dark-border h-8 w-8 rounded-full border transition-all duration-200 hover:scale-110"
      :style="{ backgroundColor: selectedColor }"
      title="色を選択"
    ></button>

    <div
      v-if="isOpen"
      class="bg-dark-panel border-dark-border absolute left-0 top-10 z-10 rounded border p-2 shadow-lg"
      @click.stop
    >
      <div class="flex gap-2">
        <button
          v-for="color in colors"
          :key="color.value"
          @click="selectColor(color.value)"
          class="border-dark-border h-8 w-8 rounded-full border transition-all duration-200 hover:scale-110"
          :class="{ 'ring-2 ring-primary': selectedColor === color.value }"
          :style="{ backgroundColor: color.value }"
          :title="color.name"
        ></button>
      </div>
    </div>
  </div>

  <teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[5]"
      @click="isOpen = false"
    ></div>
  </teleport>
</template>
