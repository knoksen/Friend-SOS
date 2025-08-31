export const vibrate = (pattern: number | number[] = [100]) => {
  if ('vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch (e) {
      console.warn('Vibration not supported or permission denied');
    }
  }
};

export const HAPTIC_PATTERNS = {
  SUCCESS: [50] as number[],
  ERROR: [100, 50, 100] as number[],
  WARNING: [50, 30, 50] as number[],
  BUTTON_PRESS: [20] as number[],
  ALERT_TRIGGER: [100, 30, 100, 30, 100] as number[],
};
