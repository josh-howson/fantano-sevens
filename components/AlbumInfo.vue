<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import IconGenre from '~/components/icons/IconGenre.vue';
import type { Album, ShuffleStatus } from '~/types/Album';
import { getAlbumImage } from '~/utilities/album';
import IconChevronLeft from '~/components/icons/IconChevronLeft.vue';
import IconSparkle from '~/components/icons/IconSparkle.vue';

const props = defineProps<{
  album: Album;
  shuffleStatus: ShuffleStatus;
}>();

const emit = defineEmits<{
  (e: 'flip'): void;
}>();

const albumCoverRef = ref<HTMLElement | null>(null);
const overview: Ref<string> = ref('');
const overviewStatus: Ref<'not-fetched' | 'fetching' | 'fetched'> = ref('not-fetched');
const isOverviewOpen: Ref<boolean> = ref(false);
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

const getOverview = async () => {
  overviewStatus.value = 'fetching';
  try {
    const response = await fetch(`/api/albumOverview`, {
      method: 'POST',
      body: JSON.stringify(props.album),
    });
    overview.value = await response.json();
    overviewStatus.value = 'fetched'
  } catch (error) {
    console.error(error);
    overviewStatus.value = 'not-fetched';
  }
}

const openOverview = () => {
  if (overviewStatus.value === 'not-fetched') getOverview();
  if (props.shuffleStatus === 'picked') {
    isOverviewOpen.value = true;
  }
}

const closeOverview = () => {
  isOverviewOpen.value = false;
}

const resetOverview = () => {
  overview.value = '';
  overviewStatus.value = 'not-fetched';
  isOverviewOpen.value = false;
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
      // clear overview
      resetOverview();
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
      <div>{{ new Date(album.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }).toLocaleLowerCase() }}</div>

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
        isOverviewOpen && 'overview-open',
        overviewStatus === 'fetching' && 'overview-fetching',
        overviewStatus === 'fetched' && 'overview-fetched',
      ]"
      ref="albumCoverRef"
      @click="shuffleStatus === 'picked' && openOverview()"
    >
      <img :src="getAlbumImage(album, shuffleStatus !== 'picked' ? 'medium' : 'medium').url" />

      <div :class="['fantano-score', shuffleStatus === 'picked' && 'picked']">fantano {{ album.score }}</div>

      <div class="overview" v-if="overview && isOverviewOpen">
        <div class="overview-heading">
          <button class="close-overview view-back icon-link-button enter-scale" @click.stop="closeOverview"><IconChevronLeft />back</button>

          <img :src="getAlbumImage(album, shuffleStatus !== 'picked' ? 'medium' : 'medium').url" />
        </div>

        <div class="overview-body">{{ overview }}</div>

        <Alert class="ai-disclaimer" dismiss-id="disclaimer-ai">
          <template #icon>
            <IconSparkle />
          </template>
          note: ai can be useful, but it can sometimes make mistakes.
        </Alert>
      </div>
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
  &.overview-fetched.overview-open {
    aspect-ratio: 3 / 4;
    & > img {
      animation: flip-in-alt .5s ease forwards;
      backface-visibility: hidden;
    }
    & > .fantano-score {
      display: none;
    }
  }
  &.picked:not(:where(.overview-open, .overview-fetching)) {
    cursor: pointer;
    &:hover {
      scale: .95;
    }
  }
  &.overview-fetching {
    cursor: wait;
    animation: pulse 1s 1s ease infinite;
    &::after {
      --size: 14px;
      content: '';
      display: block;
      width: var(--size);
      height: var(--size);
      border-radius: 999px;
      border: calc(var(--size) * .25) solid var(--on-surface);
      border-top-color: transparent;
      border-right-color: transparent;
      bottom: 0;
      left: 0;
      margin: 16px;
      position: absolute;
      animation: spin 500ms linear infinite;
      background: var(--bg-surface-light);
      outline: calc(var(--size) * .5) solid var(--bg-surface-light);
      outline-offset: -1px;
    }
  }
}

.album-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  border: 3px solid var(--on-surface);
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

.overview {
  height: 100%;
  inset: 0;
  position: absolute;
  overflow-y: auto;
  scrollbar-width: thin;
  background-color: var(--bg-surface-light);
  border: 3px solid var(--on-surface);
  border-radius: 8px;
  white-space: preserve-breaks;
  line-height: 1.5;
  animation: flip-in .5s ease forwards;
  backface-visibility: hidden;

}

.overview-body,
.overview-heading {
  padding: var(--spacing-1);
}

@keyframes flip-in {
  0% {
    transform: rotateY(180deg);
  }
  100% {
    transform: rotateY(0deg);
  }
}

@keyframes flip-in-alt {
  0% {
    transform: rotateY(0deg);
  }
  100% {
    transform: rotateY(-180deg);
  }
}

.overview-heading {
  display: flex;
  gap: var(--spacing-1);
  align-items: center;
  position: sticky;
  top: 0;
  background: var(--bg-surface-light);
  border-bottom: 3px solid var(--on-surface);
}

.overview-heading img {
  border-radius: 8px;
  height: 50px;
  width: 50px;
  border: 2px solid var(--on-surface);
  display: block;
}

.overview-heading h2 {
  font-weight: bold;
}

.close-overview {
  margin-inline-end: auto;
}

.ai-disclaimer {
  margin: var(--spacing-2) var(--spacing-1);
}

@keyframes spinTopToBottom {
  0% {
    transform: rotateX(0deg);
  }
  100% {
    transform: rotateX(-1800deg);
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(10px);
  }
  100% {
    transform: translateY(0);
  }
}

@media (max-height: 700px) {
  .album-info {
    max-width: 300px;
  }
}
</style>