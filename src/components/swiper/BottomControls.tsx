import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { hapticFeedback } from '../../services/hapticsService';

interface BottomControlsProps {
  onTrash: () => void;
  onUndo: () => void;
  onKeep: () => void;
  canUndo: boolean;
  disabled?: boolean;
}

const BottomControlsInner: React.FC<BottomControlsProps> = ({
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
      {/* 1. Left Purge Button */}
      <TouchableOpacity
        style={[styles.actionButton, styles.purgeButton, disabled && styles.disabledButton]}
        onPress={handleTrash}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text style={styles.purgeIcon}>✕</Text>
        <Text style={styles.purgeLabel}>PURGE</Text>
      </TouchableOpacity>

      {/* 2. Center Undo Button */}
      <TouchableOpacity
        style={[
          styles.actionButton,
          styles.undoButton,
          (!canUndo || disabled) && styles.disabledButton,
        ]}
        onPress={handleUndo}
        disabled={!canUndo || disabled}
        activeOpacity={0.7}
      >
        <Text style={styles.undoIcon}>↺</Text>
        <Text style={styles.undoLabel}>UNDO</Text>
      </TouchableOpacity>

      {/* 3. Right Keep Button */}
      <TouchableOpacity
        style={[styles.actionButton, styles.keepButton, disabled && styles.disabledButton]}
        onPress={handleKeep}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text style={styles.keepIcon}>✓</Text>
        <Text style={styles.keepLabel}>KEEP</Text>
      </TouchableOpacity>
    </View>
  );
};

export const BottomControls = React.memo(BottomControlsInner);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 14,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    backgroundColor: '#000000',
    borderWidth: 2,
  },
  disabledButton: {
    opacity: 0.25,
  },
  purgeButton: {
    minWidth: 92,
    height: 58,
    borderColor: '#FF3333',
    paddingHorizontal: 16,
  },
  purgeIcon: {
    color: '#FF3333',
    fontSize: 18,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  purgeLabel: {
    color: '#FF3333',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  undoButton: {
    minWidth: 74,
    height: 52,
    borderColor: '#555555',
    paddingHorizontal: 12,
  },
  undoIcon: {
    color: '#8E8E8E',
    fontSize: 16,
    fontWeight: '900',
  },
  undoLabel: {
    color: '#8E8E8E',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  keepButton: {
    minWidth: 92,
    height: 58,
    borderColor: '#00FF66',
    paddingHorizontal: 16,
  },
  keepIcon: {
    color: '#00FF66',
    fontSize: 18,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  keepLabel: {
    color: '#00FF66',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});
