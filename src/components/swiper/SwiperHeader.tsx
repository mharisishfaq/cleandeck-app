import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { hapticFeedback } from '../../services/hapticsService';

interface SwiperHeaderProps {
  pendingDeleteCount: number;
  pendingDeleteSizeFormatted: string;
  onPause: () => void;
  onDeleteAll: () => void;
  onOpenReviewQueue?: () => void;
}

export const SwiperHeader: React.FC<SwiperHeaderProps> = ({
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
        <Text style={styles.pauseIcon}>⏸</Text>
        <Text style={styles.pauseText}>Pause</Text>
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
          🗑️ {pendingDeleteCount} {pendingDeleteCount === 1 ? 'item' : 'items'} •{' '}
          {pendingDeleteSizeFormatted}
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
          Delete All
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#0F172A',
  },
  pauseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 6,
  },
  pauseIcon: {
    color: '#94A3B8',
    fontSize: 12,
  },
  pauseText: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '700',
  },
  counterPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    maxWidth: '48%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeCounterPill: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  emptyCounterPill: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  counterPillText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  activeCounterText: {
    color: '#F87171',
  },
  emptyCounterText: {
    color: '#64748B',
  },
  deleteAllButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1.5,
    borderColor: '#EF4444',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteAllButtonDisabled: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderColor: '#334155',
    opacity: 0.45,
  },
  deleteAllButtonText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  deleteAllTextDisabled: {
    color: '#64748B',
  },
});
