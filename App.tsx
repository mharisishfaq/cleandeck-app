import React, { useCallback, useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AppState, StyleSheet, View, type AppStateStatus } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useGalleryCleaner } from './src/hooks/useGalleryCleaner';
import { InitialLoadingScreen } from './src/components/InitialLoadingScreen';
import { PermissionRequestView } from './src/components/PermissionRequestView';
import { HomeScreen } from './src/components/home/HomeScreen';
import { SwiperDeck } from './src/components/swiper/SwiperDeck';
import { OnboardingModal } from './src/components/onboarding/OnboardingModal';
import {
  clearSession,
  hasCompletedOnboarding,
  loadSession,
  saveSession,
  setOnboardingCompleted,
} from './src/services/sessionService';
import {
  getDetailedGallerySummary,
  type GallerySummaryStats,
} from './src/services/mediaFetcherService';
import type { CleanerSessionData, MediaAsset } from './src/types/media';

type AppScreen = 'home' | 'deck';

export default function App() {
  const {
    permission,
    isLimitedAccess,
    selectMorePhotos,
    requestPermissions,
    openSettings,
    checkPermissions,
    assets,
    totalCount,
    hasNextPage,
    sortDirection,
    loadInitialBatch,
    loadNextBatch,
    deleteAssets,
    isMockMode,
    toggleMockMode,
  } = useGalleryCleaner({
    batchSize: 20,
    initialSortDirection: 'desc',
    mediaType: 'all',
    autoLoadOnGranted: false, // We control batch loading based on Home Resume / Start New
  });

  const [currentScreen, setCurrentScreen] = useState<AppScreen>('home');
  const [activeSession, setActiveSession] = useState<CleanerSessionData | null>(null);
  const [galleryStats, setGalleryStats] = useState<GallerySummaryStats | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // 1. Initial App Boot: Check permissions, load persisted session & stats
  useEffect(() => {
    async function init() {
      try {
        const [permResult, savedSess, onboardingDone] = await Promise.all([
          checkPermissions(),
          loadSession(),
          hasCompletedOnboarding(),
        ]);

        setActiveSession(savedSess);

        if (!onboardingDone) {
          setShowOnboarding(true);
        }

        if (permResult.isGranted) {
          const stats = await getDetailedGallerySummary();
          setGalleryStats(stats);
        }
      } catch (err) {
        console.error('[App] Initialization error:', err);
      } finally {
        setIsInitializing(false);
      }
    }

    init();
  }, [checkPermissions]);

  const handleCompleteOnboarding = useCallback(async () => {
    await setOnboardingCompleted(true);
    setShowOnboarding(false);
  }, []);

  // 2. AppState Listener: Detect permission revocation when resuming from device settings
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        const permResult = await checkPermissions();
        if (permResult.isGranted) {
          const stats = await getDetailedGallerySummary();
          setGalleryStats(stats);
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, [checkPermissions]);

  // 3. Action: Resume Paused Session
  const handleResumeSession = useCallback(async () => {
    if (!activeSession) return;

    // Load media starting after saved cursor
    await loadInitialBatch(sortDirection, activeSession.lastAssetId);
    setCurrentScreen('deck');
  }, [activeSession, loadInitialBatch, sortDirection]);

  // 4. Action: Start New Session
  const handleStartNewSession = useCallback(async () => {
    await clearSession();
    setActiveSession(null);

    // Fetch from beginning of camera roll
    await loadInitialBatch(sortDirection, undefined);
    setCurrentScreen('deck');
  }, [loadInitialBatch, sortDirection]);

  // 5. Action: Pause Current Deck Run
  const handlePauseDeck = useCallback(
    async (sessionData: CleanerSessionData) => {
      try {
        await saveSession(sessionData);
        setActiveSession(sessionData);
        setCurrentScreen('home');

        // Refresh stats
        const stats = await getDetailedGallerySummary();
        setGalleryStats(stats);
      } catch (err) {
        console.error('[App] Failed to pause session:', err);
        setCurrentScreen('home');
      }
    },
    []
  );

  // 6. Action: Return to Home (from Deck Completion or Empty State)
  const handleReturnHome = useCallback(async () => {
    await clearSession();
    setActiveSession(null);
    setCurrentScreen('home');

    const stats = await getDetailedGallerySummary();
    setGalleryStats(stats);
  }, []);

  // 7. Action: Direct Batch Deletion from Home
  const handleDirectDelete = useCallback(
    async (assetIds: string[]): Promise<boolean> => {
      const success = await deleteAssets(assetIds);
      if (success) {
        await clearSession();
        setActiveSession(null);
        const stats = await getDetailedGallerySummary();
        setGalleryStats(stats);
      }
      return success;
    },
    [deleteAssets]
  );

  // 8. Action: Synchronize Session Queue updates from Home Temporary Folder review
  const handleUpdateSessionQueue = useCallback(
    async (updatedQueue: MediaAsset[]) => {
      if (!activeSession) return;
      const updatedSession: CleanerSessionData = {
        ...activeSession,
        pendingDeleteQueue: updatedQueue,
      };
      await saveSession(updatedSession);
      setActiveSession(updatedSession);
    },
    [activeSession]
  );

  // 9. Action: Select More Photos (Limited / Partial Access)
  const handleSelectMorePhotos = useCallback(async () => {
    await selectMorePhotos();
    const stats = await getDetailedGallerySummary();
    setGalleryStats(stats);
  }, [selectMorePhotos]);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={styles.root}>
        {/* Light content status bar for deep dark theme */}
        <StatusBar style="light" />
        <View style={styles.appContainer}>
          {/* State A: Initial Permissions & Storage Scan */}
          {isInitializing || permission.isLoading ? (
            <InitialLoadingScreen statusMessage="Initializing CleanDeck..." />
          ) : !permission.isGranted ? (
            /* State B: Permissions Prompt (Catches external revocations smoothly) */
            <PermissionRequestView
              permission={permission}
              onRequestPermission={async () => {
                const res = await requestPermissions();
                if (res.isGranted) {
                  const stats = await getDetailedGallerySummary();
                  setGalleryStats(stats);
                }
              }}
              onOpenSettings={openSettings}
              onRetry={async () => {
                const res = await checkPermissions();
                if (res.isGranted) {
                  const stats = await getDetailedGallerySummary();
                  setGalleryStats(stats);
                }
              }}
              onTryDemoMode={async () => {
                await toggleMockMode(true);
                const stats = await getDetailedGallerySummary();
                setGalleryStats(stats);
              }}
            />
          ) : currentScreen === 'home' ? (
            /* State C: Home Dashboard with Staged Temporary Folder inspection */
            <HomeScreen
              session={activeSession}
              galleryStats={galleryStats}
              isMockMode={isMockMode}
              isLimitedAccess={isLimitedAccess}
              onSelectMorePhotos={handleSelectMorePhotos}
              onToggleMockMode={async () => {
                await toggleMockMode(!isMockMode);
                const stats = await getDetailedGallerySummary();
                setGalleryStats(stats);
              }}
              onOpenOnboarding={() => setShowOnboarding(true)}
              onResumeSession={handleResumeSession}
              onStartNewSession={handleStartNewSession}
              onDirectBatchDelete={handleDirectDelete}
              onUpdateSessionQueue={handleUpdateSessionQueue}
            />
          ) : (
            /* State D: 9:16 Swiper Deck with Inspection Zoom & Memory Caps */
            <SwiperDeck
              initialAssets={assets}
              totalCount={totalCount}
              hasNextPage={hasNextPage}
              onLoadNextBatch={loadNextBatch}
              onDeleteAssets={deleteAssets}
              onPause={handlePauseDeck}
              onReturnHome={handleReturnHome}
              onSessionUpdate={(updatedSession) => setActiveSession(updatedSession)}
              initialPendingQueue={activeSession?.pendingDeleteQueue || []}
              initialReviewedCount={activeSession?.reviewedCount || 0}
              initialKeptCount={activeSession?.keptCount || 0}
            />
          )}

          {/* First-Time Onboarding Walkthrough Modal */}
          <OnboardingModal
            visible={showOnboarding}
            onComplete={handleCompleteOnboarding}
          />
        </View>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
  },
  appContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
});
