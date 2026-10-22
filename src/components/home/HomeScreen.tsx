import React, { useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { CleanerSessionData, MediaAsset } from '../../types/media';
import { formatBytes, type GallerySummaryStats } from '../../services/mediaFetcherService';
import { ConfirmDeleteModal } from '../modals/ConfirmDeleteModal';
import { TrashReviewModal } from '../modals/TrashReviewModal';

interface HomeScreenProps {
  session: CleanerSessionData | null;
  galleryStats: GallerySummaryStats | null;
  isMockMode?: boolean;
  isLimitedAccess?: boolean;
  onSelectMorePhotos?: () => void;
  onToggleMockMode?: () => void;
  onOpenOnboarding?: () => void;
  onResumeSession: () => void;
  onStartNewSession: () => void;
  onDirectBatchDelete: (assetIds: string[]) => Promise<boolean>;
  onUpdateSessionQueue?: (updatedQueue: MediaAsset[]) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  session,
  galleryStats,
  isMockMode = false,
  isLimitedAccess = false,
  onSelectMorePhotos,
  onToggleMockMode,
  onOpenOnboarding,
  onResumeSession,
  onStartNewSession,
  onDirectBatchDelete,
  onUpdateSessionQueue,
}) => {
  const insets = useSafeAreaInsets();
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Staged pending stats
  const pendingQueue = session?.pendingDeleteQueue || [];
  const pendingCount = pendingQueue.length;
  const pendingBytes = pendingQueue.reduce(
    (acc, item) => acc + item.estimatedSizeBytes,
    0
  );
  const pendingFormattedSize = formatBytes(pendingBytes);

  // Formatted date string for paused session
  const pausedDateString = session?.savedAt
    ? new Date(session.savedAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  // Handler for Start New with staged item safety check
  const handleStartNewPress = () => {
    if (pendingCount > 0) {
      Alert.alert(
        'Discard Paused Queue?',
        `You have ${pendingCount} ${
          pendingCount === 1 ? 'item' : 'items'
        } (${pendingFormattedSize}) staged for deletion in your paused session. Starting fresh will discard this queue without deleting the files.\n\nStart fresh anyway?`,
        [
          { text: 'Keep Paused Queue', style: 'cancel' },
          {
            text: 'Discard & Start Fresh',
            style: 'destructive',
            onPress: onStartNewSession,
          },
        ]
      );
    } else {
      onStartNewSession();
    }
  };

  // Handler for executing deletion directly from Home
  const handleConfirmDirectDelete = async () => {
    if (!session || pendingCount === 0 || isDeleting) return;

    setIsDeleting(true);
    const ids = session.pendingDeleteQueue.map((item) => item.id);

    try {
      const success = await onDirectBatchDelete(ids);
      if (success) {
        setIsDeleteModalVisible(false);
        setIsReviewModalVisible(false);
        Alert.alert(
          'Storage Reclaimed!',
          `Successfully freed up ${pendingFormattedSize} (${ids.length} items moved to Recently Deleted).`
        );
      } else {
        setIsDeleteModalVisible(false);
      }
    } catch (err) {
      console.error('[HomeScreen] Direct delete failed:', err);
      setIsDeleteModalVisible(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRestoreItem = (assetId: string) => {
    const updated = pendingQueue.filter((a) => a.id !== assetId);
    if (onUpdateSessionQueue) {
      onUpdateSessionQueue(updated);
    }
  };

  const handleRestoreAll = () => {
    if (onUpdateSessionQueue) {
      onUpdateSessionQueue([]);
    }
    setIsReviewModalVisible(false);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: Math.max(insets.top + 10, 42),
          paddingBottom: Math.max(insets.bottom + 20, 36),
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Terminal Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <View>
            <Text style={styles.appName}>CLEANDECK</Text>
            <Text style={styles.headerVersion}>// RECLAMATION TERMINAL</Text>
          </View>
          <View style={styles.headerRightBadges}>
            {onToggleMockMode && (
              <TouchableOpacity
                style={[styles.demoTogglePill, isMockMode && styles.demoTogglePillActive]}
                onPress={onToggleMockMode}
                activeOpacity={0.7}
              >
                <Text style={[styles.demoToggleText, isMockMode && styles.demoToggleTextActive]}>
                  {isMockMode ? '[DEMO]' : '[LIVE]'}
                </Text>
              </TouchableOpacity>
            )}
            <View style={styles.proBadge}>
              <Text style={styles.proBadgeText}>[9:16 DECK]</Text>
            </View>
            {onOpenOnboarding && (
              <TouchableOpacity
                style={styles.infoButton}
                onPress={onOpenOnboarding}
                activeOpacity={0.7}
                accessibilityLabel="Tutorial and tips"
              >
                <Text style={styles.infoButtonText}>?</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        <Text style={styles.headerSubtitle}>
          Physical gesture triage & camera roll storage recovery
        </Text>
      </View>

      {/* Limited / Partial Photo Access Banner */}
      {isLimitedAccess && (
        <View style={styles.limitedBanner}>
          <View style={styles.limitedTextContainer}>
            <Text style={styles.limitedBannerTitle}>[ ACCESS: PARTIAL ]</Text>
            <Text style={styles.limitedBannerText}>
              Application restricted to selected media items only.
            </Text>
          </View>
          {onSelectMorePhotos && (
            <TouchableOpacity
              style={styles.selectMoreButton}
              onPress={onSelectMorePhotos}
              activeOpacity={0.8}
            >
              <Text style={styles.selectMoreButtonText}>[ EXTEND ACCESS ]</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* 2. Dynamic Session Card */}
      {session ? (
        // A) Paused Session Card
        <View style={styles.pausedCard}>
          <View style={styles.pausedBadgeRow}>
            <View style={styles.pausedPill}>
              <View style={styles.orangePulseDot} />
              <Text style={styles.pausedPillText}>[ SESSION PAUSED // {pausedDateString} ]</Text>
            </View>
          </View>

          <Text style={styles.pausedCardTitle}>SAVED RUN DETECTED</Text>
          <Text style={styles.pausedCardDescription}>
            Queue state and staged items preserved in offline persistent storage.
          </Text>

          {/* Progress Indicators */}
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statBoxNumber}>{session.reviewedCount}</Text>
              <Text style={styles.statBoxLabel}>REVIEWED</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statBoxNumber}>{session.keptCount}</Text>
              <Text style={styles.statBoxLabel}>KEPT</Text>
            </View>

            <View style={[styles.statBox, styles.statBoxTrash]}>
              <Text style={[styles.statBoxNumber, styles.trashText]}>{pendingCount}</Text>
              <Text style={styles.statBoxLabel}>STAGED</Text>
            </View>
          </View>

          {/* Reclaimable summary pill if items staged */}
          {pendingCount > 0 && (
            <TouchableOpacity
              style={styles.reclaimPill}
              onPress={() => setIsReviewModalVisible(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.reclaimPillText}>
                [ PURGE QUEUE: <Text style={styles.boldWhite}>{pendingFormattedSize}</Text> // {pendingCount} {pendingCount === 1 ? 'ITEM' : 'ITEMS'} • TAP TO INSPECT ]
              </Text>
            </TouchableOpacity>
          )}

          {/* Action Buttons */}
          <View style={styles.actionColumn}>
            {/* Primary Action: Resume */}
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={onResumeSession}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>[ RESUME CLEANING RUN ]</Text>
            </TouchableOpacity>

            {/* Quick Action: Review & Delete Staged Items in Temporary Folder Grid */}
            {pendingCount > 0 && (
              <TouchableOpacity
                style={styles.deleteStagedButton}
                onPress={() => setIsReviewModalVisible(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.deleteStagedButtonText}>
                  [ PURGE {pendingCount} STAGED // {pendingFormattedSize} ]
                </Text>
              </TouchableOpacity>
            )}

            {/* Secondary Action: Start New */}
            <TouchableOpacity
              style={styles.startNewButton}
              onPress={handleStartNewPress}
              activeOpacity={0.7}
            >
              <Text style={styles.startNewButtonText}>[ DISCARD & START NEW ]</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        // B) No Active Session Card
        <View style={styles.freshCard}>
          <View style={styles.iconCircle}>
            <Text style={styles.heroEmoji}>//</Text>
          </View>

          <Text style={styles.freshTitle}>GALLERY READY FOR TRIAGE</Text>
          <Text style={styles.freshSubtitle}>
            SWIPE RIGHT: PRESERVE [KEEP] // SWIPE LEFT: STAGE FOR PURGE
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={onStartNewSession}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>[ START CLEANING RUN ]</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 3. Quick Storage Stats Card */}
      <View style={styles.statsCard}>
        <View style={styles.statsHeaderRow}>
          <Text style={styles.statsCardTitle}>STORAGE TELEMETRY</Text>
          <View style={styles.totalBadge}>
            <Text style={styles.totalBadgeText}>
              {galleryStats ? `[${galleryStats.totalCount.toLocaleString()} TOTAL]` : '[SCANNING...]'}
            </Text>
          </View>
        </View>

        <View style={styles.storageGrid}>
          <View style={styles.storageItem}>
            <Text style={styles.storageLabel}>// PHOTOS</Text>
            <Text style={styles.storageValue}>
              {galleryStats ? galleryStats.photoCount.toLocaleString() : '—'}
            </Text>
          </View>

          <View style={styles.storageItem}>
            <Text style={styles.storageLabel}>// VIDEOS</Text>
            <Text style={styles.storageValue}>
              {galleryStats ? galleryStats.videoCount.toLocaleString() : '—'}
            </Text>
          </View>

          <View style={styles.storageItem}>
            <Text style={styles.storageLabel}>// EST. SIZE</Text>
            <Text style={styles.storageValue}>
              {galleryStats ? galleryStats.formattedTotalSize : '—'}
            </Text>
          </View>
        </View>
      </View>

      {/* 4. Simulator / Zero Media Helper Banner */}
      {galleryStats && galleryStats.totalCount === 0 && !isMockMode && onToggleMockMode && (
        <TouchableOpacity
          style={styles.simulatorCard}
          onPress={onToggleMockMode}
          activeOpacity={0.8}
        >
          <View style={styles.simulatorContent}>
            <Text style={styles.simulatorTitle}>[ SIMULATOR EMPTY GALLERY ]</Text>
            <Text style={styles.simulatorSubtitle}>
              Tap to mount 18 high-res mock samples to test swipe deck.
            </Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Full-Screen Temporary Folder Queue Inspector */}
      <TrashReviewModal
        visible={isReviewModalVisible}
        queue={pendingQueue}
        onClose={() => setIsReviewModalVisible(false)}
        onRestoreItem={handleRestoreItem}
        onRestoreAll={handleRestoreAll}
        onDeleteAll={() => {
          setIsReviewModalVisible(false);
          setTimeout(() => {
            handleConfirmDirectDelete();
          }, 150);
        }}
        isDeleting={isDeleting}
      />

      {/* Confirmation Modal for Direct Delete from Home */}
      <ConfirmDeleteModal
        visible={isDeleteModalVisible}
        itemCount={pendingCount}
        sizeFormatted={pendingFormattedSize}
        isDeleting={isDeleting}
        onCancel={() => setIsDeleteModalVisible(false)}
        onConfirm={handleConfirmDirectDelete}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 36,
    gap: 14,
  },
  header: {
    marginBottom: 4,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  appName: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 1.5,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  headerVersion: {
    color: '#8E8E8E',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  headerRightBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  demoTogglePill: {
    backgroundColor: '#0A0A0A',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 2,
    borderWidth: 1.5,
    borderColor: '#333333',
  },
  demoTogglePillActive: {
    backgroundColor: '#000000',
    borderColor: '#D4FF00',
  },
  demoToggleText: {
    color: '#666666',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  demoToggleTextActive: {
    color: '#D4FF00',
  },
  proBadge: {
    backgroundColor: '#0A0A0A',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 2,
    borderWidth: 1.5,
    borderColor: '#333333',
  },
  proBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  infoButton: {
    width: 28,
    height: 28,
    borderRadius: 2,
    backgroundColor: '#0A0A0A',
    borderWidth: 1.5,
    borderColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  headerSubtitle: {
    color: '#777777',
    fontSize: 12,
    marginTop: 6,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  pausedCard: {
    backgroundColor: '#0A0A0A',
    borderRadius: 4,
    padding: 16,
    borderWidth: 2,
    borderColor: '#D4FF00',
  },
  pausedBadgeRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  pausedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#D4FF00',
    gap: 6,
  },
  orangePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 1,
    backgroundColor: '#D4FF00',
  },
  pausedPillText: {
    color: '#D4FF00',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  pausedCardTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  pausedCardDescription: {
    color: '#777777',
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#000000',
    borderRadius: 2,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#222222',
  },
  statBoxTrash: {
    borderColor: '#FF3333',
  },
  statBoxNumber: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  trashText: {
    color: '#FF3333',
  },
  statBoxLabel: {
    color: '#666666',
    fontSize: 9,
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: 0.8,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  reclaimPill: {
    backgroundColor: '#000000',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 2,
    borderWidth: 1.5,
    borderColor: '#FF3333',
    marginBottom: 14,
    alignItems: 'center',
  },
  reclaimPillText: {
    color: '#FF3333',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  boldWhite: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  actionColumn: {
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#D4FF00',
    borderRadius: 3,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#D4FF00',
  },
  primaryButtonText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  deleteStagedButton: {
    backgroundColor: '#000000',
    borderRadius: 3,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FF3333',
  },
  deleteStagedButtonText: {
    color: '#FF3333',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  startNewButton: {
    backgroundColor: '#000000',
    borderRadius: 3,
    paddingVertical: 11,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#333333',
  },
  startNewButtonText: {
    color: '#8E8E8E',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  freshCard: {
    backgroundColor: '#0A0A0A',
    borderRadius: 4,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#262626',
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 2,
    backgroundColor: '#000000',
    borderWidth: 2,
    borderColor: '#D4FF00',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  heroEmoji: {
    fontSize: 20,
    color: '#D4FF00',
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  freshTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 1.2,
    marginBottom: 6,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  freshSubtitle: {
    color: '#777777',
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
    marginBottom: 18,
    letterSpacing: 0.5,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  statsCard: {
    backgroundColor: '#0A0A0A',
    borderRadius: 4,
    padding: 16,
    borderWidth: 2,
    borderColor: '#262626',
  },
  statsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statsCardTitle: {
    color: '#8E8E8E',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.2,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  totalBadge: {
    backgroundColor: '#000000',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 2,
    borderWidth: 1.5,
    borderColor: '#333333',
  },
  totalBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  storageGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  storageItem: {
    flex: 1,
    backgroundColor: '#000000',
    borderRadius: 2,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: 1.5,
    borderColor: '#1E1E1E',
  },
  storageValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  storageLabel: {
    color: '#666666',
    fontSize: 9,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: 0.8,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  limitedBanner: {
    backgroundColor: '#0A0A0A',
    borderRadius: 4,
    padding: 14,
    borderWidth: 2,
    borderColor: '#D4FF00',
    gap: 10,
  },
  limitedTextContainer: {
    gap: 2,
  },
  limitedBannerTitle: {
    color: '#D4FF00',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  limitedBannerText: {
    color: '#8E8E8E',
    fontSize: 11,
    lineHeight: 16,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  selectMoreButton: {
    backgroundColor: '#000000',
    borderRadius: 2,
    borderWidth: 1.5,
    borderColor: '#D4FF00',
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  selectMoreButtonText: {
    color: '#D4FF00',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  simulatorCard: {
    backgroundColor: '#0A0A0A',
    borderRadius: 4,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#333333',
  },
  simulatorContent: {
    gap: 4,
  },
  simulatorTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  simulatorSubtitle: {
    color: '#777777',
    fontSize: 11,
    lineHeight: 15,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});

