# FocusWaves — Native Mobile Wrap Guide (Capacitor)

FocusWaves already ships as an **installable PWA** (`manifest.webmanifest` + `sw.js`, safe-area insets, Wake Lock, Media Session controls, and haptic cues) on `https://focus-waves.vercel.app/`.

When you are ready to compile native **Android (`.aab`/`.apk`)** or **iOS (`.ipa`)** binaries using `capacitor.config.json`, run the steps below.

---

## 1. Install Capacitor Core & Native Plugins

```bash
cd c:/Users/drewt/dtedev/focuswaves
npm install @capacitor/core @capacitor/haptics @capacitor/status-bar @capacitor/splash-screen
npm install -D @capacitor/cli @capacitor/android @capacitor/ios
```

---

## 2. Generate Native Projects (One-Time)

```bash
npm run build:client
npx cap add android
npx cap add ios
```

*(Note: `android/` builds directly on Windows via Android Studio; `ios/` requires macOS + Xcode or a cloud runner like Ionic Appflow / GitHub Actions macOS.)*

---

## 3. Enable Background Lock-Screen Audio

### iOS (`ios/App/App/Info.plist`)
Add the audio background mode so Web Audio entrainment keeps running when the screen locks:

```xml
<key>UIBackgroundModes</key>
<array>
  <string>audio</string>
</array>
```

### Android (`android/app/src/main/AndroidManifest.xml`)
Ensure wake lock and foreground media permissions are present:

```xml
<uses-permission android:name="android.permission.WAKE_LOCK" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK" />
```

---

## 4. Sync & Open Native IDEs

Any time you update the web app:

```bash
# Sync web build into native projects
npm run mobile:sync

# Open in Android Studio (Windows / macOS)
npm run mobile:android

# Open in Xcode (macOS)
npm run mobile:ios
```

Haptic taps and completion pulses automatically switch from `navigator.vibrate` to native `@capacitor/haptics` when running inside the Capacitor shell—no code changes required.
