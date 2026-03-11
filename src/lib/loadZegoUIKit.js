const ZEGO_SDK_SCRIPT_ID = 'zego-uikit-prebuilt-sdk';
const ZEGO_SDK_SCRIPT_SRC = '/vendor/zego-uikit-prebuilt.js';

let zegoSdkPromise = null;

function readLoadedSdk() {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.ZegoUIKitPrebuilt ?? null;
}

export function loadZegoUIKitPrebuilt() {
  const loadedSdk = readLoadedSdk();

  if (loadedSdk) {
    return Promise.resolve(loadedSdk);
  }

  if (typeof document === 'undefined') {
    return Promise.reject(new Error('The ZEGO SDK can only load in the browser.'));
  }

  if (zegoSdkPromise) {
    return zegoSdkPromise;
  }

  zegoSdkPromise = new Promise((resolve, reject) => {
    const handleReady = () => {
      const sdk = readLoadedSdk();

      if (!sdk) {
        reject(new Error('The ZEGO SDK script loaded, but ZegoUIKitPrebuilt was not found on window.'));
        return;
      }

      resolve(sdk);
    };

    const existingScript = document.getElementById(ZEGO_SDK_SCRIPT_ID);

    if (existingScript) {
      existingScript.addEventListener('load', handleReady, { once: true });
      existingScript.addEventListener(
        'error',
        () => reject(new Error('Unable to load the ZEGO SDK script.')),
        { once: true },
      );
      return;
    }

    const script = document.createElement('script');
    script.id = ZEGO_SDK_SCRIPT_ID;
    script.async = true;
    script.src = ZEGO_SDK_SCRIPT_SRC;
    script.addEventListener('load', handleReady, { once: true });
    script.addEventListener(
      'error',
      () => reject(new Error('Unable to load the ZEGO SDK script.')),
      { once: true },
    );
    document.head.appendChild(script);
  }).catch((error) => {
    zegoSdkPromise = null;
    throw error;
  });

  return zegoSdkPromise;
}
