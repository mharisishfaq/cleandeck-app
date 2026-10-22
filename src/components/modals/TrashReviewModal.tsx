import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Platform,
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
            <Text style={styles.navButtonText}>[ CLOSE ]</Text>
          </TouchableOpacity>

          {/* Center: Title & Subtitle */}
          <View style={styles.titleColumn}>
            <Text style={styles.navTitle}>PURGE INSPECTOR</Text>
            <Text style={styles.navSubtitle}>
              // STAGED: {queue.length} // {formattedTotalSize}
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
              [ RESTORE ALL ]
            </Text>
          </TouchableOpacity>
        </View>

        {/* 2. Main Content (Grid or Empty State) */}
        {queue.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>[ QUEUE_IS_EMPTY ]</Text>
            <Text style={styles.emptySubtitle}>
              No items currently staged for purge.
            </Text>
            <TouchableOpacity style={styles.returnButton} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.returnButtonText}>[ RETURN TO GALLERY ]</Text>
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
                [ EXECUTE PURGE // {queue.length} ITEMS ({formattedTotalSize}) ]
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
    backgroundColor: '#000000',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1.5,
    borderBottomColor: '#222222',
    backgroundColor: '#000000',
  },
  navButton: {
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  navButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  disabledNavButton: {
    opacity: 0.3,
  },
  titleColumn: {
    alignItems: 'center',
    flex: 1,
  },
  navTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.2,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  navSubtitle: {
    color: '#FF3333',
    fontSize: 10,
    fontWeight: '800',
    marginTop: 2,
    letterSpacing: 0.8,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  restoreAllText: {
    color: '#00FF66',
    fontSize: 11,
    fontWeight: '900',
    textAlign: 'right',
    letterSpacing: 0.8,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  disabledRestoreAllText: {
    color: '#444444',
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
    backgroundColor: '#0A0A0A',
    position: 'relative',
    borderWidth: 1.5,
    borderColor: '#222222',
    borderRadius: 2,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  videoBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: '#000000',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  videoBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  sizeBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: '#000000',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#333333',
  },
  sizeBadgeText: {
    color: '#8E8E8E',
    fontSize: 9,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  restoreButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 26,
    height: 26,
    borderRadius: 2,
    backgroundColor: '#000000',
    borderWidth: 1.5,
    borderColor: '#00FF66',
    alignItems: 'center',
    justifyContent: 'center',
  },
  restoreIcon: {
    color: '#00FF66',
    fontSize: 14,
    fontWeight: '900',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 1.2,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  emptySubtitle: {
    color: '#666666',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  returnButton: {
    backgroundColor: '#000000',
    paddingVertical: 11,
    paddingHorizontal: 18,
    borderRadius: 2,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  returnButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#000000',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 24,
    borderTopWidth: 1.5,
    borderTopColor: '#222222',
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
  disabledDeleteButton: {
    opacity: 0.35,
  },
  deleteButtonText: {
    color: '#FF3333',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  previewBackdrop: {
    flex: 1,
    backgroundColor: '#000000',
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1.5,
    borderBottomColor: '#222222',
  },
  previewCloseButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 2,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    backgroundColor: '#000000',
  },
  previewCloseText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  previewDateText: {
    color: '#8E8E8E',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
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
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
    borderTopWidth: 1.5,
    borderTopColor: '#222222',
    paddingTop: 12,
  },
  previewMetaRow: {
    gap: 2,
  },
  previewFilename: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  previewDimensions: {
    color: '#666666',
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  keepItemButton: {
    backgroundColor: '#000000',
    paddingVertical: 13,
    borderRadius: 2,
    borderWidth: 2,
    borderColor: '#00FF66',
    alignItems: 'center',
  },
  keepItemButtonText: {
    color: '#00FF66',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});
