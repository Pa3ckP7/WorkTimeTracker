# WorkTimeTracker

A cross-platform work time tracking application built with Vue 3, TypeScript, and Capacitor.

## Tech Stack

- **Frontend:** Vue 3 + TypeScript
- **Build Tool:** Vite
- **Mobile:** Capacitor (Android)
- **State Management:** Pinia
- **Routing:** Vue Router
- **Testing:** Vitest
- **Linting:** ESLint + oxlint

## Prerequisites

- Node.js `^20.19.0` or `>=22.12.0`
- pnpm
- Android Studio (for Android development)
- JDK 17 or higher (for Android builds)

## Project Setup

### 1. Install Dependencies

```sh
pnpm install
```

### 2. Environment Setup

Create a `.env` file in the root directory if needed:

```sh
# Add your environment variables here
```

## Development

### Web Development

```sh
# Run dev server with hot-reload
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

### Mobile Development (Android)

```sh
# Build web assets and sync to Android
pnpm build:mobile

# Open Android Studio
npx cap open android

# Run on Android device/emulator (from Android Studio)
# Or use: npx cap run android
```

**Note:** After making changes to web code, run `pnpm build:mobile` to update the Android app.

## Code Quality

```sh
# Run all linters
pnpm lint

# Run unit tests
pnpm test:unit

# Type checking
pnpm type-check
```

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/)
- [Vue - Official](https://marketplace.visualstudio.com/items?itemName=Vue.volar) extension (disable Vetur if installed)
- [Android Studio](https://developer.android.com/studio) (for Android development)

## Browser DevTools

**Chromium-based browsers** (Chrome, Edge, Brave):
- [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
- [Enable Custom Object Formatter](http://bit.ly/object-formatters)

**Firefox:**
- [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
- [Enable Custom Object Formatter](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Project Structure

```
├── src/              # Vue source code
├── public/           # Static assets
├── android/          # Android native project
├── dist/             # Build output
└── capacitor.config.ts  # Capacitor configuration
```

## Configuration

- **Vite:** See [Vite Configuration Reference](https://vite.dev/config/)
- **Capacitor:** Edit `capacitor.config.ts`
- **TypeScript:** `tsconfig.json` and related config files
