import dotenv from 'dotenv';

dotenv.config();

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  runtimeConfig: {
    spotifyClientId: process.env.SPOTIFY_CLIENT_ID,
    spotifyClientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  },
  devtools: { enabled: true },
  css: [
    '@/assets/fonts.css',
    '@/assets/globals.css',
    '@/assets/layout.css',
    '@/assets/reset.css',
    '@/assets/typography.css',
    '@/assets/variables.css',
  ]
})
