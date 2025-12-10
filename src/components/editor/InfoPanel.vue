<script lang="ts" setup>
defineProps<{
  width: number;
  height: number;
}>();
</script>

<template>
  <div
    v-if="width > 0 && height > 0"
    class="fixed bottom-4 left-4 px-2 py-1 text-xs text-gray-400"
  >
    {{ width }} × {{ height }}px
  </div>
</template>
