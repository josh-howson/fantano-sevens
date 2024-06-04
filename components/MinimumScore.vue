<script lang="ts" setup>
const range = [0, 10];
const minimumScore = defineModel({ default: 7 });

const setScore = (newScore: number) => {
  if (newScore < range[0]) minimumScore.value = range[0];
  else if (newScore > range[1]) minimumScore.value = range[1];
  else minimumScore.value = newScore;
}

const handleIncrement = () => setScore(minimumScore.value + 1);

const handleDecrement = () => setScore(minimumScore.value - 1);
</script>

<template>
  <div class="minimum-score">
    <button class="button-icon button-secondary" @click="handleDecrement" :disabled="minimumScore <= range[0]" aria-label="decrease minimum">-</button>
    {{ minimumScore < range[1] ? `${minimumScore}+` : minimumScore }} <button class="button-icon button-secondary" @click="handleIncrement"
      :disabled="minimumScore >= range[1]" aria-label="increase minimum">+</button>
  </div>
</template>

<style scoped>
.minimum-score[disabled="true"] {
  transform: scale(var(--enter-scale));
  opacity: 0;
  pointer-events: none;
}

.minimum-score button {
  font-size: 16px;
  --size: 32px;
}

.minimum-score {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-1);
  font-size: 16px;
  font-weight: bold;
  transition: all var(--transition-duration) var(--easing);
  opacity: 1;
}
</style>
