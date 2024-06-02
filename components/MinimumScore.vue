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
    <div class="number-range">
      <button class="button-icon button-secondary" @click="handleDecrement" :disabled="minimumScore <= range[0]">-</button>
      {{ minimumScore < range[1] ? `${minimumScore}+` : minimumScore }} <button class="button-icon button-secondary" @click="handleIncrement"
        :disabled="minimumScore >= range[1]">+</button>
    </div>
    <span>fantano minimum</span>
  </div>
</template>

<style scoped>
.minimum-score[disabled="true"] {
  transform: scale(var(--enter-scale));
  opacity: 0;
  pointer-events: none;
}

.minimum-score {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-1);
  font-size: 12px;
  transition: all var(--transition-duration) var(--easing);
  opacity: 1;
}

.minimum-score button {
  font-size: 16px;
  --size: 32px;
}

.number-range {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-1);
  font-size: 16px;
  font-weight: bold;
}
</style>
