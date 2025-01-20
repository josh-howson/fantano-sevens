<script lang="ts" setup>
  onMounted(() => {
    const script = document.createElement('script');
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4822177946089338';
    script.async = true;
    script.crossOrigin = 'anonymous';
    document.body.appendChild(script);
  });
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtPage />
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
