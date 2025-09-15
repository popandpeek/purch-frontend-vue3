<template>
  <button
    v-if="!link"
    :class="buttonClasses"
    :disabled="disabled"
    :type="type"
    :data-variant="getVariant()"
    @click="handleClick"
  >
    <span v-if="icon" class="btn__icon">{{ icon }}</span>
    <span class="btn__text">
      <slot />
    </span>
  </button>
  <router-link
    v-else
    :to="to"
    :class="buttonClasses"
    :data-variant="getVariant()"
  >
    <span v-if="icon" class="btn__icon">{{ icon }}</span>
    <span class="btn__text">
      <slot />
    </span>
  </router-link>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'success' | 'ghost' | 'dropdown';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  type?: 'button' | 'submit' | 'reset';
  link?: boolean;
  to?: string;
  mode?: string; // Legacy prop for backward compatibility
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  type: 'button',
  link: false,
  to: '/',
  mode: undefined
});

const emit = defineEmits<{
  click: [event: Event];
}>();

// Map legacy mode prop to new variant system
const getVariant = () => {
  if (props.mode) {
    switch (props.mode) {
      case 'flat': return 'tertiary';
      case 'outline': return 'ghost';
      default: return 'primary';
    }
  }
  return props.variant;
};

const buttonClasses = computed(() => {
  const variant = getVariant();
  return [
    'btn',
    `btn--${variant}`,
    `btn--${props.size}`,
    {
      'btn--disabled': props.disabled,
      'btn--loading': props.loading
    }
  ];
});

const handleClick = (event: Event) => {
  if (!props.disabled && !props.loading) {
    emit('click', event);
  }
};
</script>

<style scoped>
/* Design system styles are imported globally */
</style>
