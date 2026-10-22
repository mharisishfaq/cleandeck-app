import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { hapticFeedback } from '../../services/hapticsService';

interface SwiperHeaderProps {
  pendingDeleteCount: number;
  pendingDeleteSizeFormatted: string;
  onPause: () => void;
  onDeleteAll: () => void;
  onOpenReviewQueue?: () => void;
}

const SwiperHeaderInner: React.FC<SwiperHeaderProps> = ({
  pendingDeleteCount,
  pendingDeleteSizeFormatted,
  onPause,
  onDeleteAll,
  onOpenReviewQueue,
}) => {
  const hasPendingItems = pendingDeleteCount > 0;

  const handlePillPress = () => {
    if (onOpenReviewQueue) {
      hapticFeedback.light();
      onOpenReviewQueue();
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. Left Side: Pause Button */}
      <TouchableOpacity
        style={styles.pauseButton}
        onPress={onPause}
        activeOpacity={0.7}
        accessibilityLabel="Pause gallery review"
      >
        <Text style={styles.pauseText}>[ PAUSE ]</Text>
      </TouchableOpacity>

      {/* 2. Center: Live Pending Deletion Counter Pill (Clickable) */}
      <TouchableOpacity
        style={[
          styles.counterPill,
          hasPendingItems ? styles.activeCounterPill : styles.emptyCounterPill,
        ]}
        onPress={handlePillPress}
        disabled={!hasPendingItems && !onOpenReviewQueue}
        activeOpacity={0.75}
        accessibilityLabel="Review pending deletions"
      >
        <Text
          style={[
            styles.counterPillText,
            hasPendingItems ? styles.activeCounterText : styles.emptyCounterText,
          ]}
          numberOfLines={1}
        >
          {hasPendingItems
            ? `[ STAGED: ${pendingDeleteCount} // ${pendingDeleteSizeFormatted} ]`
            : '[ QUEUE: 0 ]'}
        </Text>
      </TouchableOpacity>

      {/* 3. Right Side: Delete All Button */}
      <TouchableOpacity
        style={[
          styles.deleteAllButton,
          !hasPendingItems && styles.deleteAllButtonDisabled,
        ]}
        onPress={onDeleteAll}
        disabled={!hasPendingItems}
        activeOpacity={0.7}
        accessibilityLabel="Delete all pending items"
      >
        <Text
          style={[
            styles.deleteAllButtonText,
            !hasPendingItems && styles.deleteAllTextDisabled,
          ]}
        >
          [ PURGE ALL ]
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export const SwiperHeader = React.memo(SwiperHeaderInner);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#000000',
    borderBottomWidth: 1.5,
    borderBottomColor: '#1A1A1A',
  },
  pauseButton: {
    backgroundColor: '#0A0A0A',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: '#333333',
  },
  pauseText: {
    color: '#8E8E8E',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  counterPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 3,
    borderWidth: 1.5,
    maxWidth: '52%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeCounterPill: {
    backgroundColor: '#000000',
    borderColor: '#FF3333',
  },
  emptyCounterPill: {
    backgroundColor: '#0A0A0A',
    borderColor: '#262626',
  },
  counterPillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  activeCounterText: {
    color: '#FF3333',
  },
  emptyCounterText: {
    color: '#555555',
  },
  deleteAllButton: {
    backgroundColor: '#000000',
    borderWidth: 1.5,
    borderColor: '#FF3333',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteAllButtonDisabled: {
    borderColor: '#262626',
    opacity: 0.35,
  },
  deleteAllButtonText: {
    color: '#FF3333',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  deleteAllTextDisabled: {
    color: '#555555',
  },
});
