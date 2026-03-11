function canRegisterServiceWorker() {
  return import.meta.env.PROD && typeof window !== 'undefined' && 'serviceWorker' in navigator;
}

export function registerPwa() {
  if (!canRegisterServiceWorker()) {
    return;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.error('Talksy PWA registration failed.', error);
    });
  });
}
