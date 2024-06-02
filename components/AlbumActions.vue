<script setup lang="ts">
import type { Album, HistoryAlbum, ShuffleStatus } from '~/types/Album';
import { getAlbumSpotifyUrl } from '~/utilities/album';
// import { isAlbumLiked, isAlbumLogged } from '~/utilities/history';
import IconSpotify from '~/components/icons/IconSpotify.vue';
import IconRedo from '~/components/icons/IconRedo.vue';

const props = defineProps<{
  album: Album;
  albumHistory: HistoryAlbum[];
  shuffleStatus: ShuffleStatus;
}>();

// const isLogged = computed(() => isAlbumLogged(props.albumHistory, props.album))
// const isLiked = computed(() => isAlbumLiked(props.albumHistory, props.album))

const emit = defineEmits<{
  (e: 'history-add', album: Album): void;
  (e: 'log', album: Album, value: boolean): void;
  (e: 'like', album: Album, value: boolean): void;
  (e: 'shuffle'): void;
}>();

const handleSpotifyClick = () => {
  const spotifyUrl = getAlbumSpotifyUrl(props.album);
  if (spotifyUrl) {
    window.open(spotifyUrl, '_blank');
    emit('history-add', props.album)
  } else {
    console.warn('Spotify URL is missing.');
  }
};

const handleShuffle = () => {
  emit('shuffle');
}

// const toggleAlbumLog = () => {
//   emit('log', props.album, !isLogged.value);
// };

// const toggleAlbumLike = () => {
//   emit('like', props.album, !isLiked.value);
// };
</script>

<template>
  <div :class="['album-actions', shuffleStatus === 'picked' && 'picked']">
    <button class="reshuffle button-big button-secondary" @click="handleShuffle" :disabled="shuffleStatus === 'shuffling'">
      <IconRedo />
    </button>

    <button class="button-big button-primary" @click="handleSpotifyClick">
      <IconSpotify />  

      <span>stream</span>
    </button>

    <!-- <button class="button-secondary" @click="toggleAlbumLog">{{ isLogged ? 'Logged ✏️' : 'Log' }}</button> -->

    <!-- <button class="button-secondary" @click="toggleAlbumLike">{{ isLiked ? 'Liked 💖' : 'Like' }}</button> -->
  </div>
</template>

<style scoped>
.album-actions {
  display: flex;
  align-items: stretch;
  flex-flow: row wrap;
  gap: var(--spacing-1\/2);
  transition: all var(--transition-duration) var(--easing);
  scale: var(--enter-scale);
  opacity: 0;
  pointer-events: none;
}

.album-actions.picked {
  scale: 1;
  opacity: 1;
  pointer-events: all;
}

.reshuffle {
  padding-inline: 24px;
}
</style>