<script lang="ts" setup>
defineProps<{
  title: string;
}>();
</script>

<template>
  <div class="mb-8">
    <h3 class="text-dark-text mt-0 mb-4 text-base">{{ title }}</h3>
    <slot />
  </div>
</template>
