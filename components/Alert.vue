<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import IconCross from '~/components/icons/IconCross.vue';
import { getCookie, setCookie } from '~/utilities/cookie';

type Props = {
  dismissId?: string
};
const props = defineProps<Props>();

const isDismissed = ref(false);

onMounted(() => {
  if (props.dismissId) {
    const dismissedAlerts = JSON.parse(getCookie('dismissedAlerts') || '[]');
    isDismissed.value = dismissedAlerts.includes(props.dismissId);
  }
});

const dismissAlert = () => {
  if (props.dismissId) {
    const dismissedAlerts = JSON.parse(getCookie('dismissedAlerts') || '[]');
    if (!dismissedAlerts.includes(props.dismissId)) {
      dismissedAlerts.push(props.dismissId);
      setCookie('dismissedAlerts', JSON.stringify(dismissedAlerts));
      isDismissed.value = true;
    }
  }
};
</script>

<template>
  <div v-if="!isDismissed" class="alert">
    <div class="icon">
      <slot name="icon"></slot>
    </div>

    <slot></slot>

    <button title="don't show this message again" v-if="props.dismissId" @click="dismissAlert" class="dismiss button-icon button-secondary">
      <IconCross />
    </button>
  </div>
</template>

<style scoped>
.alert {
  width: 100%;
  max-width: fit-content;
  font-size: 14px;
  display: flex;
  gap: var(--spacing-1);
  align-items: start;
  background-color: var(--bg-surface-light);
  border: 2px solid var(--on-surface);
  border-radius: 4px;
  padding: var(--spacing-1);
  line-height: 1.5;
}
.icon {
  vertical-align: middle;
  height: 1.5em;
  width: 1.5em;
  margin-inline-end: .5em;
  padding: 4px;
  box-sizing: content-box;
}
.dismiss {
  margin-inline-start: auto;
}
</style>