import { useRef } from 'react';
import { assets, Icon } from './ui';
import type { Difficulty, LetterTileData, PlayerDisplay, WordFeedback } from '../types';

export function GameTimer({ label }: { label: string }) {
  return (
    <div className="timer-row">
      <div className="timer surface" role="timer" aria-label={`Time remaining: ${label}`}>
        {label}
      </div>
    </div>
  );
}
export function ScoreCard({ name, score }: PlayerDisplay) {
  return (
    <section className="score-card surface" aria-label={`${name}: ${score} points`}>
      <h2>{name}</h2>
      <p>{score}</p>
    </section>
  );
}
export function ScoreGain({ label }: { label: string }) {
  return (
    <div className="score-gain" aria-label={label}>
      <Icon src={assets.burst} size={64} />
      <span>{label}</span>
    </div>
  );
}
export function FoundWordsTray({
  words,
  feedback,
  emptyLabel = 'Your words appear here',
}: {
  words: readonly string[];
  feedback?: WordFeedback;
  emptyLabel?: string;
}) {
  const tray = useRef<HTMLDivElement>(null);
  return (
    <div className="word-tray surface">
      <div
        ref={tray}
        className="found-words"
        tabIndex={0}
        aria-label="Words found. Scroll horizontally."
      >
        {words.length ? (
          words.map((word, index) => <span key={`${word}-${index}`}>{word}</span>)
        ) : (
          <span className="empty-words">{emptyLabel}</span>
        )}
      </div>
      <button
        type="button"
        aria-label="Scroll found words"
        onClick={() => tray.current?.scrollBy({ left: 160, behavior: 'smooth' })}
      >
        <Icon src={assets.arrow} />
      </button>
      {feedback && (
        <div className={`word-feedback ${feedback.tone}`} role="status">
          {feedback.message}
          {feedback.tone === 'success' && <span aria-hidden="true">✓</span>}
        </div>
      )}
    </div>
  );
}
export function WordEntry({
  value,
  onBackspace,
  disabled = false,
}: {
  value: string;
  onBackspace: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="word-entry surface">
      <button
        type="button"
        aria-label="Delete last letter"
        onClick={onBackspace}
        disabled={disabled || !value}
      >
        <Icon src={assets.backspace} size={28} />
      </button>
      <output aria-label="Current word">{value || '\u00a0'}</output>
    </div>
  );
}
export function LetterTile({
  tile,
  onSelect,
}: {
  tile: LetterTileData;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      type="button"
      className={`letter-tile surface ${tile.required ? 'required' : ''}`}
      disabled={tile.disabled}
      aria-label={`${tile.letter}${tile.required ? ', required letter' : ''}`}
      onClick={() => onSelect(tile.id)}
    >
      <span>{tile.letter}</span>
    </button>
  );
}
export function LetterGrid({
  mode,
  tiles,
  onSelect,
}: {
  mode: Difficulty;
  tiles: readonly LetterTileData[];
  onSelect: (id: string) => void;
}) {
  const columns = mode === 'easy' ? 3 : 4;
  return (
    <div className={`letter-grid ${mode}`} aria-label="Letter tiles">
      {[tiles.slice(0, columns), tiles.slice(columns)].map((row, index) => (
        <div className="letter-row" key={index}>
          {row.map((tile) => (
            <LetterTile key={tile.id} tile={tile} onSelect={onSelect} />
          ))}
        </div>
      ))}
    </div>
  );
}
