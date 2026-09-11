# Hisaab

**Hisaab** (حساب — "the reckoning/account") is a subscription tracker and
bill-splitting app built for how people in Pakistan and South Asia actually
pay for things: PKR-first amounts, JazzCash/Easypaisa/bank/cash as first-class
payment methods, and no assumption you're settling up in USD with a credit
card.

One codebase, three targets: iOS, Android, and Web — built with
[Expo](https://expo.dev) + React Native + TypeScript.

## What it does

- **Subscriptions** — track recurring payments (Netflix, gym, cloud storage,
  utilities, anything). See total monthly spend in PKR and get warned before
  renewals hit (color-coded countdown, red inside 3 days).
- **Groups & bill-splitting** — create a group for your flat, roommates, or
  trip. Log shared expenses (rent, groceries, WiFi), split equally across
  whoever was included, and see a live per-person balance.
- **Settle up** — the app computes the minimum set of payments needed to
  clear everyone's balance (debt simplification, Splitwise-style), and lets
  you record how it was actually paid — JazzCash, Easypaisa, bank transfer,
  card, or cash.
- **PKR-first UX** — every amount is formatted as `Rs 12,345`, dates in
  `DD-Mon-YYYY`, and payment-method badges are color-coded so a JazzCash
  entry looks different from an Easypaisa one at a glance.

## Tech stack

- [Expo](https://expo.dev) (SDK 57) + React Native 0.86 + TypeScript
- React Navigation (bottom tabs + native stack)
- `@react-native-async-storage/async-storage` for on-device persistence
  (works on iOS, Android, and Web via `localStorage`)
- No backend yet — this is a local-first MVP. See **Roadmap** below.

## Getting started

```bash
npm install
npm run web       # run in the browser
npm run android   # run on Android (device/emulator)
npm run ios       # run on iOS (macOS + Xcode required)
```

## Project structure

```
App.tsx                   # navigation + provider wiring
src/
  types/                  # Subscription, Group, Expense, Settlement types
  store/                  # AppContext (state) + AsyncStorage persistence
  utils/
    format.ts             # PKR formatting, date + renewal-countdown helpers
    split.ts              # equal-split + debt-simplification algorithms
  theme/                  # colors, payment-method metadata, categories
  components/             # Card, PaymentBadge, ChoiceChips
  screens/                # Dashboard, Subscriptions, Groups, forms
  navigation/              # React Navigation stack/tab config
```

## Roadmap (post-MVP)

This version is intentionally local-only (no login, no sync) to keep the
build simple and fast to try. Natural next steps:

- Accounts + cloud sync, so a group's ledger is shared live across everyone's
  phones instead of living on one device.
- Real JazzCash / Easypaisa integration (payment initiation + confirmation)
  instead of tagging a payment method after the fact.
- Push notifications for renewals (currently in-app only).
- Custom (non-equal) expense splits and recurring/split rent templates.
- Multi-currency support for the diaspora use case (send PKR, track in your
  local currency too).
