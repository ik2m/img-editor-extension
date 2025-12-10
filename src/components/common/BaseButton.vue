<script lang="ts" setup>
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    size?: 'md' | 'sm';
    color?: 'primary' | 'secondary' | 'danger';
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
  }>(),
  {
    size: 'md',
    color: 'primary',
    disabled: false,
    type: 'button',
  }
);

const colorCls = computed(() => {
  const map = {
    primary:
      'bg-primary hover:bg-primary-hover disabled:bg-dark-elevated disabled:text-dark-muted font-semibold',
    secondary: 'bg-dark-border hover:bg-[#4d4d4d] disabled:opacity-30',
    danger: 'bg-danger hover:bg-danger-hover text-white disabled:opacity-30',
  };
  return map[props.color];
});

const sizeCls = computed(() => {
  const map = {
    md: 'px-4 py-2 text-base mb-2',
    sm: 'px-2 py-1 text-xs rounded-sm',
  };
  return map[props.size];
});
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    class="block w-full cursor-pointer rounded border-none text-white transition-colors duration-200 disabled:cursor-not-allowed"
    :class="[colorCls, sizeCls]"
  >
    <slot />
  </button>
</template>
