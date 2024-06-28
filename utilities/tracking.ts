export function trackEvent(type: string, params?: any) {
  const gtag = (window as any).gtag;
  if (typeof gtag !== 'undefined') {
    gtag('event', type, params);
  }
};
