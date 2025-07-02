<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import type { Album, HistoryAlbum, ShuffleStatus } from '~/types/Album';
import HistoryView from '~/components/views/HistoryView.vue';
import IconGear from '~/components/icons/IconGear.vue';
import IconHistory from '~/components/icons/IconHistory.vue';
import IconInstall from '~/components/icons/IconInstall.vue';
import IconLightbulb from '~/components/icons/IconLightbulb.vue';
import IconSparkle from '~/components/icons/IconSparkle.vue';
import SettingsView from '~/components/views/SettingsView.vue';
import usePwaInstall from '~/composables/usePwaInstall';
import useVibration from '~/composables/useVibration';
import {
  addToHistory,
  getAlbumHistory,
  updateLikeStatus,
  updateLogStatus,
  removeFromHistory,
  incrementLifetimeSpins,
  getLifetimeSpins,
} from '~/utilities/history';
import { VIEW, type View } from '~/utilities/view';
import { formatAlbumTitleAndArtist, getAlbumImage } from '~/utilities/album';
import { getMinRating, setMinRating } from '~/utilities/preference';
import { migrateCookiesToLocalStorage } from '~/utilities/cookie';
import { preloadImage } from '~/utilities/image';
import { trackEvent } from '~/utilities/tracking';

const SHUFFLE_DURATION = 4000;

definePageMeta({
  ssr: false,
});

const { vibrate } = useVibration();
const { handleInstall, isInstallable } = usePwaInstall();

const view: Ref<View> = ref(VIEW.PICKER);
const minRating = ref(7);
const nextRandomAlbums: Ref<Album[]> = ref([]);
const randomAlbums: Ref<Album[]> = ref([]);
const currentAlbum: Ref<Album | null> = ref(null);
const shuffleStatus: Ref<ShuffleStatus> = ref('init');
const shuffleIndex = ref(0);
const albumHistory: Ref<HistoryAlbum[]> = ref([]);
const loggedAlbums = computed(() => albumHistory.value.filter(album => !!album.logged));
const isPromptingToInstallPwa = ref(false);
const sessionShuffleCount = ref(0);
const pwaPickAgainClicked = ref(false);

const { data, error, status, refresh } = useFetch<Album[]>('/api/randomAlbums', {
  method: 'POST',
  body: {
    minRating: minRating,
    loggedAlbums: loggedAlbums,
  },
  cache: 'no-cache',
  watch: false,
});

const isShowBigButton = computed(() => shuffleStatus.value === 'init' && !isPromptingToInstallPwa.value);
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

let shuffleInterval: ReturnType<typeof setTimeout> | null = null;

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
  vibrate('shortest');
};

const getShouldPromptToInstall = (): boolean => {
  const spinsToPromptOn = [7, 20, 50];
  if (!isInstallable.value) return false;

  const lifetimeSpins = getLifetimeSpins();
  if (
    !spinsToPromptOn.includes(lifetimeSpins) ||
    // also prompt every 125
    lifetimeSpins > 0 &&
    lifetimeSpins % 125 === 0
  ) return false;

  return true;
};

