import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CleanerSessionData } from '../types/media';

const SESSION_STORAGE_KEY = '@cleanup_active_session_v1';

/**
 * Persists active cleaning session state (cursor, staged deletions, stats) to local storage.
 */
export async function saveSession(sessionData: CleanerSessionData): Promise<void> {
  try {
    const jsonString = JSON.stringify(sessionData);
    await AsyncStorage.setItem(SESSION_STORAGE_KEY, jsonString);
  } catch (error) {
    console.error('[SessionService] Failed to save session:', error);
    throw error;
  }
}

/**
 * Retrieves the saved session from local storage, or null if no session is active.
 */
export async function loadSession(): Promise<CleanerSessionData | null> {
  try {
    const jsonString = await AsyncStorage.getItem(SESSION_STORAGE_KEY);
    if (!jsonString) return null;

    const data: CleanerSessionData = JSON.parse(jsonString);
    return data;
  } catch (error) {
    console.error('[SessionService] Failed to load session:', error);
    return null;
  }
}

/**
 * Clears the saved session from local storage.
 */
export async function clearSession(): Promise<void> {
  try {
    await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (error) {
    console.error('[SessionService] Failed to clear session:', error);
  }
}

const ONBOARDING_STORAGE_KEY = '@cleandeck_has_completed_onboarding_v1';

/**
 * Checks if the user has completed the first-time onboarding walkthrough.
 */
export async function hasCompletedOnboarding(): Promise<boolean> {
  try {
    const val = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
    return val === 'true';
  } catch (error) {
    console.error('[SessionService] Failed to check onboarding status:', error);
    return false;
  }
}

/**
 * Persists the onboarding completion status to local storage.
 */
export async function setOnboardingCompleted(completed: boolean = true): Promise<void> {
  try {
    await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, completed ? 'true' : 'false');
  } catch (error) {
    console.error('[SessionService] Failed to set onboarding status:', error);
  }
}
