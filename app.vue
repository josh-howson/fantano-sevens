<script setup lang="ts">
import "@storedotapp/pwa-install-dialog";
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtPage />
  <pwa-install-dialog id="install-dialog" app="fantanosevens" />
</template>

<style>
.page-enter-active,
.page-leave-active {
  transition: all 0.4s;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  filter: blur(1rem);
}
</style>
