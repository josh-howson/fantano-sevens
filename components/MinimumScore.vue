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
    <span>Fantano minimum: </span>
    <div class="number-range">
      <button @click="handleDecrement" :disabled="minimumScore <= range[0]">-</button>
      {{ minimumScore < range[1] ? `${minimumScore}+` : minimumScore }} <button @click="handleIncrement"
        :disabled="minimumScore >= range[1]">+</button>
    </div>
  </div>
</template>

<style scoped>
.minimum-score {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  margin-top: var(--spacing-1);
}

.number-range {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-1);
}
</style>
