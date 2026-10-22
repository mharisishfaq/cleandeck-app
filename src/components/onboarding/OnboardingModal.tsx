import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { hapticFeedback } from '../../services/hapticsService';

interface OnboardingModalProps {
  visible: boolean;
  onComplete: () => void;
}

interface StepData {
  badge: string;
  badgeColor: string;
  emoji: string;
  title: string;
  subtitle: string;
  illustrationType: 'swipe' | 'queue' | 'shield';
  bullets: { icon: string; title: string; desc: string }[];
}

const STEPS: StepData[] = [
  {
    badge: 'STEP 1 OF 3 • INTUITIVE GESTURES',
    badgeColor: '#10B981',
    emoji: '👆',
    title: 'Swipe to Clean',
    subtitle: 'Reviewing your camera roll is as fun and fast as playing cards.',
    illustrationType: 'swipe',
    bullets: [
      {
        icon: '👉',
        title: 'Swipe Right = Keep',
        desc: 'Retain your favorite memories safely in your gallery.',
      },
      {
        icon: '👈',
        title: 'Swipe Left = Trash',
        desc: 'Stage blurry shots, duplicates, and heavy files for cleaning.',
      },
      {
        icon: '🔍',
        title: 'Double-Tap / Pinch',
        desc: 'Inspect landscape photos in full detail without accidental swipes.',
      },
    ],
  },
  {
    badge: 'STEP 2 OF 3 • SAFE BY DESIGN',
    badgeColor: '#F59E0B',
    emoji: '🛡️',
    title: 'Zero Deletion Anxiety',
    subtitle: 'Swiping left never deletes files immediately from your phone.',
    illustrationType: 'queue',
    bullets: [
      {
        icon: '📁',
        title: 'Temporary Folder',
        desc: 'All trashed items are staged in a reviewable holding area.',
      },
      {
        icon: '↺',
        title: 'One-Tap Restore',
        desc: 'Restore any photo back to your gallery anytime before deleting.',
      },
      {
        icon: '⏸️',
        title: 'Pause & Resume',
        desc: 'Pick up right where you left off. Your queue is safely saved.',
      },
    ],
  },
  {
    badge: 'STEP 3 OF 3 • SYSTEM INTEGRITY',
    badgeColor: '#6366F1',
    emoji: '🚀',
    title: 'Batch Delete with OS Safety',
    subtitle: 'Reclaim gigabytes of device storage with complete peace of mind.',
    illustrationType: 'shield',
    bullets: [
      {
        icon: '🔒',
        title: 'System Confirmation',
        desc: 'Apple & Android native dialogs always confirm batch removals.',
      },
      {
        icon: '♻️',
        title: 'Recently Deleted Safety Net',
        desc: 'Deleted assets move to Recently Deleted for 30 days of recovery.',
      },
      {
        icon: '⚡',
        title: 'Live Storage Reclaim Counter',
        desc: 'See exactly how many MBs and GBs you are freeing in real-time.',
      },
    ],
  },
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  visible,
  onComplete,
}) => {
  const insets = useSafeAreaInsets();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const step = STEPS[currentStepIndex];
  const isLastStep = currentStepIndex === STEPS.length - 1;

  const handleNext = () => {
    hapticFeedback.light();
    if (isLastStep) {
      hapticFeedback.medium();
      onComplete();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      hapticFeedback.light();
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    hapticFeedback.medium();
    onComplete();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="fullScreen"
      onRequestClose={onComplete}
    >
      <View style={[styles.container, { paddingTop: Math.max(insets.top + 10, 36) }]}>
        {/* Top Header Row with Skip / Back */}
        <View style={styles.topRow}>
          {currentStepIndex > 0 ? (
            <TouchableOpacity
              onPress={handleBack}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.backPlaceholder} />
          )}

          {/* Stepper Dot Indicators */}
          <View style={styles.stepperDots}>
            {STEPS.map((_, idx) => (
              <View
                key={idx}
                style={[
                  styles.dot,
                  idx === currentStepIndex && styles.activeDot,
                  idx < currentStepIndex && styles.completedDot,
                ]}
              />
            ))}
          </View>

          <TouchableOpacity
            onPress={handleSkip}
            style={styles.skipButton}
            activeOpacity={0.7}
          >
            <Text style={styles.skipButtonText}>
              {isLastStep ? '' : 'Skip'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Center Content Card */}
        <View style={styles.contentBody}>
          {/* Badge */}
          <View style={styles.badgeRow}>
            <View
              style={[
                styles.badgePill,
                { borderColor: step.badgeColor, backgroundColor: `${step.badgeColor}18` },
              ]}
            >
              <Text style={[styles.badgeText, { color: step.badgeColor }]}>
                {step.badge}
              </Text>
            </View>
          </View>

          {/* Graphic / Icon Circle */}
          <View style={styles.heroCircle}>
            <Text style={styles.heroEmoji}>{step.emoji}</Text>
          </View>

          {/* Title & Subtitle */}
          <Text style={styles.stepTitle}>{step.title}</Text>
          <Text style={styles.stepSubtitle}>{step.subtitle}</Text>

          {/* Step Visual Highlight Component */}
          {step.illustrationType === 'swipe' && (
            <View style={styles.interactiveDemoBox}>
              <View style={[styles.demoCard, styles.demoCardLeft]}>
                <Text style={styles.demoActionIcon}>✕</Text>
                <Text style={styles.demoCardLabel}>Swipe Left = Trash</Text>
              </View>
              <View style={[styles.demoCard, styles.demoCardRight]}>
                <Text style={[styles.demoActionIcon, styles.demoKeepIcon]}>✓</Text>
                <Text style={[styles.demoCardLabel, styles.demoKeepLabel]}>Swipe Right = Keep</Text>
              </View>
            </View>
          )}

          {step.illustrationType === 'queue' && (
            <View style={styles.interactiveDemoBox}>
              <View style={styles.demoQueueBox}>
                <Text style={styles.demoQueueIcon}>📂</Text>
                <Text style={styles.demoQueueTitle}>Staged in Temporary Folder</Text>
                <Text style={styles.demoQueueSubtitle}>
                  Nothing leaves your phone until you press &quot;Delete All&quot;
                </Text>
              </View>
            </View>
          )}

          {step.illustrationType === 'shield' && (
            <View style={styles.interactiveDemoBox}>
              <View style={styles.demoShieldBox}>
                <Text style={styles.demoShieldIcon}>🛡️</Text>
                <Text style={styles.demoShieldTitle}>OS Native Dialog</Text>
                <Text style={styles.demoShieldSubtitle}>
                  Protected by Apple Photos & Android Media Security
                </Text>
              </View>
            </View>
          )}

          {/* Feature Bullets */}
          <View style={styles.bulletsList}>
            {step.bullets.map((b, i) => (
              <View key={i} style={styles.bulletRow}>
                <View style={styles.bulletIconCircle}>
                  <Text style={styles.bulletIconText}>{b.icon}</Text>
                </View>
                <View style={styles.bulletContent}>
                  <Text style={styles.bulletTitle}>{b.title}</Text>
                  <Text style={styles.bulletDesc}>{b.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Bottom CTA Row (Safe-Area Protected) */}
        <View
          style={[
            styles.bottomActionRow,
            { paddingBottom: Math.max(insets.bottom + 16, 32) },
          ]}
        >
          <TouchableOpacity
            style={styles.primaryActionButton}
            onPress={handleNext}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryActionText}>
              {isLastStep ? 'Get Started ✨' : 'Continue →'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  backButtonText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '700',
  },
  backPlaceholder: {
    width: 60,
  },
  stepperDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#334155',
  },
  activeDot: {
    width: 24,
    backgroundColor: '#10B981',
  },
  completedDot: {
    backgroundColor: '#059669',
  },
  skipButton: {
    width: 60,
    alignItems: 'flex-end',
    paddingVertical: 6,
  },
  skipButtonText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
  contentBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  badgeRow: {
    marginBottom: 12,
  },
  badgePill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  heroCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderWidth: 2,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  heroEmoji: {
    fontSize: 34,
  },
  stepTitle: {
    color: '#F8FAFC',
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  stepSubtitle: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  interactiveDemoBox: {
    width: '100%',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    marginBottom: 16,
  },
  demoCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  demoCardLeft: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  demoCardRight: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  demoActionIcon: {
    fontSize: 18,
    fontWeight: '900',
    color: '#EF4444',
    marginBottom: 4,
  },
  demoKeepIcon: {
    color: '#10B981',
  },
  demoCardLabel: {
    color: '#FCA5A5',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  demoKeepLabel: {
    color: '#A7F3D0',
  },
  demoQueueBox: {
    width: '100%',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  demoQueueIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  demoQueueTitle: {
    color: '#FDE68A',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
  },
  demoQueueSubtitle: {
    color: '#D1D5DB',
    fontSize: 11,
    textAlign: 'center',
  },
  demoShieldBox: {
    width: '100%',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#6366F1',
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  demoShieldIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  demoShieldTitle: {
    color: '#C7D2FE',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
  },
  demoShieldSubtitle: {
    color: '#CBD5E1',
    fontSize: 11,
    textAlign: 'center',
  },
  bulletsList: {
    width: '100%',
    backgroundColor: '#161F30',
    borderRadius: 18,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  bulletIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  bulletIconText: {
    fontSize: 15,
  },
  bulletContent: {
    flex: 1,
  },
  bulletTitle: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  bulletDesc: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 16,
  },
  bottomActionRow: {
    width: '100%',
    paddingTop: 12,
  },
  primaryActionButton: {
    backgroundColor: '#10B981',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  primaryActionText: {
    color: '#0D0D0D',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
