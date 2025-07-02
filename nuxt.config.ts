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
    '@/assets/animation.css',
  ],

  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    head: {
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, user-scalable=no, viewport-fit=cover' },
        { name: 'description', content: "randomly select an album to listen to based on Anthony Fantano's rating" },
        { name: 'apple-mobile-web-app-capable', content: "yes" },
        { name: 'apple-mobile-web-app-status-bar-style', content: "black translucent" },
        { name: 'theme-color', content: "#FFEC8B" },
      ],
      title: 'fantano sevens',
      link: [
        { rel: 'manifest', href: '/manifest.json?v=2' },
      ],
      htmlAttrs: {
        lang: 'en',
      },
      script: [
        {
          src: 'https://www.googletagmanager.com/gtag/js?id=G-H135NRCKYL',
          async: true,
        },
        {
          children: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-H135NRCKYL');
          `
        },
      ],
    },
  },

  ssr: true,

  compatibilityDate: '2024-08-05',
});
