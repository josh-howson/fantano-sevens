<script setup lang="ts">
import type { HistoryAlbum } from '~/types/Album';
import IconEdit from '~/components/icons/IconEdit.vue';
import IconChevronLeft from '~/components/icons/IconChevronLeft.vue';

type Props = {
  albumHistory: HistoryAlbum[]
}
defineProps<Props>();

const emit = defineEmits<{
  (e: 'log', album: HistoryAlbum): void;
  (e: 'like', album: HistoryAlbum): void;
  (e: 'stream', album: HistoryAlbum): void;
  (e: 'remove', album: HistoryAlbum): void;
  (e: 'close'): void;
}>();

const isEdit = ref(false);

const handleRemove = (album: HistoryAlbum) => {
  emit('remove', album);
}

const handleLog = (album: HistoryAlbum) => {}
const handleLike = (album: HistoryAlbum) => {}
const handleStream = (album: HistoryAlbum) => {}

const handleBack = () => {
  emit('close');
}

const handleEdit = () => isEdit.value = true;

const handleDoneEditing = () => isEdit.value = false;
</script>

<template>
  <div class="page-layout">
    <div class="history">
      <button class="history-back icon-link-button" @click="handleBack"><IconChevronLeft />back</button>

      <h1 class="history-title">
        <span>History</span>

        <button v-if="isEdit" class="edit icon-link-button" @click="handleDoneEditing"><IconEdit />done</button>

        <button v-else class="edit icon-link-button" @click="handleEdit"><IconEdit />edit</button>
      </h1>

      <div class="history-list">
        <div class="history-row" v-for="album in albumHistory">
          <div class="history-item">
            <div class="title">{{ album.title }}</div>

            <div class="artist">{{ album.artist }}</div>

            <div class="history-actions">
              <button @click="handleLog(album)">log</button>

              <button @click="handleLike(album)">like</button>

              <button @click="handleStream(album)">stream</button>
            </div>
          </div>

          <button v-if="isEdit" @click="handleRemove(album)">X</button>
        </div>
      </div>

      <table v-if="false">
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
          <td v-if="isEdit">
            <button class="" @click="handleRemove(album)">x</button>
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<style scoped>
.history {
  max-width: 480px;
  width: 100%;
}

.history-back {
  padding: 16px 0 !important;
}

.history-title {
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

.history-list {
  display: flex;
  flex-flow: column nowrap;
  gap: var(--spacing-1);
  margin-top: var(--spacing-2);
}

.history-actions {
  display: flex;
  gap: var(--spacing-1\/2);
}

.history-row {
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  gap: var(--spacing-1);
}

.history-item {
  flex: 1 1 0;
}

.history-item .title {
  font-size: 16px;
  font-weight: bold;
}

.history-item .artist {
  font-size: 12px;
}

.history-actions {
  margin-top: var(--spacing-1\/2);
}

.history-actions button {
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

.history-actions button:hover {
  text-decoration: underline;
}

@media (min-width: 480px) {
  .edit {
    margin-left: auto;
  }
}
</style>