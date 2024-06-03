export default defineNuxtPlugin((nuxtApp) => {
  if (process.client && process.env.NODE_ENV === 'production') {
    // Insert the Google Analytics script tag
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-H135NRCKYL';
    document.head.appendChild(script);

    // Insert the gtag function
    script.onload = () => {
      const dataLayer = (window as any).dataLayer || [];
      function gtag(...args: any[]) {
        dataLayer.push(args);
      }

      (window as any).dataLayer = dataLayer;
      (window as any).gtag = gtag;

      gtag('js', new Date());
      gtag('config', 'G-H135NRCKYL');
    };
  }
});
