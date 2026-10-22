import React from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, View } from 'react-native';

interface InitialLoadingScreenProps {
  statusMessage?: string;
}

export const InitialLoadingScreen: React.FC<InitialLoadingScreenProps> = ({
  statusMessage = 'INITIALIZING SYSTEM SCAN...',
}) => {
  return (
    <View style={styles.container}>
      {/* Brutalist Geometric Wireframe Box */}
      <View style={styles.wireframeBox}>
        <Text style={styles.wireframeIcon}>//</Text>
      </View>

      <Text style={styles.title}>CLEANDECK</Text>
      <Text style={styles.subtitle}>STORAGE RECLAMATION TERMINAL</Text>

      <View style={styles.loadingBox}>
        <ActivityIndicator size="small" color="#D4FF00" />
        <Text style={styles.statusText}>[ {statusMessage.toUpperCase()} ]</Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerBadge}>[ CURSOR STREAM // 60FPS REANIMATED ]</Text>
        <Text style={styles.footerDetail}>
          Scanning local camera roll blocks
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  wireframeBox: {
    width: 64,
    height: 64,
    borderRadius: 2,
    backgroundColor: '#000000',
    borderWidth: 2,
    borderColor: '#D4FF00',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  wireframeIcon: {
    fontSize: 24,
    color: '#D4FF00',
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  subtitle: {
    color: '#666666',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginTop: 4,
    marginBottom: 32,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 2,
    gap: 10,
    borderWidth: 1.5,
    borderColor: '#333333',
  },
  statusText: {
    color: '#D4FF00',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
  },
  footerBadge: {
    color: '#8E8E8E',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  footerDetail: {
    color: '#444444',
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});
