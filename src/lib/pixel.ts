declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

export const initPixel = (pixelId: string) => {
  if (!pixelId || typeof window === 'undefined') return;
  if (window.fbq) return;

  window.fbq = function(...args: any[]) {
    if (window.fbq.callMethod) {
      window.fbq.callMethod.apply(window.fbq, args);
    } else {
      window.fbq.queue.push(args);
    }
  };
  
  if (!window._fbq) window._fbq = window.fbq;
  window.fbq.push = window.fbq;
  window.fbq.loaded = true;
  window.fbq.version = '2.0';
  window.fbq.queue = [];

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  const firstScript = document.getElementsByTagName('script')[0];
  if (firstScript && firstScript.parentNode) {
    firstScript.parentNode.insertBefore(script, firstScript);
  } else {
    document.head.appendChild(script);
  }

  window.fbq('init', pixelId);
};

export const trackEvent = (eventName: string, data?: any) => {
  const pixelId = (import.meta as any).env.VITE_FACEBOOK_PIXEL_ID;
  if (!pixelId || typeof window === 'undefined' || !window.fbq) return;
  window.fbq('track', eventName, data);
};
