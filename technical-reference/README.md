# Technical references

User-supplied code, data, and media for the remaining spec sections.
Review status and source choices are recorded in each category's README.

| Material | Location | Inspection | Spec sections |
| --- | --- | --- | --- |
| XP and level sketch | [logic/progression/](logic/progression/README.md) | JavaScript reviewed without execution | 10 |
| Definitive sprite package | [logic/characters/Sprites/](logic/characters/Sprites/) | Six atlases and 5,246 frame entries; image bounds checked | 9 |
| Character animation prototype | [logic/characters/](logic/characters/README.md) | Processing code, frame JSON, and image bounds reviewed | 9 |
| Puzzle dataset | [database/](database/README.md) | 30,056 records inspected | 3, 6 |
| Music and effects | [audio/](audio/README.md) | 16 MP3 files; metadata and scope audio mappings inspected | 12 |

## File inventory

[inventory.json](inventory.json) records each original path, current path, byte count, and SHA-256 hash.
It covers the 50 initially organized files and seven added sprite files.
The character sketch and its `data/` directory remain together to preserve relative paths.

## Adding references

Place new files in the matching category.
Add their purpose, approval status, known gaps, and relevant spec section to that category's README.

