import { useCallback, useRef, useState } from 'react';
import { PermissionStatus } from 'expo';
import {
  checkGalleryPermissions,
  isLimitedAccess as checkIsLimitedAccess,
  openDeviceSettings,
  presentLimitedAccessPicker,
  requestGalleryPermissions,
} from '../services/permissionsService';
import {
  deleteMediaAssets,
  fetchMediaBatch,
  isMockModeEnabled,
  setMockMode,
} from '../services/mediaFetcherService';
import type {
  CleanMediaType,
  GalleryPermissionState,
  MediaAsset,
  SortDirection,
} from '../types/media';

interface UseGalleryCleanerOptions {
  batchSize?: number;
  initialSortDirection?: SortDirection;
  mediaType?: CleanMediaType;
  autoLoadOnGranted?: boolean;
}

export function useGalleryCleaner(options: UseGalleryCleanerOptions = {}) {
  const {
    batchSize = 20,
    initialSortDirection = 'desc',
    mediaType = 'all',
  } = options;

  const [permission, setPermission] = useState<GalleryPermissionState>({
    isGranted: false,
    canAskAgain: true,
    status: PermissionStatus.UNDETERMINED,
    isLoading: true,
  });

  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoadingInitial, setIsLoadingInitial] = useState<boolean>(false);
  const [isLoadingNext, setIsLoadingNext] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(initialSortDirection);
  const [batchNumber, setBatchNumber] = useState<number>(0);

  // 1. Initial Permission Check
  const checkPermissions = useCallback(async () => {
    setPermission((prev) => ({ ...prev, isLoading: true }));
    const result = await checkGalleryPermissions();
    setPermission(result);
    return result;
  }, []);

  // 2. Request Permission Prompt
  const requestPermissions = useCallback(async () => {
    setPermission((prev) => ({ ...prev, isLoading: true }));
    const result = await requestGalleryPermissions();
    setPermission(result);
    return result;
  }, []);

  // 3. Load First Batch of Media
  const loadInitialBatch = useCallback(
    async (sort = sortDirection, startingCursor?: string) => {
      setIsLoadingInitial(true);
      setError(null);

      try {
        const result = await fetchMediaBatch({
          batchSize,
          cursor: startingCursor,
          sortDirection: sort,
          mediaType,
        });

        setAssets(result.assets);
        setCursor(result.cursor);
        setHasNextPage(result.hasNextPage);
        setTotalCount(result.totalCount);
        setBatchNumber(1);
      } catch (err: any) {
        setError(err?.message || 'Failed to fetch camera roll assets.');
      } finally {
        setIsLoadingInitial(false);
      }
    },
    [batchSize, mediaType, sortDirection]
  );

  // 4. Load Next Batch Using Cursor (with ref-based lock to prevent overlapping fetches)
  const isFetchingRef = useRef(false);

  const loadNextBatch = useCallback(async () => {
    // Ref-based lock prevents concurrent fetches when React state hasn't settled yet
    if (!hasNextPage || !cursor || isFetchingRef.current) return;

    isFetchingRef.current = true;
    setIsLoadingNext(true);
    setError(null);

    try {
      const result = await fetchMediaBatch({
        batchSize,
        cursor,
        sortDirection,
        mediaType,
      });

      // Deduplicate: only append assets whose IDs don't already exist
      setAssets((prev) => {
        const existingIds = new Set(prev.map((a) => a.id));
        const uniqueNew = result.assets.filter((a) => !existingIds.has(a.id));
        return [...prev, ...uniqueNew];
      });
      setCursor(result.cursor);
      setHasNextPage(result.hasNextPage);
      setTotalCount(result.totalCount);
      setBatchNumber((prev) => prev + 1);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch subsequent media batch.');
    } finally {
      isFetchingRef.current = false;
      setIsLoadingNext(false);
    }
  }, [batchSize, cursor, hasNextPage, mediaType, sortDirection]);

  // 5. Delete specific assets (e.g., from user swiping left or cleaning selection)
  const deleteAssets = useCallback(
    async (assetIds: string[] | string): Promise<boolean> => {
      const ids = Array.isArray(assetIds) ? assetIds : [assetIds];
      const success = await deleteMediaAssets(ids);

      if (success) {
        const idSet = new Set(ids);
        setAssets((prev) => prev.filter((a) => !idSet.has(a.id)));
        setTotalCount((prev) => Math.max(0, prev - ids.length));
      }
      return success;
    },
    []
  );

  // 6. Change Sort Direction (Newest <-> Oldest)
  const toggleSortDirection = useCallback(() => {
    const nextSort = sortDirection === 'desc' ? 'asc' : 'desc';
    setSortDirection(nextSort);
    loadInitialBatch(nextSort);
  }, [loadInitialBatch, sortDirection]);

  // 7. Mock / Demo Mode for instant simulator testing
  const [isMockMode, setIsMockModeState] = useState<boolean>(isMockModeEnabled());

  const toggleMockMode = useCallback(
    async (forcedState?: boolean) => {
      const nextState = forcedState !== undefined ? forcedState : !isMockModeEnabled();
      setMockMode(nextState);
      setIsMockModeState(nextState);

      if (nextState) {
        // Automatically mark permission as granted for demo mode
        setPermission({
          isGranted: true,
          canAskAgain: true,
          status: PermissionStatus.GRANTED,
          accessPrivileges: 'all',
          isLoading: false,
        });
        await loadInitialBatch(sortDirection, undefined);
      }
    },
    [loadInitialBatch, sortDirection]
  );

  // 8. Limited / Partial Access Handling (iOS & Android 14+)
  const isLimitedAccess = checkIsLimitedAccess(permission);

  const selectMorePhotos = useCallback(async () => {
    await presentLimitedAccessPicker();
    return checkPermissions();
  }, [checkPermissions]);

  return {
    permission,
    isLimitedAccess,
    selectMorePhotos,
    checkPermissions,
    requestPermissions,
    openSettings: openDeviceSettings,
    assets,
    cursor,
    hasNextPage,
    totalCount,
    isLoadingInitial,
    isLoadingNext,
    error,
    batchNumber,
    batchSize,
    sortDirection,
    loadInitialBatch,
    loadNextBatch,
    deleteAssets,
    toggleSortDirection,
    isMockMode,
    toggleMockMode,
  };
}
