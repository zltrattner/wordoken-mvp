# Database and puzzle references

File: [puzzles/finished_games_20231225.json](puzzles/finished_games_20231225.json)

Status: User-selected starting point for the puzzle database.
Review: JSON structure and all record field sets inspected.
Spec sections: 3 and 6.

## Dataset

The root object contains 30,056 puzzle records keyed by numeric strings.
Despite its filename, this file contains puzzle definitions rather than completed match histories.

| Field | JSON type | Observed contents |
| --- | --- | --- |
| `allLetters` | String | Available letters |
| `fixedLetters` | String | Required letters |
| `qtyLetters` | Integer | Available-letter count |
| `wordokenList` | Array of strings | Words classified as Wordokens |
| `wordList` | Array of strings | Puzzle word list |
| `otherLetters` | String | Remaining letters |

| Letter count | Puzzles |
| --- | ---: |
| 6 | 8,789 |
| 7 | 10,979 |
| 8 | 10,288 |

The export has no separate difficulty flag; `qtyLetters` matches the length of `allLetters`.
Every six- or seven-letter puzzle has one required letter; every eight-letter puzzle has two.

## Spec decisions

- Puzzles have stable IDs without version records.
- A shared `words` table stores word rarities from 0 through 1, with 1 meaning rarest.
- Puzzle downloads return word-to-rarity pairs looked up from that table.
- Played-game records reference their puzzle and include opponent replay data.
- A generated `Guest###` bot supplies an opponent when no recording exists.
- The bot is level 1 and submits a random valid word every 20 through 30 seconds.

## Remaining data gaps

- The shared word-to-rarity dataset has not been supplied.
- Review status is defined in Section 3; selection and opponent eligibility are defined in Section 6.

This batch includes no SQL schema or recorded opponent histories.

