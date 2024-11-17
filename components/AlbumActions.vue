<script setup lang="ts">
import type { Album, HistoryAlbum, ShuffleStatus } from '~/types/Album';
import IconSpotify from '~/components/icons/IconSpotify.vue';
import IconRedo from '~/components/icons/IconRedo.vue';
import { getHistoryAlbumFromAlbum } from '~/utilities/album';

const props = defineProps<{
  album: Album;
  albumHistory: HistoryAlbum[];
  shuffleStatus: ShuffleStatus;
  canShuffle: boolean;
}>();

const emit = defineEmits<{
  (e: 'stream', album: HistoryAlbum, historyAdd: boolean): void;
  (e: 'shuffle'): void;
}>();

const handleShuffle = () => {
  emit('shuffle');
};

const handleStream = () => {
  const historyAlbum = getHistoryAlbumFromAlbum(props.album);
  emit('stream', historyAlbum, true);
};
</script>

<template>
  <div :class="['album-actions', shuffleStatus === 'picked' && 'picked']">
    <button
      class="reshuffle button-big button-secondary"
      @click="handleShuffle"
      :disabled="shuffleStatus === 'shuffling' || !canShuffle"
      aria-label="pick again"
      title="pick again"
    >
      <IconRedo />
    </button>

    <button
      class="stream button-big button-primary"
      @click="handleStream"
      title="stream this album"
    >
      <IconSpotify />  

      <span class="text">stream</span>
    </button>
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

@media (max-width: 374px) {
  .stream .text {
    display: none;
  }
}
</style>