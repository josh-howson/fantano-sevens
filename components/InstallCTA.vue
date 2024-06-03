<script setup lang="ts">
import { ref, onMounted } from 'vue';

const deferredPrompt = ref<Event | null>(null);
const showInstallPrompt = ref(false);

const promptInstall = () => {
  if (deferredPrompt.value) {
    (deferredPrompt.value as any).prompt();
    (deferredPrompt.value as any).userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the A2HS prompt');
      } else {
        console.log('User dismissed the A2HS prompt');
      }
      deferredPrompt.value = null;
      showInstallPrompt.value = false;
    });
  }
};

onMounted(() => {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt.value = e;
    showInstallPrompt.value = true;
  });

  window.addEventListener('appinstalled', () => {
    console.log('App installed');
    showInstallPrompt.value = false;
  });
});
</script>

<template>
  <div>
    <button v-if="showInstallPrompt" @click="promptInstall">Add to Home Screen</button>
  </div>
</template>

<style scoped>
button {
  /* Add your button styling here */
}
</style>
