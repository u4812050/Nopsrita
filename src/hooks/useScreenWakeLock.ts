import { useEffect } from 'react';
import { requestScreenWakeLock, releaseScreenWakeLock } from '../utils/deviceCompatibility';

/**
 * Ensures the screen remains active and does not sleep during active resuscitation
 * Compatible across all Android and iOS models.
 */
export function useScreenWakeLock(isActive: boolean) {
  useEffect(() => {
    if (!isActive) {
      releaseScreenWakeLock();
      return;
    }

    // Request wake lock when active
    requestScreenWakeLock();

    // Re-acquire wake lock if user switches apps / tabs and returns
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isActive) {
        requestScreenWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      releaseScreenWakeLock();
    };
  }, [isActive]);
}
