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
import { BRUTALIST } from '../../theme/brutalist';

interface OnboardingModalProps {
  visible: boolean;
  onComplete: () => void;
}

interface StepData {
  tag: string;
  tagColor: string;
  code: string;
  title: string;
  subtitle: string;
  illustrationType: 'swipe' | 'queue' | 'shield';
  bullets: { code: string; title: string; desc: string }[];
}

const STEPS: StepData[] = [
  {
    tag: '// GESTURE INTERACTION',
    tagColor: BRUTALIST.colors.accent,
    code: 'STAGE_01',
    title: 'DECISION_DECK',
    subtitle: 'Review high-resolution camera roll media rapidly with single gestures.',
    illustrationType: 'swipe',
    bullets: [
      {
        code: '01',
        title: 'SWIPE RIGHT = PRESERVE',
        desc: 'Retains media untouched in original camera roll directories.',
      },
      {
        code: '02',
        title: 'SWIPE LEFT = STAGE PURGE',
        desc: 'Queues duplicate, blurry, or heavy assets for reclamation.',
      },
      {
        code: '03',
        title: 'DOUBLE-TAP / PINCH = ZOOM',
        desc: 'Inspect full-scale assets without accidental swipe triggers.',
      },
    ],
  },
  {
    tag: '// DATA INTEGRITY',
    tagColor: '#FFAA00',
    code: 'STAGE_02',
    title: 'STAGED_HOLDING',
    subtitle: 'Zero instant deletion. All flagged items wait safely in a review sandbox.',
    illustrationType: 'queue',
    bullets: [
      {
        code: '01',
        title: 'INTERMEDIATE REVIWER',
        desc: 'Inspect staged items at any point before triggering actual removal.',
      },
      {
        code: '02',
        title: 'INSTANT DESELECTION',
        desc: 'Remove any asset from the purge queue with a single tap.',
      },
      {
        code: '03',
        title: 'PERSISTENT SESSION',
        desc: 'Pause and resume cleaning runs anytime without loss of progress.',
      },
    ],
  },
  {
    tag: '// HARDWARE SECURITY',
    tagColor: BRUTALIST.colors.success,
    code: 'STAGE_03',
    title: 'SYSTEM_PURGE_GATE',
    subtitle: 'Batch deletions are hardware-protected and natively confirmed.',
    illustrationType: 'shield',
    bullets: [
      {
        code: '01',
        title: 'OS CONFIRMATION DIALOG',
        desc: 'Apple & Android native systems prompt final approval before deletion.',
      },
      {
        code: '02',
        title: '30-DAY RECENTLY DELETED SAFETY',
        desc: 'Files move to system trash first for 30-day emergency recovery.',
      },
      {
        code: '03',
        title: 'LIVE TELEMETRY TRACKER',
        desc: 'Monitor exact megabytes and gigabytes reclaimed in real-time.',
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
      <View style={[styles.container, { paddingTop: Math.max(insets.top + 8, 36) }]}>
        {/* Navigation Bar */}
        <View style={styles.topRow}>
          {currentStepIndex > 0 ? (
            <TouchableOpacity
              onPress={handleBack}
              style={styles.navBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.navBtnText}>[ ← PREV ]</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.navBtnPlaceholder} />
          )}

          {/* Stepper Readout */}
          <View style={styles.stepperReadout}>
            <Text style={styles.stepperText}>
              [ {currentStepIndex + 1} / {STEPS.length} ]
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleSkip}
            style={styles.navBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.skipBtnText}>
              {isLastStep ? '' : '[ SKIP ]'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Center Content Body */}
        <View style={styles.contentBody}>
          {/* Header Metadata Tag */}
          <View style={styles.metaRow}>
            <View style={[styles.tagBadge, { borderColor: step.tagColor }]}>
              <Text style={[styles.tagText, { color: step.tagColor }]}>
                {step.tag}
              </Text>
            </View>
            <Text style={styles.codeStamp}>// {step.code}</Text>
          </View>

          {/* Main Title & Subtitle */}
          <Text style={styles.stepTitle}>{step.title}</Text>
          <Text style={styles.stepSubtitle}>{step.subtitle}</Text>

          {/* Step Technical Diagram */}
          {step.illustrationType === 'swipe' && (
            <View style={styles.demoContainer}>
              <View style={[styles.demoBlock, styles.demoBlockLeft]}>
                <Text style={styles.demoBlockSymbol}>[ ✕ ]</Text>
                <Text style={styles.demoBlockLabel}>SWIPE LEFT</Text>
                <Text style={styles.demoBlockSub}>STAGE PURGE</Text>
              </View>
              <View style={[styles.demoBlock, styles.demoBlockRight]}>
                <Text style={[styles.demoBlockSymbol, styles.demoKeepSymbol]}>[ ✓ ]</Text>
                <Text style={[styles.demoBlockLabel, styles.demoKeepLabel]}>SWIPE RIGHT</Text>
                <Text style={[styles.demoBlockSub, styles.demoKeepSub]}>PRESERVE</Text>
              </View>
            </View>
          )}

          {step.illustrationType === 'queue' && (
            <View style={styles.demoContainer}>
              <View style={styles.demoTerminalBox}>
                <Text style={styles.demoTerminalTag}>// STAGING_SANDBOX // ACTIVE</Text>
                <Text style={styles.demoTerminalText}>
                  Assets staged for deletion remain 100% accessible until you explicitly confirm
                  batch purge. One-tap restore available anytime.
                </Text>
              </View>
            </View>
          )}

          {step.illustrationType === 'shield' && (
            <View style={styles.demoContainer}>
              <View style={styles.demoTerminalBox}>
                <Text style={styles.demoTerminalTag}>// OS_CONFIRMATION_LAYER</Text>
                <Text style={styles.demoTerminalText}>
                  Protected by native Apple Photos & Android Media security APIs. Deletion moves
                  assets to system 30-day trash first.
                </Text>
              </View>
            </View>
          )}

          {/* Technical Protocol Bullets */}
          <View style={styles.protocolList}>
            {step.bullets.map((b) => (
              <View key={b.code} style={styles.protocolRow}>
                <View style={styles.protocolIdx}>
                  <Text style={styles.protocolIdxText}>[{b.code}]</Text>
                </View>
                <View style={styles.protocolDetail}>
                  <Text style={styles.protocolTitle}>{b.title}</Text>
                  <Text style={styles.protocolDesc}>{b.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Bottom CTA Row */}
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
              {isLastStep ? '[ INITIALIZE CLEANDECK ]' : '[ NEXT PROTOCOL → ]'}
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
    backgroundColor: BRUTALIST.colors.bg,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 40,
    borderBottomWidth: BRUTALIST.borders.thin,
    borderBottomColor: BRUTALIST.colors.border,
    paddingBottom: 8,
  },
  navBtn: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  navBtnText: {
    color: BRUTALIST.colors.textDim,
    fontFamily: BRUTALIST.typography.mono,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  navBtnPlaceholder: {
    width: 60,
  },
  stepperReadout: {
    alignItems: 'center',
  },
  stepperText: {
    color: BRUTALIST.colors.accent,
    fontFamily: BRUTALIST.typography.mono,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  skipBtnText: {
    color: BRUTALIST.colors.textMuted,
    fontFamily: BRUTALIST.typography.mono,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  contentBody: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: BRUTALIST.borders.thin,
    borderRadius: BRUTALIST.radii.xs,
    backgroundColor: BRUTALIST.colors.surfaceRaised,
  },
  tagText: {
    fontFamily: BRUTALIST.typography.mono,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  codeStamp: {
    color: BRUTALIST.colors.textMuted,
    fontFamily: BRUTALIST.typography.mono,
    fontSize: 11,
    fontWeight: '700',
  },
  stepTitle: {
    color: BRUTALIST.colors.text,
    fontSize: 24,
    fontWeight: '900',
    fontFamily: BRUTALIST.typography.mono,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  stepSubtitle: {
    color: BRUTALIST.colors.textDim,
    fontFamily: BRUTALIST.typography.mono,
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 16,
  },
  demoContainer: {
    width: '100%',
    marginBottom: 16,
  },
  demoBlock: {
    flex: 1,
    backgroundColor: BRUTALIST.colors.surface,
    borderWidth: BRUTALIST.borders.normal,
    borderRadius: BRUTALIST.radii.xs,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  demoBlockLeft: {
    borderColor: BRUTALIST.colors.danger,
    backgroundColor: BRUTALIST.colors.dangerBg,
  },
  demoBlockRight: {
    borderColor: BRUTALIST.colors.success,
    backgroundColor: BRUTALIST.colors.successBg,
  },
  demoBlockSymbol: {
    color: BRUTALIST.colors.danger,
    fontFamily: BRUTALIST.typography.mono,
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 2,
  },
  demoBlockLabel: {
    color: BRUTALIST.colors.text,
    fontFamily: BRUTALIST.typography.mono,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  demoBlockSub: {
    color: BRUTALIST.colors.danger,
    fontFamily: BRUTALIST.typography.mono,
    fontSize: 9,
    fontWeight: '700',
    marginTop: 2,
  },
  demoKeepSymbol: {
    color: BRUTALIST.colors.success,
  },
  demoKeepLabel: {
    color: BRUTALIST.colors.text,
  },
  demoKeepSub: {
    color: BRUTALIST.colors.success,
  },
  demoTerminalBox: {
    backgroundColor: BRUTALIST.colors.surface,
    borderWidth: BRUTALIST.borders.normal,
    borderColor: BRUTALIST.colors.borderStark,
    borderRadius: BRUTALIST.radii.xs,
    padding: 12,
    ...BRUTALIST.shadows.hardBox,
  },
  demoTerminalTag: {
    color: BRUTALIST.colors.accent,
    fontFamily: BRUTALIST.typography.mono,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 6,
  },
  demoTerminalText: {
    color: BRUTALIST.colors.text,
    fontFamily: BRUTALIST.typography.mono,
    fontSize: 11,
    lineHeight: 16,
  },
  protocolList: {
    backgroundColor: BRUTALIST.colors.surface,
    borderWidth: BRUTALIST.borders.thin,
    borderColor: BRUTALIST.colors.border,
    borderRadius: BRUTALIST.radii.xs,
    padding: 12,
    gap: 12,
  },
  protocolRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  protocolIdx: {
    marginTop: 1,
  },
  protocolIdxText: {
    color: BRUTALIST.colors.accent,
    fontFamily: BRUTALIST.typography.mono,
    fontSize: 11,
    fontWeight: '800',
  },
  protocolDetail: {
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
  bottomActionRow: {
    width: '100%',
    paddingTop: 12,
  },
  primaryActionButton: {
    backgroundColor: BRUTALIST.colors.accent,
    borderWidth: BRUTALIST.borders.heavy,
    borderColor: BRUTALIST.colors.accent,
    borderRadius: BRUTALIST.radii.xs,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...BRUTALIST.shadows.hardAccent,
  },
  primaryActionText: {
    color: BRUTALIST.colors.accentText,
    fontFamily: BRUTALIST.typography.mono,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
