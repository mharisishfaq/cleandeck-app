import React, { useState } from 'react';
import {
  Alert,
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
      {/* 1. Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.appName}>CleanDeck</Text>
          <View style={styles.headerRightBadges}>
            {onToggleMockMode && (
              <TouchableOpacity
                style={[styles.demoTogglePill, isMockMode && styles.demoTogglePillActive]}
                onPress={onToggleMockMode}
                activeOpacity={0.7}
              >
                <Text style={[styles.demoToggleText, isMockMode && styles.demoToggleTextActive]}>
                  {isMockMode ? '🧪 DEMO' : '📱 GALLERY'}
                </Text>
              </TouchableOpacity>
            )}
            <View style={styles.proBadge}>
              <Text style={styles.proBadgeText}>⚡ 9:16 DECK</Text>
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
          Gamified camera roll decluttering & storage recovery
        </Text>
      </View>

      {/* Limited / Partial Photo Access Banner */}
      {isLimitedAccess && (
        <View style={styles.limitedBanner}>
          <View style={styles.limitedTextContainer}>
            <Text style={styles.limitedBannerTitle}>⚠️ Limited Photo Access</Text>
            <Text style={styles.limitedBannerText}>
              Limited Photo Access granted. The app can only see and clean the photos you selected.
            </Text>
          </View>
          {onSelectMorePhotos && (
            <TouchableOpacity
              style={styles.selectMoreButton}
              onPress={onSelectMorePhotos}
              activeOpacity={0.8}
            >
              <Text style={styles.selectMoreButtonText}>Select More Photos</Text>
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
              <Text style={styles.pausedPillText}>SESSION PAUSED • {pausedDateString}</Text>
            </View>
          </View>

          <Text style={styles.pausedCardTitle}>Pick Up Where You Left Off</Text>
          <Text style={styles.pausedCardDescription}>
            Your review progress and staged deletions are safely preserved in local storage.
          </Text>

          {/* Progress Indicators */}
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statBoxNumber}>{session.reviewedCount}</Text>
              <Text style={styles.statBoxLabel}>Reviewed</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statBoxNumber}>{session.keptCount}</Text>
              <Text style={styles.statBoxLabel}>Kept</Text>
            </View>

            <View style={[styles.statBox, styles.statBoxTrash]}>
              <Text style={[styles.statBoxNumber, styles.trashText]}>{pendingCount}</Text>
              <Text style={styles.statBoxLabel}>Marked Trash</Text>
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
                🗑️ Reclaimable: <Text style={styles.boldWhite}>{pendingFormattedSize}</Text> from{' '}
                {pendingCount} {pendingCount === 1 ? 'item' : 'items'} • Tap to inspect
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
              <Text style={styles.primaryButtonText}>▶ Resume Cleaning</Text>
            </TouchableOpacity>

            {/* Quick Action: Review & Delete Staged Items in Temporary Folder Grid */}
            {pendingCount > 0 && (
              <TouchableOpacity
                style={styles.deleteStagedButton}
                onPress={() => setIsReviewModalVisible(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.deleteStagedButtonText}>
                  📂 Review & Delete {pendingCount} {pendingCount === 1 ? 'Item' : 'Items'} (
                  {pendingFormattedSize})
                </Text>
              </TouchableOpacity>
            )}

            {/* Secondary Action: Start New */}
            <TouchableOpacity
              style={styles.startNewButton}
              onPress={handleStartNewPress}
              activeOpacity={0.7}
            >
              <Text style={styles.startNewButtonText}>↻ Start New Session</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        // B) No Active Session Card
        <View style={styles.freshCard}>
          <View style={styles.iconCircle}>
            <Text style={styles.heroEmoji}>🧹</Text>
          </View>

          <Text style={styles.freshTitle}>Ready to clean your gallery?</Text>
          <Text style={styles.freshSubtitle}>
            Swipe right to keep favorite memories, swipe left to stage duplicates and heavy clutter
            for safe deletion.
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={onStartNewSession}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>✨ Start Cleaning Deck</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 3. Quick Storage Stats Card */}
      <View style={styles.statsCard}>
        <View style={styles.statsHeaderRow}>
          <Text style={styles.statsCardTitle}>Gallery Overview</Text>
          <View style={styles.totalBadge}>
            <Text style={styles.totalBadgeText}>
              {galleryStats ? `${galleryStats.totalCount.toLocaleString()} Total` : 'Scanning...'}
            </Text>
          </View>
        </View>

        <View style={styles.storageGrid}>
          <View style={styles.storageItem}>
            <Text style={styles.storageIcon}>📷</Text>
            <Text style={styles.storageValue}>
              {galleryStats ? galleryStats.photoCount.toLocaleString() : '—'}
            </Text>
            <Text style={styles.storageLabel}>Photos</Text>
          </View>

          <View style={styles.storageItem}>
            <Text style={styles.storageIcon}>🎥</Text>
            <Text style={styles.storageValue}>
              {galleryStats ? galleryStats.videoCount.toLocaleString() : '—'}
            </Text>
            <Text style={styles.storageLabel}>Videos</Text>
          </View>

          <View style={styles.storageItem}>
            <Text style={styles.storageIcon}>💾</Text>
            <Text style={styles.storageValue}>
              {galleryStats ? galleryStats.formattedTotalSize : '—'}
            </Text>
            <Text style={styles.storageLabel}>Est. Storage</Text>
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
          <View style={styles.simulatorIconCircle}>
            <Text style={styles.simulatorEmoji}>🧪</Text>
          </View>
          <View style={styles.simulatorContent}>
            <Text style={styles.simulatorTitle}>Simulator or Empty Gallery?</Text>
            <Text style={styles.simulatorSubtitle}>
              Tap to load 18 high-res sample photos & videos to test the 9:16 swiper deck!
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
    backgroundColor: '#0F172A',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 40,
    gap: 18,
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
    color: '#F8FAFC',
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  headerRightBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  demoTogglePill: {
    backgroundColor: 'rgba(51, 65, 85, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#475569',
  },
  demoTogglePillActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.25)',
    borderColor: '#6366F1',
  },
  demoToggleText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  demoToggleTextActive: {
    color: '#A5B4FC',
  },
  proBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#6366F1',
  },
  proBadgeText: {
    color: '#818CF8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  infoButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoButtonText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '800',
  },
  simulatorCard: {
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#6366F1',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  simulatorIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  simulatorEmoji: {
    fontSize: 22,
  },
  simulatorContent: {
    flex: 1,
  },
  simulatorTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  simulatorSubtitle: {
    color: '#A5B4FC',
    fontSize: 12,
    lineHeight: 16,
  },
  headerSubtitle: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 4,
  },
  pausedCard: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 4,
  },
  pausedBadgeRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  pausedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 6,
  },
  orangePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
  },
  pausedPillText: {
    color: '#FBBF24',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  pausedCardTitle: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
  },
  pausedCardDescription: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  statBoxTrash: {
    borderColor: 'rgba(239, 68, 68, 0.3)',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  statBoxNumber: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '800',
  },
  trashText: {
    color: '#F87171',
  },
  statBoxLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  reclaimPill: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    marginBottom: 16,
    alignItems: 'center',
  },
  reclaimPillText: {
    color: '#FCA5A5',
    fontSize: 12,
    fontWeight: '600',
  },
  boldWhite: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  actionColumn: {
    gap: 10,
  },
  primaryButton: {
    backgroundColor: '#10B981',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  deleteStagedButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#EF4444',
  },
  deleteStagedButtonText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '700',
  },
  startNewButton: {
    backgroundColor: 'transparent',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#475569',
  },
  startNewButtonText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  freshCard: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 2,
    borderColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroEmoji: {
    fontSize: 38,
  },
  freshTitle: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  freshSubtitle: {
    color: '#94A3B8',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  statsCard: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  statsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statsCardTitle: {
    color: '#F1F5F9',
    fontSize: 16,
    fontWeight: '700',
  },
  totalBadge: {
    backgroundColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  totalBadgeText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  storageGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  storageItem: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  storageIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  storageValue: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '800',
  },
  storageLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  limitedBanner: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(245, 158, 11, 0.35)',
    gap: 12,
  },
  limitedTextContainer: {
    gap: 4,
  },
  limitedBannerTitle: {
    color: '#FBBF24',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  limitedBannerText: {
    color: '#FDE68A',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  selectMoreButton: {
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    alignSelf: 'flex-start',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  selectMoreButtonText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});

