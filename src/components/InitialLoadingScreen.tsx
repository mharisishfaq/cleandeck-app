import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

interface InitialLoadingScreenProps {
  statusMessage?: string;
}

export const InitialLoadingScreen: React.FC<InitialLoadingScreenProps> = ({
  statusMessage = 'Scanning device gallery...',
}) => {
  return (
    <View style={styles.container}>
      {/* Gamified Pulse Ring */}
      <View style={styles.pulseContainer}>
        <View style={styles.outerRing}>
          <View style={styles.innerRing}>
            <Text style={styles.heroEmoji}>🧹</Text>
          </View>
        </View>
      </View>

      <Text style={styles.title}>CleanUp Gallery</Text>
      <Text style={styles.subtitle}>Gamified Storage Cleaner</Text>

      <View style={styles.loadingBox}>
        <ActivityIndicator size="small" color="#10B981" />
        <Text style={styles.statusText}>{statusMessage}</Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerBadge}>⚡ LIGHTWEIGHT MEMORY SCANNER</Text>
        <Text style={styles.footerDetail}>
          Preparing initial 20-asset batch via cursor stream
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  pulseContainer: {
    marginBottom: 24,
  },
  outerRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  innerRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroEmoji: {
    fontSize: 42,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 15,
    marginTop: 4,
    marginBottom: 32,
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  statusText: {
    color: '#F1F5F9',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
  },
  footerBadge: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  footerDetail: {
    color: '#64748B',
    fontSize: 12,
  },
});
