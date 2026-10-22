import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import type { CleanerSessionData, MediaAsset } from '../../types/media';
import { formatBytes } from '../../services/mediaFetcherService';
import { hapticFeedback } from '../../services/hapticsService';
import { saveSession } from '../../services/sessionService';
import { MediaCard } from './MediaCard';
import { BottomControls } from './BottomControls';
import { SwiperHeader } from './SwiperHeader';
import { ConfirmDeleteModal } from '../modals/ConfirmDeleteModal';
import { TrashReviewModal } from '../modals/TrashReviewModal';
import { CelebrationToast } from '../notifications/CelebrationToast';

interface SwiperDeckProps {
  initialAssets: MediaAsset[];
  totalCount: number;
  hasNextPage: boolean;
  onLoadNextBatch: () => void;
  onDeleteAssets?: (ids: string[]) => Promise<boolean>;
  onPause: (sessionData: CleanerSessionData) => void;
  onReturnHome: () => void;
  onSessionUpdate?: (sessionData: CleanerSessionData) => void;
  initialPendingQueue?: MediaAsset[];
  initialReviewedCount?: number;
  initialKeptCount?: number;
}

interface SwipeHistoryItem {
  asset: MediaAsset;
  action: 'keep' | 'trash';
}

const MAX_HISTORY_ITEMS = 15;

