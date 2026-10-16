# CleanDeck 🧹📱

> **Gamified Camera Roll Decluttering & Storage Recovery for iOS & Android**  
> Swipe right to keep memories, swipe left to stage clutter. 100% on-device with zero deletion anxiety.

---

## 🌟 Key Features

- **🃏 9:16 Swiper Deck:** 3-card virtual window with 60 FPS gesture controls powered by React Native Reanimated worklets and haptic feedback.
- **🛡️ Zero Deletion Anxiety (Temporary Folder):** Left swipes never delete files immediately. Staged files sit safely in a visual 3-column review grid where individual items can be restored with a single tap.
- **🔒 100% On-Device Privacy:** Zero cloud uploads. All photo analysis, video thumbnailing, and metadata processing stay strictly on your device.
- **🛡️ Native OS Safety Net:** Batch deletions invoke Apple PhotoKit / Android MediaStore system confirmation dialogs, moving items directly to the OS **Recently Deleted** folder for a 30-day recovery safety net.
- **🔍 Pinch-to-Zoom & Pan:** Inspect fine details on landscape and panorama photos before making keep/trash decisions.
- **⏸️ Persistent Session Recovery:** Automatically preserves paused sessions (cursor position, staged deletions, and stats) in sandboxed local storage.
- **⚠️ Limited/Partial Access Handling:** Full compliance with iOS 14+ and Android 14+ scoped photo permissions (`READ_MEDIA_VISUAL_USER_SELECTED`), including an in-app picker to select more photos on the fly.
- **🧪 Simulator / Demo Mode:** Built-in toggle providing 18 high-resolution sample assets for rapid simulator and review testing.

---

## 📁 Project Structure

```
clean-up-app/
├── assets/                  # App icon, adaptive icon layers, splash screen, favicon
├── docs/                    # App Store & Google Play submission documentation
│   ├── PRIVACY_POLICY.md    # 100% on-device GDPR & CCPA compliant privacy policy
│   ├── STORE_ASSET_CHECKLIST.md  # Icon & splash specifications and safe zones
│   ├── STORE_LISTING.md     # High-converting store copy, metadata & keywords
│   └── TERMS_OF_SERVICE.md  # Standard terms and deletion disclaimers
├── scripts/
│   └── verify-and-generate-assets.js # Automated asset dimension & alpha checker
├── src/
│   ├── __tests__/           # Comprehensive Jest test suite (queue math, session, utils)
│   ├── components/
│   │   ├── home/            # Home dashboard with storage overview & paused sessions
│   │   ├── modals/          # Temporary Folder review grid & confirm delete modals
│   │   ├── onboarding/      # First-time 3-step walkthrough modal
│   │   └── swiper/          # 9:16 SwiperDeck, MediaCard with zoom, & SwiperHeader
│   ├── hooks/               # useGalleryCleaner hook
│   ├── services/            # Media fetching, permissions, session persistence, mock data
│   ├── types/               # TypeScript interfaces & domain models
│   └── utils/               # Media formatting, timestamps, byte calculators
├── app.json                 # Expo SDK 57 config, App Store justifications, plugins
├── eas.json                 # EAS build profiles (development, preview APK/simulator, production)
└── jest.config.js           # Jest configuration with jest-expo preset
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js `v20+` or `v22+`
- npm, yarn, or bun
- Expo CLI (`npx expo`)

### Installation
```bash
npm install
```

### Running Locally
```bash
npx expo start
```
- Press `i` to open in the iOS Simulator.
- Press `a` to open in the Android Emulator.
- Scan the QR code using Expo Go or a development build on your physical device.

---

## 🧪 Testing & Verification

Run the automated test suite covering staged deletion math, session persistence, and edge-case byte formatting:

```bash
npm test
```

Run TypeScript compilation check:
```bash
npx tsc --noEmit
```

Run Expo Doctor diagnostic check:
```bash
npx expo-doctor
```

Verify production release assets:
```bash
node scripts/verify-and-generate-assets.js
```

---

## 📦 Building with EAS

To build a standalone preview APK for Android:
```bash
npx eas-cli@latest build --profile preview --platform android
```

To build for iOS Simulator:
```bash
npx eas-cli@latest build --profile preview --platform ios
```

To submit to the App Store & Google Play:
```bash
npx eas-cli@latest build --profile production --platform all
```

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
