import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .then(() => console.log('Service Worker Registered'))
      .catch((error) => console.error('Service Worker Registration failed:', error));
  }
});