const handleShuffle = () => {
  incrementLifetimeSpins();
  isPromptingToInstallPwa.value = getShouldPromptToInstall();
  if (isPromptingToInstallPwa.value) {
    // skip shuffle if prompting to install
    return;
  }
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

const handlePwaPromptPickAgain = () => {
  pwaPickAgainClicked.value = true;
  setTimeout(() => {
    handleShuffle();
    pwaPickAgainClicked.value = false;
  }, 3000);
}

watch([minRating, view], () => {
  setMinRating(minRating.value);
  // delay fetching until back on picker view
  if (view.value === VIEW.PICKER) {
    refresh();
  }
});

onMounted(syncAlbumHistoryRef);

onBeforeMount(() => {
  migrateCookiesToLocalStorage();
  const minRatingFromCookie = getMinRating();
  if (minRatingFromCookie) minRating.value = minRatingFromCookie;
});
</script>

<template>
  <div
    class="page-layout"
    v-if="view === VIEW.PICKER"
    :style="{ '--shuffle-duration': `${SHUFFLE_DURATION}ms` }"
  >
    <div :class="[
      'top-controls',
      shuffleStatus === 'shuffling' && 'shuffling',
    ]">
      <button
        v-if="isInstallable"
        class="install button-icon button-secondary"
        @click="handleInstall"
        title="install app"
        aria-label="install app"
      >
        <IconInstall />
      </button>

      <button
        class="show-history button-icon button-secondary"
        @click="view = VIEW.HISTORY"
        aria-label="History"
        title="history"
      >
        <IconHistory />

        <div
          v-if="albumHistory.length"
          class="history-count">
          {{albumHistory.length < 10 ? albumHistory.length : '9+'}}
        </div>
      </button>

            <button
        class="settings button-icon button-secondary"
        @click="view = VIEW.SETTINGS"
        title="settings"
        aria-label="settings">
        <IconGear />
      </button>
    </div>

    <button
      class="button-big button-primary"
      @click="handleShuffle"
      :disabled="isBigButtonDisabled"
      v-if="isShowBigButton">
      {{ bigButtonText }}
    </button>

    <div
      class="pwa-install-prompt"
      v-if="isPromptingToInstallPwa && !pwaPickAgainClicked"
    >
      <IconSparkle height="32" width="32" />

      <div class="pwa-title">discover any new music yet?</div>

      <div>it looks like you’re enjoying the site. for an even better experience, install it to your device.</div>


      <button
        class="button-medium button-primary"
        @click="handleInstall"
        v-if="isInstallable"
      >
        <IconInstall />

        <span>install</span>
      </button>
    </div>

    <Alert v-if="isPromptingToInstallPwa && pwaPickAgainClicked">
      <template #icon>
        <IconLightbulb />
      </template>

      <div>if you want to install it later, press the <IconInstall /> button in the top left.</div>
    </Alert>

    <KeepAlive v-if="!isPromptingToInstallPwa">
      <AlbumInfo
        v-if="currentAlbum"
        :album="currentAlbum"
        :shuffleStatus="shuffleStatus"
        :albumHistory="albumHistory"
        @flip="handleAlbumFlip" />
    </KeepAlive>

    <div class="bottom-controls">
      <KeepAlive>
        <AlbumActions
          v-if="currentAlbum && !isPromptingToInstallPwa"
          :albumHistory="albumHistory"
          :album="currentAlbum"
          :shuffleStatus="shuffleStatus"
          :can-shuffle="status !== 'pending'"
          @history-add="handleAddAlbumToHistory"
          @shuffle="handleShuffle"
          @stream="handleStream"
        />
      </KeepAlive>

      <button
        :class="['pick-again button-big button-secondary']"
        @click="handlePwaPromptPickAgain"
        v-if="isPromptingToInstallPwa && !pwaPickAgainClicked"
        >
          <IconsIconRedo />

          <span>pick again</span>
      </button>
    </div>
  </div>

  <HistoryView
    :album-history="albumHistory"
    @close="view = VIEW.PICKER"
    @remove="handleRemoveFromHistory"
    @log="handleLogAlbum"
    @like="handleLikeAlbum"
    @stream="handleStream"
    v-else-if="view === VIEW.HISTORY"
  />

  <SettingsView
    @close="view = VIEW.PICKER"
    v-model="minRating"
    v-else-if="view === VIEW.SETTINGS"
  />

  <div v-else>an error occured :(</div>
</template>

<style scoped>
.top-controls {
  display: flex;
  align-items: center;
  justify-content: end;
  gap: var(--spacing-1);
  margin-inline-start: auto;
  margin-block-end: auto;
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
  margin-block-start: -6px;
  margin-inline-end: -6px;
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
  margin-block-start: auto;
}

.pwa-install-prompt {
  padding: var(--spacing-2);
  gap: var(--spacing-1);
  border-radius: 16px;
  display: flex;
  flex-flow: column nowrap;
  align-items: start;
  background: var(--bg-surface-light);
  border: 3px solid var(--on-surface);
  max-width: 400px;
}

.pwa-title {
  font-weight: bold;
  font-size: 20px;
}

.install-later {
  padding: var(--spacing-2);
  border-radius: 16px;
  background: var(--bg-surface-light);
  border: 3px solid var(--on-surface);
  max-width: 400px;
}

.pick-again {
  opacity: 0;
  visibility: hidden;
  animation: delayed-show 2s forwards;
  animation-delay: 3s;
}

@media (max-height: 700px) {
  .bottom-controls {
    gap: var(--spacing-1);
  }
}
</style>
