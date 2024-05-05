<script setup lang="ts">
import type { Album, HistoryAlbum, ShuffleStatus } from '~/types/Album';
import { preloadImage } from '~/utilities/image';
import { ref, computed, watch, onMounted } from 'vue';
import { addToHistory, getAlbumHistory, updateLikeStatus, updateLogStatus, removeFromHistory } from '~/utilities/history';

const SHUFFLE_DURATION = 4000;

let latestRequestId = 0;
const showHistory = ref(false);
const minRating = ref(7);
const nextRandomAlbums: Ref<Album[]> = ref([]);
const randomAlbums: Ref<Album[]> = ref([]);
const currentAlbum: Ref<Album | null> = ref(null);
const isFetching = ref(true);
const shuffleStatus: Ref<ShuffleStatus> = ref('init');
const shuffleIndex = ref(0);
const albumHistory: Ref<HistoryAlbum[]> = ref([]);

const isDisabled = computed(() => isFetching.value || shuffleStatus.value === 'shuffling');
const shuffleButtonText = computed(() => {
  if (isDisabled.value) {
    if (shuffleStatus.value === 'shuffling')
      return 'Picking...';
    else
      return 'Please wait...';
  } else
    return 'Pick a random album';
});

let abortController: AbortController | null = null;

const fetchNextRandomAlbums = async () => {
  if (abortController) {
    abortController.abort();
  }
  abortController = new AbortController();
  const requestId = ++latestRequestId;
  isFetching.value = true;
  try {
    const response = await fetch(`/api/randomAlbums?minRating=${minRating.value}`, {
      signal: abortController.signal
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch random albums. ${response.statusText}`);
    }
    const albums = await response.json() as Album[];
    if (requestId === latestRequestId) {
      nextRandomAlbums.value = albums;
    }
  } catch (error) {
    console.error(error);
  }
  isFetching.value = false;

  nextRandomAlbums.value.forEach(album => album.spotifyAlbum?.images[0].url && preloadImage(album.spotifyAlbum?.images[1].url));
};

let shuffleInterval: NodeJS.Timeout;

const showFinalAlbum = () => {
  shuffleInterval && clearInterval(shuffleInterval);
  shuffleStatus.value = 'picked';
};

const applyPreloadedAlbums = () => {
  randomAlbums.value = nextRandomAlbums.value;
  fetchNextRandomAlbums();
};

const shuffleByOne = () => {
  shuffleIndex.value = Math.floor(Math.random() * randomAlbums.value.length);
  if (shuffleIndex.value < randomAlbums.value.length - 1)
    shuffleIndex.value++;
  else
    shuffleIndex.value = 0;
  currentAlbum.value = randomAlbums.value[shuffleIndex.value];
};

const handleShuffle = () => {
  applyPreloadedAlbums();
  shuffleStatus.value = 'shuffling';
  shuffleByOne();

  setTimeout(() => showFinalAlbum(), SHUFFLE_DURATION);
};

const handleAlbumFlip = () => {
  shuffleByOne();
};

const syncAlbumHistoryRef = () => {
  albumHistory.value = getAlbumHistory();
};

const handleShowHistory = () => {
  showHistory.value = !showHistory.value;
}

const handleAddAlbumToHistory = (album: Album) => {
  addToHistory(album);
  syncAlbumHistoryRef();
};

const handleLogAlbum = (album: Album, value: boolean) => {
  updateLogStatus(album, value);
  syncAlbumHistoryRef();
}

const handleLikeAlbum = (album: Album, value: boolean) => {
  updateLikeStatus(album, value);
  syncAlbumHistoryRef();
}

const handleRemoveFromHistory = (album: HistoryAlbum) => {
  removeFromHistory(album);
  syncAlbumHistoryRef();
}

watch(minRating, () => {
  fetchNextRandomAlbums();
});

onMounted(fetchNextRandomAlbums);
onMounted(syncAlbumHistoryRef);
</script>

<template>
  <button class="show-history button-secondary" @click="handleShowHistory">{{showHistory ? 'Back' : `History${albumHistory.length ? ` (${albumHistory.length})`: ''}` }}</button>

  <div class="page-layout" v-if="!showHistory" :style="{ '--shuffle-duration': `${SHUFFLE_DURATION}ms` }">

    <MinimumScore v-model="minRating" />

    <button
      class="randomize-button"
      @click="handleShuffle"
      :disabled="isDisabled"
    >
      {{ shuffleButtonText }}
    </button>

    <AlbumInfo
      v-if="currentAlbum"
      :album="currentAlbum"
      :shuffleStatus="shuffleStatus"
      :albumHistory="albumHistory"
      @flip="handleAlbumFlip"
      @history-add="handleAddAlbumToHistory"
      @log="handleLogAlbum"
      @like="handleLikeAlbum"
    />

    <AlbumMetaData
      v-if="currentAlbum && shuffleStatus === 'picked'"
      :album="currentAlbum"
    />
  </div>
  <table class="history" v-else>
    <thead>
      <td>Album</td>
      <td>Logged</td>
      <td>Liked</td>
      <td>Actions</td>
    </thead>
    <tr v-for="album in albumHistory">
      <td>{{ album.title }} - {{ album.artist }}</td>
      <td>{{ album.logged }}</td>
      <td>{{ album.liked }}</td>
      <td>
        <button class="button-secondary" @click="handleRemoveFromHistory(album)">x</button>
      </td>
    </tr>
  </table>
</template>

<style scoped>
.show-history {
  position: absolute;
  bottom: 0;
  right: 0;
  margin: var(--spacing-1);
}

.history {
  padding: var(--spacing-1);
}

.randomize-button {
  flex: 0 0 auto;
  padding: 16rem 32rem;
  background-color: var(--primary-color);
  border: 2rem solid var(--text-color);
  border-radius: var(--border-radius);
  font-weight: bold;
  color: var(--text-color);
  font-size: 16rem;
}

.randomize-button:disabled {
  background-color: #ddd;
  color: #777;
  cursor: not-allowed;
  border-color: #777;
}
</style>
