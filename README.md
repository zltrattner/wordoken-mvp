# Wordoken UI

React + TypeScript visual components translated from the approved Wordoken Figma designs. **This is not a game implementation.**

## Current coverage

- Start screen
- Home / difficulty selection
- Countdown presentation
- Easy, medium and hard gameplay layouts (one shared `Gameplay` component)
- Shared buttons, split actions, social provider row, player header, difficulty selector, currency badge, navigation, dialog, scores, timer, word tray, letter entry, letter tiles, and static ninja poses

The remaining Figma screens are **not ported yet**. Figma node IDs and extraction references for this slice are retained in `design-reference/` and on screen root elements.

## Run the review gallery

```sh
npm ci
npm run dev
```

Open the printed local URL. The gallery has separate controls for screen selection, word feedback and countdown content. Buttons report callback events instead of running game logic. Append `?view=hard&solo` for a screen-only view. Other views: `start`, `home`, `easy`, `medium`, `countdown`, `components`.

## Build and consume

```sh
npm run build
npm pack
```

Install the resulting `wordoken-ui-0.1.0.tgz` in a React 19 host project, then:

```tsx
import { ActionButton, WordokenTheme, Gameplay } from '@wordoken/ui';
import '@wordoken/ui/styles.css';

export function Example({ onStart }: { onStart: () => void }) {
  return (
    <WordokenTheme>
      <ActionButton tone="green" onClick={onStart}>
        START GAME
      </ActionButton>
    </WordokenTheme>
  );
}
```

Full screen components include their own theme boundary. Standalone components need `WordokenTheme` or a `.wordoken` ancestor. Styles do not reset the host document. React is a peer dependency, not bundled. Original artwork is emitted as independently cached files; fonts are self-contained in the emitted CSS. The host bundler must retain the package's emitted asset files.

## Architecture and ownership

| Layer                          | Responsibility                                                             |
| ------------------------------ | -------------------------------------------------------------------------- |
| `src/index.ts`                 | Public component and type exports; no app startup                          |
| `src/components/`              | Reusable presentation and local UI behavior                                |
| `src/screens/`                 | Compositions of shared components; data and actions supplied through props |
| `src/types.ts`                 | UI data contracts, not domain rules                                        |
| `src/styles.css`               | Scoped theme tokens, layout, responsive adjustments and motion             |
| `src/assets.ts`, `src/assets/` | Original local artwork and fonts                                           |
| `src/preview/`                 | Development-only sample data, gallery and callback logging                 |
| `src/library.ts`               | Build-only entry that collects styles; not a second app                    |

`Gameplay` does not own the clock, selected letters, found words, feedback duration or scores. The host supplies those props and handles `onLetterSelect`, `onBackspace`, `onClear`, `onShuffle`, and `onSubmit`. Its optional `arena` slot accepts a future animation renderer. The supplied `Fighters` component is the approved static layered sprite pose, not an animation engine.

`Countdown` displays its `count` and `caption`; it does not run a timer. `Home` receives difficulty options and selected mode. `SocialRow` accepts any provider list and emits the selected ID; it does not implement OAuth. `FoundWordsTray` owns only its horizontal scrolling affordance. `Dialog` owns native modal focus and Escape handling; the host mounts and dismisses it.

**Intentionally absent:** word validation, scoring, matchmaking, challenge links, API clients, authentication, subscriptions, application navigation, analytics, persistence, service worker and PWA registration. No preview fixtures are included in the library build.

## Layout contract

- Approved reference size: 402 × 740 CSS pixels, with a centered 320px content rail.
- Screen height defaults to `100svh`; the host can set `--wk-screen-height` on a surrounding element.
- Shorter viewports compact spacing, not the 160px gameplay arena.
- At very short heights, a 660px minimum preserves usable content and permits vertical scrolling. Do not disable scrolling globally in the host app.
- Safe-area padding, surrounding browser/app chrome and keyboard behavior belong to the host shell. Do not add duplicate safe-area padding inside every component.
- Required letters have accessible names; focus indicators and reduced-motion support are included.
- Social labels retain Fixture Expanded SemiBold, 16px, uppercase. Use `labelColor="white"` on the relevant authentication backgrounds.

## Verification

```sh
npm run check
npm test
npm run build
npm run build:preview
# With the preview server running:
npx playwright install chromium
npm run test:browser
```

`PLAYWRIGHT_EXECUTABLE_PATH` can point to an existing compatible Chromium executable. `PREVIEW_URL` can target a production preview server. Browser checks cover six screen variants at 402×740, 375×667 and 320×740, asset loading, layout boundaries, callbacks, feedback, horizontal scrolling and radio selection. Screenshots and the geometry report are generated under `test-results/`.

These are desktop Chromium viewport checks, not a claim of physical iPhone or Safari testing. Test the integrated host on the target iPhone browser before release.

## Assets and licensing

Fixture fonts and Wordoken artwork were supplied by the project owner. Keep their existing license/usage permissions; this package does not grant new redistribution rights. Montserrat and Black Han Sans retain their upstream font licenses in their source packages. Do not publish this private package publicly without checking asset/font rights.
