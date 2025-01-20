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