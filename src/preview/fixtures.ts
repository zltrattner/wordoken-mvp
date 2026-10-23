import type { Difficulty, DifficultyOptionData, LetterTileData } from '../types';

// Figma sample values. This file is excluded from the published component entry.
export const difficultyOptions: readonly DifficultyOptionData[] = [
  { value: 'easy', label: 'EASY', rules: ['6 LETTERS', '1 RED LETTER', 'NO KNOCKOUTS'] },
  { value: 'medium', label: 'MEDIUM', rules: ['7 LETTERS', '1 RED LETTER', 'KNOCKOUTS ALLOWED'] },
  { value: 'hard', label: 'HARD', rules: ['8 LETTERS', '2 RED LETTERS', 'FASTER KNOCKOUTS'] },
];
export const gameSamples: Record<
  Difficulty,
  { entry: string; words: string[]; tiles: LetterTileData[] }
> = {
  easy: { entry: 'PLANET', words: ['PLANET', 'PLANT', 'PLATE'], tiles: tiles('PATLEN', ['T']) },
  medium: {
    entry: 'CAPTURE',
    words: ['CAPTURE', 'CARPET', 'TRACE'],
    tiles: tiles('CATUREP', ['T']),
  },
  hard: {
    entry: 'COMPUTER',
    words: ['COMPUTER', 'COMET', 'ROUTE', 'ROPE', 'TOME'],
    tiles: tiles('CMTUOERP', ['T', 'O']),
  },
};
function tiles(letters: string, required: string[]): LetterTileData[] {
  return [...letters].map((letter, index) => ({
    id: `tile-${index}`,
    letter,
    required: required.includes(letter),
  }));
}
