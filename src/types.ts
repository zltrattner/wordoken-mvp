/** UI variants only. Production rules and game state belong to the host app. */
export type Difficulty = 'easy' | 'medium' | 'hard';
export type Tone = 'yellow' | 'green' | 'white';
export interface DifficultyOptionData {
  value: Difficulty;
  label: string;
  rules: readonly string[];
}
export interface LetterTileData {
  id: string;
  letter: string;
  required?: boolean;
  disabled?: boolean;
}
export interface PlayerDisplay {
  name: string;
  score: string | number;
}
export interface WordFeedback {
  message: string;
  tone: 'success' | 'error';
}
