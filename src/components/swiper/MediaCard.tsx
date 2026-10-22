import React, { useCallback, useState } from 'react';
import {
  Image,
  Platform,
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

const MediaCardInner: React.FC<MediaCardProps> = ({
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
        {isActive ? (
          <GestureDetector gesture={inspectionGestures}>
            <Animated.View style={[styles.mediaContainer, mediaZoomAnimatedStyle]}>
              {isVideo ? (
                <VideoCardContent uri={asset.uri} isActive={isActive} />
              ) : (
                <Image
                  source={{ uri: asset.uri }}
                  style={styles.media}
                  resizeMode="contain"
                  resizeMethod="resize"
                  fadeDuration={0}
                />
              )}
            </Animated.View>
          </GestureDetector>
        ) : (
          <View style={styles.mediaContainer}>
            <Image
              source={{ uri: asset.uri }}
              style={styles.media}
              resizeMode="contain"
              resizeMethod="resize"
              fadeDuration={0}
            />
          </View>
        )}

        {/* Top Badges Header */}
        <View style={styles.topBadgeRow} pointerEvents="none">
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>
              {isVideo ? `[REC // ${asset.formattedDuration || 'VID'}]` : '[IMG // PHOTO]'}
            </Text>
          </View>

          <View style={styles.dateBadge}>
            <Text style={styles.dateBadgeText}>[{asset.formattedDate.toUpperCase()}]</Text>
          </View>
        </View>

        {/* Zoomed Inspection Hint Pill */}
        {isZoomedInternal && (
          <View style={styles.zoomHintBadge} pointerEvents="none">
            <Text style={styles.zoomHintText}>[ ZOOM // DBL-TAP TO RESET ]</Text>
          </View>
        )}

        {/* Bottom Metadata Info */}
        <View style={styles.bottomMeta} pointerEvents="none">
          <Text style={styles.filenameText} numberOfLines={1}>
            {asset.filename.toUpperCase()}
          </Text>
          <Text style={styles.dimensionsText}>
            {asset.width}×{asset.height} // {asset.formattedSize}
          </Text>
        </View>

        {/* SWIPE OVERLAYS */}
        {keepOverlayStyle && !isZoomedInternal && (
          <Animated.View style={[styles.overlayBadge, styles.keepBadge, keepOverlayStyle]}>
            <Text style={styles.keepBadgeText}>[ KEEP ]</Text>
          </Animated.View>
        )}

        {trashOverlayStyle && !isZoomedInternal && (
          <Animated.View style={[styles.overlayBadge, styles.trashBadge, trashOverlayStyle]}>
            <Text style={styles.trashBadgeText}>[ PURGE ]</Text>
          </Animated.View>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    position: 'absolute',
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#000000',
    borderWidth: 2,
    borderColor: '#333333',
    elevation: Platform.OS === 'android' ? 2 : 4,
  },
  canvas: {
    flex: 1,
    backgroundColor: '#050505',
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
    backgroundColor: '#050505',
  },
  topBadgeRow: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  typeBadge: {
    backgroundColor: '#000000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 2,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  typeBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  dateBadge: {
    backgroundColor: '#000000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 2,
    borderWidth: 1.5,
    borderColor: '#444444',
  },
  dateBadgeText: {
    color: '#8E8E8E',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  zoomHintBadge: {
    position: 'absolute',
    top: 54,
    alignSelf: 'center',
    backgroundColor: '#000000',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 2,
    borderWidth: 1.5,
    borderColor: '#D4FF00',
    zIndex: 20,
  },
  zoomHintText: {
    color: '#D4FF00',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  bottomMeta: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.88)',
    borderTopWidth: 1,
    borderTopColor: '#222222',
    zIndex: 10,
  },
  filenameText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  dimensionsText: {
    color: '#666666',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: 0.5,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  overlayBadge: {
    position: 'absolute',
    top: 50,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 2,
    borderWidth: 3,
    backgroundColor: '#000000',
    zIndex: 30,
  },
  keepBadge: {
    left: 16,
    borderColor: '#00FF66',
    transform: [{ rotate: '-8deg' }],
  },
  keepBadgeText: {
    color: '#00FF66',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  trashBadge: {
    right: 16,
    borderColor: '#FF3333',
    transform: [{ rotate: '8deg' }],
  },
  trashBadgeText: {
    color: '#FF3333',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});

export const MediaCard = React.memo(MediaCardInner);
