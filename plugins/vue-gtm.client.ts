import { createGtm } from '@gtm-support/vue-gtm';

export default defineNuxtPlugin((nuxtApp) => {
  const router = useRouter();

  nuxtApp.vueApp.use(
    createGtm({
      id: 'G-H135NRCKYL', // Replace with your actual Google Tag Manager ID
      vueRouter: router,
      debug: true,
    })
  );
});
