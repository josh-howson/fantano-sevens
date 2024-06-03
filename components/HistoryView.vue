<script setup lang="ts">
import type { HistoryAlbum } from '~/types/Album';
import InstallCTA from '~/components/InstallCTA.vue';
import IconEdit from '~/components/icons/IconEdit.vue';
import IconChevronLeft from '~/components/icons/IconChevronLeft.vue';
import IconSpotify from '~/components/icons/IconSpotify.vue';
import IconCross from '~/components/icons/IconCross.vue';
import { isAlbumLiked, isAlbumLogged } from '~/utilities/history';

type Props = {
  albumHistory: HistoryAlbum[]
}
const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'log', album: HistoryAlbum, value: boolean): void;
  (e: 'like', album: HistoryAlbum, value: boolean): void;
  (e: 'stream', album: HistoryAlbum): void;
  (e: 'remove', album: HistoryAlbum): void;
  (e: 'close'): void;
}>();

const isEdit = ref(false);

const handleRemove = (album: HistoryAlbum) => {
  emit('remove', album);
};

const toggleLog = (album: HistoryAlbum) => {
  emit('log', album, !isAlbumLogged(props.albumHistory, album));
};

const handleLike = (album: HistoryAlbum) => {
  emit('like', album, !isAlbumLiked(props.albumHistory, album));
};

const handleStream = (album: HistoryAlbum) => {
  emit('stream', album);
};

const handleBack = () => {
  emit('close');
};

const handleEdit = () => isEdit.value = true;

const handleDoneEditing = () => isEdit.value = false;
</script>

<template>
  <div class="page-layout">
    <div class="history">
      <button class="back icon-link-button" @click="handleBack"><IconChevronLeft />back</button>
      
      <h1 class="heading">
        <span>history</span>
        
          <button v-if="isEdit" class="edit icon-link-button" @click="handleDoneEditing"><IconEdit />done</button>
          
          <button v-else class="edit icon-link-button" @click="handleEdit" :disabled="!albumHistory.length"><IconEdit />edit</button>

          <InstallCTA />
      </h1>

      <template v-if="albumHistory.length">
        <div class="list">
          <div class="history-album" v-for="album in albumHistory">
            <img class="cover" :src="album.albumCoverUrl" />

            <div class="album-text">
              <div class="title">{{ album.title }}</div>

              <div class="artist">{{ album.artist }}</div>

              <div class="actions">
                <button @click="toggleLog(album)">{{ isAlbumLogged(albumHistory, album) ? 'logged' : 'log' }}</button>

                <button @click="handleLike(album)">{{ isAlbumLiked(albumHistory, album) ? 'liked' : 'like' }}</button>

                <button @click="handleStream(album)">
                  <span>stream</span>

                  <IconSpotify />
                </button>
              </div>
            </div>

            <button class="button-icon button-secondary" v-if="isEdit" @click="handleRemove(album)" title="remove from history" aria-label="remove from history"><IconCross /></button>
          </div>
        </div>
      </template>

      <div v-else>
        <p>your history is empty!</p>

        <p>come back after you've streamed, saved or logged an album, and you'll be able to keep track of and modify them here.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.history {
  max-width: 480px;
  width: 100%;
}

.back {
  padding: 16px 0 !important;
}

.heading {
  display: flex;
  align-items: center;
  margin-top: var(--spacing-2);
  font-size: 20px;
  font-weight: bold;
}

.icon-link-button {
  background: none;
  padding: 0;
  color: var(--on-surface);
  border: none;
  display: inline-flex;
  gap: 4px;
  align-items: center;
  font-size: 16px;
  font-weight: normal;
}

.edit {
  margin-left: var(--spacing-1);
}

.edit:disabled {
  opacity: .5;
}

.list {
  display: flex;
  flex-flow: column nowrap;
  gap: var(--spacing-1);
  margin-top: var(--spacing-2);
}

.actions {
  display: flex;
  gap: var(--spacing-1);
  margin-top: var(--spacing-1\/2);
  flex-flow: row wrap;
}

.actions svg {
  height: 1em;
  width: 1em;
}

.history-album {
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  gap: var(--spacing-1\/2);
}

.cover {
  border: 2px solid var(--on-surface);
  border-radius: 4px;
  height: 64px;
  width: 64px;
}

.album-text {
  flex: 1 1 0;
  display: flex;
  flex-flow: column nowrap;
}

.album-text .title {
  font-size: 16px;
  font-weight: bold;
}

.album-text .artist {
  font-size: 12px;
}

.actions button {
  background: none;
  padding: 0;
  color: var(--on-surface);
  border: none;
  display: inline-flex;
  gap: 4px;
  align-items: center;
  font-weight: bold;
  font-size: 12px;
}

.actions button:hover {
  text-decoration: underline;
}

@media (min-width: 480px) {
  .edit {
    margin-left: auto;
  }
}
</style>