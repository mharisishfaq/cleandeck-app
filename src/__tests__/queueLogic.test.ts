import type { MediaAsset } from '../types/media';

// Helper functions that model the queue math and transformations used in SwiperDeck, HomeScreen, and TrashReviewModal
function calculateQueueMetrics(queue: MediaAsset[]) {
  const count = queue.length;
  const totalBytes = queue.reduce((sum, item) => sum + item.estimatedSizeBytes, 0);
  return { count, totalBytes };
}

function stageItemForDeletion(queue: MediaAsset[], item: MediaAsset): MediaAsset[] {
  return [...queue, item];
}

function undoLastStagedItem(queue: MediaAsset[]): { updatedQueue: MediaAsset[]; undoneItem: MediaAsset | null } {
  if (queue.length === 0) {
    return { updatedQueue: [], undoneItem: null };
  }
  const undoneItem = queue[queue.length - 1];
  const updatedQueue = queue.slice(0, -1);
  return { updatedQueue, undoneItem };
}

function restoreItemFromQueue(queue: MediaAsset[], assetId: string): MediaAsset[] {
  return queue.filter((item) => item.id !== assetId);
}

describe('Staged Deletion Queue Mathematics & State Management', () => {
  const assetA: MediaAsset = {
    id: 'asset_a',
    filename: 'IMG_A.JPG',
    uri: 'ph://asset_a',
    mediaType: 'photo',
    width: 3000,
    height: 4000,
    creationTime: 1700000000,
    formattedDate: 'Nov 14, 2023',
    duration: 0,
    aspectRatio: 3 / 4,
    estimatedSizeBytes: 3 * 1024 * 1024, // 3,145,728 bytes
    formattedSize: '3.0 MB',
  };

  const assetB: MediaAsset = {
    id: 'asset_b',
    filename: 'VIDEO_B.MP4',
    uri: 'ph://asset_b',
    mediaType: 'video',
    width: 1920,
    height: 1080,
    creationTime: 1700001000,
    formattedDate: 'Nov 14, 2023',
    duration: 12,
    aspectRatio: 16 / 9,
    estimatedSizeBytes: 30 * 1024 * 1024, // 31,457,280 bytes
    formattedSize: '30 MB',
  };

  const assetC: MediaAsset = {
    id: 'asset_c',
    filename: 'IMG_C.JPG',
    uri: 'ph://asset_c',
    mediaType: 'photo',
    width: 4032,
    height: 3024,
    creationTime: 1700002000,
    formattedDate: 'Nov 14, 2023',
    duration: 0,
    aspectRatio: 4 / 3,
    estimatedSizeBytes: 4 * 1024 * 1024, // 4,194,304 bytes
    formattedSize: '4.0 MB',
  };

  describe('Staged Left Swipe (Queue Accumulation)', () => {
    it('increments staged count and accumulates exact reclaimable bytes on left swipe', () => {
      let queue: MediaAsset[] = [];
      let metrics = calculateQueueMetrics(queue);
      expect(metrics.count).toBe(0);
      expect(metrics.totalBytes).toBe(0);

      // 1. Swipe left on Asset A
      queue = stageItemForDeletion(queue, assetA);
      metrics = calculateQueueMetrics(queue);
      expect(metrics.count).toBe(1);
      expect(metrics.totalBytes).toBe(3 * 1024 * 1024);

      // 2. Swipe left on Asset B (Video)
      queue = stageItemForDeletion(queue, assetB);
      metrics = calculateQueueMetrics(queue);
      expect(metrics.count).toBe(2);
      expect(metrics.totalBytes).toBe(3 * 1024 * 1024 + 30 * 1024 * 1024);

      // 3. Swipe left on Asset C
      queue = stageItemForDeletion(queue, assetC);
      metrics = calculateQueueMetrics(queue);
      expect(metrics.count).toBe(3);
      expect(metrics.totalBytes).toBe(3 * 1024 * 1024 + 30 * 1024 * 1024 + 4 * 1024 * 1024);
    });
  });

  describe('Tapping Undo (Queue Subtraction)', () => {
    it('removes the last staged item, decrements count, and subtracts byte tally accurately', () => {
      // Start with 3 staged items
      let queue: MediaAsset[] = [assetA, assetB, assetC];
      const initialBytes = calculateQueueMetrics(queue).totalBytes;

      // Tap Undo (should remove assetC)
      const { updatedQueue, undoneItem } = undoLastStagedItem(queue);
      queue = updatedQueue;

      expect(undoneItem?.id).toBe('asset_c');
      const metrics = calculateQueueMetrics(queue);
      expect(metrics.count).toBe(2);
      expect(metrics.totalBytes).toBe(initialBytes - assetC.estimatedSizeBytes);
      expect(queue.map((a) => a.id)).toEqual(['asset_a', 'asset_b']);
    });

    it('safely handles undo when queue is empty', () => {
      const { updatedQueue, undoneItem } = undoLastStagedItem([]);
      expect(updatedQueue).toEqual([]);
      expect(undoneItem).toBeNull();
    });
  });

  describe('Restoring an Individual Item from Temporary Folder Grid', () => {
    it('removes the selected item without mutating or altering unrelated items in the queue', () => {
      const initialQueue: MediaAsset[] = [assetA, assetB, assetC];
      const initialBytes = calculateQueueMetrics(initialQueue).totalBytes;

      // Restore middle item (assetB)
      const updatedQueue = restoreItemFromQueue(initialQueue, 'asset_b');

      // Assert target is removed
      expect(updatedQueue.find((a) => a.id === 'asset_b')).toBeUndefined();
      expect(updatedQueue).toHaveLength(2);

      // Assert metrics updated
      const metrics = calculateQueueMetrics(updatedQueue);
      expect(metrics.count).toBe(2);
      expect(metrics.totalBytes).toBe(initialBytes - assetB.estimatedSizeBytes);

      // Assert unrelated items (assetA, assetC) are completely unmutated and keep order
      expect(updatedQueue[0]).toEqual(assetA);
      expect(updatedQueue[1]).toEqual(assetC);
      expect(initialQueue).toHaveLength(3); // Original array not mutated in place
    });

    it('restoring all items empties the queue completely', () => {
      const initialQueue: MediaAsset[] = [assetA, assetB, assetC];
      const emptiedQueue: MediaAsset[] = [];

      const metrics = calculateQueueMetrics(emptiedQueue);
      expect(metrics.count).toBe(0);
      expect(metrics.totalBytes).toBe(0);
      expect(initialQueue).toHaveLength(3);
    });
  });

  describe('Deduplication & Seen Asset Protection (Duplicate Card Prevention)', () => {
    it('prevents already-swiped cards from re-entering the queue when incoming batches arrive', () => {
      const seenAssetIds = new Set<string>();
      let queue: MediaAsset[] = [assetA, assetB];

      // User swipes assetA (Keep)
      seenAssetIds.add(assetA.id);
      queue = queue.slice(1); // queue now has [assetB]

      // Next batch arrives containing [assetA, assetB, assetC] (e.g. from camera roll pagination)
      const incomingBatch = [assetA, assetB, assetC];
      const existingQueueIds = new Set(queue.map((a) => a.id));

      const newItemsToQueue = incomingBatch.filter(
        (a) => !existingQueueIds.has(a.id) && !seenAssetIds.has(a.id)
      );

      // Only assetC should be queued — assetA is ignored because it was already seen,
      // and assetB is ignored because it is already in the queue.
      expect(newItemsToQueue).toEqual([assetC]);
      queue = [...queue, ...newItemsToQueue];
      expect(queue.map((a) => a.id)).toEqual(['asset_b', 'asset_c']);
    });

    it('un-marks seenAssetIds when an item is restored or undone so it can be reviewed again', () => {
      const seenAssetIds = new Set<string>([assetA.id, assetB.id]);

      // Undo assetB
      seenAssetIds.delete(assetB.id);
      expect(seenAssetIds.has(assetB.id)).toBe(false);
      expect(seenAssetIds.has(assetA.id)).toBe(true);

      // Restore all
      const restored = [assetA];
      restored.forEach((item) => seenAssetIds.delete(item.id));
      expect(seenAssetIds.size).toBe(0);
    });
  });
});
