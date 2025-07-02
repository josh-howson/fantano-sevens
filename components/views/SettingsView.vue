<script setup lang="ts">
import IconChevronLeft from '~/components/icons/IconChevronLeft.vue';
import { resetCookiesAndLocalStorage } from '~/utilities/cookie';
import { getAlbumHistory, getLifetimeSpins } from '~/utilities/history';
import { exportUserData, importUserData } from '~/utilities/backup';

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const minRating = defineModel({ default: 7 });
const albumHistory = getAlbumHistory();
const clearDataClickCount = ref(0);
const fileInput = ref<HTMLInputElement | null>(null);

const lifetimeSpins = getLifetimeSpins();

const streamsPerDay = computed(() => {
  if (!albumHistory.length) return 'N/A'

  const oldest = albumHistory.reduce((oldest, current) =>
    new Date(current.streamDate).getTime() < new Date(oldest.streamDate).getTime() ? current : oldest
  )
  const oldestTime = new Date(oldest.streamDate!).getTime()
  const now = Date.now()
  const days = Math.max((now - oldestTime) / (1000 * 60 * 60 * 24), 1)
  const avg = albumHistory.length / days
  return avg.toPrecision(2)
})

const handleBack = () => {
  emit('close');
};

const handleClearClick = () => {
  if (clearDataClickCount.value) {
    resetCookiesAndLocalStorage();
    clearDataClickCount.value++;
  } else {
    clearDataClickCount.value++;
  }
}

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    try {
      await importUserData(file);
    } catch (error) {
      alert(error);
    }
  }
};
</script>

<template>
  <div class="page-layout">
    <div class="settings">
      <button class="view-back icon-link-button" @click="handleBack">
        <IconChevronLeft />
        <span>back</span>
      </button>

      <h1 class="view-heading">
        <span>preferences</span>
      </h1>

      <div class="setting-panel">
        <div>
          <h2 class="heading">minimum score</h2>

          <p>{{ minRating === 0 ? 'get reviews with any rating.' : `only get reviews tony rated a ${minRating < 10 ?
            `${minRating} or higher` : '10'}.` }}</p>
        </div>

        <MinimumScore v-model="minRating" />
      </div>

      <div class="setting-panel">
        <div>
          <h2 class="heading">backup or restore data</h2>

          <p>downloads a "user-data.json" file. find it in your downloads folder, then import it from another device to
            transfer all your settings and history.</p>

          <div class="restore-data-buttons">
            <button class="button-medium button-secondary" @click="exportUserData">download my data</button>

            <input ref="fileInput" type="file" accept=".json" @change="handleFileUpload" style="display: none" />

            <button class="button-medium button-secondary" @click="triggerFileInput">import user-data.json</button>
          </div>
        </div>
      </div>

      <div class="setting-panel">
        <div>
          <h2 class="heading">reset all site data</h2>

          <p>all data is stored locally using cookies and basic browser local storage. this will permanently delete all
            your settings and data.<span v-if="albumHistory.length > 2"> including <b>all {{ albumHistory.length }}
                albums in your history</b>.</span></p>

          <button :class="['button-medium button-secondary', clearDataClickCount > 0 && 'shift-to-end']"
            @click="handleClearClick" :disabled="clearDataClickCount > 1">
            {{ clearDataClickCount === 0 ? 'clear my data' : clearDataClickCount === 1 ? 'please clear my data!' :
              'clearing...' }}
          </button>
        </div>
      </div>

      <div class="setting-panel">
        <div>
          <h2 class="heading">stats</h2>

          <p>lifetime spins: {{ lifetimeSpins }}</p>

          <template v-if="albumHistory.length > 0">
            <p>albums streamed: {{ albumHistory.length }}</p>

            <p>albums logged: {{albumHistory.filter(historyAlbum => !!historyAlbum.logged).length}}</p>

            <p>albums liked: {{albumHistory.filter(historyAlbum => !!historyAlbum.liked).length}}</p>

            <p>streams per day (avg.): {{ streamsPerDay }}</p>
          </template>
        </div>
      </div>

      <div class="contact-dev">
        <p>have feedback or questions? contact the developer at <a
            href="mailto:josh.b.howson@gmail.com">josh.b.howson@gmail.com</a> or jsh#5707 on discord.</p>

        <p>
          <NuxtLink to="/">home</NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings {
  width: 100%;
  height: 100%;
  max-width: var(--max-content-width);
  display: flex;
  flex-flow: column nowrap;
  padding-block-end: var(--spacing-2);
}

.setting-panel {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: var(--spacing-1);
  background: var(--bg-surface-light);
  padding: var(--spacing-1);
  border-radius: 12px;
  border: 2px solid var(--on-surface);
  margin-block-end: var(--spacing-1);
}

.min-rating {
  display: flex;
  gap: var(--spacing-1);
}

.min-rating p {
  margin: 0;
}

.heading {
  font-weight: bold;
  font-size: 16px;
}

.shift-to-end {
  margin-inline-start: auto;
}

.restore-data-buttons {
  display: flex;
  gap: var(--spacing-1);
  flex-flow: row wrap;
}

.contact-dev {
  align-items: flex-start;
  margin-block-start: auto;
  padding-block-end: var(--spacing-2);
}
</style>
