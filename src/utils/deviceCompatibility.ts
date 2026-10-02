/**
 * iOS & Android Universal Compatibility Utilities
 * Ensures seamless operation on all models of iPhone, iPad, Android phones & tablets.
 */

// 1. Device & Browser Detection
export const isIOSDevice = (): boolean => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  const ua = window.navigator.userAgent.toLowerCase();
  // Standard iPhone/iPad or iPadOS 13+ with desktop-class browsing
  return /iphone|ipad|ipod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

export const isAndroidDevice = (): boolean => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  return /android/.test(window.navigator.userAgent.toLowerCase());
};

export const isStandaloneApp = (): boolean => {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
};

// 2. Safe Haptic Feedback (Vibration API for Android & supported devices)
export const triggerHaptic = (pattern: 'tick' | 'success' | 'warning' | 'alert' | 'shock') => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return;
  if (!('vibrate' in navigator)) return;

  try {
    switch (pattern) {
      case 'tick':
        navigator.vibrate(12);
        break;
      case 'success':
        navigator.vibrate([20, 60, 20]);
        break;
      case 'warning':
        navigator.vibrate([40, 60, 40]);
        break;
      case 'alert':
        navigator.vibrate([80, 50, 80, 50, 100]);
        break;
      case 'shock':
        navigator.vibrate([150, 80, 200]);
        break;
    }
  } catch (e) {
    // Graceful fallback if vibration permission is restricted
  }
};

// 3. Screen Wake Lock & iOS Fallback (Keep screen on during Resuscitation)
let wakeLockSentinel: any = null;
let iosNoSleepVideo: HTMLVideoElement | null = null;

export const requestScreenWakeLock = async (): Promise<boolean> => {
  if (typeof window === 'undefined') return false;

  // Modern Screen Wake Lock API (Android Chrome, Edge, iOS Safari 16.4+)
  if ('wakeLock' in navigator && (navigator as any).wakeLock?.request) {
    try {
      wakeLockSentinel = await (navigator as any).wakeLock.request('screen');
      wakeLockSentinel.addEventListener('release', () => {
        wakeLockSentinel = null;
      });
      return true;
    } catch (err) {
      console.warn('Wake Lock request rejected or failed:', err);
    }
  }

  // Fallback for older iOS Safari: Minimal invisible loop video to prevent lock
  if (isIOSDevice() && !iosNoSleepVideo) {
    try {
      const video = document.createElement('video');
      video.setAttribute('playsinline', '');
      video.setAttribute('muted', '');
      video.setAttribute('loop', '');
      // 1-pixel silent inline WebM/MP4 data URI
      video.src = 'data:video/mp4;base64,AAAAHGZ0eXBtcDQyAAAAAG1wNDJpc29tYXZjMQAAADpmcmVlAAABA21kYXQAAAKwAAYAAAAAABAAEAAC';
      video.muted = true;
      video.style.position = 'fixed';
      video.style.top = '-9999px';
      video.style.opacity = '0';
      video.style.pointerEvents = 'none';
      video.style.width = '1px';
      video.style.height = '1px';
      document.body.appendChild(video);
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Auto-play was prevented before user gesture
        });
      }
      iosNoSleepVideo = video;
      return true;
    } catch (e) {
      console.warn('iOS video keep-awake fallback failed:', e);
    }
  }

  return false;
};

export const releaseScreenWakeLock = async () => {
  if (wakeLockSentinel) {
    try {
      await wakeLockSentinel.release();
    } catch (e) {
      // ignore
    }
    wakeLockSentinel = null;
  }
  if (iosNoSleepVideo) {
    try {
      iosNoSleepVideo.pause();
      if (iosNoSleepVideo.parentNode) {
        iosNoSleepVideo.parentNode.removeChild(iosNoSleepVideo);
      }
    } catch (e) {
      // ignore
    }
    iosNoSleepVideo = null;
  }
};

// 4. Web Audio Unlocker for iOS & Android
export const unlockAudio = (ctx: AudioContext | null): void => {
  if (!ctx) return;
  if (ctx.state === 'suspended') {
    ctx.resume().catch((err) => {
      console.warn('AudioContext resume failed:', err);
    });
  }
};

// 5. iOS Garbage-Collection Safe Speech Helper
export const safeSpeakUtterance = (
  utterance: SpeechSynthesisUtterance,
  onEnd?: () => void
): void => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return;
  }

  // Prevent garbage collection on iOS WebKit
  (window as any).__activeUtterance = utterance;

  const cleanup = () => {
    delete (window as any).__activeUtterance;
    if (onEnd) onEnd();
  };

  utterance.onend = cleanup;
  utterance.onerror = cleanup;

  // On iOS, if cancel() was just called, a slight delay is required before speak()
  if (isIOSDevice()) {
    setTimeout(() => {
      try {
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        cleanup();
      }
    }, 40);
  } else {
    try {
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      cleanup();
    }
  }
};
