import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { MediaAsset } from '../../types/media';
import { formatBytes } from '../../services/mediaFetcherService';
import { hapticFeedback } from '../../services/hapticsService';
import { VideoCardContent } from '../swiper/VideoCardContent';

interface TrashReviewModalProps {
  visible: boolean;
  queue: MediaAsset[];
  onClose: () => void;
  onRestoreItem: (assetId: string) => void;
  onRestoreAll: () => void;
  onDeleteAll: () => void;
  isDeleting?: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_GAP = 3;
const NUM_COLUMNS = 3;
const ITEM_SIZE = Math.floor((SCREEN_WIDTH - GRID_GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS);

export const TrashReviewModal: React.FC<TrashReviewModalProps> = ({
  visible,
  queue,
  onClose,
  onRestoreItem,
  onRestoreAll,
  onDeleteAll,
  isDeleting = false,
}) => {
  const insets = useSafeAreaInsets();
  // Active asset selected for full-screen expanded inspection
  const [inspectingAsset, setInspectingAsset] = useState<MediaAsset | null>(null);

  const totalBytes = queue.reduce((sum, item) => sum + item.estimatedSizeBytes, 0);
  const formattedTotalSize = formatBytes(totalBytes);

  const handleRestoreAllPress = () => {
    if (queue.length === 0) return;

    Alert.alert(
      'Restore All Items?',
      `Are you sure you want to move all ${queue.length} ${
        queue.length === 1 ? 'item' : 'items'
      } back to your keep pile?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore All',
          style: 'default',
          onPress: () => {
            hapticFeedback.medium();
            onRestoreAll();
          },
        },
      ]
    );
  };

  const handleSingleRestore = (assetId: string) => {
    hapticFeedback.light();
    onRestoreItem(assetId);
    if (inspectingAsset?.id === assetId) {
      setInspectingAsset(null);
    }
  };

  const renderGridItem = ({ item }: { item: MediaAsset }) => {
    const isVideo = item.mediaType === 'video';

    return (
      <TouchableOpacity
        style={styles.gridItem}
        activeOpacity={0.85}
        onPress={() => {
          hapticFeedback.light();
          setInspectingAsset(item);
        }}
      >
        <Image source={{ uri: item.uri }} style={styles.thumbnail} resizeMode="cover" />

        {/* Top-Left: Video Badge or Type */}
        {isVideo && (
          <View style={styles.videoBadge}>
            <Text style={styles.videoBadgeText}>
              ▶ {item.formattedDuration || 'VID'}
            </Text>
          </View>
        )}

        {/* Bottom-Left: Size Badge */}
        <View style={styles.sizeBadge}>
          <Text style={styles.sizeBadgeText}>{item.formattedSize}</Text>
        </View>

        {/* Top-Right: Quick Restore Button */}
        <TouchableOpacity
          style={styles.restoreButton}
          onPress={() => handleSingleRestore(item.id)}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.restoreIcon}>↺</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* 1. Top Navigation Bar (Safe-area padded) */}
        <View style={[styles.navBar, { paddingTop: Math.max(insets.top, 14) }]}>
          {/* Left: Close */}
          <TouchableOpacity
            style={styles.navButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.navButtonText}>Close</Text>
          </TouchableOpacity>

          {/* Center: Title & Subtitle */}
          <View style={styles.titleColumn}>
            <Text style={styles.navTitle}>Temporary Folder</Text>
            <Text style={styles.navSubtitle}>
              {queue.length} {queue.length === 1 ? 'item' : 'items'} • {formattedTotalSize}
            </Text>
          </View>

          {/* Right: Restore All */}
          <TouchableOpacity
            style={[styles.navButton, queue.length === 0 && styles.disabledNavButton]}
            onPress={handleRestoreAllPress}
            disabled={queue.length === 0}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.restoreAllText,
                queue.length === 0 && styles.disabledRestoreAllText,
              ]}
            >
              Restore All
            </Text>
          </TouchableOpacity>
        </View>

        {/* 2. Main Content (Grid or Empty State) */}
        {queue.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Text style={styles.emptyEmoji}>✨</Text>
            </View>
            <Text style={styles.emptyTitle}>Temporary Folder is Empty</Text>
            <Text style={styles.emptySubtitle}>
              No photos or videos are currently staged for deletion.
            </Text>
            <TouchableOpacity style={styles.returnButton} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.returnButtonText}>Back to Gallery</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={queue}
            keyExtractor={(item) => item.id}
            renderItem={renderGridItem}
            numColumns={NUM_COLUMNS}
            columnWrapperStyle={styles.rowWrapper}
            contentContainerStyle={[
              styles.gridContent,
              { paddingBottom: Math.max(insets.bottom + 90, 110) },
            ]}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* 3. Sticky Bottom Action Bar (Safe-area padded) */}
        {queue.length > 0 && (
          <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom + 12, 28) }]}>
            <TouchableOpacity
              style={[styles.deleteButton, isDeleting && styles.disabledDeleteButton]}
              onPress={() => {
                hapticFeedback.heavy();
                onDeleteAll();
              }}
              disabled={isDeleting}
              activeOpacity={0.8}
            >
              <Text style={styles.deleteButtonText}>
                Delete All {queue.length} {queue.length === 1 ? 'Item' : 'Items'} (
                {formattedTotalSize})
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 4. Full-Screen Asset Inspection Sub-Modal */}
        {inspectingAsset && (
          <Modal
            visible={!!inspectingAsset}
            transparent
            animationType="fade"
            onRequestClose={() => setInspectingAsset(null)}
          >
            <View style={styles.previewBackdrop}>
              <SafeAreaView style={styles.previewContainer}>
                {/* Preview Header */}
                <View style={[styles.previewHeader, { paddingTop: Math.max(insets.top, 14) }]}>
                  <TouchableOpacity
                    style={styles.previewCloseButton}
                    onPress={() => setInspectingAsset(null)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.previewCloseText}>✕ Close</Text>
                  </TouchableOpacity>

                  <Text style={styles.previewDateText}>
                    {inspectingAsset.formattedDate}
                  </Text>
                </View>

                {/* Media Preview Box */}
                <View style={styles.previewMediaBox}>
                  {inspectingAsset.mediaType === 'video' ? (
                    <VideoCardContent uri={inspectingAsset.uri} />
                  ) : (
                    <Image
                      source={{ uri: inspectingAsset.uri }}
                      style={styles.previewImage}
                      resizeMode="contain"
                    />
                  )}
                </View>

                {/* Preview Metadata & Keep Action */}
                <View style={[styles.previewFooter, { paddingBottom: Math.max(insets.bottom + 14, 24) }]}>
                  <View style={styles.previewMetaRow}>
                    <Text style={styles.previewFilename} numberOfLines={1}>
                      {inspectingAsset.filename}
                    </Text>
                    <Text style={styles.previewDimensions}>
                      {inspectingAsset.width} × {inspectingAsset.height} •{' '}
                      {inspectingAsset.formattedSize}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.keepItemButton}
                    onPress={() => handleSingleRestore(inspectingAsset.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.keepItemButtonText}>
                      ✓ Keep This Item (Restore)
                    </Text>
                  </TouchableOpacity>
                </View>
              </SafeAreaView>
            </View>
          </Modal>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    backgroundColor: '#0F172A',
  },
  navButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    minWidth: 70,
  },
  navButtonText: {
    color: '#94A3B8',
    fontSize: 15,
    fontWeight: '600',
  },
  disabledNavButton: {
    opacity: 0.35,
  },
  titleColumn: {
    alignItems: 'center',
    flex: 1,
  },
  navTitle: {
    color: '#F8FAFC',
    fontSize: 17,
    fontWeight: '800',
  },
  navSubtitle: {
    color: '#F87171',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  restoreAllText: {
    color: '#10B981',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'right',
  },
  disabledRestoreAllText: {
    color: '#64748B',
  },
  rowWrapper: {
    gap: GRID_GAP,
  },
  gridContent: {
    paddingBottom: 110,
    gap: GRID_GAP,
  },
  gridItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    backgroundColor: '#0D0D0D',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 6,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  videoBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  videoBadgeText: {
    color: '#F8FAFC',
    fontSize: 10,
    fontWeight: '700',
  },
  sizeBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  sizeBadgeText: {
    color: '#CBD5E1',
    fontSize: 10,
    fontWeight: '700',
  },
  restoreButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  restoreIcon: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '900',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
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
  emptyEmoji: {
    fontSize: 38,
  },
  emptyTitle: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  returnButton: {
    backgroundColor: '#1E293B',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  returnButtonText: {
    color: '#F1F5F9',
    fontSize: 14,
    fontWeight: '700',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0F172A',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
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
  disabledDeleteButton: {
    opacity: 0.5,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  previewBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  previewCloseButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#1E293B',
  },
  previewCloseText: {
    color: '#F1F5F9',
    fontSize: 13,
    fontWeight: '700',
  },
  previewDateText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  previewMediaBox: {
    flex: 1,
    width: '100%',
    position: 'relative',
    marginVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewFooter: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 14,
  },
  previewMetaRow: {
    gap: 4,
  },
  previewFilename: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
  },
  previewDimensions: {
    color: '#64748B',
    fontSize: 12,
  },
  keepItemButton: {
    backgroundColor: '#10B981',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  keepItemButtonText: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
