import React from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface ConfirmDeleteModalProps {
  visible: boolean;
  itemCount: number;
  sizeFormatted: string;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  visible,
  itemCount,
  sizeFormatted,
  isDeleting,
  onCancel,
  onConfirm,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Warning Icon Badge */}
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>[ ! ]</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>[ CONFIRM PURGE ]</Text>

          {/* Body */}
          <Text style={styles.body}>
            Requested purge of{' '}
            <Text style={styles.highlightText}>
              {itemCount} {itemCount === 1 ? 'ITEM' : 'ITEMS'} ({sizeFormatted})
            </Text>{' '}
            from local device storage. Items will transfer to system Recently Deleted album.
          </Text>

          {/* System Safety Callout */}
          <View style={styles.safetyCallout}>
            <Text style={styles.safetyText}>
              // NATIVE OS WILL PROMPT A SYSTEM CONFIRMATION DIALOG BEFORE REMOVAL.
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            {/* 1. Confirm Delete All Button */}
            <TouchableOpacity
              style={[styles.deleteButton, isDeleting && styles.disabledButton]}
              onPress={onConfirm}
              disabled={isDeleting}
              activeOpacity={0.8}
            >
              {isDeleting ? (
                <View style={styles.deletingRow}>
                  <ActivityIndicator size="small" color="#FF3333" />
                  <Text style={styles.deleteButtonText}>[ REQUESTING_OS... ]</Text>
                </View>
              ) : (
                <Text style={styles.deleteButtonText}>
                  [ EXECUTE PURGE // {itemCount} {itemCount === 1 ? 'ITEM' : 'ITEMS'} ]
                </Text>
              )}
            </TouchableOpacity>

            {/* 2. Cancel Button */}
            <TouchableOpacity
              style={[styles.cancelButton, isDeleting && styles.disabledButton]}
              onPress={onCancel}
              disabled={isDeleting}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>[ ABORT // KEEP SWIPING ]</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#0A0A0A',
    borderRadius: 4,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF3333',
  },
  iconCircle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 2,
    backgroundColor: '#000000',
    borderWidth: 1.5,
    borderColor: '#FF3333',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  iconText: {
    fontSize: 14,
    color: '#FF3333',
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: 1.2,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  body: {
    color: '#8E8E8E',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  highlightText: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  safetyCallout: {
    backgroundColor: '#000000',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#262626',
    marginBottom: 18,
    width: '100%',
  },
  safetyText: {
    color: '#555555',
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  actions: {
    width: '100%',
    gap: 8,
  },
  deleteButton: {
    backgroundColor: '#000000',
    paddingVertical: 13,
    borderRadius: 2,
    borderWidth: 2,
    borderColor: '#FF3333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deletingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteButtonText: {
    color: '#FF3333',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  cancelButton: {
    backgroundColor: '#000000',
    paddingVertical: 12,
    borderRadius: 2,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  disabledButton: {
    opacity: 0.35,
  },
});
