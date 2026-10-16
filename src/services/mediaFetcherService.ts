import * as MediaLibrary from 'expo-media-library/legacy';
import { formatBytes } from '../utils/mediaUtils';
import type {
  CleanMediaType,
  FetchBatchOptions,
  MediaAsset,
  MediaBatchResult,
} from '../types/media';
import { INITIAL_MOCK_ASSETS } from './mockMediaData';

const DEFAULT_BATCH_SIZE = 20;

let mockAssetsPool: MediaAsset[] = [...INITIAL_MOCK_ASSETS];
let mockModeEnabled = false;

export function setMockMode(enabled: boolean): void {
  mockModeEnabled = enabled;
  if (enabled && mockAssetsPool.length === 0) {
    mockAssetsPool = [...INITIAL_MOCK_ASSETS];
  }
}

export function isMockModeEnabled(): boolean {
  return mockModeEnabled;
}

export function resetMockData(): void {
  mockAssetsPool = [...INITIAL_MOCK_ASSETS];
}

export async function fetchMockMediaBatch(
  options: FetchBatchOptions = {}
): Promise<MediaBatchResult> {
  const {
    batchSize = DEFAULT_BATCH_SIZE,
    cursor,
    mediaType = 'all',
  } = options;

  let filtered = [...mockAssetsPool];
  if (mediaType === 'photo') {
    filtered = filtered.filter((a) => a.mediaType === 'photo');
  } else if (mediaType === 'video') {
    filtered = filtered.filter((a) => a.mediaType === 'video');
  }

  const startIndex = cursor ? filtered.findIndex((a) => a.id === cursor) + 1 : 0;
  const pageItems = filtered.slice(startIndex, startIndex + batchSize);
  const nextItem = filtered[startIndex + batchSize];
  const hasNextPage = !!nextItem;
  const nextCursor = hasNextPage ? pageItems[pageItems.length - 1]?.id || null : null;

  return {
    assets: pageItems,
    cursor: nextCursor,
    hasNextPage,
    totalCount: filtered.length,
  };
}

export function getMockGallerySummary(): GallerySummaryStats {
  const photoCount = mockAssetsPool.filter((a) => a.mediaType === 'photo').length;
  const videoCount = mockAssetsPool.filter((a) => a.mediaType === 'video').length;
  const totalCount = mockAssetsPool.length;
  const estimatedTotalBytes = mockAssetsPool.reduce(
    (acc, item) => acc + item.estimatedSizeBytes,
    0
  );

  return {
    totalCount,
    photoCount,
    videoCount,
    estimatedTotalBytes,
    formattedTotalSize: formatBytes(estimatedTotalBytes),
  };
}

export { formatBytes };

/**
 * Calculates a realistic file size estimate based on resolution, duration, and media type.
 */
function estimateAssetSize(raw: MediaLibrary.Asset): number {
  if (raw.mediaType === 'video') {
    // Mobile 1080p/4K video averages ~2.5 MB per second
    const duration = raw.duration && raw.duration > 0 ? raw.duration : 5;
    return Math.round(duration * 2.5 * 1024 * 1024);
  }

  // Mobile camera photo averages ~3 MB, scaled by megapixels
  const width = raw.width || 3000;
  const height = raw.height || 4000;
  const megapixels = (width * height) / 1000000;
  const estimated = Math.round(megapixels * 0.35 * 1024 * 1024);
  return Math.max(1.8 * 1024 * 1024, Math.min(estimated, 15 * 1024 * 1024));
}

/**
 * Formats duration in seconds to MM:SS or HH:MM:SS.
 */
function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0:00';
  const totalSeconds = Math.round(seconds);
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  const paddedSecs = secs < 10 ? `0${secs}` : `${secs}`;
  if (hrs > 0) {
    const paddedMins = mins < 10 ? `0${mins}` : `${mins}`;
    return `${hrs}:${paddedMins}:${paddedSecs}`;
  }
  return `${mins}:${paddedSecs}`;
}

/**
 * Formats a UNIX timestamp or millisecond timestamp into a readable date string.
 */
