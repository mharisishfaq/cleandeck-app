import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { hapticFeedback } from '../../services/hapticsService';

interface BottomControlsProps {
  onTrash: () => void;
  onUndo: () => void;
  onKeep: () => void;
  canUndo: boolean;
  disabled?: boolean;
}

export const BottomControls: React.FC<BottomControlsProps> = ({
  onTrash,
  onUndo,
  onKeep,
  canUndo,
  disabled = false,
}) => {
  const handleTrash = () => {
    hapticFeedback.medium();
    onTrash();
  };

  const handleUndo = () => {
    hapticFeedback.medium();
    onUndo();
  };

  const handleKeep = () => {
    hapticFeedback.medium();
    onKeep();
  };

  return (
    <View style={styles.container}>
      {/* 1. Left Trash Button */}
      <TouchableOpacity
        style={[styles.button, styles.trashButton, disabled && styles.disabledButton]}
        onPress={handleTrash}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text style={styles.trashIcon}>✕</Text>
        <Text style={styles.trashLabel}>Trash</Text>
      </TouchableOpacity>

      {/* 2. Center Undo Button */}
      <TouchableOpacity
        style={[
          styles.button,
          styles.undoButton,
          (!canUndo || disabled) && styles.disabledButton,
        ]}
        onPress={handleUndo}
        disabled={!canUndo || disabled}
        activeOpacity={0.7}
      >
        <Text style={styles.undoIcon}>↺</Text>
        <Text style={styles.undoLabel}>Undo</Text>
      </TouchableOpacity>

      {/* 3. Right Keep Button */}
      <TouchableOpacity
        style={[styles.button, styles.keepButton, disabled && styles.disabledButton]}
        onPress={handleKeep}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text style={styles.keepIcon}>✓</Text>
        <Text style={styles.keepLabel}>Keep</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 20,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 36,
  },
  disabledButton: {
    opacity: 0.35,
  },
  trashButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#1E293B',
    borderWidth: 2,
    borderColor: '#EF4444',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  trashIcon: {
    color: '#EF4444',
    fontSize: 24,
    fontWeight: '900',
  },
  trashLabel: {
    color: '#F87171',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  undoButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#1E293B',
    borderWidth: 1.5,
    borderColor: '#64748B',
  },
  undoIcon: {
    color: '#94A3B8',
    fontSize: 20,
    fontWeight: '800',
  },
  undoLabel: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '700',
    marginTop: 1,
    textTransform: 'uppercase',
  },
  keepButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#1E293B',
    borderWidth: 2,
    borderColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  keepIcon: {
    color: '#10B981',
    fontSize: 24,
    fontWeight: '900',
  },
  keepLabel: {
    color: '#34D399',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
    textTransform: 'uppercase',
  },
});
