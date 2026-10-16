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
              {isVideo ? `🎥 ${item.formattedDuration}` : '📷 PHOTO'}
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
            <Text style={styles.deleteButtonText}>🗑️ Test Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Gamified Status Header */}
      <View style={styles.header}>
        <View>
          <View style={styles.titleRow}>
            <Text style={styles.title}>CleanUp Hub</Text>
            <View style={styles.activePill}>
              <View style={styles.greenDot} />
              <Text style={styles.activePillText}>Ready</Text>
            </View>
          </View>
          <Text style={styles.headerSubtitle}>
            Gamified Gallery Declutter Scaffolding
          </Text>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{totalCount.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Total Camera Roll</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>{assets.length}</Text>
          <Text style={styles.statLabel}>Loaded in Memory</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>Batch #{batchNumber}</Text>
          <Text style={styles.statLabel}>Size: {batchSize}/page</Text>
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
            ⏱️ Sort: {sortDirection === 'desc' ? 'Newest First' : 'Oldest First'}
          </Text>
        </TouchableOpacity>

        <View style={styles.cursorTag}>
          <Text style={styles.cursorTagText} numberOfLines={1}>
            Cursor: {cursor ? cursor.slice(-8) : 'End'}
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
                  <ActivityIndicator size="small" color="#0F172A" />
                ) : (
                  <Text style={styles.loadMoreButtonText}>
                    Load Next {batchSize} Assets (Cursor Paginated)
                  </Text>
                )}
              </TouchableOpacity>
            ) : (
              <View style={styles.endOfRollBanner}>
                <Text style={styles.endOfRollText}>
                  🎉 All camera roll assets reached or end of gallery!
                </Text>
              </View>
            )}

            <Text style={styles.memoryEfficiencyNote}>
              ⚡ Cursor pagination ensures only lightweight batches are fetched
              sequentially without memory bloat.
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
    backgroundColor: '#0F172A',
    paddingTop: 50,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: '#F8FAFC',
    fontSize: 26,
    fontWeight: '800',
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  activePillText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: '#94A3B8',
    fontSize: 14,
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
    backgroundColor: '#1E293B',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  statValue: {
    color: '#38BDF8',
    fontSize: 16,
    fontWeight: '800',
  },
  statLabel: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sortToggle: {
    backgroundColor: '#334155',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  sortToggleText: {
    color: '#F1F5F9',
    fontSize: 12,
    fontWeight: '600',
  },
  cursorTag: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  cursorTagText: {
    color: '#A5B4FC',
    fontSize: 11,
    fontFamily: 'monospace',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  card: {
    width: '48%',
    backgroundColor: '#1E293B',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
  },
  thumbnailWrapper: {
    width: '100%',
    height: 140,
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  typeTag: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeTagText: {
    color: '#F8FAFC',
    fontSize: 10,
    fontWeight: '700',
  },
  cardInfo: {
    padding: 10,
  },
  cardDate: {
    color: '#F1F5F9',
    fontSize: 12,
    fontWeight: '600',
  },
  cardDimensions: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 2,
    marginBottom: 8,
  },
  deleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    borderRadius: 8,
    paddingVertical: 5,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#F87171',
    fontSize: 11,
    fontWeight: '600',
  },
  footerContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  loadMoreButton: {
    backgroundColor: '#10B981',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  loadMoreButtonDisabled: {
    opacity: 0.6,
  },
  loadMoreButtonText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
  },
  endOfRollBanner: {
    backgroundColor: '#1E293B',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
  },
  endOfRollText: {
    color: '#34D399',
    fontSize: 13,
    fontWeight: '600',
  },
  memoryEfficiencyNote: {
    color: '#64748B',
    fontSize: 11,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 16,
  },
});
