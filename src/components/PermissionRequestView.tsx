import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { GalleryPermissionState } from '../types/media';

interface PermissionRequestViewProps {
  permission: GalleryPermissionState;
  onRequestPermission: () => void;
  onOpenSettings: () => void;
  onRetry: () => void;
  onTryDemoMode?: () => void;
}

export const PermissionRequestView: React.FC<PermissionRequestViewProps> = ({
  permission,
  onRequestPermission,
  onOpenSettings,
  onRetry,
  onTryDemoMode,
}) => {
  const isDeniedPermanently = !permission.canAskAgain && permission.status === 'denied';

  return (
    <View style={styles.container}>
      {/* Gamified Header Badge */}
      <View style={styles.badgeContainer}>
        <Text style={styles.badgeEmoji}>⚡</Text>
        <Text style={styles.badgeText}>STORAGE MISSION: LEVEL 1</Text>
      </View>

      {/* Hero Icon */}
      <View style={styles.iconCircle}>
        <Text style={styles.iconGraphic}>🧹</Text>
      </View>

      {/* Title & Subtitle */}
      <Text style={styles.title}>Unlock Your Gallery</Text>
      <Text style={styles.subtitle}>
        CleanUp needs access to your photos and videos to analyze clutter, find
        heavy files, and help you declutter storage.
      </Text>

      {/* Permission Perks / Guarantees */}
      <View style={styles.perksList}>
        <View style={styles.perkRow}>
          <Text style={styles.perkIcon}>📸</Text>
          <View style={styles.perkContent}>
            <Text style={styles.perkTitle}>Scan Photos & Videos</Text>
            <Text style={styles.perkDescription}>
              Chronologically loads media in lightweight 20-item batches.
            </Text>
          </View>
        </View>

        <View style={styles.perkRow}>
          <Text style={styles.perkIcon}>🗑️</Text>
          <View style={styles.perkContent}>
            <Text style={styles.perkTitle}>Safe Native Deletion</Text>
            <Text style={styles.perkDescription}>
              Always prompts your OS confirmation before removing any photo.
            </Text>
          </View>
        </View>

        <View style={styles.perkRow}>
          <Text style={styles.perkIcon}>🔒</Text>
          <View style={styles.perkContent}>
            <Text style={styles.perkTitle}>100% Private & On-Device</Text>
            <Text style={styles.perkDescription}>
              Your media never leaves your phone or touches external servers.
            </Text>
          </View>
        </View>
      </View>

      {/* Status Warning if Denied */}
      {isDeniedPermanently && (
        <View style={styles.deniedBanner}>
          <Text style={styles.deniedText}>
            ⚠️ Permission was declined. Please enable Photo Library access in your
            device Settings.
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        {permission.isLoading ? (
          <View style={styles.loadingWrapper}>
            <ActivityIndicator size="large" color="#10B981" />
            <Text style={styles.loadingText}>Checking system permissions...</Text>
          </View>
        ) : isDeniedPermanently ? (
          <>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={onOpenSettings}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Open Device Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={onRetry}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryButtonText}>I Enabled It, Refresh</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={onRequestPermission}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Grant Gallery Access</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={onOpenSettings}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryButtonText}>Open Settings</Text>
            </TouchableOpacity>
          </>
        )}

        {onTryDemoMode && (
          <TouchableOpacity
            style={styles.demoButton}
            onPress={onTryDemoMode}
            activeOpacity={0.7}
          >
            <Text style={styles.demoButtonText}>✨ Try Demo Mode (18 Sample Media)</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  badgeContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.4)',
  },
  badgeEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  badgeText: {
    color: '#818CF8',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  iconCircle: {
    alignSelf: 'center',
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 2,
    borderColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  iconGraphic: {
    fontSize: 44,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  perksList: {
    backgroundColor: '#1E293B',
    borderRadius: 18,
    padding: 16,
    gap: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  perkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  perkIcon: {
    fontSize: 22,
    marginRight: 12,
    marginTop: 2,
  },
  perkContent: {
    flex: 1,
  },
  perkTitle: {
    color: '#F1F5F9',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  perkDescription: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 18,
  },
  deniedBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: '#EF4444',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  deniedText: {
    color: '#FCA5A5',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  actionContainer: {
    marginTop: 20,
    gap: 12,
  },
  loadingWrapper: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  loadingText: {
    color: '#94A3B8',
    marginTop: 8,
    fontSize: 14,
  },
  primaryButton: {
    backgroundColor: '#10B981',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  secondaryButtonText: {
    color: '#94A3B8',
    fontSize: 15,
    fontWeight: '600',
  },
  demoButton: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#6366F1',
    marginTop: 4,
  },
  demoButtonText: {
    color: '#818CF8',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
