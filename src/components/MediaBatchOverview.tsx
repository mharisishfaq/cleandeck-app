import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BRUTALIST } from '../theme/brutalist';
import type { MediaAsset, SortDirection } from '../types/media';

interface MediaBatchOverviewProps {
  assets: MediaAsset[];
  totalCount: number;
  batchNumber: number;
  batchSize: number;
  hasNextPage: boolean;
  cursor: string | null;
  sortDirection: SortDirection;
  isLoadingNext: boolean;
  onLoadNextBatch: () => void;
  onToggleSort: () => void;
  onDeleteAsset: (id: string) => void;
}

export const MediaBatchOverview: React.FC<MediaBatchOverviewProps> = ({
  assets,
  totalCount,
  batchNumber,
  batchSize,
  hasNextPage,
  cursor,
  sortDirection,
  isLoadingNext,
  onLoadNextBatch,
  onToggleSort,
  onDeleteAsset,
}) => {
  const renderItem = ({ item }: { item: MediaAsset }) => {
    const isVideo = item.mediaType === 'video';

    return (
      <View style={styles.card}>
        <View style={styles.thumbnailWrapper}>
          <Image
            source={{ uri: item.uri }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
          <View style={styles.typeTag}>
            <Text style={styles.typeTagText}>
              {isVideo ? `[VID // ${item.formattedDuration}]` : '[IMG]'}
            </Text>
          </View>
        </View>

        <View style={styles.cardInfo}>
          <Text style={styles.cardDate}>{item.formattedDate}</Text>
          <Text style={styles.cardDimensions} numberOfLines={1}>
            {item.width} × {item.height}
          </Text>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => onDeleteAsset(item.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.deleteButtonText}>[ ✕ TEST PURGE ]</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Brutalist Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>MEDIA_BATCH_INDEX</Text>
          <View style={styles.activePill}>
            <Text style={styles.activePillText}>[ ONLINE ]</Text>
          </View>
        </View>
        <Text style={styles.headerSubtitle}>
          // CURSOR_PAGINATED_DIAGNOSTIC_HUB
        </Text>
      </View>

      {/* Brutalist Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{totalCount.toLocaleString()}</Text>
          <Text style={styles.statLabel}>TOTAL ASSETS</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>{assets.length}</Text>
          <Text style={styles.statLabel}>INDEXED</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>#{batchNumber}</Text>
          <Text style={styles.statLabel}>BATCH {batchSize}/PAGE</Text>
        </View>
      </View>

      {/* Controls & Cursor Info */}
      <View style={styles.controlsRow}>
        <TouchableOpacity
          style={styles.sortToggle}
          onPress={onToggleSort}
          activeOpacity={0.7}
        >
          <Text style={styles.sortToggleText}>
            [ ORDER: {sortDirection === 'desc' ? 'NEWEST_FIRST' : 'OLDEST_FIRST'} ]
          </Text>
        </TouchableOpacity>

        <View style={styles.cursorTag}>
          <Text style={styles.cursorTagText} numberOfLines={1}>
            CURSOR: {cursor ? cursor.slice(-8) : 'EOF'}
          </Text>
        </View>
      </View>

      {/* Media Assets List */}
      <FlatList
        data={assets}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={
          <View style={styles.footerContainer}>
            {hasNextPage ? (
              <TouchableOpacity
                style={[
                  styles.loadMoreButton,
                  isLoadingNext && styles.loadMoreButtonDisabled,
                ]}
                onPress={onLoadNextBatch}
                disabled={isLoadingNext}
                activeOpacity={0.8}
              >
                {isLoadingNext ? (
                  <ActivityIndicator size="small" color={BRUTALIST.colors.accentText} />
                ) : (
                  <Text style={styles.loadMoreButtonText}>
                    [ FETCH NEXT {batchSize} ASSETS ]
                  </Text>
                )}
              </TouchableOpacity>
            ) : (
              <View style={styles.endOfRollBanner}>
                <Text style={styles.endOfRollText}>
                  [ END_OF_GALLERY_REACHED ]
                </Text>
              </View>
            )}

            <Text style={styles.memoryEfficiencyNote}>
              // ZERO_BLOAT: Memory-capped cursor pagination pipeline.
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRUTALIST.colors.bg,
    paddingTop: 54,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: BRUTALIST.colors.text,
    fontSize: 20,
    fontWeight: '900',
    fontFamily: BRUTALIST.typography.mono,
    letterSpacing: 0.5,
  },
  activePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: BRUTALIST.borders.thin,
    borderColor: BRUTALIST.colors.accent,
    borderRadius: BRUTALIST.radii.xs,
    backgroundColor: BRUTALIST.colors.surfaceRaised,
  },
  activePillText: {
    color: BRUTALIST.colors.accent,
    fontSize: 10,
    fontWeight: '800',
    fontFamily: BRUTALIST.typography.mono,
  },
  headerSubtitle: {
    color: BRUTALIST.colors.textDim,
    fontSize: 11,
    fontFamily: BRUTALIST.typography.mono,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    backgroundColor: BRUTALIST.colors.surface,
    borderRadius: BRUTALIST.radii.xs,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: BRUTALIST.borders.thin,
    borderColor: BRUTALIST.colors.border,
  },
  statValue: {
    color: BRUTALIST.colors.accent,
    fontSize: 15,
    fontWeight: '900',
    fontFamily: BRUTALIST.typography.mono,
  },
  statLabel: {
    color: BRUTALIST.colors.textMuted,
    fontSize: 9,
    fontFamily: BRUTALIST.typography.mono,
    marginTop: 2,
    textAlign: 'center',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sortToggle: {
    backgroundColor: BRUTALIST.colors.surfaceRaised,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: BRUTALIST.radii.xs,
    borderWidth: BRUTALIST.borders.thin,
    borderColor: BRUTALIST.colors.border,
  },
  sortToggleText: {
    color: BRUTALIST.colors.text,
    fontSize: 11,
    fontFamily: BRUTALIST.typography.mono,
    fontWeight: '700',
  },
  cursorTag: {
    backgroundColor: BRUTALIST.colors.surface,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: BRUTALIST.radii.xs,
    borderWidth: BRUTALIST.borders.thin,
    borderColor: BRUTALIST.colors.border,
  },
  cursorTagText: {
    color: BRUTALIST.colors.textDim,
    fontSize: 10,
    fontFamily: BRUTALIST.typography.mono,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  card: {
    width: '48%',
    backgroundColor: BRUTALIST.colors.surface,
    borderRadius: BRUTALIST.radii.xs,
    overflow: 'hidden',
    borderWidth: BRUTALIST.borders.normal,
    borderColor: BRUTALIST.colors.border,
  },
  thumbnailWrapper: {
    width: '100%',
    height: 130,
    position: 'relative',
    backgroundColor: BRUTALIST.colors.bg,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  typeTag: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: BRUTALIST.colors.bg,
    borderWidth: BRUTALIST.borders.thin,
    borderColor: BRUTALIST.colors.border,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: BRUTALIST.radii.xs,
  },
  typeTagText: {
    color: BRUTALIST.colors.text,
    fontSize: 9,
    fontFamily: BRUTALIST.typography.mono,
    fontWeight: '800',
  },
  cardInfo: {
    padding: 8,
  },
  cardDate: {
    color: BRUTALIST.colors.text,
    fontSize: 11,
    fontFamily: BRUTALIST.typography.mono,
    fontWeight: '700',
  },
  cardDimensions: {
    color: BRUTALIST.colors.textDim,
    fontSize: 9,
    fontFamily: BRUTALIST.typography.mono,
    marginTop: 2,
    marginBottom: 8,
  },
  deleteButton: {
    backgroundColor: BRUTALIST.colors.dangerBg,
    borderWidth: BRUTALIST.borders.thin,
    borderColor: BRUTALIST.colors.danger,
    borderRadius: BRUTALIST.radii.xs,
    paddingVertical: 5,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: BRUTALIST.colors.danger,
    fontSize: 10,
    fontFamily: BRUTALIST.typography.mono,
    fontWeight: '800',
  },
  footerContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  loadMoreButton: {
    backgroundColor: BRUTALIST.colors.accent,
    width: '100%',
    paddingVertical: 14,
    borderRadius: BRUTALIST.radii.xs,
    alignItems: 'center',
    marginBottom: 10,
    ...BRUTALIST.shadows.hardAccent,
  },
  loadMoreButtonDisabled: {
    opacity: 0.5,
  },
  loadMoreButtonText: {
    color: BRUTALIST.colors.accentText,
    fontSize: 12,
    fontFamily: BRUTALIST.typography.mono,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  endOfRollBanner: {
    backgroundColor: BRUTALIST.colors.surface,
    borderWidth: BRUTALIST.borders.thin,
    borderColor: BRUTALIST.colors.border,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: BRUTALIST.radii.xs,
    marginBottom: 10,
  },
  endOfRollText: {
    color: BRUTALIST.colors.accent,
    fontSize: 11,
    fontFamily: BRUTALIST.typography.mono,
    fontWeight: '700',
  },
  memoryEfficiencyNote: {
    color: BRUTALIST.colors.textMuted,
    fontSize: 10,
    fontFamily: BRUTALIST.typography.mono,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
});
