<script lang="ts" setup>
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'icon' | 'label';
    danger?: boolean;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
  }>(),
  {
    variant: 'primary',
    danger: false,
    disabled: false,
    type: 'button',
  }
);

const colorCls = computed(() => {
  let result =
    props.variant === 'primary'
      ? 'bg-primary hover:bg-primary-hover disabled:bg-dark-elevated disabled:text-dark-muted font-semibold'
      : 'bg-dark-border hover:bg-[#4d4d4d] disabled:opacity-30';

  if (props.danger && props.variant === 'icon') {
    result += 'text-danger hover:bg-danger hover:text-white';
  }
  return result;
});

const sizeCls = computed(() => {
  return props.variant === 'icon'
    ? 'px-2 py-1 text-xs rounded-sm'
    : 'px-4 py-2 text-base mb-2';
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
