import { assets } from '../components/ui';
import type { Difficulty, DifficultyOptionData, LetterTileData } from '../types';
import type { ArchiveEntry } from '../screens/Archive';
import type { RewardRow } from '../screens/PostGame';
import type { StoreItem } from '../screens/Store';

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

export const storeItems: readonly StoreItem[] = [
  { id: 'daily', name: '1 Game', price: 'FREE', art: assets.timerIcon },
  { id: 'coins', name: '500 Coins', price: '$1.99', art: assets.coinsStack },
  { id: 'chest-small', name: 'Sm. Chest', price: '75', art: assets.chest },
  { id: 'chest-large', name: 'Lg. Chest', locked: 'LEVEL 15', art: assets.chest },
  { id: 'bandana-green', name: 'Green Bandana', price: '75', art: assets.bandanaBlue },
  { id: 'bandana-blue', name: 'Blue Bandana', price: '75', art: assets.bandanaBlue },
  { id: 'bandana-purple', name: 'Purple Bandana', locked: 'LOCKED', art: assets.bandanaRed },
  { id: 'katana', name: 'Katana', locked: 'LEVEL 20' },
  { id: 'armor', name: 'Armor', locked: 'LEVEL 25' },
  { id: 'mystery-1', name: 'Coming Soon', locked: 'LOCKED' },
  { id: 'mystery-2', name: 'Coming Soon', locked: 'LOCKED' },
  { id: 'mystery-3', name: 'Coming Soon', locked: 'LOCKED' },
];

export const archiveEntries: readonly ArchiveEntry[] = [
  { id: '1', result: 'win', opponent: 'Guest 558', ago: '1 DAY AGO', percent: 80 },
  { id: '2', result: 'loss', opponent: 'RobbieRobertson', ago: '4 DAYS AGO', percent: 23 },
  { id: '3', result: 'tie', opponent: 'Guest 765', ago: '11 DAYS AGO', percent: 34 },
  { id: '4', result: 'win', opponent: 'NinjaWolf', ago: '18 DAYS AGO', percent: 72 },
  { id: '5', result: 'loss', opponent: 'Wordsmith', ago: '21 DAYS AGO', percent: 19 },
  { id: '6', result: 'tie', opponent: 'Guest 121', ago: '29 DAYS AGO', percent: 46 },
];

export const winRewards: readonly RewardRow[] = [
  { label: 'Word Score', coins: 28, icon: assets.coinsStack },
  { label: 'Victory', coins: 25, icon: assets.medal },
  { label: 'Hot Streak Bonus', coins: 50, icon: assets.fire },
  { label: 'Level Multiplier', coins: 13, icon: assets.coinsSilver },
  { label: 'Wordoken Bonus', coins: 10, icon: assets.coinsStack },
  { label: 'Fast KO Bonus', coins: 25, icon: assets.knockout },
];

export const standardRewards: readonly RewardRow[] = [
  { label: 'Word Score', coins: 28, icon: assets.coinsStack },
  { label: 'Level Multiplier', coins: 13, icon: assets.coinsSilver },
  { label: 'Wordoken Bonus', coins: 10, icon: assets.coinsStack },
];
