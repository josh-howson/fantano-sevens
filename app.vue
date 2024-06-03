<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import type { Album, HistoryAlbum, ShuffleStatus } from '~/types/Album';
import { preloadImage } from '~/utilities/image';
import { addToHistory, getAlbumHistory, updateLikeStatus, updateLogStatus, removeFromHistory } from '~/utilities/history';
import { getMinRatingFromCookie, setMinRatingCookie } from '~/utilities/preference';
import IconHistory from '~/components/icons/IconHistory.vue';
import HistoryView from '~/components/HistoryView.vue';
import { getAlbumImage } from '~/utilities/album';

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

const isShowBigButton = computed(() => shuffleStatus.value === 'init');
const isBigButtonDisabled = computed(() => isFetching.value);
const bigButtonText = computed(() => isFetching.value ? 'loading...' : 'pick a random album');

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

  nextRandomAlbums.value.forEach(album => {
    const albumCoverUrl = getAlbumImage(album, 'medium');
    return albumCoverUrl && preloadImage(albumCoverUrl.url);
  });
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

const handleStream = (album: HistoryAlbum, historyAdd: boolean = false) => {
  const spotifyUrl = album.spotifyUrl;
  window.open(spotifyUrl, '_blank');
  if (historyAdd) {
    handleAddAlbumToHistory(album);
    syncAlbumHistoryRef();
  }
};

const handleAlbumFlip = () => {
  shuffleByOne();
};

const syncAlbumHistoryRef = () => {
  albumHistory.value = getAlbumHistory();
};

const handleShowHistory = () => {
  showHistory.value = true;
}

const handleCloseHistory = () => {
  showHistory.value = false;
}

const handleAddAlbumToHistory = (album: HistoryAlbum) => {
  addToHistory(album);
  syncAlbumHistoryRef();
};

const handleLogAlbum = (album: HistoryAlbum, value: boolean) => {
  updateLogStatus(album, value);
  syncAlbumHistoryRef();
}

const handleLikeAlbum = (album: HistoryAlbum, value: boolean) => {
  updateLikeStatus(album, value);
  syncAlbumHistoryRef();
}

const handleRemoveFromHistory = (album: HistoryAlbum) => {
  removeFromHistory(album);
  syncAlbumHistoryRef();
}

watch(minRating, () => {
  fetchNextRandomAlbums();
  setMinRatingCookie(minRating.value);
});

onMounted(fetchNextRandomAlbums);

onMounted(syncAlbumHistoryRef);

onMounted(() => {
  const minRatingFromCookie = getMinRatingFromCookie();
  if (minRatingFromCookie) minRating.value = minRatingFromCookie;
})
</script>

<template>
  <div class="page-layout" v-if="!showHistory" :style="{ '--shuffle-duration': `${SHUFFLE_DURATION}ms` }">
    <button class="show-history button-icon button-secondary" @click="handleShowHistory" aria-label="History" title="my history">
      <IconHistory />
      
      <div v-if="albumHistory.length" class="history-count">{{ albumHistory.length < 10 ? albumHistory.length : '9+' }}</div>
    </button>
   
    <button
      class="button-big button-primary"
      @click="handleShuffle"
      :disabled="isBigButtonDisabled"
      v-if="isShowBigButton"
    >
      {{ bigButtonText }}
    </button>

    <AlbumInfo
      v-if="currentAlbum"
      :album="currentAlbum"
      :shuffleStatus="shuffleStatus"
      :albumHistory="albumHistory"
      @flip="handleAlbumFlip"
    />

    <div class="bottom-controls">
      <AlbumActions
        v-if="currentAlbum"
        :albumHistory="albumHistory"
        :album="currentAlbum"
        :shuffleStatus="shuffleStatus"
        @history-add="handleAddAlbumToHistory"
        @shuffle="handleShuffle"
        @stream="handleStream"
      />

      <MinimumScore v-model="minRating" :disabled="shuffleStatus === 'shuffling'" />
    </div>
  </div>

  <HistoryView
    :album-history="albumHistory"
    @close="handleCloseHistory"
    @remove="handleRemoveFromHistory"
    @log="handleLogAlbum"
    @like="handleLikeAlbum"
    @stream="handleStream"
    v-else
  />
</template>

<style scoped>
.show-history {
  position: relative;
  margin-left: auto;
  margin-bottom: auto;
}

.history-count {
  width: 20px;
  height: 20px;
  border-radius: 999px;
  background: var(--on-surface);
  border: 2px solid var(--bg-surface-light);
  color: var(--bg-surface-light);
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  right: 0;
  font-size: 11px;
  font-weight: bold;
  text-align: center;
  margin-top: -6px;
  margin-right: -6px;
}

.history {
  padding: var(--spacing-1);
  display: flex;
  flex-flow: column nowrap;
  gap: var(--spacing);
  height: 100dvh;
}

.bottom-controls {
  display: flex;
  gap: var(--spacing-2);
  align-items: center;
  flex-direction: column;
  margin-top: auto;
}

@media (max-height: 700px) {
  .bottom-controls {
    gap: var(--spacing-1);
  }
}
</style>
