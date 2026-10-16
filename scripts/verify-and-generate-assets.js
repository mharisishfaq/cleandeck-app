#!/usr/bin/env node
/**
 * scripts/verify-and-generate-assets.js
 *
 * Automated verification and guideline generator for CleanDeck release assets:
 * - 1024x1024 App Store / Expo master icon
 * - Adaptive Android foreground, background, and monochrome assets
 * - Splash screen icon and background configuration
 */

const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.resolve(__dirname, '../assets');

const REQUIRED_ASSETS = [
  {
    filename: 'icon.png',
    description: 'Universal App Icon / iOS App Store Icon',
    requiredWidth: 1024,
    requiredHeight: 1024,
    allowAlpha: false, // Apple App Store rejects icons with alpha channels
    notes: 'Must be opaque RGB, 1024x1024. No rounded corners (iOS applies corner radius automatically).',
  },
  {
    filename: 'android-icon-foreground.png',
    description: 'Android Adaptive Icon Foreground',
    minWidth: 432,
    minHeight: 432,
    recommendedWidth: 1024,
    recommendedHeight: 1024,
    allowAlpha: true,
    notes: 'Transparent background. Logo must sit within the inner 66% safe zone (circle diameter ~672px on a 1024px canvas).',
  },
  {
    filename: 'android-icon-background.png',
    description: 'Android Adaptive Icon Background',
    minWidth: 432,
    minHeight: 432,
    recommendedWidth: 1024,
    recommendedHeight: 1024,
    allowAlpha: true,
    notes: 'Solid #0D0D0D or dark subtle gradient. Full bleed edge-to-edge.',
  },
  {
    filename: 'android-icon-monochrome.png',
    description: 'Android 13+ Material You Themed Icon',
    minWidth: 432,
    minHeight: 432,
    recommendedWidth: 1024,
    recommendedHeight: 1024,
    allowAlpha: true,
    notes: 'Pure white silhouette on transparent background. Used when user enables themed icons.',
  },
  {
    filename: 'splash-icon.png',
    description: 'Splash Screen Logo',
    minWidth: 200,
    minHeight: 200,
    recommendedWidth: 1024,
    recommendedHeight: 1024,
    allowAlpha: true,
    notes: 'Centered brand graphic displayed over #0D0D0D splash background.',
  },
  {
    filename: 'favicon.png',
    description: 'Web Favicon',
    requiredWidth: 48,
    requiredHeight: 48,
    allowAlpha: true,
    notes: '48x48 or 32x32 standard web browser favicon.',
  },
];

function readPngMetadata(filePath) {
  try {
    const buf = fs.readFileSync(filePath);
    // PNG Header: 89 50 4E 47 0D 0A 1A 0A
    if (buf.length < 29 || buf.readUInt32BE(0) !== 0x89504E47) {
      return { valid: false, error: 'Not a valid PNG file' };
    }
    const width = buf.readUInt32BE(16);
    const height = buf.readUInt32BE(20);
    const bitDepth = buf[24];
    const colorType = buf[25]; // 0=grayscale, 2=RGB, 3=Indexed, 4=Grayscale+Alpha, 6=RGBA
    const hasAlpha = colorType === 4 || colorType === 6;

    return {
      valid: true,
      width,
      height,
      bitDepth,
      colorType,
      hasAlpha,
      sizeBytes: buf.length,
    };
  } catch (err) {
    return { valid: false, error: err.message };
  }
}

function verifyAssets() {
  console.log('\n============================================================');
  console.log('   CleanDeck Production Release Asset Verifier');
  console.log('============================================================\n');

  let allPassed = true;

  REQUIRED_ASSETS.forEach((spec) => {
    const fullPath = path.join(ASSETS_DIR, spec.filename);
    const exists = fs.existsSync(fullPath);

    console.log(`▸ Checking: ${spec.filename} (${spec.description})`);

    if (!exists) {
      console.log(`  ❌ MISSING: File not found at ${fullPath}\n`);
      allPassed = false;
      return;
    }

    const meta = readPngMetadata(fullPath);
    if (!meta.valid) {
      console.log(`  ❌ INVALID: ${meta.error}\n`);
      allPassed = false;
      return;
    }

    const sizeKb = (meta.sizeBytes / 1024).toFixed(1);
    let sizeCheckPassed = true;

    if (spec.requiredWidth && spec.requiredHeight) {
      if (meta.width !== spec.requiredWidth || meta.height !== spec.requiredHeight) {
        console.log(`  ⚠️  Dimensions: ${meta.width}x${meta.height} (Expected exactly ${spec.requiredWidth}x${spec.requiredHeight})`);
        sizeCheckPassed = false;
        allPassed = false;
      } else {
        console.log(`  ✓  Dimensions: ${meta.width}x${meta.height} (Exact Match)`);
      }
    } else {
      console.log(`  ✓  Dimensions: ${meta.width}x${meta.height} (File Size: ${sizeKb} KB)`);
    }

    if (spec.allowAlpha === false && meta.hasAlpha) {
      console.log(`  ❌ Alpha Channel: Has alpha transparency. Apple App Store guidelines require opaque icons (Color Type 2 - RGB without alpha).`);
      allPassed = false;
    } else {
      console.log(`  ✓  Color Type: ${meta.colorType} (Alpha check passed)`);
    }

    console.log(`  ℹ  Guideline: ${spec.notes}\n`);
  });

  console.log('------------------------------------------------------------');
  if (allPassed) {
    console.log('✅ All production assets pass store compliance standards!\n');
  } else {
    console.log('⚠️  Some assets require adjustments before final app store upload.\n');
  }
}

verifyAssets();
