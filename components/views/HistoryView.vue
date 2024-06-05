<script setup lang="ts">
import type { HistoryAlbum } from '~/types/Album';
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
      <button class="view-back icon-link-button" @click="handleBack"><IconChevronLeft />back</button>
      
      <h1 class="view-heading">
        <span>history</span>
        
          <button v-if="isEdit" class="edit icon-link-button" @click="handleDoneEditing"><IconEdit />done</button>
          
          <button v-else class="edit icon-link-button" @click="handleEdit" :disabled="!albumHistory.length"><IconEdit />edit</button>
      </h1>

      <template v-if="albumHistory.length">
        <div class="list">
          <div class="history-album" v-for="album in albumHistory">
            <img class="cover" :src="album.albumCoverUrl" />

            <div class="album-text">
              <div class="title">{{ album.title }}</div>

              <div class="artist">{{ album.artist }}</div>

              <div class="actions">
                <button @click="toggleLog(album)">{{ isAlbumLogged(albumHistory, album) ? `logged` : 'log' }}</button>

                <button @click="handleLike(album)">{{ isAlbumLiked(albumHistory, album) ? 'liked' : 'like' }}</button>

                <button @click="handleStream(album)">
                  <span>stream</span>

                  <IconSpotify />
                </button>
              </div>

              <div class="log-date" v-if="album.logDate">logged {{ new Date(album.logDate).toLocaleDateString('en-US').toLocaleLowerCase() }}</div>
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
  max-width: var(--max-content-width);
  width: 100%;
  --big-factor: 1;
}

.edit {
  margin-left: var(--spacing-1);
}

.edit:disabled {
  opacity: .5;
}

.list {
  display: flex;
  flex-flow: column-reverse nowrap;
  gap: var(--spacing-1);
}

.actions {
  display: flex;
  gap: var(--spacing-1);
  margin-top: var(--spacing-1\/2);
  flex-flow: row wrap;
}

.actions svg {
  height: calc(1em * var(--big-factor));
  width: calc(1em * var(--big-factor));
}

.history-album {
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  gap: calc(var(--spacing-1\/2) * var(--big-factor));
}

.cover {
  border: 2px solid var(--on-surface);
  border-radius: calc(4px * var(--big-factor));
  height: calc(64px * var(--big-factor));
  width: calc(64px * var(--big-factor));
}

.album-text {
  flex: 1 1 0;
  display: flex;
  flex-flow: column nowrap;
}

.album-text .title {
  font-size: calc(16px * var(--big-factor));
  font-weight: bold;
}

.album-text .artist,
.album-text .log-date {
  font-size: calc(12px * var(--big-factor));
}

.album-text .log-date {
  margin-top: var(--spacing-1\/4);
}

.actions button {
  background: none;
  padding: 0;
  color: var(--on-surface);
  border: none;
  display: inline-flex;
  gap: calc(4px * var(--big-factor));
  align-items: center;
  font-weight: bold;
  font-size: calc(12px * var(--big-factor));
}

.actions button:hover {
  text-decoration: underline;
}

@media (min-width: 480px) {
  .history {
    --big-factor: 1.2;
  }
  .edit {
    margin-left: auto;
  }
}
</style>