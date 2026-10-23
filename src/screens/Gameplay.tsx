import type { ReactNode } from 'react';
import { ActionButton } from '../components/ui';
import { Fighters } from '../components/Fighters';
import {
  FoundWordsTray,
  GameTimer,
  LetterGrid,
  ScoreCard,
  ScoreGain,
  WordEntry,
} from '../components/gameplay';
import type { Difficulty, LetterTileData, PlayerDisplay, WordFeedback } from '../types';

export interface GameplayProps {
  mode: Difficulty;
  timeLabel: string;
  player: PlayerDisplay;
  opponent: PlayerDisplay;
  words: readonly string[];
  entry: string;
  tiles: readonly LetterTileData[];
  feedback?: WordFeedback;
  scoreGain?: string;
  /** Replace the static approved sprite pose with the host's animation renderer. */
  arena?: ReactNode;
  onLetterSelect: (id: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  onShuffle: () => void;
  onSubmit: () => void;
}
/** Presentation only: no timer, dictionary, scoring, networking or persistence. */
export function Gameplay(props: GameplayProps) {
  return (
    <main
      className="wordoken screen gameplay-screen"
      aria-label={`${props.mode} gameplay`}
      data-figma-node={
        props.mode === 'hard' ? '39:603' : props.mode === 'easy' ? '266:2327' : '266:2476'
      }
    >
      <div className="gameplay rail">
        <GameTimer label={props.timeLabel} />
        <div className="scores">
          <ScoreCard {...props.player} />
          <ScoreCard {...props.opponent} />
          {props.scoreGain && <ScoreGain label={props.scoreGain} />}
        </div>
        {props.arena ?? <Fighters />}
        <FoundWordsTray words={props.words} feedback={props.feedback} />
        <WordEntry value={props.entry} onBackspace={props.onBackspace} />
        <LetterGrid mode={props.mode} tiles={props.tiles} onSelect={props.onLetterSelect} />
        <div className="game-actions">
          <ActionButton onClick={props.onClear}>CLEAR</ActionButton>
          <ActionButton onClick={props.onShuffle}>SHUFFLE</ActionButton>
          <ActionButton tone="green" onClick={props.onSubmit}>
            SUBMIT
          </ActionButton>
        </div>
      </div>
    </main>
  );
}
