// utils/trackEvent.ts
export function trackEvent(eventCategory: string, eventAction: string, eventLabel?: string) {
  if ((window as any).gtag) {
    (window as any).gtag('event', eventAction, {
      event_category: eventCategory,
      event_label: eventLabel
    });
  } else {
    console.warn('Google Analytics is not loaded yet.');
  }
}
