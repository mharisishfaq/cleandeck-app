import React from 'react';
import {
  ActivityIndicator,
  Modal,
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
            <Text style={styles.iconText}>🗑️</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>Confirm Deletion</Text>

          {/* Body */}
          <Text style={styles.body}>
            Are you sure you want to delete all the left-swiped media? This will
            move{' '}
            <Text style={styles.highlightText}>
              {itemCount} {itemCount === 1 ? 'item' : 'items'} ({sizeFormatted})
            </Text>{' '}
            to your system&apos;s Recently Deleted album.
          </Text>

          {/* System Safety Callout */}
          <View style={styles.safetyCallout}>
            <Text style={styles.safetyIcon}>🛡️</Text>
            <Text style={styles.safetyText}>
              Your native OS will prompt you to confirm before any permanent changes
              are made.
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
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.deleteButtonText}>Requesting OS...</Text>
                </View>
              ) : (
                <Text style={styles.deleteButtonText}>
                  Delete All {itemCount} {itemCount === 1 ? 'Item' : 'Items'}
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
              <Text style={styles.cancelButtonText}>Cancel / Keep Swiping</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#1E293B',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 2,
    borderColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconText: {
    fontSize: 32,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
  },
  body: {
    color: '#94A3B8',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 16,
  },
  highlightText: {
    color: '#F1F5F9',
    fontWeight: '700',
  },
  safetyCallout: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 20,
    gap: 8,
  },
  safetyIcon: {
    fontSize: 16,
  },
  safetyText: {
    flex: 1,
    color: '#64748B',
    fontSize: 12,
    lineHeight: 16,
  },
  actions: {
    width: '100%',
    gap: 10,
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  deletingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#475569',
  },
  cancelButtonText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
});
