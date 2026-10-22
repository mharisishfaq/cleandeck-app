import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BRUTALIST } from '../theme/brutalist';
import type { GalleryPermissionState } from '../types/media';

interface PermissionRequestViewProps {
  permission: GalleryPermissionState;
  onRequestPermission: () => void;
  onOpenSettings: () => void;
  onRetry: () => void;
  onTryDemoMode?: () => void;
}

export const PermissionRequestView: React.FC<PermissionRequestViewProps> = ({
  permission,
  onRequestPermission,
  onOpenSettings,
  onRetry,
  onTryDemoMode,
}) => {
  const isDeniedPermanently = !permission.canAskAgain && permission.status === 'denied';

  return (
    <View style={styles.container}>
      {/* Brutalist System Header */}
      <View style={styles.header}>
        <View style={styles.terminalTag}>
          <Text style={styles.terminalTagText}>// CLEANDECK OS GATEWAY</Text>
        </View>
        <Text style={styles.title}>STORAGE_ACCESS</Text>
        <Text style={styles.titleSub}>PERMISSION VERIFICATION REQUIRED</Text>
      </View>

      {/* Hero Terminal Card */}
      <View style={styles.terminalCard}>
        <View style={styles.terminalCardHeader}>
          <Text style={styles.terminalCardHeaderDot}>●</Text>
          <Text style={styles.terminalCardHeaderText}>SECURITY PROTOCOL 01</Text>
        </View>
        <Text style={styles.terminalCardBody}>
          CleanDeck operates as an on-device storage reclamation tool. Direct read access
          to your media index is required to compute asset sizes, detect redundancies,
          and stage files for batch removal.
        </Text>
      </View>

      {/* Hardware Protocols */}
      <View style={styles.protocolList}>
        <View style={styles.protocolItem}>
          <View style={styles.protocolIndexBox}>
            <Text style={styles.protocolIndexText}>01</Text>
          </View>
          <View style={styles.protocolContent}>
            <Text style={styles.protocolTitle}>LOCAL SCANNING ONLY</Text>
            <Text style={styles.protocolDesc}>
              Media is indexed on-device in lightweight cursor-paginated chunks.
            </Text>
          </View>
        </View>

        <View style={styles.protocolItem}>
          <View style={styles.protocolIndexBox}>
            <Text style={styles.protocolIndexText}>02</Text>
          </View>
          <View style={styles.protocolContent}>
            <Text style={styles.protocolTitle}>STAGE & REVIEW GATEWAY</Text>
            <Text style={styles.protocolDesc}>
              Swipes only stage files in a temporary review queue. No immediate deletion.
            </Text>
          </View>
        </View>

        <View style={styles.protocolItem}>
          <View style={styles.protocolIndexBox}>
            <Text style={styles.protocolIndexText}>03</Text>
          </View>
          <View style={styles.protocolContent}>
            <Text style={styles.protocolTitle}>OS SAFETY SHIELD</Text>
            <Text style={styles.protocolDesc}>
              Final batch removal always triggers your device operating system dialog.
            </Text>
          </View>
        </View>
      </View>

      {/* Denied Status Warning */}
      {isDeniedPermanently && (
        <View style={styles.deniedBanner}>
          <Text style={styles.deniedTag}>[ ! ] ERROR: PERMISSION_BLOCKED</Text>
          <Text style={styles.deniedDesc}>
            Access was declined at system level. Open device settings to enable Photo Library
            read permissions.
          </Text>
        </View>
      )}

      {/* Action Block */}
      <View style={styles.actionSection}>
        {permission.isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color={BRUTALIST.colors.accent} />
            <Text style={styles.loadingText}>[ QUERYING SYSTEM PERMISSIONS... ]</Text>
          </View>
        ) : isDeniedPermanently ? (
          <>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={onOpenSettings}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryBtnText}>[ OPEN SYSTEM SETTINGS ]</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={onRetry}
              activeOpacity={0.75}
            >
              <Text style={styles.secondaryBtnText}>[ RE-CHECK PERMISSIONS ]</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={onRequestPermission}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryBtnText}>[ GRANT GALLERY ACCESS ]</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={onOpenSettings}
              activeOpacity={0.75}
            >
              <Text style={styles.secondaryBtnText}>[ OPEN SETTINGS ]</Text>
            </TouchableOpacity>
          </>
        )}

        {onTryDemoMode && (
          <TouchableOpacity
            style={styles.demoBtn}
            onPress={onTryDemoMode}
            activeOpacity={0.8}
          >
            <Text style={styles.demoBtnText}>[ LAUNCH SANDBOX DEMO (18 ITEMS) ]</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRUTALIST.colors.bg,
    paddingHorizontal: 20,
    paddingTop: 64,
    paddingBottom: 36,
    justifyContent: 'space-between',
  },
  header: {
    marginBottom: 8,
  },
  terminalTag: {
    alignSelf: 'flex-start',
    backgroundColor: BRUTALIST.colors.surfaceRaised,
    borderWidth: BRUTALIST.borders.thin,
    borderColor: BRUTALIST.colors.border,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BRUTALIST.radii.xs,
    marginBottom: 10,
  },
  terminalTagText: {
    color: BRUTALIST.colors.accent,
    fontFamily: BRUTALIST.typography.mono,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  title: {
    color: BRUTALIST.colors.text,
    fontSize: 26,
    fontWeight: '900',
    fontFamily: BRUTALIST.typography.mono,
    letterSpacing: 0.5,
  },
  titleSub: {
    color: BRUTALIST.colors.textDim,
    fontSize: 11,
    fontFamily: BRUTALIST.typography.mono,
    letterSpacing: 1,
    marginTop: 4,
  },
  terminalCard: {
    backgroundColor: BRUTALIST.colors.surface,
    borderWidth: BRUTALIST.borders.heavy,
    borderColor: BRUTALIST.colors.borderStark,
    borderRadius: BRUTALIST.radii.xs,
    padding: 16,
    ...BRUTALIST.shadows.hardBox,
  },
  terminalCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    borderBottomWidth: BRUTALIST.borders.thin,
    borderBottomColor: BRUTALIST.colors.border,
    paddingBottom: 6,
  },
  terminalCardHeaderDot: {
    color: BRUTALIST.colors.accent,
    fontSize: 10,
  },
  terminalCardHeaderText: {
    color: BRUTALIST.colors.textDim,
    fontFamily: BRUTALIST.typography.mono,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  terminalCardBody: {
    color: BRUTALIST.colors.text,
    fontFamily: BRUTALIST.typography.mono,
    fontSize: 12,
    lineHeight: 18,
  },
  protocolList: {
    gap: 10,
  },
  protocolItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BRUTALIST.colors.surface,
    borderWidth: BRUTALIST.borders.thin,
    borderColor: BRUTALIST.colors.border,
    borderRadius: BRUTALIST.radii.xs,
    padding: 12,
    gap: 12,
  },
  protocolIndexBox: {
    width: 32,
    height: 32,
    backgroundColor: BRUTALIST.colors.surfaceRaised,
    borderWidth: BRUTALIST.borders.thin,
    borderColor: BRUTALIST.colors.borderLight,
    borderRadius: BRUTALIST.radii.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  protocolIndexText: {
    color: BRUTALIST.colors.accent,
    fontFamily: BRUTALIST.typography.mono,
    fontSize: 12,
    fontWeight: '900',
  },
  protocolContent: {
    flex: 1,
  },
  protocolTitle: {
    color: BRUTALIST.colors.text,
    fontFamily: BRUTALIST.typography.mono,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  protocolDesc: {
    color: BRUTALIST.colors.textDim,
    fontFamily: BRUTALIST.typography.mono,
    fontSize: 10,
    lineHeight: 14,
  },
  deniedBanner: {
    backgroundColor: BRUTALIST.colors.dangerBg,
    borderWidth: BRUTALIST.borders.normal,
    borderColor: BRUTALIST.colors.danger,
    borderRadius: BRUTALIST.radii.xs,
    padding: 12,
  },
  deniedTag: {
    color: BRUTALIST.colors.danger,
    fontFamily: BRUTALIST.typography.mono,
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 4,
  },
  deniedDesc: {
    color: BRUTALIST.colors.text,
    fontFamily: BRUTALIST.typography.mono,
    fontSize: 10,
    lineHeight: 14,
  },
  actionSection: {
    gap: 10,
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    backgroundColor: BRUTALIST.colors.surface,
    borderWidth: BRUTALIST.borders.thin,
    borderColor: BRUTALIST.colors.border,
    borderRadius: BRUTALIST.radii.xs,
  },
  loadingText: {
    color: BRUTALIST.colors.accent,
    fontFamily: BRUTALIST.typography.mono,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  primaryBtn: {
    backgroundColor: BRUTALIST.colors.accent,
    borderWidth: BRUTALIST.borders.heavy,
    borderColor: BRUTALIST.colors.accent,
    borderRadius: BRUTALIST.radii.xs,
    paddingVertical: 15,
    alignItems: 'center',
    ...BRUTALIST.shadows.hardAccent,
  },
  primaryBtnText: {
    color: BRUTALIST.colors.accentText,
    fontFamily: BRUTALIST.typography.mono,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  secondaryBtn: {
    backgroundColor: BRUTALIST.colors.surface,
    borderWidth: BRUTALIST.borders.normal,
    borderColor: BRUTALIST.colors.borderLight,
    borderRadius: BRUTALIST.radii.xs,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: BRUTALIST.colors.text,
    fontFamily: BRUTALIST.typography.mono,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  demoBtn: {
    backgroundColor: BRUTALIST.colors.surfaceRaised,
    borderWidth: BRUTALIST.borders.thin,
    borderColor: BRUTALIST.colors.border,
    borderRadius: BRUTALIST.radii.xs,
    paddingVertical: 12,
    alignItems: 'center',
  },
  demoBtnText: {
    color: BRUTALIST.colors.accent,
    fontFamily: BRUTALIST.typography.mono,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
});
