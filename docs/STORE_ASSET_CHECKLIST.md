# CleanDeck — App Store & Google Play Asset Checklist

This document details the production specifications, dimensions, safe zones, and export requirements for CleanDeck app store assets.

---

## 1. Master Icon Specifications

### A. Universal / iOS App Store Master Icon (`assets/icon.png`)
| Property | Requirement |
| :--- | :--- |
| **Dimensions** | `1024 x 1024 px` |
| **Format** | 24-bit or 32-bit PNG (Flattened) |
| **Color Space** | sRGB or Display P3 |
| **Alpha Transparency** | **STRICTLY FORBIDDEN** (Apple App Store rejection trigger). Must be completely opaque (Color Type 2). |
| **Corner Radius** | **Square** (Do not round corners; iOS automatically applies the squircle mask). |
| **Visual Design** | Dark `#0D0D0D` / deep navy `#0F172A` background with the CleanDeck gradient symbol centered. |

---

## 2. Android Adaptive Icon Specifications

Android 8.0+ devices use adaptive icons consisting of two layers (foreground and background), plus an optional monochrome layer for Android 13+ Material You themed icons.

### B. Foreground Layer (`assets/android-icon-foreground.png`)
| Property | Requirement |
| :--- | :--- |
| **Dimensions** | `1024 x 1024 px` (or min `512 x 512 px`, `432 x 432 px`) |
| **Format** | 32-bit PNG with Alpha (RGBA) |
| **Background** | **Transparent** |
| **Safe Zone** | Inner **66% diameter circle** (approx. 672px on a 1024px canvas). The outer 18% is masked out depending on the device OEM shape (circle, squircle, rounded rectangle). |

### C. Background Layer (`assets/android-icon-background.png`)
| Property | Requirement |
| :--- | :--- |
| **Dimensions** | `1024 x 1024 px` (or min `512 x 512 px`) |
| **Format** | PNG (RGB or RGBA) |
| **Fill** | Full bleed solid `#0D0D0D` or brand gradient. No transparent areas. |

### D. Themed Monochrome Layer (`assets/android-icon-monochrome.png`)
| Property | Requirement |
| :--- | :--- |
| **Dimensions** | `1024 x 1024 px` (or min `432 x 432 px`) |
| **Format** | PNG with Alpha |
| **Content** | Flat, single-color (pure white `#FFFFFF`) silhouette of the CleanDeck symbol on a transparent background. Android tints this dynamically according to user wallpaper palette. |

---

## 3. Splash Screen Specifications (`assets/splash-icon.png`)

Configured in `app.json` under `plugins -> expo-splash-screen`:

```json
[
  "expo-splash-screen",
  {
    "backgroundColor": "#0D0D0D",
    "image": "./assets/splash-icon.png",
    "imageWidth": 200,
    "resizeMode": "contain"
  }
]
```

- **Canvas**: Centered logo graphic on `#0D0D0D` background.
- **Target Size**: `200–300 px` visual mark width inside a `1024 x 1024 px` container.

---

## 4. Web Favicon (`assets/favicon.png`)
- **Dimensions**: `48 x 48 px` (or `32 x 32 px`).
- **Format**: PNG with transparency.

---

## 5. Automated Verification Script

To audit and verify all image assets prior to EAS Build or submission:

```bash
node scripts/verify-and-generate-assets.js
```
