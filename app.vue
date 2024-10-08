<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import type { Album, HistoryAlbum, ShuffleStatus } from '~/types/Album';
import { preloadImage } from '~/utilities/image';
import { addToHistory, getAlbumHistory, updateLikeStatus, updateLogStatus, removeFromHistory } from '~/utilities/history';
import { getMinRatingFromCookie, setMinRatingCookie } from '~/utilities/preference';
import { formatAlbumTitleAndArtist, getAlbumImage } from '~/utilities/album';
import IconHistory from '~/components/icons/IconHistory.vue';
import HistoryView from '~/components/views/HistoryView.vue';
import SettingsView from '~/components/views/SettingsView.vue';
import IconInstall from '~/components/icons/IconInstall.vue';
import IconGear from '~/components/icons/IconGear.vue';
import { trackEvent } from '~/utilities/tracking';

const SHUFFLE_DURATION = 4000;

const view: Ref<'picker' | 'history' | 'settings'> = ref('picker');
const minRating = ref(7);
const nextRandomAlbums: Ref<Album[]> = ref([]);
const randomAlbums: Ref<Album[]> = ref([]);
const currentAlbum: Ref<Album | null> = ref(null);
const shuffleStatus: Ref<ShuffleStatus> = ref('init');
const shuffleIndex = ref(0);
const albumHistory: Ref<HistoryAlbum[]> = ref([]);
const deferredPrompt = ref();
const isInstallShown = ref(false);
const sessionShuffleCount = ref(0);

const { data, error, status, refresh } = useFetch<Album[]>('/api/randomAlbums', {
  query: {
    minRating: minRating.value,
  },
  cache: 'no-cache',
});

const isShowBigButton = computed(() => shuffleStatus.value === 'init');
const isBigButtonDisabled = computed(() => status.value === 'pending');
const bigButtonText = computed(() => status.value === 'pending' ? 'loading...' : 'pick a random album');

watch(data, async (newValue) => {
  if (newValue) {
    nextRandomAlbums.value = newValue;
    try {
      const preloadPromises = nextRandomAlbums.value.map((album) => {
        const albumCoverUrl = getAlbumImage(album, 'medium');
        return albumCoverUrl ? preloadImage(albumCoverUrl.url) : Promise.resolve();
      });

      await Promise.all(preloadPromises)
    } catch (error) {
      console.error('There was an error preloading the image:', error);
    }
  }
}, { immediate: true });

watch([status, error], (newValue) => {
  if (status.value === 'error')
    console.error('There has been an error!', newValue);
}, { immediate: true });

let shuffleInterval: NodeJS.Timeout;

const showFinalAlbum = () => {
  shuffleInterval && clearInterval(shuffleInterval);
  shuffleStatus.value = 'picked';
};

const applyPreloadedAlbums = () => {
  randomAlbums.value = nextRandomAlbums.value;
  refresh();
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
  setTimeout(() => {
    showFinalAlbum();
    sessionShuffleCount.value++;
    trackEvent('shuffle', {
      album: currentAlbum.value
        ? formatAlbumTitleAndArtist(currentAlbum.value)
        : null,
      minScore: minRating.value,
      sessionShuffleCount: sessionShuffleCount.value,
    });
  }, SHUFFLE_DURATION);
};

const handleStream = (album: HistoryAlbum, historyAdd: boolean = false) => {
  const spotifyUrl = album.spotifyUrl;
  window.open(spotifyUrl, '_blank', 'noopener,noreferrer');

  if (historyAdd) {
    handleAddAlbumToHistory(album);
    syncAlbumHistoryRef();
  }
  trackEvent('stream', {
    album: currentAlbum.value
      ? formatAlbumTitleAndArtist(currentAlbum.value)
      : null,
  });
};

const handleAlbumFlip = () => {
  shuffleByOne();
};

const syncAlbumHistoryRef = () => {
  albumHistory.value = getAlbumHistory();
};

const handleShowHistory = () => {
  view.value = 'history';
}

const handleCloseHistory = () => {
  view.value = 'picker';
};

const handleShowSettings = () => {
  view.value = 'settings';
};

const handleInstall = async () => {
  deferredPrompt.value.prompt();
  const { outcome } = await deferredPrompt.value.userChoice;
  isInstallShown.value = !outcome;
  trackEvent('install');
};

