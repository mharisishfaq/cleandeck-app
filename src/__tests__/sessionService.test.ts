import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  clearSession,
  hasCompletedOnboarding,
  loadSession,
  saveSession,
  setOnboardingCompleted,
} from '../services/sessionService';
import type { CleanerSessionData } from '../types/media';

describe('sessionService', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  const mockSession: CleanerSessionData = {
    lastAssetId: 'asset_test_123',
    pendingDeleteQueue: [
      {
        id: 'asset_1',
        filename: 'IMG_0001.JPG',
        uri: 'ph://0001',
        mediaType: 'photo',
        width: 3000,
        height: 4000,
        creationTime: 1700000000,
        formattedDate: 'Nov 14, 2023',
        duration: 0,
        aspectRatio: 3 / 4,
        estimatedSizeBytes: 3 * 1024 * 1024,
        formattedSize: '3.0 MB',
      },
    ],
    reviewedCount: 15,
    keptCount: 14,
    savedAt: new Date().toISOString(),
    sortDirection: 'desc',
  };

  describe('saveSession and loadSession', () => {
    it('returns null when no session has been saved', async () => {
      const session = await loadSession();
      expect(session).toBeNull();
    });

    it('persists and retrieves active session data accurately', async () => {
      await saveSession(mockSession);
      const retrieved = await loadSession();

      expect(retrieved).not.toBeNull();
      expect(retrieved?.lastAssetId).toBe(mockSession.lastAssetId);
      expect(retrieved?.reviewedCount).toBe(15);
      expect(retrieved?.keptCount).toBe(14);
      expect(retrieved?.pendingDeleteQueue).toHaveLength(1);
      expect(retrieved?.pendingDeleteQueue[0].id).toBe('asset_1');
    });

    it('handles corrupted/malformed storage gracefully without throwing', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Deliberately write invalid JSON to the session key
      await AsyncStorage.setItem('@cleanup_active_session_v1', '{invalid_json: true, malformed');

      const retrieved = await loadSession();
      expect(retrieved).toBeNull();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('clearSession', () => {
    it('successfully removes saved session', async () => {
      await saveSession(mockSession);
      expect(await loadSession()).not.toBeNull();

      await clearSession();
      expect(await loadSession()).toBeNull();
    });
  });

  describe('onboarding persistence', () => {
    it('defaults to false when onboarding has not been completed', async () => {
      const completed = await hasCompletedOnboarding();
      expect(completed).toBe(false);
    });

    it('persists onboarding completion status', async () => {
      await setOnboardingCompleted(true);
      expect(await hasCompletedOnboarding()).toBe(true);

      await setOnboardingCompleted(false);
      expect(await hasCompletedOnboarding()).toBe(false);
    });
  });
});
