# XP and level reference

File: [xp and level algorithm.js](<xp and level algorithm.js>)

Status: Supplied example; approval unconfirmed.
Review: Static inspection; not executed.
Spec section: 10.

## Contents

The code uses p5.js-style functions, including `createCanvas`, `pow`, and `print`.
It calculates win, draw, and loss adjustments from both players' levels and a multiplier.
The example rounds XP from points, a participation bonus, and the result adjustment.
Its threshold sums integers from zero through `level * 10 - 1`.

| Example input | Value |
| --- | --- |
| Player level | 10 |
| Opponent level | 10 |
| Multiplier | 10 |
| Result | 1: win |
| Points | 50 |
| Starting XP | 0 |
| Participation bonus | 5 |

## Decisions for the spec

- Confirm the formulas and example constants.
- Define how accumulated XP produces a new level.
- Define XP floors, level limits, and treatment of negative awards.
- Confirm whether progression includes every score bonus.

