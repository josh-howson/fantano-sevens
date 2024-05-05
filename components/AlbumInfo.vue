<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import type { Album, HistoryAlbum, ShuffleStatus } from '~/types/Album';
import { getAlbumSpotifyUrl } from '~/utilities/album';
import { isAlbumLiked, isAlbumLogged } from '~/utilities/history';

const props = defineProps<{
  album: Album;
  shuffleStatus: ShuffleStatus;
  albumHistory: HistoryAlbum[];
}>();

const emit = defineEmits<{
  (e: 'flip'): void;
  (e: 'history-add', album: Album): void;
  (e: 'log', album: Album, value: boolean): void;
  (e: 'like', album: Album, value: boolean): void;
}>();

const albumCoverRef = ref<HTMLElement | null>(null);
const isLogged = computed(() => isAlbumLogged(props.albumHistory, props.album))
const isLiked = computed(() => isAlbumLiked(props.albumHistory, props.album))
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

const handleSpotifyClick = () => {
  const spotifyUrl = getAlbumSpotifyUrl(props.album);
  if (spotifyUrl) {
    window.open(spotifyUrl, '_blank');
    emit('history-add', props.album)
  } else {
    console.warn('Spotify URL is missing.');
  }
};

const toggleAlbumLog = () => {
  emit('log', props.album, !isLogged.value);
};

const toggleAlbumLike = () => {
  emit('like', props.album, !isLiked.value);
};

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
    <div
      :class="[
        'album-cover',
        shuffleStatus === 'shuffling' && 'shuffle',
        shuffleStatus === 'picked' && 'picked',
      ]"
      ref="albumCoverRef"
    >
      <img :src="album?.spotifyAlbum?.images[1].url" />
    </div>
    <div class="album-text">
      <div class="title">{{ album.title }}</div>
      <div class="artist">{{ album.artist }}</div>
    </div>

    <div class="album-actions" v-if="shuffleStatus === 'picked'">
      <button class="button-secondary" @click="handleSpotifyClick">Stream on Spotify 🎧</button>
      <button class="button-secondary" @click="toggleAlbumLog">{{ isLogged ? 'Logged ✏️' : 'Log' }}</button>
      <button class="button-secondary" @click="toggleAlbumLike">{{ isLiked ? 'Liked 💖' : 'Like' }}</button>
    </div>
  </div>
</template>

<style scoped>
.album-info {
  flex: 1 1 0;
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  perspective: 80vh;
  padding: 0 var(--spacing-1);
  width: 100%;
}

.album-cover {
  margin-top: 16rem;
  width: 200rem;
  aspect-ratio: 1 / 1;
  transition: all .5s ease-out;
}

.album-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: var(--border-radius);
  border: 2rem solid var(--text-color);
  transition: transform 0.5s;
  transform-style: preserve-3d;
}

.shuffle {
  animation: spinTopToBottom var(--shuffle-duration) ease-in-out;
}

.picked {
  width: 100%;
  max-width: 400rem;
}

.album-text {
  text-align: center;
  padding: 16rem;
}

.title {
  font-size: 24rem;
  font-weight: bold;
}

.artist {
  font-size: 16rem;
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
</style>