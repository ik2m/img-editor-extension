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
  const map = {
    primary:
      'bg-primary hover:bg-primary-hover disabled:bg-dark-elevated disabled:text-dark-muted',
    secondary: 'bg-dark-border hover:bg-[#4d4d4d] disabled:opacity-30',
    icon: 'bg-dark-border hover:bg-[#4d4d4d] disabled:opacity-30',
    label: 'bg-dark-border hover:bg-[#4d4d4d]',
  };

  let result = map[props.variant];

  if (props.danger && props.variant === 'icon') {
    result += 'text-danger hover:bg-danger hover:text-white';
  }
  return result;
});

const sizeCls = computed(() => {
  const map = {
    primary: 'px-4 py-2 text-base font-semibold mb-2',
    secondary: 'px-4 py-2 text-base mb-2',
    icon: 'px-2 py-1 text-xs rounded-sm',
    label: 'px-4 py-2 text-base mb-2',
  };
  return map[props.variant];
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
