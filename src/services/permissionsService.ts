import { Linking, Platform } from 'react-native';
import { PermissionStatus } from 'expo';
import * as MediaLibrary from 'expo-media-library/legacy';
import type { GalleryPermissionState } from '../types/media';

/**
 * Normalizes expo-media-library's PermissionResponse into a standardized GalleryPermissionState.
 */
function normalizePermissionResponse(
  response: MediaLibrary.PermissionResponse,
  isLoading = false
): GalleryPermissionState {
  const isGranted =
    response.granted ||
    response.accessPrivileges === 'all' ||
    response.accessPrivileges === 'limited';

  return {
    isGranted,
    canAskAgain: response.canAskAgain,
    status: response.status,
    accessPrivileges: response.accessPrivileges,
    isLoading,
  };
}

/**
 * Checks current photo/video library permissions without triggering a system prompt.
 */
export async function checkGalleryPermissions(): Promise<GalleryPermissionState> {
  try {
    const granularPermissions: MediaLibrary.GranularPermission[] =
      Platform.OS === 'android' ? ['photo', 'video'] : [];

    const response = await MediaLibrary.getPermissionsAsync(
      false, // writeOnly = false -> request read & write/delete
      granularPermissions
    );

    return normalizePermissionResponse(response);
  } catch (error) {
    console.error('[PermissionsService] Error checking permissions:', error);
    return {
      isGranted: false,
      canAskAgain: true,
      status: PermissionStatus.UNDETERMINED,
      isLoading: false,
    };
  }
}

/**
 * Triggers the native system modal requesting permissions to access and clean photos/videos.
 */
export async function requestGalleryPermissions(): Promise<GalleryPermissionState> {
  try {
    const granularPermissions: MediaLibrary.GranularPermission[] =
      Platform.OS === 'android' ? ['photo', 'video'] : [];

    const response = await MediaLibrary.requestPermissionsAsync(
      false, // Request full access (read & delete/write)
      granularPermissions
    );

    return normalizePermissionResponse(response);
  } catch (error) {
    console.error('[PermissionsService] Error requesting permissions:', error);
    return {
      isGranted: false,
      canAskAgain: true,
      status: PermissionStatus.DENIED,
      isLoading: false,
    };
  }
}

/**
 * Opens device application settings if user has permanently denied permissions.
 */
export async function openDeviceSettings(): Promise<void> {
  try {
    await Linking.openSettings();
  } catch (error) {
    console.error('[PermissionsService] Failed to open device settings:', error);
  }
}

/**
 * Checks if the current permission state represents limited/partial photo library access.
 */
export function isLimitedAccess(permissionState: GalleryPermissionState): boolean {
  return permissionState.accessPrivileges === 'limited';
}

/**
 * On iOS 14+ or Android 14+ with limited access, opens the system picker to grant access to more photos.
 * If the native picker is unsupported, gracefully falls back to device settings.
 */
export async function presentLimitedAccessPicker(): Promise<void> {
  try {
    if (typeof (MediaLibrary as any).presentPermissionsPickerAsync === 'function') {
      await (MediaLibrary as any).presentPermissionsPickerAsync();
    } else {
      await openDeviceSettings();
    }
  } catch (error) {
    console.warn('[PermissionsService] presentPermissionsPickerAsync unavailable, opening settings:', error);
    await openDeviceSettings();
  }
}