function formatTimestamp(timestamp: number): string {
  const millis = timestamp > 100000000000 ? timestamp : timestamp * 1000;
  const date = new Date(millis);
  if (isNaN(date.getTime())) return 'Unknown date';
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Maps raw Expo asset to clean application MediaAsset model with file size metadata.
 */
function transformAsset(raw: MediaLibrary.Asset): MediaAsset {
  const isVideo = raw.mediaType === 'video';
  const width = raw.width || 1;
  const height = raw.height || 1;
  const estimatedSizeBytes = estimateAssetSize(raw);

  return {
    id: raw.id,
    filename: raw.filename || (isVideo ? 'video.mp4' : 'photo.jpg'),
    uri: raw.uri,
    mediaType: isVideo ? 'video' : 'photo',
    width,
    height,
    creationTime: raw.creationTime,
    formattedDate: formatTimestamp(raw.creationTime),
    duration: raw.duration || 0,
    formattedDuration: isVideo ? formatDuration(raw.duration) : undefined,
    aspectRatio: width / height,
    estimatedSizeBytes,
    formattedSize: formatBytes(estimatedSizeBytes),
  };
}

/**
 * Maps CleanMediaType to Expo MediaLibrary MediaType array.
 */
function resolveMediaTypes(type?: CleanMediaType): MediaLibrary.MediaTypeValue[] {
  switch (type) {
    case 'photo':
      return [MediaLibrary.MediaType.photo];
    case 'video':
      return [MediaLibrary.MediaType.video];
    case 'all':
    default:
      return [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video];
  }
}

/**
 * Fetches a chronological batch of media assets from the camera roll using cursor-based pagination.
 */
export async function fetchMediaBatch(
  options: FetchBatchOptions = {}
): Promise<MediaBatchResult> {
  if (mockModeEnabled) {
    return fetchMockMediaBatch(options);
  }

  const {
    batchSize = DEFAULT_BATCH_SIZE,
    cursor,
    mediaType = 'all',
    sortDirection = 'desc',
  } = options;

  const isAscending = sortDirection === 'asc';

  const queryOptions: MediaLibrary.AssetsOptions = {
    first: batchSize,
    sortBy: [[MediaLibrary.SortBy.creationTime, isAscending]],
    mediaType: resolveMediaTypes(mediaType),
  };

  if (cursor) {
    queryOptions.after = cursor;
  }

  try {
    const pagedInfo = await MediaLibrary.getAssetsAsync(queryOptions);
    const transformedAssets = (pagedInfo.assets || []).map(transformAsset);

    return {
      assets: transformedAssets,
      cursor: pagedInfo.hasNextPage ? pagedInfo.endCursor : null,
      hasNextPage: pagedInfo.hasNextPage,
      totalCount: pagedInfo.totalCount,
    };
  } catch (error) {
    console.error('[MediaFetcherService] Error fetching media batch:', error);
    throw error;
  }
}

/**
 * Permanently deletes specified assets from the device's camera roll.
 * The native OS will display a system confirmation dialog before deletion.
 *
 * @param assetIds Array of asset IDs or single asset ID to delete
 * @returns boolean indicating if deletion was approved by the user and succeeded
 */
export async function deleteMediaAssets(
  assetIds: string[] | string
): Promise<boolean> {
  const ids = Array.isArray(assetIds) ? assetIds : [assetIds];
  if (ids.length === 0) return true;

  if (mockModeEnabled) {
    const idSet = new Set(ids);
    mockAssetsPool = mockAssetsPool.filter((item) => !idSet.has(item.id));
    return true;
  }

  try {
    // Attempt standard batch deletion
    const success = await MediaLibrary.deleteAssetsAsync(ids);
    return success;
  } catch (error: any) {
    console.warn(
      '[MediaFetcherService] Batch deletion encountered an error, attempting resilient cleanup:',
      error?.message || error
    );

    // If batch fails due to a ghost or missing asset, attempt individual deletions
    let anySuccess = false;
    for (const id of ids) {
      try {
        await MediaLibrary.deleteAssetsAsync([id]);
        anySuccess = true;
      } catch (innerErr) {
        // Asset already removed or inaccessible, safely skip
        console.warn(`[MediaFetcherService] Skipped already removed asset ${id}`);
        anySuccess = true;
      }
    }
    return anySuccess;
  }
}

export interface GallerySummaryStats {
  totalCount: number;
  photoCount: number;
  videoCount: number;
  estimatedTotalBytes: number;
  formattedTotalSize: string;
}

/**
 * Fetches breakdown of photo and video counts with estimated storage usage.
 */
export async function getDetailedGallerySummary(): Promise<GallerySummaryStats> {
  if (mockModeEnabled) {
    return getMockGallerySummary();
  }

  try {
    const [photosResult, videosResult] = await Promise.all([
      MediaLibrary.getAssetsAsync({ first: 1, mediaType: [MediaLibrary.MediaType.photo] }),
      MediaLibrary.getAssetsAsync({ first: 1, mediaType: [MediaLibrary.MediaType.video] }),
    ]);

    const photoCount = photosResult.totalCount || 0;
    const videoCount = videosResult.totalCount || 0;
    const totalCount = photoCount + videoCount;
    const estimatedTotalBytes =
      photoCount * 3.2 * 1024 * 1024 + videoCount * 28 * 1024 * 1024;

    return {
      totalCount,
      photoCount,
      videoCount,
      estimatedTotalBytes,
      formattedTotalSize: formatBytes(estimatedTotalBytes),
    };
  } catch (error) {
    console.error('[MediaFetcherService] Failed to get detailed gallery summary:', error);
    return {
      totalCount: 0,
      photoCount: 0,
      videoCount: 0,
      estimatedTotalBytes: 0,
      formattedTotalSize: '0 MB',
    };
  }
}

/**
 * Fetches total count of media assets available in the gallery.
 */
export async function getGallerySummary(): Promise<{ totalCount: number }> {
  if (mockModeEnabled) {
    return { totalCount: mockAssetsPool.length };
  }

  try {
    const result = await MediaLibrary.getAssetsAsync({
      first: 1,
      mediaType: [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video],
    });
    return { totalCount: result.totalCount };
  } catch (error) {
    console.error('[MediaFetcherService] Failed to get gallery summary:', error);
    return { totalCount: 0 };
  }
}
