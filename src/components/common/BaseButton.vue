<script lang="ts" setup>
import { computed } from 'vue';

interface Props {
  variant?: 'primary' | 'secondary' | 'icon' | 'label';
  danger?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  danger: false,
  disabled: false,
  type: 'button',
});

const baseClasses =
  'block w-full cursor-pointer rounded border-none text-white transition-colors duration-200 disabled:cursor-not-allowed';

const variantClasses = computed(() => {
  const classes: Record<string, string> = {
    primary:
      'bg-primary hover:bg-primary-hover disabled:bg-dark-elevated disabled:text-dark-muted px-4 py-2 text-base font-semibold mb-2',
    secondary:
      'bg-dark-border hover:bg-[#4d4d4d] disabled:opacity-30 px-4 py-2 text-base mb-2',
    icon: 'bg-dark-border hover:bg-[#4d4d4d] disabled:opacity-30 px-2 py-1 text-xs rounded-sm',
    label: 'bg-dark-border hover:bg-[#4d4d4d] px-4 py-2 text-base mb-2',
  };

  let result = classes[props.variant];

  // dangerプロパティがtrueの場合、削除ボタン用スタイルを追加
  if (props.danger && props.variant === 'icon') {
    result += ' text-danger hover:bg-danger hover:text-white';
  }

  return result;
});
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="[baseClasses, variantClasses, $attrs.class]"
    v-bind="$attrs"
  >
    <slot />
  </button>
</template>
