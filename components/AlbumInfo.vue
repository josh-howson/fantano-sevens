<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import type { Album, ShuffleStatus } from '~/types/Album';
import IconGenre from '~/components/icons/IconGenre.vue';

const props = defineProps<{
  album: Album;
  shuffleStatus: ShuffleStatus;
}>();

const emit = defineEmits<{
  (e: 'flip'): void;
}>();

const albumCoverRef = ref<HTMLElement | null>(null);
let animationFrameId: number;
let accumulatedRotation = 0;
let lastAngle = 0;

function detectRotation() {
  if (!albumCoverRef.value) return;

  const matrix = window.getComputedStyle(albumCoverRef.value).transform;
  const angle = getRotationAngle(matrix);

  const angleDifference = angle - lastAngle;
  if (!isNaN(angleDifference)) {
    accumulatedRotation += angleDifference;
  }

  const flipThreshold = 180;
  if (Math.abs(accumulatedRotation) >= flipThreshold) {
    emit('flip');
    accumulatedRotation %= flipThreshold;
  }

  lastAngle = angle;
  animationFrameId = requestAnimationFrame(detectRotation);
}

function getRotationAngle(matrix: string): number {
  if (!matrix || matrix === 'none') return 0;

  const values = matrix.split('(')[1].split(')')[0].split(',');
  const m21 = parseFloat(values[4]);
  const m22 = parseFloat(values[5]);

  return Math.round(Math.atan2(m21, m22) * (180 / Math.PI)) % 360;
}

watch(
  () => props.shuffleStatus,
  (newStatus) => {
    if (newStatus === 'shuffling') {
      if (albumCoverRef.value) {
        lastAngle = getRotationAngle(window.getComputedStyle(albumCoverRef.value).transform);
        accumulatedRotation = 0;
        detectRotation();
      }
    } else {
      cancelAnimationFrame(animationFrameId);
    }
  },
  { immediate: true }
);

// Start detection if shuffling when the component mounts
onMounted(() => {
  if (props.shuffleStatus === 'shuffling') {
    if (albumCoverRef.value) {
      lastAngle = getRotationAngle(window.getComputedStyle(albumCoverRef.value).transform);
      accumulatedRotation = 0;
      detectRotation();
    }
  }
});

onUnmounted(() => {
  cancelAnimationFrame(animationFrameId);
});
</script>

<template>
  <div class="album-info">
    <div :class="['stats-top', shuffleStatus === 'picked' && 'picked']">
      <div>{{ new Date(album.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) }}</div>

      <div class="genre">
        <IconGenre />

        <span>{{ album.genre }}</span>
      </div>
    </div>

    <div
      :class="[
        'album-cover',
        shuffleStatus === 'shuffling' && 'shuffle',
        shuffleStatus === 'picked' && 'picked',
      ]"
      ref="albumCoverRef"
    >
      <img :src="album?.spotifyAlbum?.images[1].url" />

      <div :class="['fantano-score', shuffleStatus === 'picked' && 'picked']">fantano {{ album.score }}</div>
    </div>

    <div class="album-text">
      <div class="artist">{{ album.artist }}</div>

      <div class="title">{{ album.title }}</div>
    </div>
  </div>
</template>

<style scoped>
.album-info {
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  perspective: 80vh;
  padding: 0 var(--spacing-1);
  width: 100%;
  max-width: 400px;
}

.stats-top {
  display: flex;
  align-items: center;
  flex-flow: row wrap;
  justify-content: space-between;
  width: 100%;
  font-size: 12px;
  padding: 8px;
}

.stats-top > * {
  scale: 0;
  transition: all var(--transition-duration) var(--easing);
}

.stats-top.picked > * {
  scale: 1;
}

.stats-top .genre {
  display: flex;
  align-items: center;
  gap: 4px;
  text-transform: lowercase;
}

.album-cover {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  transition: all var(--transition-duration) var(--easing);
}

.album-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid var(--on-surface);
  transition: transform var(--transition-duration);
  transform-style: preserve-3d;
}

.shuffle {
  animation: spinTopToBottom var(--shuffle-duration) ease-in-out;
  scale: .8;
}

.fantano-score {
  position: absolute;
  right: 0;
  bottom: 0;
  display: inline-block;
  border-radius: 4px;
  padding: 2px 6px;
  margin: 8px;
  font-size: 12px;
  font-weight: bold;
  background: var(--bg-surface-light);
  color: var(--on-surface);
  border: 2px solid var(--on-surface);
  scale: var(--enter-scale);
  opacity: 0;
  transition: all var(--transition-duration) var(--easing);
}

.fantano-score.picked {
  scale: 1;
  opacity: 1;
}

.album-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  text-align: center;
  padding: 16px;
  text-transform: initial;
}

.title {
  font-size: 20px;
  font-weight: bold;
}

.artist {
  font-size: 16px;
}

.album-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-1);
}

@keyframes spinTopToBottom {
  0% {
    transform: rotateX(0deg);
  }

  100% {
    transform: rotateX(-1800deg);
  }
}

@media (max-height: 700px) {
  .album-info {
    max-width: 300px;
  }
}
</style>