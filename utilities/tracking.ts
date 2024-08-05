import { ENVIRONMENT } from "~/types/Environment";

export function trackEvent(type: string, params?: any) {
  if (process.env.NODE_ENV === ENVIRONMENT.DEVELOPMENT) return;

  const gtag = (window as any).gtag;
  if (typeof gtag !== 'undefined') {
    gtag('event', type, params);
  }
};
