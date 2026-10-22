import React, { useEffect } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity } from 'react-native';
import Animated, {
  FadeInUp,
  FadeOutUp,
} from 'react-native-reanimated';

interface CelebrationToastProps {
  message: string;
  onDismiss: () => void;
  durationMs?: number;
}

export const CelebrationToast: React.FC<CelebrationToastProps> = ({
  message,
  onDismiss,
  durationMs = 3500,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, durationMs);

    return () => clearTimeout(timer);
  }, [durationMs, onDismiss]);

  return (
    <Animated.View
      entering={FadeInUp.duration(200)}
      exiting={FadeOutUp.duration(180)}
      style={styles.toastContainer}
    >
      <TouchableOpacity
        style={styles.toastPill}
        onPress={onDismiss}
        activeOpacity={0.8}
      >
        <Text style={styles.toastText}>[ {message.toUpperCase()} ]</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    alignItems: 'center',
    zIndex: 100,
  },
  toastPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 2,
    borderWidth: 2,
    borderColor: '#00FF66',
  },
  toastText: {
    color: '#00FF66',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});
