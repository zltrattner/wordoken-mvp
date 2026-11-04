# 2. Architecture and code organization

## 2.1 Technology

2.1.1 One npm-workspace repository contains the web app, shared packages, and backend code.

2.1.2 The web app uses React, TypeScript, and Vite.

2.1.3 Supabase provides authentication, PostgreSQL, and server functions.

## 2.2 Module boundaries

2.2.1 Core code imports only data types, rule data, and other core modules.

2.2.2 Application modules call core functions.

2.2.3 Storage, clocks, HTTP, auth, audio, and ads use `ports/` interfaces.

2.2.4 Browser modules implement those interfaces with browser APIs and service clients.

2.2.5 React screens receive state and emit player actions.

2.2.6 Scoring and the clock advance independently of animation playback.

## 2.3 Game execution

2.3.1 A game starts after its puzzle and opponent recording are cached.

2.3.2 Word entry, scoring, and opponent playback run on the device.

2.3.3 The clock adapter records device start time and elapsed action times.

2.3.4 The client saves moves locally as they occur.

2.3.5 The client queues a played-game record when the match ends under 7.8.4.

2.3.6 Browser and server calculations use the same core code.

2.3.7 Local rewards and confirmed balances follow 4.4.

2.3.8 Word scoring follows 7.4.

## 2.4 Folder structure and contents

```text
wordoken/
|-- _specs/
|-- design-reference/
|-- technical-reference/         # Supplied code, data, and media
|
|-- apps/
|   |-- web/
|   |   |-- src/
|   |   |   |-- app/              # Startup, routes, module setup
|   |   |   |-- features/         # Connect app calls to screens
|   |   |   `-- platform/
|   |   |       |-- api/          # Server requests
|   |   |       |-- auth/         # Supabase sessions
|   |   |       |-- storage/      # IndexedDB
|   |   |       |-- clock/        # Device timestamps and elapsed time
|   |   |       |-- audio/
|   |   |       |-- ads/
|   |   |       `-- pwa/          # Service worker and caching
|   |   |-- public/              # Files served without bundling
|   |   `-- tests/               # Browser tests
|   `-- ios/                     # Future Swift app
|
|-- packages/
|   |-- core/
|   |   `-- src/
|   |       |-- puzzles/          # Eligibility and selection
|   |       |-- game/             # State, validation, scoring, replay
|   |       |-- progression/      # XP and level calculations
|   |       |-- economy/          # Coins, tokens, reward calculations
|   |       `-- character/        # Character states and action sequences
|   |-- application/
|   |   `-- src/
|   |       |-- accounts/
|   |       |-- games/            # Prepare, start, finish, submit
|   |       |-- archive/
|   |       |-- avatars/
|   |       |-- store/
|   |       |-- sync/             # Upload queue and server sync
|   |       `-- ports/            # Storage, API, clock interfaces
|   |-- ui-react/
|   |   `-- src/
|   |       |-- components/
|   |       |-- screens/
|   |       `-- theme/
|   `-- character-web/            # Browser sprite rendering
|
|-- contracts/
|   |-- openapi.yaml             # API requests and responses
|   `-- schemas/                 # Saved games and replay formats
|
|-- content/
|   |-- rules/                   # Game constants
|   |   |-- game.json            # Scoring and knockout parameters
|   |   `-- progression.json     # Level threshold table; see 10.3
|   |-- catalog/                 # Items and chest definitions
|   |-- audio/                   # Event mappings, loops, and fades
|   `-- characters/              # Layers, frames, animation definitions
|
|-- assets/
|   |-- sprites/
|   |-- audio/
|   |-- fonts/
|   `-- icons/
|
|-- supabase/
|   |-- functions/               # APIs, verification, payment callbacks
|   |-- migrations/              # Tables, policies, database functions
|   `-- tests/
|
|-- test-vectors/                # JSON inputs and expected outputs
`-- tools/                       # Asset builds and code generation
```

## 2.5 Builds and tests

2.5.1 Asset builds convert originals in `assets/` into platform-specific bundles.

2.5.2 Unit tests sit beside the modules they verify.

2.5.3 API clients are generated from `contracts/openapi.yaml`.

## 2.6 Swift port

2.6.1 Swift reuses the backend, API definitions, content, and source assets.

2.6.2 Native screens, local algorithms, and device adapters are implemented in Swift.

2.6.3 TypeScript and Swift calculations must pass the same examples in `test-vectors/`.
