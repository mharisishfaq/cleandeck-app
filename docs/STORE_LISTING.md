# CleanDeck — App Store & Google Play Listing Copy

This document contains high-converting store listing assets, copy, keywords, and categorization for the Apple App Store and Google Play Store.

---

## 1. Quick Metadata Overview

| Field | Apple App Store (iOS) | Google Play Store (Android) |
| :--- | :--- | :--- |
| **App Name** | `CleanDeck – Swipe Photo Cleaner` *(29/30 chars)* | `CleanDeck: Swipe Photo Cleaner` *(30/30 chars)* |
| **Subtitle / Short Description** | `Declutter Photos & Videos` *(25/30 chars)* | `Swipe right to keep memories, swipe left to declutter. 100% on-device & safe.` *(77/80 chars)* |
| **Bundle ID / Package** | `com.cleandeck.app` | `com.cleandeck.app` |
| **Primary Category** | Utilities | Tools |
| **Secondary Category** | Photo & Video | Photography |
| **Age / Content Rating** | 4+ | Everyone (PEGI 3) |
| **Pricing** | Free (or Freemium) | Free (or Freemium) |

---

## 2. iOS App Store Metadata

### A. Promotional Text *(Max 170 characters — can be updated anytime without a new binary release)*
```
Free up gigabytes in minutes! Swipe right to keep memories, swipe left to stage clutter. 100% private with zero deletion anxiety and a safety-net Temporary Folder.
```

### B. Keywords *(Max 100 characters, comma-separated, no spaces after commas)*
```
photo cleaner,gallery,clean up,storage,swipe cleaner,duplicate photos,delete photos,declutter,videos
```

---

## 3. High-Converting Long Description (iOS & Android)

```markdown
Is your phone constantly running out of storage? Are thousands of duplicate screenshots, accidental burst shots, and massive forgotten videos hogging your camera roll?

Meet CleanDeck — the gamified, lightning-fast gallery cleaner that turns photo decluttering into a satisfying, stress-free card game.

Clean your entire camera roll in minutes with zero deletion anxiety.


✨ HOW IT WORKS

👉 Swipe Right (Keep)
Preserve your favorite moments, crisp portraits, and cherished memories.

👈 Swipe Left (Trash)
Stage blurry photos, duplicate receipts, and storage-hogging clutter for deletion.

⚡ Tap Undo
Swiped too fast? One tap smoothly brings the last photo back to the top of the deck.


🛡️ ZERO DELETION ANXIETY: THE TEMPORARY FOLDER SAFETY NET

Most cleaning apps delete photos immediately, causing panic. Not CleanDeck.

When you swipe left, files are NEVER removed immediately from your device. Instead, they are placed in CleanDeck’s visual "Temporary Folder."

• Visual 3-Column Inspection Grid: Inspect every staged photo and video side-by-side before committing.
• Single-Tap Restoration: Change your mind about an individual photo? Tap it once to return it to your camera roll.
• Restore All: Easily cancel a batch and start over without risking a single file.


🔒 100% PRIVATE, SECURE & NATIVE OS SAFETY

Your memories belong to you alone:
• Zero Cloud Uploads: CleanDeck operates 100% offline and on-device. Your photos and videos are NEVER uploaded to any remote server or cloud database.
• Official OS Confirmation: When you tap "Delete All", your device’s native system dialog (Apple PhotoKit / Android MediaStore) prompts for your final confirmation.
• 30-Day Recovery Buffer: Confirmed items move straight to your system’s "Recently Deleted" album, giving you a full 30-day window to recover anything you want back.
• No Account Required: Open the app and start cleaning immediately. No sign-ups, no logins, no personal data collection.


⚡ POWERFUL FEATURES FOR HEAVY GALLERIES

• Fluid 9:16 Swiper Deck: Ultra-smooth 60 FPS gesture controls powered by native worklets and haptic feedback.
• Pinch-to-Zoom & Pan: Double-tap or pinch to inspect fine details in landscape and panorama shots before deciding.
• Live Storage Counter: Watch your reclaimable space add up in real-time (e.g., "🗑️ 18 items • 540 MB").
• Sort by Date or Size: Tackle your newest memories first, or clean from oldest to newest.
• Pause & Resume: Life happens! CleanDeck automatically remembers your exact place and staged queue so you can resume whenever you have a free minute.
• Limited Access Support: Choose exactly which photos CleanDeck can see with native iOS 14+ and Android 14+ scoped permissions.


Free up precious gigabytes for new memories. Download CleanDeck today and experience the cleanest camera roll you’ve had in years!
```

---

## 4. App Store Review Notes (For App Reviewers)

When submitting the binary build to App Store Connect or Google Play Console, provide these reviewer notes in the submission form:

```text
Reviewer Information:
CleanDeck is a local photo and video gallery utility that allows users to review their local camera roll using swipe gestures.

Testing Notes:
- The app requires photo library access to display camera roll thumbnails and perform batch deletions.
- If testing in an iOS Simulator or empty test device with 0 photos, tap the "🧪 DEMO" pill button in the top-right header of the Home Screen to immediately load 18 high-resolution sample assets.
- CleanDeck does not connect to any external backends or cloud servers; all operations are 100% on-device.
- Deletions invoke the native OS confirmation dialog and move items to the system's "Recently Deleted" album.
```

---

## 5. Recommended App Store Screenshots Strategy

To maximize conversion rate on store product pages, design 5 screenshots using modern dark mockups:

1. **Screenshot 1 (Hero / Hook)**:  
   *Headline:* "Swipe to Clean Your Gallery"  
   *Visual:* Top card swiping right with glowing green "KEEP" overlay, showing card stack behind it.
2. **Screenshot 2 (Storage Value)**:  
   *Headline:* "Reclaim Gigabytes in Minutes"  
   *Visual:* Header showing live counter pill: `🗑️ 24 items • 1.2 GB` with reclaim progress bar.
3. **Screenshot 3 (Zero Anxiety)**:  
   *Headline:* "Zero Deletion Anxiety"  
   *Visual:* The Temporary Folder 3-column review grid showing thumbnails, checkmarks, and "Restore" controls.
4. **Screenshot 4 (Inspection Detail)**:  
   *Headline:* "Pinch-to-Zoom Inspection"  
   *Visual:* Active card in 9:16 frame zoomed into photo details with video duration badges.
5. **Screenshot 5 (100% Private)**:  
   *Headline:* "100% On-Device & Private"  
   *Visual:* Home dashboard overview showing zero cloud uploads, offline lock icon, and OS Recently Deleted safety net.
