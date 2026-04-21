// Stub de analytics — conecta aquí tu provider (gtag, PostHog, Segment, etc.)
export function trackEvent(
  event: string,
  props?: Record<string, unknown>
): void {
  if (typeof window === 'undefined') return;
  if (process.env.NODE_ENV === 'development') {
    console.log('[dx:analytics]', event, props);
  }
  // Wire up when you have a provider:
  // if ((window as any).gtag) (window as any).gtag('event', event, props);
  // if ((window as any).posthog) (window as any).posthog.capture(event, props);
  // if ((window as any).analytics) (window as any).analytics.track(event, props);
}
