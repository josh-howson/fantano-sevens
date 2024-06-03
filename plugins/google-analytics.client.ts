export default defineNuxtPlugin((nuxtApp) => {
  if (process.client && process.env.NODE_ENV === 'production') {
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-H135NRCKYL';
    document.head.appendChild(script);

    script.onload = () => {
      (window as any).dataLayer = (window as any).dataLayer || [];
      function gtag(...args: any[]) {
        (window as any).dataLayer.push(args);
      }
      (window as any).gtag = gtag;

      gtag('js', new Date());
      gtag('config', 'G-H135NRCKYL');
    };
  }
});
