import { useEffect, useState } from 'react';

function isStandaloneMode() {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

function isIosDevice() {
  if (typeof window === 'undefined') {
    return false;
  }

  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function isSafariBrowser() {
  if (typeof window === 'undefined') {
    return false;
  }

  const userAgent = window.navigator.userAgent;
  return /safari/i.test(userAgent) && !/crios|fxios|edgios|chrome|android/i.test(userAgent);
}

export function useInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(() => isStandaloneMode());
  const [showInstallHelp, setShowInstallHelp] = useState(false);
  const isIos = isIosDevice();
  const isSafari = isSafariBrowser();

  useEffect(() => {
    const mediaQuery = window.matchMedia('(display-mode: standalone)');

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
      setIsInstalled(false);
    };

    const handleAppInstalled = () => {
      setInstallPrompt(null);
      setIsInstalled(true);
      setShowInstallHelp(false);
    };

    const handleDisplayModeChange = (event) => {
      setIsInstalled(event.matches || window.navigator.standalone === true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    mediaQuery.addEventListener?.('change', handleDisplayModeChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      mediaQuery.removeEventListener?.('change', handleDisplayModeChange);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isInstalled) {
      return;
    }

    if (installPrompt) {
      await installPrompt.prompt();
      await installPrompt.userChoice.catch(() => undefined);
      setInstallPrompt(null);
      return;
    }

    setShowInstallHelp(true);
  };

  return {
    handleInstallClick,
    isInstalled,
    isIos,
    isSafari,
    setShowInstallHelp,
    showInstallHelp,
  };
}
