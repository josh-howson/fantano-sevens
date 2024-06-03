import dotenv from 'dotenv';

dotenv.config();

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  runtimeConfig: {
    spotifyClientId: process.env.SPOTIFY_CLIENT_ID,
    spotifyClientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    public: {
      gtagId: 'G-H135NRCKYL',
    }
  },
  devtools: { enabled: true },
  css: [
    '@/assets/fonts.css',
    '@/assets/globals.css',
    '@/assets/layout.css',
    '@/assets/reset.css',
    '@/assets/typography.css',
    '@/assets/variables.css',
  ],
  app: {
    head: {
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, user-scalable=no' },
        { name: 'description', content: "randomly select an album to listen to based on Anthony Fantano's rating" },
      ],
      title: 'fantano sevens',
      link: [
        { rel: 'manifest', href: '/manifest.json' },
      ],
      htmlAttrs: {
        lang: 'en',
      },
    },
  },
});
