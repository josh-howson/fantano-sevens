<script setup lang="ts">
import type { Album } from '~/types/Album';
import { getAlbumSpotifyUrl } from '~/utilities/album';
type Props = {
  album: Album;
}

defineProps<Props>();
</script>

<template>
  <div class="metadata">
    <div class="fantano-score">Fantano Score: {{ album.score }}</div>
    <p><strong>Title:</strong> {{ album.title }}</p>
    <p><strong>Artist:</strong> {{ album.artist }}</p>
    <p><strong>Release Date:</strong> {{ album.date }}</p>
    <p><strong>Genre:</strong> {{ album.genre }}</p>
  </div>
</template>

<style>
.metadata {
  flex: 0 0 auto;
  text-align: center;
  margin-top: auto;
  padding: var(--spacing-1);
  padding-bottom: 48rem;
}

.fantano-score {
  font-size: 20rem;
  font-weight: bold;
}
</style>