# Testing Hisaab on a physical device

There are two paths, from fastest (no build) to most realistic (an
installable app icon on your phone).

## 1. Fastest: Expo Go (no build, works today, Android *and* iOS)

Expo Go is a free app from the Play Store / App Store that can run this
project directly from your computer over the network — no build, no
developer account, no waiting.

```bash
npm install
npm run device        # runs `expo start --tunnel`
```

This prints a QR code in the terminal.

- **Android**: install "Expo Go" from the Play Store, open it, scan the QR
  code.
- **iOS**: install "Expo Go" from the App Store, then scan the QR code with
  your iPhone's **Camera app** (not Expo Go itself) — it'll offer to open in
  Expo Go.

`--tunnel` routes the connection through Expo's relay so it works even if
your phone and computer aren't on the same Wi-Fi. Use this while you're
actively iterating on the UI — every save shows up on your phone in
seconds.

## 2. A real installable app: EAS Build

When you want an actual app icon on your home screen (not running inside
Expo Go), use [EAS Build](https://docs.expo.dev/build/introduction/) —
Expo's cloud build service. It compiles the native Android/iOS app for
you, so you don't need Android Studio or a Mac.

### Android APK — free, no Apple-style restrictions

```bash
npm install -g eas-cli      # one-time
eas login                   # free Expo account — sign up at expo.dev
eas build:configure         # first time only, links this project to your account
npm run build:android       # builds a downloadable, installable .apk
```

The build runs on Expo's servers (5–15 minutes) and ends with a link to
download the `.apk` directly. Options to get it onto your phone:

- Open the link on the phone's browser and download it directly, or
- Scan the QR code EAS prints, or
- `eas build:list` to grab the link later.

Then on the phone: open the downloaded file → Android will ask to allow
"install unknown apps" for that one app → install. No Play Store review,
no restrictions — this is a real standalone Hisaab.apk.

### iOS — yes, it's possible, with one catch

EAS can build a real `.ipa` the same way (`npm run build:ios`), and it
does **not** require a Mac. The catch is entirely on Apple's side, not
ours: to install a build on a physical iPhone outside the App Store,
Apple requires either:

- **A paid Apple Developer Program membership** ($99/year) — with this,
  `eas build -p ios --profile preview` registers your iPhone's UDID and
  signs an "ad-hoc" build EAS can install directly (similar flow to
  Android, via a link + a one-time "Trust this developer" tap in iPhone
  Settings), or via **TestFlight** for easier distribution to multiple
  testers.
- **No paid account**: you can still run the app on your iPhone for free,
  but only by building locally through Xcode on a Mac connected to the
  phone by cable (the build then expires after 7 days and needs
  re-installing from Xcode). This isn't possible from this cloud
  environment since it has no Mac/Xcode — it'd need to happen on your own
  Mac.

If you don't want to deal with Apple accounts at all, **Expo Go (option
1) already works identically on iOS today**, no account needed.

### Have me trigger the build instead

If you'd rather not install anything locally, create a free account at
[expo.dev](https://expo.dev), generate an access token at
**expo.dev → Settings → Access Tokens**, and share it as an environment
variable (`EXPO_TOKEN`) — with that, the build can be triggered directly
from this environment and I'll hand you back the download link once it
finishes.

## Project identifiers

- Android package: `com.syedhassanabbas.hisaab`
- iOS bundle id: `com.syedhassanabbas.hisaab`

Change these in `app.json` before building if you'd rather use your own
reverse-domain identifier.
