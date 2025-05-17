<script setup lang="ts">
import type { HistoryAlbum } from '~/types/Album';
import IconChevronLeft from '../icons/IconChevronLeft.vue';

type Props = {
  unloggedAlbums: HistoryAlbum[];
};

const props = defineProps<Props>();

type Emits = {
  (e: 'like', album: HistoryAlbum, value: boolean): void;
  (e: 'dislike', album: HistoryAlbum, value: boolean): void;
  (e: 'close'): void;
};

const emit = defineEmits<Emits>();

type TouchCoordinates = {x: number; y: number};

const initialTouchXY: Ref<TouchCoordinates | null> = ref(null);
const swipeDistance: Ref<TouchCoordinates | null> = ref(null);
const initialBoundingClientRect: Ref<DOMRect | null> = ref(null);
const transformOrigin: Ref<TouchCoordinates | null> = ref(null);
const swipeStatus: Ref<'dislike-unconfirmed' | 'dislike-confirmed' | 'like-unconfirmed' | 'like-confirmed' | 'initial'> = ref('initial');
const lastCardIndex: ComputedRef<number> = computed(() => props.unloggedAlbums.length - 1);

const handleTouchStart = (e: TouchEvent) => {
  const touch = e.touches[0];
  initialTouchXY.value = {
    x: touch.clientX,
    y: touch.clientY,
  };
  const rect = (e.currentTarget as Element).getBoundingClientRect();
  initialBoundingClientRect.value = rect;
  transformOrigin.value = {
    x: touch.clientX - rect.left,
    y: touch.clientY - rect.top,
  };
};

const handleTouchMove = (e: TouchEvent) => {
  if (initialTouchXY.value !== null) {
    swipeDistance.value = {
      x: e.touches[0].clientX - initialTouchXY.value?.x,
      y: e.touches[0].clientY - initialTouchXY.value?.y,
    };

    if (swipeDistance?.value?.x > (initialBoundingClientRect?.value?.width ?? 0) / 2) {
      swipeStatus.value = 'like-unconfirmed';
    } else if (swipeDistance?.value?.x < -(initialBoundingClientRect?.value?.width ?? 0) / 2) {
      swipeStatus.value = 'dislike-unconfirmed';
    } else {
      swipeStatus.value = 'initial';
    }
  }
};

const handleTouchEnd = (e: TouchEvent) => {
  initialTouchXY.value = null;
  swipeDistance.value = null;
  initialBoundingClientRect.value = null;
  transformOrigin.value = null;
  if (swipeStatus.value === 'dislike-unconfirmed') {
    swipeStatus.value = 'dislike-confirmed';
    emit('like', props.unloggedAlbums[0], true);
  } else if (swipeStatus.value === 'like-unconfirmed') {
    swipeStatus.value = 'like-confirmed';
    emit('dislike', props.unloggedAlbums[0], false);
  } else {
    swipeStatus.value = 'initial';
  }
};

const getWindowInnerWidth = () => (window as any).innerWidth as number;

const handleBack = () => {
  emit('close');
};
</script>

<template>
  <div class="page-layout">
    <button class="view-back icon-link-button" @click="handleBack"><IconChevronLeft />back</button>
    
    <div class="card-stack">
      <div class="ghost-card"></div>

      <div
        :class="['card', swipeStatus]"
        @touchstart="e => index === lastCardIndex && handleTouchStart(e)"
        @touchmove="e => index === lastCardIndex && handleTouchMove(e)"
        @touchend="e => index === lastCardIndex && handleTouchEnd(e)"
        v-for="(album, index) in unloggedAlbums"
        :style="index === lastCardIndex && (() => {
          const MAX_ROTATION = 15;
          const x = swipeStatus === 'like-confirmed'
            ? getWindowInnerWidth()
            : swipeStatus === 'dislike-confirmed'
              ? -getWindowInnerWidth()
              : swipeDistance?.x ?? 0;
          const width = initialBoundingClientRect?.width ?? 1;
          const height = initialBoundingClientRect?.height ?? 1;
          const touchY = transformOrigin?.y;
          const direction = (touchY !== undefined && touchY < height / 2) ? -1 : 1;
          const percentToLike = Math.max(0, Math.min(x / (width / 2), 1));
          const percentToDislike = Math.max(0, Math.min(-x / (width / 2), 1));
          let angle = (x / width) * MAX_ROTATION * direction;

          angle = Math.max(-MAX_ROTATION, Math.min(MAX_ROTATION, angle));

          return {
            transform: `translate(${x}px, ${swipeDistance?.y ?? 0}px) rotate(${angle}deg)`,
            transition: initialTouchXY ? 'none' : 'all .3s ease',
            transformOrigin: transformOrigin ? `${transformOrigin.x}px ${transformOrigin.y}px` : 'center center',
            '--percent-to-like': percentToLike,
            '--percent-to-dislike': percentToDislike,
          };
        })()"
      >
        <img :class="['card-img']" :src="album.albumCoverUrl" />

        <div :class="['card-artist']">{{ album.artist }}</div>

        <div :class="['card-title']">{{ album.title }}</div>

        <template v-if="index === lastCardIndex">
          <div class="like-badge">yes</div>

          <div class="dislike-badge">no</div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card-stack {
  display: grid;
  width: 100%;
  height: 100%;
  place-content: center;
  * > * {
    grid-column: 1;
    grid-row: 1;
  }
}
.ghost-card {
  display: block;
  content: '';
  background: rgba(0, 0, 0, .2);
  border-radius: 8px;
  height: 100%;
  margin-inline: var(--spacing-1);
  margin-block-end: calc(0px - var(--spacing-1));
}
.card {
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-flow: column nowrap;
  gap: var(--spacing-1);
  background-color: var(--bg-surface-light);
  border-radius: 8px;
  padding-bottom: var(--spacing-1);
  &:last-child {
    box-shadow: 0 4px 8px rgba(0, 0, 0, .3);
    will-change: transform;
    .like-badge,
    .dislike-badge {
      border: 2px solid currentColor;
      background-color: color-mix(in srgb, currentColor 20%, transparent 100%);
      padding: var(--spacing-1\/2);
      position: absolute;
      top: 0;
      margin: var(--spacing-1);
      border-radius: 4px;
      font-size: 20px;
    }
    .like-badge {
      color: green;
      right: 0;
      rotate: 10deg;
      opacity: var(--percent-to-like);
    }
    .dislike-badge {
      color: red;
      left: 0;
      rotate: -10deg;
      opacity: var(--percent-to-dislike);
    }
  }
}
.card-img {
  width: 300px;
  max-width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
}
.card-artist,
.card-title {
  padding-inline: var(--spacing-1);
}
</style>
