<script setup lang="ts">
useHead({
  link: [
    {
      rel: 'preload',
      href: 'https://pj7xtf4phc.ufs.sh/f/RCdZyxsXc5qD3rTOrZkZogae654WVLTPKYhGQmFDxjvfAItS',
      as: 'image',
      type: 'image/png',
    },
  ],
});
</script>

<template>
  <main class="home-wrap">
    <header class="header">
      <NuxtLink to="/">fantanosevens</NuxtLink>
      
      <!-- <button class="button-icon button-secondary" title="install"><IconInstall /></button> -->
    </header>
    <section class="hero">
      <div class="hero-content">
        <h1>the fastest way to discover top-rated music.</h1>

        <p>with a single click, spin to get new music recommendations spanning all genres.</p>

        <NuxtLink to="/app" class="button-big button-primary">discover music now &rarr;</NuxtLink>
      </div>

      <div class="hero-visual">
        <img alt="" width="540" height="884" src="https://pj7xtf4phc.ufs.sh/f/RCdZyxsXc5qD3rTOrZkZogae654WVLTPKYhGQmFDxjvfAItS" />
      </div>
    </section>

    <section class="good-stuff">
      <div class="content">
        <h2>only the good stuff.</h2>

        <p>all album recommendations are vetted by trusted music critics. no more sifting through mediocre playlists. you can hit play with confidence you’re listening to the best.</p>

        <NuxtLink to="/app">discover music now &rarr;</NuxtLink>
      </div>

      <div class="visual">
        <img alt="" width="437" height="233" src="https://pj7xtf4phc.ufs.sh/f/RCdZyxsXc5qD7l5R9PJUmaorvRjL5hbtFHZJxqfynPIscA3k" loading="lazy" />
      </div>
    </section>

    <section class="keep-track">
      <div class="content">
        <h2>keep track of your favorites.</h2>

        <p>we save the albums you listen to, so you can come back to log, save or stream your favorite albums again anytime.</p>

        <NuxtLink to="/app">discover music now &rarr;</NuxtLink>
      </div>

      <div class="visual">
        <img alt="" width="419" height="714" src="https://pj7xtf4phc.ufs.sh/f/RCdZyxsXc5qDjkwBPwdN5MHDkhEB0wlY2KfAxVvOSi7WGcdF" loading="lazy" />
      </div>
    </section>

    <section class="easy-and-free">
      <h2>it's easy and free.</h2>

      <p>so start listening to something great right now.</p>

      <NuxtLink to="/app" class="button-big button-primary">get started</NuxtLink>
    </section>
  </main>
</template>

<style scoped>
.home-wrap {
  display: flex;
  flex-flow: column nowrap;
  gap: 32px;
  padding: 16px;
  p {
    line-height: 1.5;
  }
  a.button-big {
    display: inline-flex;
    text-decoration: none;
  }
  @media (max-width: 1023px) {
    .button-big {
      font-size: 16px;
      padding: 16px 32px;
    }
  }
  @media (min-width: 1024px) {
    display: grid;
    grid-template-columns: minmax(16px, 1fr) minmax(0, 150px) minmax(0, 800px) minmax(0, 150px) minmax(16px, 1fr);
  }
  p {
    max-width: 40ch;
  }
}
.home-wrap > * {
  grid-column: 3;
}
.header {
  grid-column: 2 / -2;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  padding: 24px 0;
  a {
    text-decoration: none;
    font-size: 20px;
    @media (min-width: 1024px) {
      font-size: 32px;
    }
  }
}
.hero {
  grid-column: 2 / -2;
  display: flex;
  gap: 64px;
  flex-direction: column;
  @media (min-width: 1024px) {
    align-items: center;
    flex-direction: row;
    min-height: 90vh;
    p {
      font-size: 24px;
    }
  }
}
.hero-content {
  h1 {
    font-size: 32px;
    line-height: 1.2;
    max-width: 30ch;
    text-wrap: balance;
    text-wrap: pretty;
  }
  @media (min-width: 1024px) {
    flex: 3 3 0;
    h1 {
      font-size: 52px;
    }
  }
}
.hero-visual {
  width: 100%;
  text-align: center;
  img {
    transform: translate(0%, 0%) scale(1) rotate(0deg);
    transition: transform .3s ease;
    width: 100%;
    max-width: 600px;
    height: auto;
    &:hover {
      transform: translate(0%, -2%) scale(1.1) rotate(1deg);
    }
  }
  @media (min-width: 1024px) {
    flex: 2 2 0;
    width: 0;
  }
}
.good-stuff,
.keep-track {
  display: flex;
  gap: 32px;
  align-items: center;
  flex-flow: column nowrap;
  h2 {
    @media (min-width: 1024px) {
      font-size: 32px;
    }
  }
  a {
    font-size: 20px;
  }
  .visual {
    img {
      width: 100%;
      height: auto;
    }
  }
  @media (min-width: 1024px) {
    gap: 64px;
    flex-flow: row nowrap;
  }
}
.good-stuff {
  @media (min-width: 1024px) {
    flex-direction: row-reverse;
  }
}
.keep-track {
  margin-top: 64px;
}
.easy-and-free {
  text-align: center;
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  padding-bottom: 200px;
  @media (min-width: 1024px) {
    h2 {
      font-size: 52px
    }
    p {
      font-size: 24px;
    }
  }
}
</style>