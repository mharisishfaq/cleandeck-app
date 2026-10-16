import { PermissionStatus } from 'expo';
import type { PermissionResponse } from 'expo-media-library/legacy';

export type CleanMediaType = 'photo' | 'video' | 'all';
export type SortDirection = 'desc' | 'asc';

export interface MediaAsset {
  id: string;
  filename: string;
  uri: string;
  mediaType: 'photo' | 'video';
  width: number;
  height: number;
  creationTime: number;
  formattedDate: string;
  duration: number; // in seconds
  formattedDuration?: string;
  aspectRatio: number;
  estimatedSizeBytes: number;
  formattedSize: string;
}

export interface FetchBatchOptions {
  batchSize?: number;
  cursor?: string;
  mediaType?: CleanMediaType;
  sortDirection?: SortDirection;
}

export interface MediaBatchResult {
  assets: MediaAsset[];
  cursor: string | null;
  hasNextPage: boolean;
  totalCount: number;
}

export interface GalleryPermissionState {
  isGranted: boolean;
  canAskAgain: boolean;
  status: PermissionStatus;
  accessPrivileges?: 'all' | 'limited' | 'none';
  isLoading: boolean;
}

export interface CleanerSessionData {
  lastAssetId: string;
  pendingDeleteQueue: MediaAsset[];
  reviewedCount: number;
  keptCount: number;
  savedAt: string; // ISO Date string
  sortDirection?: SortDirection;
}
