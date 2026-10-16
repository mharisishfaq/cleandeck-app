# Privacy Policy for CleanDeck

**Effective Date:** October 16, 2026  
**Last Updated:** October 16, 2026  
**Application:** CleanDeck (com.cleandeck.app)

CleanDeck ("we", "our", or "the App") is committed to protecting your privacy. This Privacy Policy explains our practices regarding your data when you use CleanDeck on iOS and Android devices.

---

## 1. Core Principle: 100% On-Device & Zero Cloud Uploads

CleanDeck is built with an absolute privacy-first architecture:

- **Zero Cloud Uploads:** CleanDeck does **not** transmit, upload, copy, or sync your photos, videos, or metadata to any remote servers, cloud services, or external third parties.
- **100% Local Processing:** Every photo inspection, swipe decision, video preview, resolution check, and file size estimation is calculated strictly in your device's local memory (RAM) and sandboxed local cache.
- **No Account Required:** You do not need to register, log in, or provide personal identifiable information (PII) such as your name, email address, or phone number to use the App.

---

## 2. Device Permissions & How They Are Used

To function as a photo and video gallery cleaner, CleanDeck requests access to your local media library. These permissions are used exclusively on your local device:

### iOS Permissions
- **`NSPhotoLibraryUsageDescription`**:  
  Allows CleanDeck to read photos and videos from your local camera roll in chronologically paginated batches, enabling you to inspect and organize your media into "Keep" and "Trash" piles.
- **`NSPhotoLibraryAddUsageDescription`**:  
  Allows CleanDeck to submit left-swiped media to the native iOS system confirmation dialog to move unwanted assets to your system's "Recently Deleted" album.
- **Limited Access Support (iOS 14+)**:  
  If you choose "Select Photos..." rather than granting full library access, CleanDeck will only display and process the specific media assets you chose. You can add or modify selected assets at any time via the in-app photo picker.

### Android Permissions
- **`READ_MEDIA_IMAGES` & `READ_MEDIA_VIDEO`** (Android 13+):  
  Allows local inspection of photos and video files.
- **`READ_MEDIA_VISUAL_USER_SELECTED`** (Android 14+):  
  Allows partial/limited photo access when you grant selective permission.
- **`ACCESS_MEDIA_LOCATION`**:  
  Enables reading local image orientation and metadata for proper 9:16 aspect display.

---

## 3. Safe Deletion & Native OS Safety Net

CleanDeck does **not** permanently erase your files behind your back or bypass operating system safety controls:

1. **Staged Queue (Zero Deletion Anxiety):** Swiping left or tapping Trash only marks an item inside CleanDeck's temporary in-memory queue. No file is modified on disk during your swiping session.
2. **Mandatory Native System Dialog:** When you tap "Delete All", the App triggers your device operating system's native confirmation dialog (Apple PhotoKit on iOS, MediaStore on Android).
3. **30-Day Recovery Buffer:** Once confirmed, deleted files are moved directly to your system's official **Recently Deleted** folder. You retain the standard 30-day operating system recovery period to restore any file before permanent removal.

---

## 4. Local Storage Persistence

CleanDeck utilizes sandboxed local device storage (`AsyncStorage`) exclusively for:
- Saving active cleaning progress if you pause your session (cursor position, staged deletion list, reviewed counts).
- Remembering whether you have completed the first-time onboarding walkthrough.

This data never leaves your device and is erased when you clear the session or uninstall the App.

---

## 5. Third-Party Analytics, Tracking & Advertising

- **Zero Tracking:** We do not use third-party behavioral analytics, crash reporters that capture media data, or advertising software development kits (SDKs).
- **No IDFA/GAID Collection:** We do not track you across apps or websites.

---

## 6. Children's Privacy

CleanDeck does not knowingly collect or solicit personal information from children under the age of 13 (or under the age of 16 in the European Economic Area). The App operates entirely offline with respect to user media.

---

## 7. Your Rights (GDPR & CCPA/CPRA Compliance)

Because CleanDeck does not collect, retain, or transmit your personal data to remote servers:
- You retain complete ownership and sovereignty over your photo library.
- You can revoke gallery permissions at any time via your device's System Settings (`Settings > Privacy > Photos` on iOS, or `Settings > Apps > CleanDeck > Permissions` on Android).
- Uninstalling CleanDeck removes all sandboxed local session caches immediately.

---

## 8. Changes to This Privacy Policy

We may update this Privacy Policy from time to time. Any changes will be published in this document and reflected in the App's release notes.

---

## 9. Contact Us

If you have any questions or feedback regarding this Privacy Policy, please contact:

- **Email:** support@cleandeck.app (or your designated developer contact)
- **Website:** https://cleandeck.app