const handleCloseSettings = () => {
  view.value = 'picker';
};

const handleAddAlbumToHistory = (album: HistoryAlbum) => {
  addToHistory(album);
  syncAlbumHistoryRef();
  trackEvent('history-add', {
    album: currentAlbum.value
      ? formatAlbumTitleAndArtist(currentAlbum.value)
      : null,
  });
};

const handleLogAlbum = (album: HistoryAlbum, value: boolean) => {
  updateLogStatus(album, value);
  syncAlbumHistoryRef();
  trackEvent('log', {
    album: currentAlbum.value
      ? formatAlbumTitleAndArtist(currentAlbum.value)
      : null,
    logged: value,
  });
}

const handleLikeAlbum = (album: HistoryAlbum, value: boolean) => {
  updateLikeStatus(album, value);
  syncAlbumHistoryRef();
  trackEvent('like', {
    album: currentAlbum.value
      ? formatAlbumTitleAndArtist(currentAlbum.value)
      : null,
    liked: value,
  });
}

const handleRemoveFromHistory = (album: HistoryAlbum) => {
  removeFromHistory(album);
  syncAlbumHistoryRef();
  trackEvent('history-remove', {
    album: currentAlbum.value
      ? formatAlbumTitleAndArtist(currentAlbum.value)
      : null,
  });
}

watch([minRating, view], () => {
  setMinRatingCookie(minRating.value);
  // delay fetching until back on picker view
  if (view.value === 'picker') {
    refresh();
  }
});

onMounted(syncAlbumHistoryRef);

onBeforeMount(() => {
  const minRatingFromCookie = getMinRatingFromCookie();
  if (minRatingFromCookie) minRating.value = minRatingFromCookie;
});

onBeforeMount(() => {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt.value = e;
    isInstallShown.value = true;
  });
});
</script>

<template>
  <div class="page-layout" v-if="view === 'picker'" :style="{ '--shuffle-duration': `${SHUFFLE_DURATION}ms` }">
    <div :class="[
      'top-controls',
      shuffleStatus === 'shuffling' && 'shuffling',
    ]">
      <button v-if="isInstallShown" class="install button-icon button-secondary" @click="handleInstall"
        title="install app" aria-label="install app">
        <IconInstall />
      </button>

      <button class="settings button-icon button-secondary" @click="handleShowSettings" title="settings"
        aria-label="settings">
        <IconGear />
      </button>

      <button class="show-history button-icon button-secondary" @click="handleShowHistory" aria-label="History"
        title="my history">
        <IconHistory />

        <div v-if="albumHistory.length" class="history-count">{{ albumHistory.length < 10 ? albumHistory.length : '9+'
            }}</div>
      </button>
    </div>

    <button class="button-big button-primary" @click="handleShuffle" :disabled="isBigButtonDisabled"
      v-if="isShowBigButton">
      {{ bigButtonText }}
    </button>

    <KeepAlive>
      <AlbumInfo v-if="currentAlbum" :album="currentAlbum" :shuffleStatus="shuffleStatus" :albumHistory="albumHistory"
        @flip="handleAlbumFlip" />
    </KeepAlive>

    <div class="bottom-controls">
      <AlbumActions v-if="currentAlbum" :albumHistory="albumHistory" :album="currentAlbum"
        :shuffleStatus="shuffleStatus" :can-shuffle="status !== 'pending'" @history-add="handleAddAlbumToHistory"
        @shuffle="handleShuffle" @stream="handleStream" />
    </div>
  </div>

  <HistoryView :album-history="albumHistory" @close="handleCloseHistory" @remove="handleRemoveFromHistory"
    @log="handleLogAlbum" @like="handleLikeAlbum" @stream="handleStream" v-else-if="view === 'history'" />

  <SettingsView @close="handleCloseSettings" v-model="minRating" v-else-if="view === 'settings'" />

  <div v-else>an error occured :(</div>
</template>

<style scoped>
.top-controls {
  display: flex;
  align-items: center;
  justify-content: end;
  gap: var(--spacing-1);
  margin-left: auto;
  margin-bottom: auto;
  width: 100%;
  min-height: 40px;

  &.shuffling>button {
    opacity: 0;
    scale: 0;
    transition: all var(--transition-duration) var(--easing);
  }
}

.top-controls .install {
  margin-inline-end: auto;
}

.show-history {
  position: relative;
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
