import React, { useCallback, useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import type { MediaAsset } from '../../types/media';
import { hapticFeedback } from '../../services/hapticsService';
import { VideoCardContent } from './VideoCardContent';

interface MediaCardProps {
  asset: MediaAsset;
  isActive: boolean;
  cardWidth: number;
  cardHeight: number;
  animatedCardStyle?: any;
  keepOverlayStyle?: any;
  trashOverlayStyle?: any;
  onZoomChange?: (isZoomed: boolean) => void;
}

export const MediaCard: React.FC<MediaCardProps> = ({
  asset,
  isActive,
  cardWidth,
  cardHeight,
  animatedCardStyle,
  keepOverlayStyle,
  trashOverlayStyle,
  onZoomChange,
}) => {
  const isVideo = asset.mediaType === 'video';
  const [isZoomedInternal, setIsZoomedInternal] = useState(false);

  // Shared values for media inspection (zoom & pan)
  const zoomScale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const zoomTranslateX = useSharedValue(0);
  const zoomTranslateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const handleZoomStateChange = useCallback(
    (zoomed: boolean) => {
      setIsZoomedInternal(zoomed);
      if (onZoomChange) {
        onZoomChange(zoomed);
      }
    },
    [onZoomChange]
  );

  // 1. Double-Tap to Zoom In / Out
  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .maxDuration(280)
    .onStart(() => {
      if (!isActive) return;

      if (zoomScale.value > 1.08) {
        // Reset zoom smoothly back to 1.0
        zoomScale.value = withSpring(1, { damping: 18, stiffness: 140 });
        zoomTranslateX.value = withSpring(0, { damping: 18, stiffness: 140 });
        zoomTranslateY.value = withSpring(0, { damping: 18, stiffness: 140 });
        runOnJS(handleZoomStateChange)(false);
        runOnJS(hapticFeedback.light)();
      } else {
        // Zoom in to 2.5x for inspecting landscape/portrait details
        zoomScale.value = withSpring(2.5, { damping: 18, stiffness: 140 });
        runOnJS(handleZoomStateChange)(true);
        runOnJS(hapticFeedback.light)();
      }
    });

  // 2. Pinch to Zoom Gesture
  const pinchGesture = Gesture.Pinch()
    .enabled(isActive)
    .onStart(() => {
      savedScale.value = zoomScale.value;
    })
    .onUpdate((event) => {
      const nextScale = Math.max(1, Math.min(savedScale.value * event.scale, 4));
      zoomScale.value = nextScale;
      if (nextScale > 1.1) {
        runOnJS(handleZoomStateChange)(true);
      }
    })
    .onEnd(() => {
      if (zoomScale.value <= 1.1) {
        zoomScale.value = withSpring(1, { damping: 18 });
        zoomTranslateX.value = withSpring(0, { damping: 18 });
        zoomTranslateY.value = withSpring(0, { damping: 18 });
        runOnJS(handleZoomStateChange)(false);
      }
    });

  // 3. Pan Gesture while Zoomed In
  const zoomPanGesture = Gesture.Pan()
    .enabled(isActive && isZoomedInternal)
    .onStart(() => {
      savedTranslateX.value = zoomTranslateX.value;
      savedTranslateY.value = zoomTranslateY.value;
    })
    .onUpdate((event) => {
      zoomTranslateX.value = savedTranslateX.value + event.translationX;
      zoomTranslateY.value = savedTranslateY.value + event.translationY;
    });

  const inspectionGestures = Gesture.Simultaneous(
    doubleTapGesture,
    pinchGesture,
    zoomPanGesture
  );

  const mediaZoomAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: zoomTranslateX.value },
        { translateY: zoomTranslateY.value },
        { scale: zoomScale.value },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        { width: cardWidth, height: cardHeight },
        animatedCardStyle,
      ]}
    >
      {/* 9:16 Inner Canvas with #0D0D0D neutral dark background */}
      <View style={styles.canvas}>
        {/* Media Layer with Inspection Zoom */}
        <GestureDetector gesture={inspectionGestures}>
          <Animated.View style={[styles.mediaContainer, mediaZoomAnimatedStyle]}>
            {isVideo && isActive ? (
              <VideoCardContent uri={asset.uri} />
            ) : (
              <Image
                source={{ uri: asset.uri }}
                style={styles.media}
                resizeMode="contain"
              />
            )}
          </Animated.View>
        </GestureDetector>

        {/* Top Badges Header */}
        <View style={styles.topBadgeRow} pointerEvents="none">
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>
              {isVideo ? `🎥 ${asset.formattedDuration || 'VIDEO'}` : '📷 PHOTO'}
            </Text>
          </View>

          <View style={styles.dateBadge}>
            <Text style={styles.dateBadgeText}>{asset.formattedDate}</Text>
          </View>
        </View>

        {/* Zoomed Inspection Hint Pill */}
        {isZoomedInternal && (
          <View style={styles.zoomHintBadge} pointerEvents="none">
            <Text style={styles.zoomHintText}>🔍 Zoomed • Double-tap to reset</Text>
          </View>
        )}

        {/* Bottom Metadata Info */}
        <View style={styles.bottomMeta} pointerEvents="none">
          <Text style={styles.filenameText} numberOfLines={1}>
            {asset.filename}
          </Text>
          <Text style={styles.dimensionsText}>
            {asset.width} × {asset.height} • {asset.formattedSize}
          </Text>
        </View>

        {/* SWIPE OVERLAYS */}
        {keepOverlayStyle && !isZoomedInternal && (
          <Animated.View style={[styles.overlayBadge, styles.keepBadge, keepOverlayStyle]}>
            <Text style={styles.keepBadgeText}>KEEP ✓</Text>
          </Animated.View>
        )}

        {trashOverlayStyle && !isZoomedInternal && (
          <Animated.View style={[styles.overlayBadge, styles.trashBadge, trashOverlayStyle]}>
            <Text style={styles.trashBadgeText}>TRASH 🗑️</Text>
          </Animated.View>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    position: 'absolute',
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#0D0D0D',
    borderWidth: 1.5,
    borderColor: '#262626',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  canvas: {
    flex: 1,
    backgroundColor: '#0D0D0D',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  mediaContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  media: {
    width: '100%',
    height: '100%',
    backgroundColor: '#0D0D0D',
  },
  topBadgeRow: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  typeBadge: {
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  typeBadgeText: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  dateBadge: {
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  dateBadgeText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  zoomHintBadge: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#38BDF8',
    zIndex: 20,
  },
  zoomHintText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '700',
  },
  bottomMeta: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'rgba(13, 13, 13, 0.75)',
    zIndex: 10,
  },
  filenameText: {
    color: '#F1F5F9',
    fontSize: 13,
    fontWeight: '600',
  },
  dimensionsText: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  overlayBadge: {
    position: 'absolute',
    top: 60,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 3,
    zIndex: 30,
  },
  keepBadge: {
    left: 20,
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
    transform: [{ rotate: '-12deg' }],
  },
  keepBadgeText: {
    color: '#34D399',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  trashBadge: {
    right: 20,
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
    transform: [{ rotate: '12deg' }],
  },
  trashBadgeText: {
    color: '#F87171',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
});
