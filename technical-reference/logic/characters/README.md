# Character animation references

Spec section: 9.

## Source roles

| Source | Role |
| --- | --- |
| [Sprites/](Sprites/) | Current definitive sprite package, as identified by the user |
| [SpriteTest/SpriteTest.pde](SpriteTest/SpriteTest.pde) | Code reference for frame lookup, placement, and layered drawing |
| `SpriteTest/data/` | Prototype assets retained for the sketch's relative paths |

Spec Section 9 defines MVP playback behavior; timing and impact markers still require visual review.

## Definitive sprite package

[WO_Sprites1_merged.json](Sprites/WO_Sprites1_merged.json) contains 5,246 frame entries.
Its `fileid` values select `WO_Sprites1-0.png` through `WO_Sprites1-5.png`.
The frame names identify Ninja and Samurai characters.
Parts include Eyes, HeadBack, HeadFront, Legs, Skin, and Torso.
All frame rectangles fit within their referenced images.
No frames are marked as rotated.

Review: All frame names, variants, action sequences, and metadata inspected; playback not reviewed.

## Packing JSON inspection

Frame keys follow `<Character>_<Action>_<Part>_<Variant>_<Frame>.png`.
The package contains 43 appearance variants after the spelling normalization in Spec 3.10.4.
Ninja supplies 3,294 frames; Samurai supplies 1,952.
Available part variants and catalog bindings are listed in [Spec 3.10](../../../_specs/03-database-structures.md#310-avatar-items-and-sprite-bindings).

| Action | Frames per part variant | Source frame numbers |
| --- | ---: | --- |
| `Idle` | 8 | 0-7 |
| `Katana` | 26 | 12-37; Samurai torso uses 0-25 |
| `Kick` | 28 | 16-43 |
| `Punch` | 22 | 60-81 |
| `React1` | 12 | 28-39 |
| `React2` | 26 | 24-49 |

Each normalized part variant supplies all six actions, totaling 122 frames.
The prototype's sorted-position indexing handles the different Katana frame-number ranges.
Spec 9.2 uses an initial 12 FPS; final playback speed remains subject to visual review.

The eight Ninja yellow-leg `Idle` filenames spell the variant `Yelllow`.
Samurai has no separate `Skin` or `Eyes` entries.
The per-part bindings in Spec 3.10.3 allow Ninja face parts alongside Samurai clothing parts.
`Katana` is an action name; the JSON has no separate weapon part.
The packing data supplies no item prices, level locks, subscription rules, or frame durations.

| Metadata field | Contents |
| --- | --- |
| `fileid` | Atlas index, 0-5 |
| `frame` | Rectangle inside that atlas |
| `spriteSourceSize` | Trimmed rectangle within the original frame |
| `sourceSize` | Original frame size; 413 by 260 for every entry |
| `trimmed` | Whether surrounding space was removed |
| `rotated` | Whether the packed sprite was rotated; false for every entry |

## Processing code reference

Review: Static inspection and one prototype atlas preview; sketch not executed.

The sketch loads `SpriteTest/data/result5.json` and `Ninja5-0.png` through `Ninja5-9.png`.
Its canvas is 720 by 720 pixels and its requested frame rate is 12 FPS.
The starting action is `Katana`.
Supported action names are `Idle`, `Punch`, `Kick`, `React1`, `React2`, and `Katana`.
Layers draw in this order: Legs, Torso, HeadBack, Skin, Eyes.
Frame placement uses `frame`, `spriteSourceSize`, `sourceSize`, and `fileid`.
Each trimmed part is positioned relative to the same original-frame center.
`currentFrame` advances once per draw; each part indexes its sorted list by that position.
The numeric filename suffix is not used as the playback index.
The prototype groups all variants for each action and part together.
The app must filter to the selected item before sorting that part's action frames.

## Prototype atlas sets

| Frame dictionary | Entries | Corresponding image filenames |
| --- | ---: | --- |
| `result.json` | 68 | `NinjaBase-0.png` through `NinjaBase-2.png` |
| `result2.json` | 152 | `Ninja2-0.png` |
| `result3.json` | 176 | `Ninja3-0.png` |
| `result4.json` | 2,592 | `Ninja4-0.png` through `Ninja4-6.png` |
| `result5.json` | 3,294 | `Ninja5-0.png` through `Ninja5-9.png` |

Only the `result5.json` mapping is explicitly loaded by the supplied sketch.
The other mappings follow image names and passed frame-bound checks.
All 6,282 frame rectangles fit within their corresponding images.

`Ninja2.png`, `Ninja21.png`, `Ninja22.png`, and `Ninja2-0.png` have identical hashes.
The bundle also includes `SourceCodePro-Regular.ttf`.

## Spec decisions and remaining review

- [Spec 9](../../../_specs/09-character-mechanism.md) defines assembly, playback, attacks, reactions, and knockout finishes.
- Katana equipment selects the packed Katana action without adding a weapon sprite layer.
- Review playback speed, attack impact frames, and the knockout hold before approving the initial timing values.
- Font selection belongs to Section 12.