export const SwiperDeck: React.FC<SwiperDeckProps> = ({
  initialAssets,
  totalCount,
  hasNextPage,
  onLoadNextBatch,
  onDeleteAssets,
  onPause,
  onReturnHome,
  onSessionUpdate,
  initialPendingQueue = [],
  initialReviewedCount = 0,
  initialKeptCount = 0,
}) => {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // 1. Strict 9:16 Aspect-Ratio Box Dimensions with Safe Area protection
  const topInset = Math.max(insets.top, 10);
  const bottomInset = Math.max(insets.bottom, 12);
  const availableHeight = Math.max(280, windowHeight - topInset - bottomInset - 180);
  const availableWidth = windowWidth - 32;
  const targetRatio = 9 / 16;

  let cardWidth = availableWidth;
  let cardHeight = cardWidth / targetRatio;

  if (cardHeight > availableHeight) {
    cardHeight = availableHeight;
    cardWidth = cardHeight * targetRatio;
  }

  const SWIPE_THRESHOLD = cardWidth * 0.28;

  // 2. Queue, History & Staged Deletion State
  const [queue, setQueue] = useState<MediaAsset[]>([]);
  const [history, setHistory] = useState<SwipeHistoryItem[]>([]);
  const [pendingDeleteQueue, setPendingDeleteQueue] = useState<MediaAsset[]>(initialPendingQueue);
  const [reviewedCount, setReviewedCount] = useState<number>(initialReviewedCount);
  const [keptCount, setKeptCount] = useState<number>(initialKeptCount);
  const [isSwipingProgrammatically, setIsSwipingProgrammatically] = useState(false);
  const [isMediaZoomed, setIsMediaZoomed] = useState(false);

  // Global deduplication: track every asset ID ever shown to the user
  const seenAssetIds = useRef<Set<string>>(new Set());

  // Ref-based snapshot of pendingDeleteQueue IDs for sync effect (avoids dependency churn)
  const pendingDeleteIdsRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    pendingDeleteIdsRef.current = new Set(pendingDeleteQueue.map((a) => a.id));
  }, [pendingDeleteQueue]);

  // Track how many initialAssets have already been synced to avoid re-iterating the full array
  const lastSyncedLengthRef = useRef(0);

  // Seed seenIds with any initial pending queue items (resumed session)
  useEffect(() => {
    initialPendingQueue.forEach((a) => seenAssetIds.current.add(a.id));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Modal & Notification States
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState<string | null>(null);

  // Handlers for Temporary Folder Queue Inspector with immediate storage synchronization
  const handleRestoreFromReview = useCallback(
    (assetId: string) => {
      seenAssetIds.current.delete(assetId);
      setPendingDeleteQueue((prevPending) => {
        const restored = prevPending.find((a) => a.id === assetId);
        const updatedPending = prevPending.filter((a) => a.id !== assetId);
        if (restored) {
          setQueue((prevQueue) => {
            const updatedQueue = [restored, ...prevQueue];
            const updatedSession: CleanerSessionData = {
              lastAssetId: updatedQueue[0]?.id || '',
              pendingDeleteQueue: updatedPending,
              reviewedCount: Math.max(0, reviewedCount - 1),
              keptCount,
              savedAt: new Date().toISOString(),
            };
            saveSession(updatedSession).catch((err) =>
              console.error('[SwiperDeck] Failed to persist session on item restore:', err)
            );
            if (onSessionUpdate) {
              onSessionUpdate(updatedSession);
            }
            return updatedQueue;
          });
          setReviewedCount((prev) => Math.max(0, prev - 1));
        }
        return updatedPending;
      });
    },
    [reviewedCount, keptCount, onSessionUpdate]
  );

  const handleRestoreAllFromReview = useCallback(() => {
    setPendingDeleteQueue((prevPending) => {
      const restoredItems = [...prevPending];
      restoredItems.forEach((a) => seenAssetIds.current.delete(a.id));
      setQueue((prevQueue) => {
        const updatedQueue = [...restoredItems, ...prevQueue];
        const newReviewedCount = Math.max(0, reviewedCount - restoredItems.length);
        const updatedSession: CleanerSessionData = {
          lastAssetId: updatedQueue[0]?.id || '',
          pendingDeleteQueue: [],
          reviewedCount: newReviewedCount,
          keptCount,
          savedAt: new Date().toISOString(),
        };
        saveSession(updatedSession).catch((err) =>
          console.error('[SwiperDeck] Failed to persist session on restore all:', err)
        );
        if (onSessionUpdate) {
          onSessionUpdate(updatedSession);
        }
        return updatedQueue;
      });
      setReviewedCount((prev) => Math.max(0, prev - restoredItems.length));
      return [];
    });
    setIsReviewModalVisible(false);
  }, [reviewedCount, keptCount, onSessionUpdate]);

  // Calculate live reclaimable space (memoized to avoid recalculating every render)
  const totalReclaimableBytes = useMemo(
    () => pendingDeleteQueue.reduce((sum, item) => sum + item.estimatedSizeBytes, 0),
    [pendingDeleteQueue]
  );
  const reclaimableSizeFormatted = useMemo(
    () => formatBytes(totalReclaimableBytes),
    [totalReclaimableBytes]
  );

  // Sync incoming assets from media fetcher into local queue (with global dedup)
  // Only processes NEW assets (from lastSyncedLength onward) to avoid O(n) on every batch.
  // Uses pendingDeleteIdsRef instead of pendingDeleteQueue to avoid re-triggering on every swipe.
  useEffect(() => {
    if (initialAssets.length === 0) return;

    if (lastSyncedLengthRef.current > initialAssets.length) {
      lastSyncedLengthRef.current = 0;
    }
    const startIdx = lastSyncedLengthRef.current;
    if (startIdx >= initialAssets.length) return; // nothing new

    const newSlice = initialAssets.slice(startIdx);
    lastSyncedLengthRef.current = initialAssets.length;

    setQueue((prevQueue) => {
      const existingIds = new Set(prevQueue.map((a) => a.id));
      const pendingIds = pendingDeleteIdsRef.current;
      const newItems = newSlice.filter(
        (a) =>
          !existingIds.has(a.id) &&
          !seenAssetIds.current.has(a.id) &&
          !pendingIds.has(a.id)
      );
      if (newItems.length === 0) return prevQueue;
      return [...prevQueue, ...newItems];
    });
  }, [initialAssets]);

  // Trigger next batch fetch when fewer than 5 items remain (debounced)
  const batchFetchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (batchFetchTimerRef.current) {
      clearTimeout(batchFetchTimerRef.current);
    }
    if (queue.length > 0 && queue.length < 5 && hasNextPage) {
      batchFetchTimerRef.current = setTimeout(() => {
        onLoadNextBatch();
      }, 150);
    }
    return () => {
      if (batchFetchTimerRef.current) {
        clearTimeout(batchFetchTimerRef.current);
      }
    };
  }, [queue.length, hasNextPage, onLoadNextBatch]);

  // 3. Shared Values for 60fps Physical Gestures & Haptic Tracking
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const hasTriggeredThresholdHaptic = useSharedValue(false);

  // 4. Staged Swipe Completion Handler
  const onSwipeComplete = useCallback(
    (action: 'keep' | 'trash') => {
      setQueue((prevQueue) => {
        if (prevQueue.length === 0) return prevQueue;
        const [swipedCard, ...remainingQueue] = prevQueue;

        // Mark this asset as permanently processed (prevents re-entry from stale arrays)
        seenAssetIds.current.add(swipedCard.id);

        // Cap history to 15 items to prevent unbounded memory growth
        setHistory((prevHist) => {
          const updated = [...prevHist, { asset: swipedCard, action }];
          return updated.length > MAX_HISTORY_ITEMS
            ? updated.slice(-MAX_HISTORY_ITEMS)
            : updated;
        });

        setReviewedCount((prev) => prev + 1);

        if (action === 'trash') {
          setPendingDeleteQueue((prevPending) => [...prevPending, swipedCard]);
        } else {
          setKeptCount((prev) => prev + 1);
        }

        return remainingQueue;
      });

      // Reset coordinates and zoom lock for the next card in the deck
      translateX.value = 0;
      translateY.value = 0;
      hasTriggeredThresholdHaptic.value = false;
      setIsSwipingProgrammatically(false);
      setIsMediaZoomed(false);
    },
    [hasTriggeredThresholdHaptic, translateX, translateY]
  );

  // 5. Pan Gesture Handler (disabled when photo is zoomed in)
  const panGesture = Gesture.Pan()
    .enabled(!isMediaZoomed)
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;

      // Haptic click when passing swipe threshold
      const isPastThreshold =
        translateX.value < -SWIPE_THRESHOLD || translateX.value > SWIPE_THRESHOLD;

      if (isPastThreshold && !hasTriggeredThresholdHaptic.value) {
        hasTriggeredThresholdHaptic.value = true;
        runOnJS(hapticFeedback.light)();
      } else if (!isPastThreshold && hasTriggeredThresholdHaptic.value) {
        hasTriggeredThresholdHaptic.value = false;
      }
    })
    .onEnd((event) => {
      const isFastSwipeLeft = event.velocityX < -800;
      const isFastSwipeRight = event.velocityX > 800;
      const isPassedThresholdLeft = translateX.value < -SWIPE_THRESHOLD;
      const isPassedThresholdRight = translateX.value > SWIPE_THRESHOLD;

      if (isFastSwipeLeft || isPassedThresholdLeft) {
        // Fling off-screen left (TRASH -> Staged)
        translateX.value = withTiming(-windowWidth * 1.5, { duration: 220 }, () => {
          runOnJS(onSwipeComplete)('trash');
        });
      } else if (isFastSwipeRight || isPassedThresholdRight) {
        // Fling off-screen right (KEEP)
        translateX.value = withTiming(windowWidth * 1.5, { duration: 220 }, () => {
          runOnJS(onSwipeComplete)('keep');
        });
      } else {
        // Snap back to center
        translateX.value = withSpring(0, { damping: 18, stiffness: 140 });
        translateY.value = withSpring(0, { damping: 18, stiffness: 140 });
        hasTriggeredThresholdHaptic.value = false;
      }
    });

  // 6. Programmatic Action Triggers for Bottom Controls
  const handleProgrammaticSwipe = useCallback(
    (action: 'keep' | 'trash') => {
      if (queue.length === 0 || isSwipingProgrammatically) return;
      setIsSwipingProgrammatically(true);

      const targetX = action === 'keep' ? windowWidth * 1.5 : -windowWidth * 1.5;
      translateX.value = withTiming(targetX, { duration: 240 }, () => {
        runOnJS(onSwipeComplete)(action);
      });
    },
    [queue.length, isSwipingProgrammatically, onSwipeComplete, translateX, windowWidth]
  );

  // 7. Undo Integration
  const handleUndo = useCallback(() => {
    if (history.length === 0 || isSwipingProgrammatically) return;

    setHistory((prevHistory) => {
      const lastIndex = prevHistory.length - 1;
      const lastItem = prevHistory[lastIndex];
      const newHistory = prevHistory.slice(0, lastIndex);

      seenAssetIds.current.delete(lastItem.asset.id);
      setQueue((prevQueue) => [lastItem.asset, ...prevQueue]);
      setReviewedCount((prev) => Math.max(0, prev - 1));

      if (lastItem.action === 'trash') {
        setPendingDeleteQueue((prevPending) =>
          prevPending.filter((item) => item.id !== lastItem.asset.id)
        );
      } else {
        setKeptCount((prev) => Math.max(0, prev - 1));
      }

      return newHistory;
    });

    translateX.value = -windowWidth;
    translateX.value = withSpring(0, { damping: 16, stiffness: 120 });
    setIsMediaZoomed(false);
  }, [history.length, isSwipingProgrammatically, translateX, windowWidth]);

  // 8. Native OS Deletion Pipeline with Sensory Feedback & Resilience
  const handleConfirmBatchDelete = useCallback(async () => {
    if (pendingDeleteQueue.length === 0 || isDeleting) return;

    setIsDeleting(true);
    const idsToDelete = pendingDeleteQueue.map((item) => item.id);
    const countToDelete = idsToDelete.length;
    const freedSize = reclaimableSizeFormatted;

    try {
      let success = false;
      if (onDeleteAssets) {
        success = await onDeleteAssets(idsToDelete);
      }

      if (success) {
        hapticFeedback.success();
        setPendingDeleteQueue([]);
        setIsConfirmModalVisible(false);
        setCelebrationMessage(
          `🎉 Freed up ${freedSize}! (${countToDelete} ${
            countToDelete === 1 ? 'item' : 'items'
          } moved to Recently Deleted)`
        );
      } else {
        setIsConfirmModalVisible(false);
      }
    } catch (error) {
      console.error('[SwiperDeck] Batch deletion error:', error);
      Alert.alert(
        'Deletion Notice',
        'Some items were already removed from your device.'
      );
      setPendingDeleteQueue([]);
      setIsConfirmModalVisible(false);
    } finally {
      setIsDeleting(false);
    }
  }, [
    isDeleting,
    onDeleteAssets,
    pendingDeleteQueue,
    reclaimableSizeFormatted,
  ]);

  // 9. Pause Button Handler
  const handlePausePress = useCallback(() => {
    hapticFeedback.medium();
    const currentActiveId = queue[0]?.id || '';
    const sessionData: CleanerSessionData = {
      lastAssetId: currentActiveId,
      pendingDeleteQueue,
      reviewedCount,
      keptCount,
      savedAt: new Date().toISOString(),
    };
    onPause(sessionData);
  }, [queue, pendingDeleteQueue, reviewedCount, keptCount, onPause]);

  // 10. Animated Styles
  const activeCardAnimatedStyle = useAnimatedStyle(() => {
    const rotationDeg = interpolate(
      translateX.value,
      [-windowWidth, 0, windowWidth],
      [-16, 0, 16],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotationDeg}deg` },
      ],
      zIndex: 10,
    };
  });

  const keepOverlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, 20, SWIPE_THRESHOLD],
      [0, 0.2, 1],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  const trashOverlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, -20, 0],
      [1, 0.2, 0],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  const nextCardAnimatedStyle = useAnimatedStyle(() => {
    const absX = Math.abs(translateX.value);
    const scale = interpolate(absX, [0, SWIPE_THRESHOLD * 1.5], [0.95, 1], Extrapolation.CLAMP);
    const translateYOffset = interpolate(
      absX,
      [0, SWIPE_THRESHOLD * 1.5],
      [12, 0],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ scale }, { translateY: translateYOffset }],
      zIndex: 5,
    };
  });

  const bufferCardAnimatedStyle = useAnimatedStyle(() => {
    const absX = Math.abs(translateX.value);
    const scale = interpolate(absX, [0, SWIPE_THRESHOLD * 1.5], [0.9, 0.95], Extrapolation.CLAMP);
    const translateYOffset = interpolate(
      absX,
      [0, SWIPE_THRESHOLD * 1.5],
      [24, 12],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ scale }, { translateY: translateYOffset }],
      zIndex: 1,
    };
  });

  // 11. Virtual 3-Card Window
  const card0 = queue[0];
  const card1 = queue[1];
  const card2 = queue[2];
  const isDeckComplete = queue.length === 0 && !hasNextPage;
  const isGalleryEmpty = totalCount === 0 && queue.length === 0;

  return (
    <View style={styles.container}>
      {/* Celebration Toast */}
      {celebrationMessage && (
        <CelebrationToast
          message={celebrationMessage}
          onDismiss={() => setCelebrationMessage(null)}
        />
      )}

      {/* Top Header with Pause, Live Counter, and Delete All (Safe-area protected) */}
      <View style={{ paddingTop: insets.top }}>
        <SwiperHeader
          pendingDeleteCount={pendingDeleteQueue.length}
          pendingDeleteSizeFormatted={reclaimableSizeFormatted}
          onPause={handlePausePress}
          onOpenReviewQueue={() => setIsReviewModalVisible(true)}
          onDeleteAll={() => {
            hapticFeedback.medium();
            setIsConfirmModalVisible(true);
          }}
        />
      </View>

      {/* Centered Strict 9:16 Aspect-Ratio Deck Stage */}
      <View style={styles.deckStage}>
        {isGalleryEmpty ? (
          // Edge Case: Empty gallery / zero media on device
          <View style={[styles.emptyContainer, { width: cardWidth, height: cardHeight }]}>
            <Text style={styles.emptyTitle}>[ NO_MEDIA_FOUND ]</Text>
            <Text style={styles.emptySubtitle}>
              Camera roll scan returned 0 items.
            </Text>
            <TouchableOpacity
              style={styles.returnHomeButton}
              onPress={onReturnHome}
              activeOpacity={0.7}
            >
              <Text style={styles.returnHomeButtonText}>[ RETURN TO TERMINAL ]</Text>
            </TouchableOpacity>
          </View>
        ) : isDeckComplete ? (
          // Deck Completion State
          <View style={[styles.completionCard, { width: cardWidth, height: cardHeight }]}>
            <View style={styles.completionEmojiCircle}>
              <Text style={styles.completionEmoji}>✓</Text>
            </View>

            <Text style={styles.completionTitle}>[ QUEUE EXHAUSTED ]</Text>
            <Text style={styles.completionSubtitle}>
              All indexed media items in this batch have been sorted.
            </Text>

            {/* Session Summary Card */}
            <View style={styles.summaryBox}>
              <Text style={styles.summaryTitle}>// SESSION TELEMETRY</Text>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>REVIEWED:</Text>
                <Text style={styles.summaryValue}>{reviewedCount} ITEMS</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>KEPT:</Text>
                <Text style={[styles.summaryValue, styles.keptGreen]}>{keptCount} ITEMS</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>STAGED FOR PURGE:</Text>
                <Text style={[styles.summaryValue, styles.trashRed]}>
                  {pendingDeleteQueue.length} ITEMS // {reclaimableSizeFormatted}
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.completionActions}>
              {pendingDeleteQueue.length > 0 && (
                <TouchableOpacity
                  style={styles.completionDeleteButton}
                  onPress={() => {
                    hapticFeedback.medium();
                    setIsConfirmModalVisible(true);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.completionDeleteButtonText}>
                    [ PURGE ALL {pendingDeleteQueue.length} STAGED ITEMS ]
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.returnHomeButton}
                onPress={onReturnHome}
                activeOpacity={0.7}
              >
                <Text style={styles.returnHomeButtonText}>[ RETURN TO TERMINAL ]</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : queue.length === 0 ? (
          // Streaming next batch
          <View style={[styles.emptyContainer, { width: cardWidth, height: cardHeight }]}>
            <Text style={styles.emptyTitle}>[ SCANNING_MEDIA ]</Text>
            <Text style={styles.emptySubtitle}>
              Reading next block from device storage...
            </Text>
          </View>
        ) : (
          <View style={{ width: cardWidth, height: cardHeight }}>
            {/* Card 2: Buffer Card */}
            {card2 && (
              <MediaCard
                key={card2.id}
                asset={card2}
                isActive={false}
                cardWidth={cardWidth}
                cardHeight={cardHeight}
                animatedCardStyle={bufferCardAnimatedStyle}
              />
            )}

            {/* Card 1: Next Card */}
            {card1 && (
              <MediaCard
                key={card1.id}
                asset={card1}
                isActive={false}
                cardWidth={cardWidth}
                cardHeight={cardHeight}
                animatedCardStyle={nextCardAnimatedStyle}
              />
            )}

            {/* Card 0: Active Top Card with Pan Gesture and Zoom Inspection */}
            {card0 && (
              <GestureDetector gesture={panGesture} key={card0.id}>
                <MediaCard
                  key={card0.id}
                  asset={card0}
                  isActive={true}
                  cardWidth={cardWidth}
                  cardHeight={cardHeight}
                  animatedCardStyle={activeCardAnimatedStyle}
                  keepOverlayStyle={keepOverlayStyle}
                  trashOverlayStyle={trashOverlayStyle}
                  onZoomChange={setIsMediaZoomed}
                />
              </GestureDetector>
            )}
          </View>
        )}
      </View>

      {/* Thumb-friendly Bottom Action Controls (hidden if deck complete or empty, Safe-area protected) */}
      {!isDeckComplete && !isGalleryEmpty ? (
        <View style={{ paddingBottom: Math.max(insets.bottom, 10) }}>
          <BottomControls
            onTrash={() => handleProgrammaticSwipe('trash')}
            onUndo={handleUndo}
            onKeep={() => handleProgrammaticSwipe('keep')}
            canUndo={history.length > 0}
            disabled={queue.length === 0 || isSwipingProgrammatically}
          />
        </View>
      ) : (
        <View style={styles.bottomPlaceholder} />
      )}

      {/* Temporary Folder Queue Inspector Modal */}
      <TrashReviewModal
        visible={isReviewModalVisible}
        queue={pendingDeleteQueue}
        onClose={() => setIsReviewModalVisible(false)}
        onRestoreItem={handleRestoreFromReview}
        onRestoreAll={handleRestoreAllFromReview}
        onDeleteAll={() => {
          setIsReviewModalVisible(false);
          setTimeout(() => {
            handleConfirmBatchDelete();
          }, 150);
        }}
        isDeleting={isDeleting}
      />

      {/* Delete All Confirmation Modal */}
      <ConfirmDeleteModal
        visible={isConfirmModalVisible}
        itemCount={pendingDeleteQueue.length}
        sizeFormatted={reclaimableSizeFormatted}
        isDeleting={isDeleting}
        onCancel={() => setIsConfirmModalVisible(false)}
        onConfirm={handleConfirmBatchDelete}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'space-between',
  },
  deckStage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  emptyContainer: {
    backgroundColor: '#0A0A0A',
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#262626',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 1.2,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  emptySubtitle: {
    color: '#666666',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  completionCard: {
    backgroundColor: '#0A0A0A',
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#333333',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 20,
  },
  completionEmojiCircle: {
    width: 48,
    height: 48,
    borderRadius: 2,
    backgroundColor: '#000000',
    borderWidth: 2,
    borderColor: '#00FF66',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  completionEmoji: {
    fontSize: 22,
    color: '#00FF66',
    fontWeight: '900',
  },
  completionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 1.5,
    marginTop: 8,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  completionSubtitle: {
    color: '#777777',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 8,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  summaryBox: {
    width: '100%',
    backgroundColor: '#000000',
    borderRadius: 3,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#222222',
    gap: 8,
  },
  summaryTitle: {
    color: '#8E8E8E',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 2,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    color: '#666666',
    fontSize: 11,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  summaryValue: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  keptGreen: {
    color: '#00FF66',
  },
  trashRed: {
    color: '#FF3333',
  },
  completionActions: {
    width: '100%',
    gap: 8,
    marginBottom: 4,
  },
  completionDeleteButton: {
    backgroundColor: '#000000',
    paddingVertical: 12,
    borderRadius: 3,
    borderWidth: 2,
    borderColor: '#FF3333',
    alignItems: 'center',
  },
  completionDeleteButtonText: {
    color: '#FF3333',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  returnHomeButton: {
    backgroundColor: '#000000',
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
  },
  returnHomeButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  bottomPlaceholder: {
    height: 70,
  },
});
