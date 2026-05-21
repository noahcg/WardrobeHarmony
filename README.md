# WardrobeHarmony

WardrobeHarmony is an Expo React Native iOS app for building a personal digital wardrobe and evaluating outfit harmony with deterministic, explainable rules.

The product goal is not to be an AI fashion app. The core experience is a calm wardrobe coordination system that helps users understand why clothing items work together based on color, contrast, saturation, pattern, formality, and outfit completeness.

## Current Features

- Premium dark-mode mobile UI inspired by boutique wardrobe tools
- Real clothing item creation from camera or photo library
- Local photo persistence using Expo file storage
- Deterministic garment color detection from photos
- Manual correction for color/category/metadata
- Local wardrobe persistence
- Closet browsing, filtering, search, details, edit, and delete
- Rules-based outfit compatibility scoring
- Clear explanations and warnings for outfit matches
- Outfit builder with suggested swaps
- Persistent saved outfits
- Color guide powered by the same compatibility data as the matching engine
- React Navigation tabs and modal/stack flows

## Deterministic Matching

The matching engine lives in:

```txt
src/lib/matchingEngine.ts
```

It evaluates outfits using explicit rules:

- neutral compatibility
- known safe color pairings
- light/dark contrast balance
- saturation harmony
- pattern balance
- formality compatibility
- category completeness

It returns:

- score from 0 to 100
- rating: `Excellent`, `Good`, `Risky`, or `Avoid`
- human-readable reasons
- warnings

The app should never depend on trends, influencers, subjective style prediction, or AI-generated taste judgments.

## Color Detection

Garment color detection lives in:

```txt
src/lib/colorExtraction.ts
```

When a user takes or imports a garment photo, the app:

1. downsamples the image
2. samples pixels
3. ignores likely white backgrounds, shadows, and near-black UI artifacts
4. finds a dominant garment color
5. maps that color to the app's `ColorFamily`
6. infers tone, saturation, confidence, and hex value

This is deterministic image analysis, not AI. Manual correction remains available because lighting and photo backgrounds can affect color readings.

## Tech Stack

- Expo SDK 54
- React Native
- TypeScript
- React Navigation
- Expo Image Picker
- Expo File System
- Expo Image Manipulator
- local JSON storage for MVP data

## Setup

Use Node 20/LTS. The project includes `.nvmrc`.

```bash
cd /Users/noah/Documents/WardrobeHarmony
nvm use
npm install
```

If needed:

```bash
nvm install
nvm use
```

## Run

```bash
npx expo start -c
```

To test on iPhone:

1. Install Expo Go from the iOS App Store.
2. Make sure the iPhone and Mac are on the same network.
3. Scan the QR code from Expo Go.

If local networking fails:

```bash
npx expo start -c --tunnel
```

## Verify

```bash
npm run typecheck
npx expo install --check
```

## Project Structure

```txt
src/
  components/       Reusable UI components
  data/             Mock wardrobe seed data
  lib/              Matching engine, color guide, color extraction
  models/           TypeScript data models
  screens/          App screens
  storage/          Local wardrobe and outfit persistence
  theme/            Colors, spacing, typography
```

## Important Files

```txt
App.tsx
src/models/clothing.ts
src/models/outfit.ts
src/lib/matchingEngine.ts
src/lib/colorGuide.ts
src/lib/colorExtraction.ts
src/storage/wardrobeStore.ts
src/storage/outfitStore.ts
```

## Product Direction

Next major steps:

- improve visual fidelity with real garment photography and tighter screen composition
- add background removal or cleaner product-photo cropping
- add stronger color detection for multi-color/patterned garments
- add outfit favorite toggling and saved outfit editing
- add onboarding and first-use empty states
- prepare EAS/TestFlight builds
- eventually add optional AI-assisted tagging for detection only, not matching decisions

The matching decision itself should remain deterministic, explainable, testable, and tunable.
