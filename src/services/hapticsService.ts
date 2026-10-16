import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Safe haptic feedback utility providing tactile sensations
 * across gestures, button presses, and successful deletion events.
 */
export const hapticFeedback = {
  /**
   * Subtle click when dragging past the left/right swipe threshold.
   */
  light: () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (_) {}
    }
  },

  /**
   * Tactile pop when pressing thumb action buttons (Trash, Undo, Keep).
   */
  medium: () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (_) {}
    }
  },

  /**
   * Firm impact for destructive operations.
   */
  heavy: () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      } catch (_) {}
    }
  },

  /**
   * Celebratory pattern when native OS deletion succeeds and storage is freed.
   */
  success: () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (_) {}
    }
  },
};
