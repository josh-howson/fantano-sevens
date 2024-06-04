<script setup lang="ts">
import IconChevronLeft from '~/components/icons/IconChevronLeft.vue';

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const minRating = defineModel({ default: 7 });

const handleBack = () => {
  emit('close');
};
</script>

<template>
  <div class="page-layout">
    <div class="settings">
      <button class="view-back icon-link-button" @click="handleBack"><IconChevronLeft />back</button>

      <h1 class="view-heading">
        <span>preferences</span>
      </h1>
      
      <div class="setting-panel">
        <div>
          <h2 class="heading">minimum score</h2>

          <p>{{ minRating === 0 ? 'get reviews with any rating.' : `only get reviews tony rated a ${minRating < 10 ? `${minRating} or higher` : '10'}.` }}</p>
        </div>

        <MinimumScore v-model="minRating" />
      </div>

    </div>
  </div>
</template>

<style scoped>
.settings {
  width: 100%;
  max-width: var(--max-content-width);
}

.setting-panel {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: var(--spacing-1);
  background: var(--bg-surface-light);
  padding: var(--spacing-1);
  border-radius: 12px;
  border: 2px solid var(--on-surface);
}

.min-rating {
  display: flex;
  gap: var(--spacing-1);
}

.min-rating p {
  margin: 0;
}

.heading {
  font-weight: bold;
  font-size: 16px;
}
</style>
