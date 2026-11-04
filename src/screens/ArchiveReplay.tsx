import type { ReactNode } from 'react';
import { ActionButton, Icon, assets } from '../components/ui';
import { Fighters } from '../components/Fighters';
import { FoundWordsTray, LetterGrid, WordEntry } from '../components/gameplay';
import type { LetterTileData } from '../types';

export interface ArchiveReplayProps {
  playerName: string;
  playerScore: string | number;
  opponentName: string;
  opponentScore: string | number;
  challengeLink: string;
  words: readonly string[];
  entry: string;
  tiles: readonly LetterTileData[];
  arena?: ReactNode;
  onBack: () => void;
  onChallenges: () => void;
  onCopyLink: () => void;
  onLetterSelect: (id: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  onShuffle: () => void;
  onSubmit: () => void;
}

export function ArchiveReplay(props: ArchiveReplayProps) {
  return (
    <main className="wordoken screen replay-screen" data-figma-node="300:3952">
      <div className="replay-utilities">
        <button
          type="button"
          className="topbar-control surface"
          onClick={props.onBack}
          aria-label="Back"
        >
          ←
        </button>
        <button type="button" className="my-challenges surface" onClick={props.onChallenges}>
          <span aria-hidden="true">🏆</span> MY CHALLENGES
        </button>
      </div>
      <div className="replay-body rail">
        <section className="replay-score surface">
          <div className="replay-names">
            <span>YOUR SCORE</span>
            <span>{props.opponentName}</span>
          </div>
          <div className="replay-values">
            <strong>{props.playerScore}</strong>
            <strong>{props.opponentScore}</strong>
          </div>
          <button type="button" className="replay-link" onClick={props.onCopyLink}>
            <span>CHALLENGE LINK</span>
            <span>
              <Icon src={assets.paperColor} size={22} /> COPY
            </span>
          </button>
        </section>
        {props.arena ?? <Fighters />}
        <FoundWordsTray words={props.words} />
        <WordEntry value={props.entry} onBackspace={props.onBackspace} />
        <LetterGrid mode="medium" tiles={props.tiles} onSelect={props.onLetterSelect} />
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
